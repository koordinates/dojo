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
    $this->keys[] = $key;
  }
  
  public function getSource()
  {
    $this->getBlockCommentKeys();
    $source = array();
    $lines = Text::chop($this->package->getSource(), $this->comment_end[0], $this->comment_end[1], $this->end[0], $this->end[1], true);
    foreach ($lines as $line_number => $line) {
      if (empty($line)) continue;
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

    $comments = array(); 
    $multiline = false;
    $key = '';
    $buffer = '';
    $lines = Text::chop($this->package->getSource(), $this->start[0], $this->start[1], $this->end[0], $this->end[1], true);
    $grepped = preg_grep('%^\W*(' . implode('|', $this->keys) . ')\b%', $lines);
    foreach ($lines as $line_number => $line) {
      $line = trim($line);
      if (!$line) continue;
      $opener = substr($line, 0, 2);
      $closer = substr($line, -2);
      if ($opener == '/*' && $closer == '*/') {
        $line = '// ' . substr($line, 2, -2);
      }
      
      if ($multiline) {
        if (($pos = strpos($line, 0, '*/')) !== false) {
          $multiline = false;
          $replacing = substr($line, 0, $pos);
          $line = str_replace($replacing, '', $line);
          $buffer .= ' ' . $replacing;
        }
      }
      
      if ($multiline) {
        // Leave it liks that
      }
      elseif ($opener == '//') {
        $line = substr($line, 2);
      }
      elseif (preg_match_all('%/\*\s*(.*?)\s*\*/%', $line, $matches)) {
        foreach ($matches[0] as $match_number => $match) {
          if (!$match_number) {
            $line = str_replace($match, '// ' . $matches[1][$match_number], $line);
          }
          else {
            $line = str_replace($match, ' ' . $matches[1][$match_number], $line);
          }
        }
      }
      elseif ($opener == '/*') {
        $line = substr($line, 2);
        $multiline = true;
      }
      else {
        $this->comments[$key] = $buffer;
        $key = '';
        $buffer = '';
        $this->comment_end = array($line_number, 0);
        break;
      }
      
      if ($grepped[$line_number]) {
        if (preg_match('%^\W*(' . implode('|', $this->keys) . ')\W*%', $line, $match)) {
          $line = str_replace($match[0], '', $line);
          $key = $match[1];
        }
      }

      $buffer .= $line . ' ';
    }
    
    if ($key) {
      $this->comments[$key] = $buffer;
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