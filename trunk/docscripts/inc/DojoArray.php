<?php

require_once('DojoBlock.php');

class DojoArray extends DojoBlock
{
  private $object = 'DojoArray';
  
  private $parameters;
  
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