<?php

require_once('DojoFunction.php');
require_once('Text.php');

class DojoFunctionCall
{
  private $dojo;
  private $package;
  private $start;
  private $parameter_start;
  
  public function __construct($dojo, $package)
  {
    $this->dojo = $dojo;
    $this->package = $package;
  }
  
  public function setStart($line, $position)
  {
    $start = array($line, $position);
  }
  
  public function setParameterStart($line, $position)
  {
    $parameter_start = array($line, $position);
  }
  
  public function buildFrom($line_number, $start)
  {
    $this->setStart($line_number, $start);
    
    $lines = $this->package->getCode();
    $lines = Text::chop($lines, $line_number, $start);
    $this->setParameterStart($line_number, strpos($line, '(', $start));

    $end = strpos($line, ')', $start);
    if ($end) {
      $call->setEnd($line_number, $end);
      $call->setParameterEnd($line_number, $end);
    }
    else {
      $i = $line_number;
      $balance = 0;
      do {
        $line = $this->code[$i];
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
              $call->setParameterEnd($i, $char_number);
              $call->setEnd($i, $char_number);
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

?>