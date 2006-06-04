<?php

require_once('DojoFunction.php');

class DojoFunctionCall extends DojoFunction
{
  
  public function __construct(&$source, &$code, $package_name, $compressed_package_name, $function_name)
  {
    $this->setFunctionName($name);
    parent::__construct($source, $code, $package_name, $compressed_package_name);
  }
  
  public function getFunctionName()
  {
    return $this->function_name;
  }
  
}

?>