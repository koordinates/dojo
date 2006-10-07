<?php

require_once('DojoFunctionBody.php');
require_once('DojoBlock.php');

class DojoFunctionDeclare extends DojoBlock
{
  private $parameters;
  private $name;
  private $body;
  
  private $anonymous = false;
  private $prototype = false;
  private $instance = false;

  public function __construct($package, $line_number = false, $position = false)
  {
    parent::__construct($package, $line_number, $position);
    $this->parameters = new DojoParameters($package);
    $this->body = new DojoFunctionBody($package);
  }

  /**
   * Getter for the function name
   *
   * @return string
   */
  public function getFunctionName()
  {
    return $this->function_name;
  }
  
  public function isAnonymous()
  {
    return $this->anonymous;
  }
  
  // Should be pulled using DojoFunctionBody
  public function getThisVariableNames()
  {
    if ($this->this_variable_names) {
      return array_keys($this->this_variable_names);
    }
    return array_keys($this->this_variable_names);
  }

  public function build(){
    if (!$this->start) {
      die("DojoFunctionDeclare->build() used before setting a start position");
    }

  	$lines = Text::chop($this->package->getCode(), $this->start[0], $this->start[1]);
    $line = trim($lines[$this->start[0]]);
    if (strpos($line, 'function') === 0) {
      $line = substr($line, 8);
      preg_match('%[^\s]%', $line, $match);
      if ($match[0] != '(') {
        $this->name = trim(substr($line, strpos($line, '(')));
      }
    }
    else {
      $name = trim(substr($line, 0, strpos($line, 'function')));
      if (preg_match('%\s+new\s*%', $name, $match)) {
        $this->anonymous = true;
        $name = str_replace($match[0], '', $name);
      }
      if (strpos($name, '.prototype.') !== false) {
        $this->prototype = true;
        $name = str_replace('.prototype.', '', $name);
      }
      if (strpos($name, 'this.') === 0) {
        $this->instance = true;
        $name = preg_replace('%^this\.%', '', $name);
      }
      $this->name = $name;
    }
    
    $this->parameters->setStart($this->start[0], strpos($lines[$this->start[0]], '('));
    $end = $this->parameters->build();
    
    $lines = Text::chop($this->package->getCode(), $end[0], $end[1]);
    foreach ($lines as $line_number => $line) {
      if (($pos = strpos($line, '{')) !== false) {
        $this->body->setStart($line_number, $pos);
        $end = $this->body->build();
        $this->setEnd($end[0], $end[1]);
        return $end;
      }
    }
  }
}

?>