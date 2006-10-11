<?php

require_once('Text.php');
require_once('DojoFunctionCall.php');

class DojoPackage
{
	private $dojo;
  protected $file; // The file reference (including dir) to the file;
	private $code; // The source - comments
	protected $source;
  protected $declarations = array(); // Builds an array of functions declarations by name, with meta
  protected $calls = array(); // Builds an array of calls
  
  public function __construct(Dojo $dojo, $file)
  {
		$this->dojo = $dojo;
    $this->setFile($file);
  }
	
	public function getFile()
	{
		return $this->file;
	}
	
	public function setFile($file)
	{
		$this->file = $file;
	}

  public function getFunctionDeclarations()
  {
    $lines = $this->getCode();
    $end = array(0, 0);

    $matches = preg_grep('%function%', $lines);
    $last_line = 0;
    foreach ($matches as $line_number => $line) {
      if ($line_number < $last_line) {
        continue;
      }

      if(preg_match('%(\bfunction\s+[a-zA-Z0-9_.$]+\b\s*\(|\b[a-zA-Z0-9_.$]+\s*=\s*(new\s*)?function\s*\()%', $line, $match)) {
        $declaration = new DojoFunctionDeclare($this);
        $declaration->setStart($line_number, strpos($line, $match[0]));
        $end = $declaration->build();
        $last_line = $end[0];
        $this->declarations[$declaration->getFunctionName()] = $declaration;
      }
    }
    
    return $this->declarations;
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
    $lines = $this->getCode();
    $lines = preg_grep('%\b' . preg_quote($name) . '\s*\(%', $lines);
    foreach ($lines as $line_number => $line) {
      $position = strpos($line, $name);
      if ($line_number < $last_line_number || ($line_number == $last_line_number && $position < $last_position)) {
        continue;
      }
      $call = new DojoFunctionCall($this, $line_number, $position);
      list($last_line_number, $last_position) = $call->build();
      $this->calls[$name][] = $call;
    }
    return $this->calls[$name];
  }
  
  public function getSource()
  {
		if ($this->source) {
			return $this->source;
		}
    $this->source = $lines = explode("\n", file_get_contents($this->dojo->getDir() . $this->file));
    return $lines;
  }
  
  /**
   * Removes comments and strings, preserving layout
   */
  public function getCode()
  {
		if ($this->code) {
			return $this->code;
		}
		
    $lines = $this->getSource();
    $in_comment = false;
    foreach ($lines as $line_number => $line) {
      //print "$line_number $line\n";
      if ($in_comment !== false) {
        if (preg_match('%^.*\*/%U', $line, $match)) {
          $line = Text::blankOut($match[0], $line);
          $in_comment = false;
        }
        else {
          $line = Text::blankOut($line, $line);
        }
      }
      
      $position = 0;
      $in_single_string = false;
      $in_double_string = false;
      $in_regex = false;

      for ($i = 0; $i < 100; $i++) {
        $matches = array();

        if ($in_comment === false && $in_regex === false && $in_single_string === false && $in_double_string === false) {
          if (preg_match('%(?:^|\breturn\b|[=([{,|&;:?])\s*/(?!/)%', $line, $match, PREG_OFFSET_CAPTURE, $position)) {
            $matches[$match[0][1] + strlen($match[0][0]) - 1] = '/';
          }
          if (preg_match('%(?:^|\breturn\b|[=([{,|&;:?+])\s*(["\'])%', $line, $match, PREG_OFFSET_CAPTURE, $position)) {
            $matches[$match[0][1] + strlen($match[0][0]) - 1] = $match[1][0];
          }
          if (($pos = strpos($line, '//', $position)) !== false) {
            $matches[$pos] = '//';
          }
          if (($pos = strpos($line, '/*', $position)) !== false) {
            $matches[$pos] = '/*';
          }
        }
        elseif ($in_regex !== false) {
          if (preg_match('%(?<![/\\\])/\s*([img.)\]},|&;:]|$)%', $line, $match, PREG_OFFSET_CAPTURE, $position)) {
            $matches[$match[0][1]] = '/';
          }
        }
        elseif ($in_single_string !== false || $in_double_string !== false) {
          if (preg_match('%(?<!\\\)([\'"])\s*([+.)\]},|&;:?]|$)%', $line, $match, PREG_OFFSET_CAPTURE, $position)) {
            $matches[$match[0][1]] = $match[1][0];
          }
        }
        elseif ($in_comment !== false) {
          if (($pos = strpos($line, '*/', $position)) !== false) {
            $matches[$pos] = '*/';
          }
        }
        
        if (!$matches) {
          break;
        }
        
        ksort($matches);
        foreach ($matches as $position => $match) {
          if ($in_comment === false && $in_regex === false && $in_single_string === false && $in_double_string === false) {
            if ($match == '"') {
              $in_double_string = $position;
              break;
            }
            elseif ($match == "'") {
              $in_single_string = $position;
              break;
            }
            elseif ($match == '/') {
              $in_regex = $position;
              break;
            }
            elseif ($match == '//') {
              $line = Text::blankOutAt($line, $position);
              break;
            }
            elseif ($match == '/*') {
              $in_comment = $position;
              break;
            }
          }
          elseif ($in_double_string !== false && $match == '"') {
            $line = Text::blankOutAt($line, $in_double_string + 1, $position - 1);
            $in_double_string = false;
          }
          elseif ($in_single_string !== false && $match == "'") {
            $line = Text::blankOutAt($line, $in_single_string + 1, $position - 1);
            $in_single_string = false;
          }
          elseif ($in_regex !== false && $match == '/') {
            $line = Text::blankOutAt($line, $in_regex + 1, $position - 1);
            $in_regex = false;
          }
          elseif ($in_comment !== false && $match == '*/') {
            $line = Text::blankOutAt($line, $in_comment + 2, $position - 1);
            $in_comment = false;
          }
        }
        ++$position;
      }
      
      if ($i == 100) {
        die("\$i should not reach 100: $line");
      }
      
      if ($in_comment !== false && !empty($line)) {
        $line = Text::blankOutAt($line, $in_comment);
      }
      
      //print "$line_number $line\n";
      $lines[$line_number] = $line;
    }
 		return $this->code = $lines;
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
    $name = implode('.', $parts);
    if ($name == 'dojo.bootstrap1' || $name == 'dojo.bootstrap2' || $name == 'dojo.loader') {
      $name = 'dojo';
    }
    if (strpos($this->file, '__package__.js') !== false) {
      $name .= '._';
    }
    return $name;
  }
  
}

?>