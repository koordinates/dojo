<?php

require_once('DojoFunction.php');

class DojoFunctionDeclare extends DojoFunction
{
  protected $content_start = array(0, 0);
  protected $content_end = array(0, 0);
  protected $function_name = "";

  public function __construct(&$source, &$code, $package_name, $compressed_package_name, $function_name = false)
  {
    if ($function_name) {
      $this->setFunctionName($function_name);
    }
    parent::__construct($source, $code, $package_name, $compressed_package_name);
  }
  
  public function setContentStart($line_number, $position)
  {
    $this->content_start = array($line_number, $position);
    $this->content_end = array($line_number, strlen($this->source[$line_number]) - 1);
  }
  
  public function setContentEnd($line_number, $position)
  {
    $this->content_end = array($line_number, $position);
  }
  
  public function setFunctionName($function_name)
  {
    $this->function_name = $function_name;
  }
  
  public function getFunctionName()
  {
    return $this->function_name;
  }
}

?>