<?php

require_once('DojoFunction.php');

class DojoFunctionCall extends DojoFunction
{
  protected $function_call_name = '';
  
  public function __construct(&$source, &$code, $package_name, $compressed_package_name, $function_call_name)
  {
    $this->function_call_name = $function_call_name;
    parent::__construct($source, $code, $package_name, $compressed_package_name);
  }
  
  public function getFunctionCallName()
  {
    return $this->function_call_name;
  }
  
}

?>