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
  
  public function getFunctionDeclarations()
  {
    $matches = preg_grep('%(\bfunction\s+[a-zA-Z0-9_.$]+\b\s*\(|\b[a-zA-Z0-9_.$]+\s*=\s*function\s*\()%', $this->code);
    foreach (array_keys($matches) as $start_line_number) {
      $line = $this->code[$start_line_number];
      if(!preg_match('%(?:\bfunction\s+([a-zA-Z0-9_.$]+)\b\s*\(|\b([a-zA-Z0-9_.$]+)\s*=\s*function\s*\()%', $line, $match)) {
        continue;
      }
      $function_name = $match[1] . $match[2];
      $function = new DojoFunctionDeclare($this->source, $this->code, $this->package_name, $this->compressed_package_name, $function_name);
      $function->setStart($start_line_number, strpos($line, $match[0]));
      $function->setParameterStart($start_line_number, strpos($line, '('));

      $content_start = false; // For content start
      $parameter_end = false; // For parameter end
      
      $balance = 0;

      for ($line_number = $start_line_number; $line_number < count($this->code); $line_number++) {
        unset($matches[$line_number]); // No inner function declarations
        $line = $this->code[$line_number];
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
    $calls = array();
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

      $calls[] = $call;
    }
    return $calls;
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
    $parts = explode('/', preg_replace('%\.js$%', '', $this->file));
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