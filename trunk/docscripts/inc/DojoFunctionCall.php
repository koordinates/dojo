<?php

require_once('DojoParameters.php');

class DojoFunctionCall
{
  private $package;
  private $start;
  private $end;
  private $name;
  private $parameters;
  
  public function __construct($package, $line_number = false, $position = false)
  {
    $this->package = $package;
    if ($line_number !== false && $position !== false) {
      $this->setStart($line_number, $position);
    }
    $this->parameters = new DojoParameters($package);
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
  
  public function getName()
  {
    if ($this->name) {
      return $this->name;
    }
    
    $line = Text::chop($this->package->getCode(), $this->start[0], $this->start[1], $this->start[0]);
    $line = $line[$this->start[0]];
    return $this->name = trim(substr($line, 0, strpos($line, '(')));
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