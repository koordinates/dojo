<?php

require_once('DojoBlock.php');
require_once('DojoFunctionBody.php');

class DojoObject extends DojoBlock
{
  private $object = 'DojoObject';
  
  private $values = array();
  private $name = '';
  private $body;
  
  public function __construct($package, $line_number = false, $position = false)
  {
    parent::__construct($package, $line_number, $position);
    $this->body = new DojoFunctionBody($package, $line_number, $position);
  }
  
  public function setName($name)
  {
    $this->name = $name;
  }
  
  public function getName()
  {
    return $this->name;
  }
  
  public function getBlockCommentKeys()
  {
    return $this->body->getBlockCommentKeys();
  }
  
  public function getBlockComment($key)
  {
    return $this->body->getBlockComment($key);
  }
  
  public function addBlockCommentKey($key)
  {
    return $this->body->addBlockCommentKey($key);
  }
  
  public function build()
  {
    if (!$this->start) {
      die("DojoObject->build() used before setting a start position");
    }
    
    $lines = Text::chop($this->package->getCode(), $this->start[0], $this->start[1], false, false, true);
    $end = array($this->start[0], $this->start[1]);

    do {
      $lines = Text::chop($this->package->getCode(), $end[0], $end[1], false, false, true); 
      foreach ($lines as $line_number => $line) {
        if (preg_match('%^\s*([a-zA-Z0-9_$]+|"\s+"):%', $line, $match)) {
          $end = array($line_number, strlen($match[0]));
          if ($match[1]{0} == '"') {
            $key = trim(implode(Text::chop($this->package->getSource(), $line_number, strpos($line, '"') + 1, $line_number, strlen($match[0]) - 3, false)));
          }
          else {
            $key = $match[1];
          }
          break;
        }
      }
      
      if (!$key) {
        $end = Text::findTermination($lines, '}');
      }
      else {
        $parameter = new DojoParameter($this->package, $end[0], $end[1], '}');
        $end = $parameter->build();
        $this->values[$key] = $parameter;
      }
    }
    while ($lines[$end[0]]{$end[1]} != '}');

    $this->setEnd($end[0], $end[1]);
    return $end;
  }
  
  public function getKeys()
  {
    if (!$this->values) {
      $this->build();
    }
    return array_keys($this->values);
  }
  
  public function getValues()
  {
    if (!$this->values) {
      $this->build();
    }
    return $this->values;
  }
}

?>