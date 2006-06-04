<?php

require_once('Dojo.php');
require_once('DojoParameter.php');

class DojoFunction extends Dojo
{
  protected $start = array(0, 0);
  protected $end = array(0, 0);
  protected $parameter_start = array(0, 0);
  protected $parameter_end = array(0, 0);
  protected $function_name;
  protected $compressed_function_name;
  protected $parameters = array(); // A list of all parameters in this function call or declaration
  protected $this_function = "";
  
  public function __construct(&$source, &$code, $package_name, $compressed_package_name)
  {
    $this->source = $source;
    $this->code = $code;
    $this->package_name = $package_name;
    $this->compressed_package_name = $compressed_package_name;
    
    $this->end = $this->parameter_end = $this->content_end = array(count($this->code) - 1, strlen(end($this->code)) - 1);
  }
  
  public function setFunctionName($function_name) {
    $this->function_name = $function_name;
  }
  
  public function setStart($line_number, $position)
  {
    $this->start = array($line_number, $position);
    $this->end = array($line_number, strlen($this->source[$line_number]) - 1);
  }
  
  /**
   * If this function is part of an object, this states the name of the function
   * that the this variable refers to.
   *
   * @param string $this_function
   */
  public function setThis($this_function)
  {
    $this->this_function = $this_function;
  }
  
  public function isThis()
  {
    return !empty($this->this_function);
  }
  
  public function getThis()
  {
    return $this->this_function;
  }
  
  public function setEnd($line_number, $position)
  {
    $this->end = array($line_number, $position);
  }
  
  public function setParameterStart($line_number, $position)
  {
    $this->parameter_start = array($line_number, $position);
    $this->parameter_end = array($line_number, strlen($this->source[$line_number]) - 1);
  }
  
  public function setParameterEnd($line_number, $position)
  {
    $this->parameter_end = array($line_number, $position);
  }
  
  public function getAll()
  {
    return $this->chop($this->source, $this->start[0], $this->start[1], $this->end[0], $this->end[1]);
  }
  
  public function getParameter($index)
  {
    if (empty($this->parameters)) {
      $this->getParameters();
    }

    if ($this->parameters[0]) {
      return $this->parameters[0];
    }
    return false;
  }
  
  /**
   * TODO: We should set a start and finish position for each parameter
   * The parameter object can figure out what's comments from what's not
   *
   */
  public function getParameters()
  {
    if ($this->parameters) {
      return $this->parameters;
    }
    
    $paren_balance = 0;
    $block_balance = 0;
    $start = $this->parameter_start[1];
    
    $lines = $this->chop($this->code, $this->parameter_start[0], $this->parameter_start[1], $this->parameter_end[0], $this->parameter_end[1], true);
    foreach ($lines as $line_number => $line) {
      if (trim($line) == '') {
        $start = 0;
        continue;
      }
      
      for ($i = $start; $i < strlen($line); $i++) {
        $start = 0;
        if (!isset($parameter)) {
          $parameter = new DojoParameter($this->source, $this->code, $this->package_name, $this->compressed_package_name, $this->function_name, $this->compressed_function_name);
          if ($i + 1 < strlen($line)) {
            $parameter->setStart($line_number, $i + 1);
          }
          else {
            $parameter->setStart($line_number + 1, 0);
          }
        }
        
        $char = $line{$i};
        if ($char == '(') {
          ++$paren_balance;
        }
        elseif ($char == ')') {
          --$paren_balance;
        }
        elseif ($char == '{') {
          ++$block_balance;
        }
        elseif ($char == '}') {
          --$block_balance;
        }
        
        if (!$paren_balance && !$block_balance && $char == ',') {
          $parameter->setEnd($line_number, $i - 1);
          $this->parameters[] = $parameter;
          unset($parameter);
        }
      }
    }
    
    if ($parameter) {
      $parameter->setEnd($this->parameter_end[0], $this->parameter_end[1] - 1);
      $this->parameters[] = $parameter;
    }
    
    return $this->parameters;
  }

  protected function chop($array, $start_line, $start_position, $end_line, $end_position, $exclusive = false)
  {
    $exclusive = round($exclusive);
    $lines = array_slice($array, $start_line, $end_line - $start_line + 1, true);
    if ($start_position > 0) {
      $lines[$start_line] = $this->blankOutAt($lines[$start_line], 0, ($exclusive) ? $start_position : $start_position - 1);
    }
    $lines[$end_line] = $this->blankOutAt($lines[$end_line], ($exclusive) ? $end_position : $end_position + 1, strlen($lines[$end_line]));
    return $lines;
  }
  
  /**
   * Starting at a set position, it looks for a matching character.
   * 
   * Character at the position must be a '{' or ')'
   *
   * @param int $line_number
   * @param int $position
   */
  protected function findMatchingChar($line_number, $position) {
    
  }
}

?>