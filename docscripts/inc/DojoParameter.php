<?php

require_once('DojoFunction.php');
require_once('DojoObject.php');
require_once('DojoString.php');

class DojoParameter extends DojoFunction
{
  private $parameter_value = "";
  private $parameter_type = "";
  private $raw_parameter_value = array();
  private $raw_source = array();
  
  public function __construct(&$source, &$code, $package_name, $compressed_package_name, $function_name, $compressed_function_name)
  {
    $this->source = $source;
    $this->code = $code;
    $this->package_name = $package_name;
    $this->compressed_package_name = $compressed_package_name;
    $this->function_name = $function_name;
    $this->compressed_function_name = $compressed_function_name;
    
    $this->end = $this->parameter_end = $this->content_end = array(count($this->code) - 1, strlen(end($this->code)) - 1);
  }
  
  public function getRawValue()
  {
    if ($this->raw_parameter_value) {
      return $this->raw_parameter_value;
    }
    
    $lines = $this->chop($this->code, $this->start[0], $this->start[1], $this->end[0], $this->end[1]);
    $this->raw_parameter_value = $lines;
    return $this->raw_parameter_value;
  }
  
  public function getRawSource()
  {
    if ($this->raw_source) {
      return $this->raw_source;
    }
    
    $lines = $this->chop($this->source, $this->start[0], $this->start[1], $this->end[0], $this->end[1]);
    return $this->raw_parameter_value = $lines;
  }

  public function getValue()
  {
    if ($this->parameter_value) {
      return $this->parameter_value;
    }
    
    $parameter_value = implode("\n", $this->chop($this->source, $this->start[0], $this->start[1], $this->end[0], $this->end[1]));
    $parameter_value = $this->trim($parameter_value);
    
    if ($parameter_value{0} == '"' || $parameter_value{0} == "'") {
      $object = new DojoString($parameter_value);
      $this->parameter_value = $object;
    }
    elseif ($parameter_value{0} == '{') {
      $object = new DojoObject($this->source, $this->code, $this->package_name, $this->compressed_package_name, $this->function_name, $this->compressed_function_name);
      $object->setStart($this->start[0], $this->start[1]);
      $object->setEnd($this->end[0], $this->end[1]);
      $this->parameter_value = $object;
    }
    else {
      $this->parameter_value = $parameter_value;
    }

    return $this->parameter_value;
  }
  
  public function getType()
  {
    if ($this->parameter_type) {
      return $this->parameter_type;
    }
    
    $parameter_type = implode("\n", $this->chop($this->source, $this->start[0], $this->start[1], $this->end[0], $this->end[1]));
    preg_match_all('%(?:^\s*/\*(.*)\*/|//(.*)$|/\*(.*)\*/\s*$)%', $parameter_type, $matches, PREG_SET_ORDER);
    
    $parameter_type = '';
    foreach ($matches as $match) {
      array_shift($match);
      $match = implode($match);
      if ($match) {
        if (!$parameter_type) {
          $parameter_type = $match;
        }
        else {
          $parameter_type .= ' ' . $match;
        }
      }
    }
    
    return $this->parameter_type = $parameter_type;
  }
}
  
?>