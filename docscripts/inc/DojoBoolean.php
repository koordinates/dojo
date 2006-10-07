<?php

class DojoBoolean
{
  private $value = '';
  
  public function __construct($value)
  {
    $this->value = (eval($value));
  }
  
  public function getValue()
  {
    return $this->value;
  }
}

?>