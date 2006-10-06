<?php

require_once('DojoString.php');
require_once('DojoObject.php');
require_once('DojoFunctionDeclare.php');

class DojoParameter
{
	private $package;
	private $start;
	private $end;
  private $parameter_value;
	
  public function __construct($package)
  {
		$this->package = $package;
  }
  
  public function getRawValue()
  {
  }
  
  public function getRawSource()
  {
  }
	
	public function setStart($line, $position)
	{
		$this->start = array($line, $position);
	}
	
	public function setEnd($line, $position)
	{
		$this->end = array($line, $position);
	}
  
  public function isA($class)
  {
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

    $code = $this->package->getCode();
    $start_line = $this->start[0];
    $start_position = $this->start[1] + 1;
    if ($start_position > strlen($code[$start_line])) {
      ++$start_line;
      $start_position = 0;
    }
    
    $paren_balance = 0;
    $block_balance = 0;
    $bracket_balance = 0;
    
    $lines = Text::chop($code, $this->start[0], $this->start[1], false, false, true);    
    foreach ($lines as $line_number => $line) {
      if ($start_line >  $line_number) {
        continue;
      }

      $chars = array_slice(Text::toArray($line), $start_position, strlen($line), true);
      $start_position = 0;
      foreach ($chars as $char_position => $char) {
        if (($char == ',' || $char == ')') && !$paren_balance && !$block_balance && !$bracket_balance) {
          $this->setEnd($line_number, $char_position);
          return $this->end;
        }

        if ($char == '(') {
          ++$paren_balance;
        }
        elseif ($char == ')') {
          --$paren_balance;
        }
        elseif ($char == '[') {
          ++$block_balance;
        }
        elseif ($char == ']') {
          --$block_balance;
        }
        elseif ($char == '{') {
          ++$bracket_balance;
        }
        elseif ($char == '}') {
          --$bracket_balance;
        }
      }
    }
  }
  
  public function getString()
  {
    if (!$this->parameter_value) {
      $this->parameter_value = $this->getValue();
    }
    
    if ($this->parameter_value instanceof DojoString) {
      return $this->parameter_value->getValue();
    }
    
    return '';
  }

  public function getValue()
  {
    if ($this->parameter_value) {
      return $this->parameter_value;
    }

    $parameter_value = Text::trim(implode("\n", Text::chop($this->package->getSource(), $this->start[0], $this->start[1], $this->end[0], $this->end[1], true)));
    
    if ($parameter_value{0} == '"' || $parameter_value{0} == "'") {
      $object = new DojoString($parameter_value);
      $this->parameter_value = $object;
    }
    elseif ($parameter_value{0} == '{') {
      $object = new DojoObject($this->source, $this->code, $this->package_name, $this->compressed_package_name, $this->function_name, $this->compressed_function_name);
      $object->setStart($this->start[0], $this->start[1]);
      $object->setEnd($this->end[0], $this->end[1]);
      $this->parameter_value = $object;
    }
    elseif (strpos($parameter_value, 'function') === 0) {
    	$function = new DojoFunctionDeclare($this->package);
      $code = $this->package->getCode();
      $start = $this->start;
      while (($pos = strpos($code[$start[0]], 'function')) === false) {
        ++$start[0];
      }
      $function->setStart($start[0], $pos);
      $function->build();
    	$this->parameter_value = $function;
    }
    else {
      $this->parameter_value = $parameter_value;
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