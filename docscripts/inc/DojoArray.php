<?php

require_once('DojoFunction.php');

class DojoArray extends DojoFunction
{
  protected $items = array();
  
  public function get($index)
  {
    if (!$this->items) {
      $this->getAll();
    }
    
    return $this->items[$index];
  }
  
  public function getAll()
  {
    if ($this->items) {
      return $this->items;
    }
    
    $parameters = $this->getParameters();
    foreach ($parameters as $parameter) {
      $this->items[] = $parameter->getValue();
    }

    return $this->items;
  }
  
  public function size()
  {
    return count($this->items);
  }
}

?>