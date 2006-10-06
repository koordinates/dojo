<?php

require_once('DojoParameter.php');

class DojoParameters
{
  private $package;
  private $parameters = array();
  private $start;
  private $end;
  
  public function __construct($package)
  {
    $this->package = $package;
  }
  
  public function setStart($line_number, $position)
  {
    $this->start = array($line_number, $position);
  }
  
  public function setEnd($line_number, $position)
  {
    $this->end = array($line_number, $position);
  }
  
  public function build()
  {
    if (!$this->start) {
      die("DojoFunctionCall->build() used before setting a start position");
    }

    $code = $this->package->getCode();
    $end = array($this->start[0], $this->start[1]);

    do {
      $parameter = new DojoParameter($this->package);
      $parameter->setStart($end[0], $end[1]);
      $end = $parameter->build();
      
      $this->parameters[] = $parameter;
    }
    while ($code[$end[0]]{$end[1]} != ')');
    
    $this->setEnd($end[0], $end[1]);
    return $end;
  }
  
  public function getParameter($pos)
  {
    if ($this->parameters && !empty($this->parameters[$pos])) {
      return $this->parameters[$pos];
    }
    else {
      return new DojoParameter($package);
    }
  }
  
  public function getParameters()
  {
    if ($this->parameters) {
      return $this->parameters;
    }
    else {
      return array();
    }
  }
}

?>