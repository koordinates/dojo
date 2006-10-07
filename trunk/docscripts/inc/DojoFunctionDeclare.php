<?php

require_once('DojoFunctionBody.php');
require_once('DojoBlock.php');

class DojoFunctionDeclare extends DojoBlock
{
  private $object = 'DojoFunctionDeclare';
  
  private $parameters;
  private $name;
  private $body;
  
  private $anonymous = false;
  private $prototype = '';
  private $instance = '';

  public function __construct($package, $line_number = false, $position = false)
  {
    parent::__construct($package, $line_number, $position);
    $this->parameters = new DojoParameters($package);
    $this->body = new DojoFunctionBody($package);
  }

  public function getFunctionName()
  {
    return $this->function_name;
  }
  
  public function setFunctionName($function_name)
  {
    $this->function_name = $function_name;
  }
  
  public function setPrototype($function_name)
  {
    $this->prototype = $function_name;
  }
  
  public function setInstance($function_name)
  {
    $this->instance = $function_name;
  }
  
  public function isAnonymous()
  {
    return $this->anonymous;
  }
  
  public function isThis()
  {
    return ($this->prototype || $this->instance);
  }
  
  public function getThis()
  {
    return ($this->prototype) ? $this->prototype : $this->instance;
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
    if ($this->end) {
      return $this->end;
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
      if (($pos = strpos($name, '.prototype.')) !== false) {
        $this->prototype = substr($name, 0, $pos);
        $name = str_replace('.prototype.', '', $name);
      }
      if (($pos = strpos($name, 'this.')) === 0) {
        $this->instance = substr($name, 0, $pos);
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
        return $this->body->build();
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
  
  public function addBlockCommentKey($key)
  {
    $this->body->addBlockCommentKey($key);
  }
  
  public function getBlockCommentKeys() 
  {
    return $this->body->getBlockCommentKeys();
  }
  
  public function getBlockComment($key)
  {
    return $this->body->getBlockComment($key);
  }
  
  public function getSource()
  {
    return $this->body->getSource();
  }
}

?>