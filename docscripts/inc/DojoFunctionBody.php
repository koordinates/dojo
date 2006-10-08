<?php

require_once('DojoBlock.php');

class DojoFunctionBody extends DojoBlock
{
	private $object = 'DojoFunctionBody';

  private $comment_end;

  private $keys = array();
  private $comments = array();
  private $return_comments = array();
  private $instance_variables = array();
  private $this_inheritance_calls = array();
  
  public function build()
  {
		if (!$this->start) {
      die("DojoFunctionBody->build() used before setting a start position");
    }
    if ($this->end) {
      return $this->end;
    }
		
		$balance = 0;
		$start_position = $this->start[1];
		$lines = Text::chop($this->package->getCode(), $this->start[0], $this->start[1], false, false, true);
    return $this->end = Text::findTermination($lines, '}', '{}');
  }
  
  public function addBlockCommentKey($key)
  {
    if ($key) {
      $this->keys[] = $key;
    }
  }
  
  public function getSource()
  {
    $this->getBlockCommentKeys();
    $source = array();
    $lines = Text::chop($this->package->getSource(), $this->comment_end[0], $this->comment_end[1], $this->end[0], $this->end[1], true);
    foreach ($lines as $line_number => $line) {
      $trimmed_line = trim($line);
      if ($trimmed_line === '') continue;
      $source[] = $line;
    }
    return implode("\n", $source);
  }
  
  public function getBlockComment($key)
  {
    $value = '';
    $this->getBlockCommentKeys();
    if (!empty($this->comments[$key])) {
      $value = preg_replace('%\s+%', ' ', trim($this->comments[$key]));
    }
    return $value;
  }
  
  public function getBlockCommentKeys() 
  {
    if ($this->block_comments) { 
      return array_keys($this->block_comments); 
    }
    
    $this->build();

    $expression = '%^(' . implode('|', $this->keys) . ')\W*%';
    $buffer = array();
    $key = '';
    
    $lines = Text::chop($this->package->getSource(), $this->start[0], $this->start[1], $this->end[0], $this->end[1], true);
    foreach ($lines as $line_number =>  $line) {
      list($comment , , $data, $multiline) = Text::findComments($line, $multiline);
      if (preg_match($expression, $comment, $match)) {
        if ($buffer && $key) {
          $this->comments[$key] = implode(' ', $buffer);
        }
        $key = $match[1];
        if ($match[0] == $comment) {
          $comment = '';
        }
        else {
          $comment = substr($comment, strlen($match[0]));
        }
      }
      
      if ($data) {
        $this->comment_end = array($line_number, 0);
        break;
      }
      
      if ($comment !== '') {
        $buffer[] = $comment;
      }
    }
    
    if ($buffer && $key) {
      $this->comments[$key] = implode(' ', $buffer);
    }

    if (!$this->comment_end) {
      $this->comment_end = $this->end;
    }

    return array_keys($this->comments);
  }
  
  public function getInstanceVariableNames()
  {
    if ($this->instance_variables) {
      return $this->instance_variables;
    }
    
    $this->build();
    $lines = Text::chop($this->package->getCode(), $this->start[0], $this->start[1], $this->end[0], $this->end[1], true);
    foreach ($lines as $line) {
      if (preg_match('%\bthis\.([a-zA-Z0-9._$]+)\s*=%', $line, $match)) {
        $this->instance_variables[] = $match[1];
      }
    }
    return $this->instance_variables;
  }
  
  public function getReturnComments()
  {
    if ($this->return_comments) {
      return $this->return_comments;
    }
    
    $this->build();
    $lines = Text::chop($this->package->getCode(), $this->start[0], $this->start[1], $this->end[0], $this->end[1], true);
    foreach ($lines as $line) {
      if (preg_match('%\breturn\b.*(?://\s*(.*)|/\*\s*(.*)\s*\*/)%', $line, $match)) {
        $this->return_comments[] = $match[1] . $match[2];
      }
    }
    return $this->return_comments;
  }
  
  public function getThisInheritanceCalls()
  {
    if ($this->this_inheritance_calls) {
      return $this->this_inheritance_calls;
    }
    
    $this->build();
    $lines = Text::chop($this->package->getCode(), $this->start[0], $this->start[1], $this->end[0], $this->end[1], true);
    foreach ($lines as $line) {
      if (preg_match('%\b([a-zA-Z0-9_.$]+)\.(?:apply|call)\s*\(%', $line, $match)) {
        $this->this_inheritance_calls[] = $match[1];
      }
    }
    return $this->this_inheritance_calls;
  }

}
  
?>