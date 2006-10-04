<?php

require_once('DojoParameters.php');
require_once('Text.php');

class DojoFunctionCall
{
  private $dojo;
  private $package;
  private $start;
  private $end;
  private $parameters;
  
  public function __construct($dojo, $package)
  {
    $this->dojo = $dojo;
    $this->package = $package;
    $this->parameters = new DojoParameters($dojo, $package);
  }
  
  public function setStart($line, $position)
  {
    $this->start = array($line, $position);
  }
  
  public function setEnd($line, $position)
  {
    $this->end = array($line, $position);
  }
  
  public function build()
  {
    if (!$this->start) {
      die("DojoFunctionCall->build() used before setting a start position");
    }

    $code = $this->package->getCode();
    $this->parameters->setStart($this->start[0], strpos($code[$this->start[0]], '(', $this->start[1]));
    $end = $this->parameters->build();

    $this->setEnd($end[0], $end[1]);
    return $end;
  }
  
  public function getParameter($pos)
  {
    return $this->parameters->getParameter($pos);
  }
  
  public function getParameters()
  {
    return $this->parameters->getParameters();
  }
}

?>