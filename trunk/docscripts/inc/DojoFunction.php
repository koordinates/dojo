<?php

require_once('DojoPackage.php');
require_once('DojoParameter.php');

class DojoFunction
{
  protected $start = array(0, 0);
  protected $end = array(0, 0);
  protected $parameter_start = array(0, 0);
  protected $parameter_end = array(0, 0);
  protected $function_name;
  protected $compressed_function_name;
  protected $parameters = array(); // A list of all parameters in this function call or declaration
  protected $this_function = "";
  
  public function __construct(&$source, &$code, $package_name, $compressed_package_name)
  {
    $this->source = $source;
    $this->code = $code;
    $this->package_name = $package_name;
    $this->compressed_package_name = $compressed_package_name;
    
    $this->end = $this->parameter_end = $this->content_end = array(count($this->code) - 1, strlen(end($this->code)) - 1);
  }
  
  public function setFunctionName($function_name) {
    $this->function_name = $function_name;
  }
  
  public function getFunctionName() {
  	return $this->function_name;
  }
  
  public function setStart($line_number, $position)
  {
    $this->start = array($line_number, $position);
    $this->end = array($line_number, strlen($this->source[$line_number]) - 1);
  }
  
  /**
   * If this function is part of an object, this states the name of the function
   * that the this variable refers to.
   *
   * @param string $this_function
   */
  public function setThis($this_function)
  {
    $this->this_function = $this_function;
  }
  
  public function isThis()
  {
    return !empty($this->this_function);
  }
  
  public function getThis()
  {
    return $this->this_function;
  }
  
  public function setEnd($line_number, $position)
  {
    $this->end = array($line_number, $position);
  }
  
  public function setParameterStart($line_number, $position)
  {
    $this->parameter_start = array($line_number, $position);
    $this->parameter_end = array($line_number, strlen($this->source[$line_number]) - 1);
  }
  
  public function setParameterEnd($line_number, $position)
  {
    $this->parameter_end = array($line_number, $position);
  }
  
  public function getAll()
  {
    return $this->chop($this->source, $this->start[0], $this->start[1], $this->end[0], $this->end[1]);
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
    for ($line_number = $this->start[0]; $line_number <= $this->end[0]; $line_number++) {
      $line = $lines[$line_number];
      if ($this->start[0] == $this->end[0]) {
        $lines[$line_number] = Text::blankOutAt($line, $this->start[1], $this->end[1]);
      }
      elseif ($line_number == $this->start[0]) {
        $lines[$line_number] = Text::blankOutAt($line, $this->start[1]);
      }
      elseif ($line_number == $this->end[0]) {
        $lines[$line_number] = Text::blankOutAt($line, 0, $this->end[1]);
      }
      else {
        $lines[$line_number] = Text::blankOut($line, $line);
      }
    }
    return $lines;
  }
  
  public function getParameter($index)
  {
    if (empty($this->parameters)) {
      $this->getParameters();
    }

    if ($this->parameters[$index]) {
      return $this->parameters[$index];
    }
    return false;
  }
  
  /**
   * TODO: We should set a start and finish position for each parameter
   * The parameter object can figure out what's comments from what's not
   *
   */
  public function getParameters()
  {
  }
  
  /**
   * Starting at a set position, it looks for a matching character.
   * 
   * Character at the position must be a '{' or ')'
   *
   * @param int $line_number
   * @param int $position
   */
  protected function findMatchingChar($line_number, $position) {
    
  }
}

?>