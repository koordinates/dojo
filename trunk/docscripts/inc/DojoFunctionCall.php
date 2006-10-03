<?php

require_once('DojoFunction.php');
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
  }
  
  public function setStart($line, $position)
  {
    $this->start = array($line, $position);
  }
  
  public function setEnd($line, $position)
  {
    $this->end = array($line, $position);
  }
  
  public function buildFrom($line_number, $start)
  {
    $this->setStart($line_number, $start);
    $this->parameters = new DojoParameters($this->dojo, $this->package);
    
    $lines = $this->package->getCode();
    $lines = Text::chop($lines, $line_number, $start);
    $line = $lines[$line_number];
    $parameter_start = array($line_number, strpos($line, '(', $start));

    foreach($lines as $line_number => $line) {
      $end = strpos($line, ')', $start);
      if ($end) {
        $this->setEnd($line_number, $end);
        $this->parameters->buildParameters($parameter_start[0], $parameter_start[1], $line_number, $end);
        return;
      }
      else {
        $i = $line_number;
        $balance = 0;
        do {
          $line = $lines[$i];
          $chars = array();
          for ($j = 0; $j < strlen($line); $j++) {
            $chars[] = $line{$j};
          }
  
          if (isset($start)) {
            $chars = array_slice($chars, $start, strlen($line), true);
          }
          unset($start);
  
          $chars = preg_grep('%[()]%', $chars);
          
          foreach ($chars as $char_number => $char) {
            if ($char == '(') {
              ++$balance;
            }
            elseif ($char == ')') {
              --$balance;
              if (!$balance) {
                $this->setParameterEnd($i, $char_number);
                $this->setEnd($i, $char_number);
                break 2;
              }
            }
          }
          ++$i;
        }
        while($i < count($this->code));
      }
    }
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