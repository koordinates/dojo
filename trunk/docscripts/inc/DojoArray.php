<?php

class DojoArray
{
  private $package;
  private $parameters;
  
  public function __construct($package)
  {
    $this->package = $package;
    $this->parameters = new DojoParameters($package);
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
      die("DojoFunctionArray->build() used before setting a start position");
    }

    $this->parameters->setStart($this->start[0], $this->start[1]);
    $end = $this->parameters->build();
    $this->setEnd($end[0], $end[1]);
    return $end;
  }
}

?>