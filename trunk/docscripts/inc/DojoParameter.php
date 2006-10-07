<?php

require_once('DojoString.php');
require_once('DojoNull.php');
require_once('DojoBoolean.php');
require_once('DojoVariable.php');
require_once('DojoObject.php');
require_once('DojoArray.php');
require_once('DojoFunctionDeclare.php');
require_once('DojoBlock.php');

class DojoParameter extends DojoBlock
{
  private $object = 'DojoParameter';
  
  private $terminator = ')';
  
  private $parameter_value;
  
  public function __construct($package, $line_number = false, $position = false, $terminator = ')')
  {
    parent::__construct($package, $line_number, $position);
    $this->terminator = $terminator;
  }
  
  public function isA($class)
  {
    if (!$this->parameter_value) {
      $this->getValue();
    }
    if ($this->parameter_value instanceof $class) {
      return true;
    }
    return false;
  }
  
  public function build()
  {
    if (!$this->start) {
      die("DojoFunctionCall->build() used before setting a start position");
    }

    $lines = Text::chop($this->package->getCode(), $this->start[0], $this->start[1], false, false, true);
    list($line_number, $position) = Text::findTermination($lines, ',' . $this->terminator, '(){}[]');
    $this->setEnd($line_number, $position);
    return $this->end;
  }
  
  public function getString()
  {
    if ($this->isA(DojoString)) {
      return $this->parameter_value->getValue();
    }
    
    return '';
  }
  
  public function getObject()
  {
    if ($this->isA(DojoObject)) {
      return $this->parameter_value;
    }
    return new DojoObject($this->package);
  }
  
  public function getFunction()
  {
    if ($this->isA(DojoFunctionDeclare)) {
      $this->parameter_value->build();
      return $this->parameter_value;
    }
    return new DojoFunctionDeclare($this->package);
  }

  public function getValue()
  {
    if ($this->parameter_value) {
      return $this->parameter_value;
    }

    $lines = Text::chop($this->package->getSource(), $this->start[0], $this->start[1], $this->end[0], $this->end[1], true);
    $parameter_value = Text::trim(implode("\n", $lines));

    if ($parameter_value{0} == '"' || $parameter_value{0} == "'") {
      $this->parameter_value = new DojoString($parameter_value);
    }
    elseif ($parameter_value{0} == '{') {
      foreach ($lines as $line_number => $line) {
        if (($position = strpos($line, '{')) !== false) {
          $this->parameter_value = new DojoObject($this->package, $line_number, $position);
          break;
        }
      }
    }
    elseif (strpos($parameter_value, 'function') === 0) {
      foreach ($lines as $line_number => $line) {
        if (($position = strpos($line, 'function')) !== false) {
          $this->parameter_value = new DojoFunctionDeclare($this->package, $line_number, $position);
          break;
        }
      }
    }
    elseif ($parameter_value{0} == '[') {
      foreach ($lines as $line_number => $line) {
        if (($position = strpos($line, '[')) !== false) {
          $this->parameter_value = new DojoArray($this->package, $line_number, $position);
          break;
        }
      }
    }
    elseif ($parameter_value == 'null' || $parameter_value == 'undefined') {
      $this->parameter_value = new DojoNull($parameter_value);
    }
    elseif ($parameter_value == 'true' || $parameter_value == 'false') {
      $this->parameter_value = new DojoBoolean($parameter_value);
    }
    else {
      $this->parameter_value = new DojoVariable($parameter_value);
    }

    return $this->parameter_value;
  }
  
  public function getType()
  {
    if ($this->parameter_type) {
      return $this->parameter_type;
    }

    $parameter_type = implode("\n", Text::chop($this->package->getSource(), $this->start[0], $this->start[1], $this->end[0], $this->end[1]));
    preg_match_all('%(?:^\s*/\*(.*)\*/|//(.*)$|/\*(.*)\*/\s*$)%', $parameter_type, $matches, PREG_SET_ORDER);
    
    $parameter_type = '';
    foreach ($matches as $match) {
      array_shift($match);
      $match = implode($match);
      if ($match) {
        if (!$parameter_type) {
          $parameter_type = $match;
        }
        else {
          $parameter_type .= ' ' . $match;
        }
      }
    }
    
    return $this->parameter_type = Text::trim($parameter_type);
  }
}
  
?>