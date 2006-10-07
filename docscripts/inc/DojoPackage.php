<?php

require_once('Text.php');
require_once('DojoFunctionCall.php');

class DojoPackage
{
	private $dojo;
  protected $file; // The file reference (including dir) to the file;
	private $code; // The source - comments
	private $source;
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
        $this->declarations[$declaration->getName] = $declaration;
      }
    }
    
    return $end;
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
    $multiline_started = false;
    foreach ($lines as $line_number => $line) {
      if ($multiline_started) {
        if (preg_match('%^.*\*/%U', $line, $match)) {
          $line = Text::blankOut($match[0], $line);
          $multiline_started = false;
        }
        else {
          $line = Text::blankOut($line, $line);
        }
      }
      
      preg_match_all('%(?:"(.*)(?<!\\\\)"' . "|'(.*)(?<!\\\\)')%U", $line, $matches);
      foreach (array_merge($matches[1], $matches[2]) as $match) {
        $line = Text::blankOut($match, $line);
      }
      
      preg_match_all('%/\*.*\*/%U', $line, $matches);
      foreach ($matches[0] as $match) {
        $line = Text::blankOut($match, $line);
      }
      
      if (preg_match_all('%(?:(/\*.*)|(//.*))$%', $line, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
          if ($match[1]) {
            $multiline_started = true;
          }
          $line = Text::blankOut($match[0], $line);
        }
      }
      
      $lines[$line_number] = $line;
    }
		$this->code = $lines;
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
    $name = implode('.', $parts);
    if ($name == 'dojo.bootstrap1' || $name == 'dojo.bootstrap2' || $name == 'dojo.loader') {
      $name = 'dojo';
    }
    return $name;
  }
  
}

?>