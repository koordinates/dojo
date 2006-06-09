<?php

require_once('DojoFunctionCall.php');
require_once('DojoFunctionDeclare.php');
require_once('DojoParameter.php');

class DojoPackage extends Dojo
{
  protected $file; // The file reference (including dir) to the file;
  protected $functions = array(); // Builds an array of functions by name, with meta
  protected $calls = array(); // Builds an array of calls
  protected $variables = array(); // Builds an array of variables
  
  public function __construct($file)
  {
    $this->file = $file;
    $this->package_name = $this->getPackageName();
    if ($this->package_name == null) {
      return null;
    }
    $this->compressed_package_name = $this->getCompressedPackage();
    $this->source = $this->getSource();
    $this->code = $this->getCode();
  }
  
  /**
   * Looks through source to find variables that are set on any external or global object
   * 
   * NOTE: This is VERY hard to do.
   * 
   * TODO: Implement
   * TODO: Look for var variable = "value"; in the global scope.
   */
  public function getExternalVariableNames()
  {
  }
  
  public function getFunctionDeclarations()
  {
    $in_function = array();
    $lines = $this->removeDiscoveredCode($this->code);
    
    $matches = preg_grep('%(\bfunction\s+[a-zA-Z0-9_.$]+\b\s*\(|\b[a-zA-Z0-9_.$]+\s*=\s*function\s*\()%', $lines);
    foreach (array_keys($matches) as $start_line_number) {
      if (in_array($start_line_number, $in_function)) continue;
      $line = $lines[$start_line_number];
      if(!preg_match('%(?:\bfunction\s+([a-zA-Z0-9_.$]+)\b\s*\(|\b([a-zA-Z0-9_.$]+)\s*=\s*function\s*\()%', $line, $match)) {
        continue;
      }
      $function_name = $match[1] . $match[2];
      if (strpos($function_name, 'this.') === 0) {
        continue;
      }
      if (($pos = strpos($function_name, '.prototype.')) !== false) {
        $prototype = substr($function_name, 0, $pos);
        $function_name = str_replace('.prototype.', '.', $function_name);
      }
      $function = new DojoFunctionDeclare($this->source, $lines, $this->package_name, $this->compressed_package_name, $function_name);
      $function->setStart($start_line_number, strpos($line, $match[0]));
      $function->setParameterStart($start_line_number, strpos($line, '('));
      if ($prototype) {
        $function->setThis($prototype);
      }

      $content_start = false; // For content start
      $parameter_end = false; // For parameter end
      
      $balance = 0;

      for ($line_number = $start_line_number; $line_number < count($lines); $line_number++) {
        $in_function[] = $line_number; // No inner function declarations
        $line = $lines[$line_number];
        if (trim($line) == '') {
          continue;
        }
        
        if (!$content_start && ($pos = strpos($line, '{')) !== false) {
          $content_start = true;
          $start = $pos;
          $function->setContentStart($line_number, $pos);
        }
        if (!$parameter_end && ($pos = strpos($line, ')')) !== false) {
          $parameter_end = true;
          $function->setParameterEnd($line_number, $pos);
        }
        
        if ($content_start) {
          for ($char_pos = $start; $char_pos < strlen($line); $char_pos++) {
            $start = 0;
            $char = $line{$char_pos};
            
            if ($char == '{') {
              ++$balance;
            }
            elseif ($char == '}') {
              --$balance;
              if (!$balance) {
                $function->setContentEnd($line_number, $char_pos);
                $function->setEnd($line_number, $char_pos);
                $this->functions[] = $function;
                unset($function);
                continue 3;
              }
            }
          }
        }
      }
    }
    
    return $this->functions;
  }
  
  /**
   * Use this to find everywhere in the code a function is called.
   *
   * @param unknown_type $name
   */
  public function getFunctionCalls($name)
  {
    if ($this->calls[$name]) {
      return $this->calls[$name];
    }
    
    $this->calls[$name] = array();
    $lines = preg_grep('%\b' . preg_quote($name) . '\s*\(%', $this->code);
    foreach ($lines as $line_number => $line) {
      $call = new DojoFunctionCall($this->source, $this->code, $this->package_name, $this->compressed_package_name, $name);

      $start = strpos($line, $name);
      $call->setStart($line_number, $start);
      $call->setParameterStart($line_number, strpos($line, '(', $start));

      $end = strpos($line, ')', $start);
      if ($end) {
        $call->setEnd($line_number, $end);
        $call->setParameterEnd($line_number, $end);
      }
      else {
        $i = $line_number;
        $balance = 0;
        do {
          $line = $this->code[$i];
          $chars = array();
          for ($j = 0; $j < strlen($line); $j++) {
            $chars[] = $line{$j};
          }

          if (isset($start)) {
            $chars = array_slice($chars, $start);
          }
          unset($start);

          $chars = preg_grep('%[()]%', $chars);
          
          foreach ($chars as $char_number => $char) {
            if ($char == '(') {
              ++$balance;
            }
            elseif ($char == ')') {
              --$balance;
              if (!$balance) {
                $call->setParameterEnd($i, $char_number);
                $call->setEnd($i, $char_number);
                break 2;
              }
            }
          }
          ++$i;
        }
        while($i < count($this->code));
      }

      $this->calls[$name][] = $call;
    }
    return $this->calls[$name];
  }
  
  /**
   * Gets rid of blocks of code that have already been found
   * to do things like check for globals
   *
   * @param array $lines
   * @return array
   */
  public function removeDiscoveredCode($lines)
  {
    foreach ($this->calls as $per_name) {
      foreach ($per_name as $call) {
        $lines = $call->removeDiscoveredCode($lines);
      }
    }
    return $lines;
  }
  
  public function getVariables()
  {
    
  }
  
  private function getSource()
  {
    $lines = explode("\n", file_get_contents(self::$root_dir . $this->file));
    return $lines;
  }
  
  /**
   * Removes comments and strings, preserving layout
   */
  private function getCode()
  {
    $lines = $this->source;
    $multiline_started = false;
    foreach ($lines as $line_number => $line) {
      if ($multiline_started) {
        if (preg_match('%^.*\*/%U', $line, $match)) {
          $line = $this->blankOut($match[0], $line);
          $multiline_started = false;
        }
        else {
          $line = $this->blankOut($line, $line);
        }
      }
      
      preg_match_all('%/\*.*\*/%U', $line, $matches);
      foreach ($matches[0] as $match) {
        $line = $this->blankOut($match, $line);
      }
      
      if (preg_match_all('%(?:(/\*.*)|(//.*))$%', $line, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
          if ($match[1]) {
            $multiline_started = true;
          }
          $line = $this->blankOut($match[0], $line);
        }
      }
      
      preg_match_all('%(?:"(.*)(?<!\\")"|\'(.*)(?<!\\\')\')%U', $line, $matches);
      foreach ($matches[1] as $match) {
        $line = $this->blankOut($match, $line);
      }
      
      $lines[$line_number] = $line;
    }
    return $lines;
  }
  
  public function getPackageName()
  {
    $file = $this->file;
    if (strpos($file, '__package__.js') !== null) {
      $file = str_replace('__package__.js', '', $file);
      if ($file{strlen($file) - 1} == '/') {
        $file = substr($file, 0, -1);
      }
    }
    $parts = explode('/', preg_replace('%\.js$%', '', $file));
    if ($parts[0] == 'src') {
      $parts[0] = 'dojo';
    }
    return implode('.', $parts);
  }
  
  private function getCompressedPackage()
  {
    return preg_replace('%^dojo(?=\.|$)%', '_', $this->package_name);
  }
  
}

?>