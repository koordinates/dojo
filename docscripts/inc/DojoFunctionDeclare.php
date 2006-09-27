<?php

require_once('DojoFunction.php');

class DojoFunctionDeclare
{
  private $dojo;
  private $package;
  private $start;
  private $end;

  public function __construct($dojo, $package)
  {
    $this->dojo = $dojo;
    $this->package = $package;
  }
  
  public function setStart($line_number, $position)
  {
    $this->start = array($line_number, $position);
  }
  
  public function setEnd($line_number, $position)
  {
    $this->end = array($line_number, $position);
  }
  
  /**
   * This sets the opening { of the function content block
   *
   * @param int $line_number
   * @param int $position
   */
  public function setContentStart($line_number, $position)
  {
    if (!is_int($line_number) || !is_int($position)) {
      throw new Exception('Inputs to setContentStart must be integers');
    }
    $this->content_start = array($line_number, $position);
    $this->content_end = array($line_number, strlen($this->source[$line_number]) - 1);
  }
  
  /**
   * This sets the closing { of the function content block
   *
   * @param int $line_number
   * @param int $position
   */
  public function setContentEnd($line_number, $position)
  {
    if (!is_int($line_number) || !is_int($position)) {
      throw new Exception('Inputs to setContentEnd must be integers');
    }
    $this->content_end = array($line_number, $position);
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
  
  public function setAnonymous($anonymous)
  {
    $this->anonymous = $anonymous;
  }
  
  public function isAnonymous()
  {
    return $this->anonymous;
  }

  /**
   * Sets a valid key for the initial block comment
   * 
   * This will make any line starting with this key (which can end with a colon)
   * be tied to that key. Anything in the comment block not associated with a key
   * will be ignored
   *
   * @param string $block_comment_key
   */
  public function addBlockCommentKey($block_comment_key) {
    if (!is_string($block_comment_key)) {
      throw new Exception('Key for addBlockCommentKey must be a string');
    }
    $this->block_comment_keys[] = $block_comment_key;
  }
  
  public function getThisVariableNames()
  {
    if ($this->this_variable_names) {
      return array_keys($this->this_variable_names);
    }
    
    $lines = Text::chop($this->package->getCode(), $this->content_start[0], $this->content_start[1], $this->content_end[0], $this->content_end[1], true);
    if ($variables = preg_grep('%\bthis\.[a-zA-Z0-9_.$]+\s*=%', $lines)) {
      foreach (array_keys($variables) as $start_line_number) {
        $line = $lines[$start_line_number];
        preg_match('%\bthis\.([a-zA-Z0-9_.$]+)\s*=%', $line, $match);
        $name = $match[1];
        $pos = strpos($line, $match[0]) + strlen($match[0]);
        $param_balance = 0;
        $block_balance = 0;
        $value = array();
  
        for ($line_number = $start_line_number; $line_number < count($this->code); $line_number++) {
          if (!$param_balance && !$block_balance && $value) {
            $this->this_variable_names[$name] = $value;
            continue;
          }
          
          $line = $lines[$line_number];
          $chars = array_values(array_diff(preg_split('%%', $line), array('')));
          for ($char_pos = $pos; $char_pos < count($chars); $char_pos++) {
            $pos = 0;
            $char = $line{$char_pos};
  
            if ($char == '(') {
              ++$param_balance;
            }
            elseif ($char == ')') {
              --$param_balance;
            }
            elseif ($char == '{') {
              ++$block_balance;
            }
            elseif ($char == '}') {
              --$block_balance;
            }
            
            if (!$param_balance && !$block_balance && $char == ';') {
              $this->this_variable_names[$name] = $value;
              $value = array();
              continue 3;
            }
            
            $value[$line_number] .= $char;
          }
        }
      }
      
      if ($value) {
        $this->this_variable_names[$name] = $value;
      }
    }
    
    return array_keys($this->this_variable_names);
  }
  
  /**
   * Gets a variable for a this.variable
   * 
   * TODO: If this is a function, etc.
   *
   * @param unknown_type $this_variable_name
   */
  public function getThisVariable($this_variable_name)
  {
    return $this->this_variable_names[$this_variable_name];
  }
  
  public function buildFunction(){
  	$lines = Text::chop($this->package->getCode(), $this->start[0], $this->start[1], count($this->code) - 1, strlen($this->code[count($this->code) - 1]), false);
	
	  $this->setParameterStart($this->start[0], strpos($lines[0], '('));
	
	  $content_start = false; // For content start
	  $parameter_end = false; // For parameter end
	
	  $balance = 0;
	
	  for ($line_number = $this->start[0]; $lines[$line_number] !== false; $line_number++) {
	    $line = $lines[$line_number];
	    if (trim($line) == '') {
	      continue;
	    }
	    
	    if (!$content_start && ($pos = strpos($line, '{')) !== false) {
	      $content_start = true;
	      $start = $pos;
	      $this->setContentStart($line_number, $pos);
	    }
	    if (!$parameter_end && ($pos = strpos($line, ')')) !== false) {
	      $parameter_end = true;
	      $this->setParameterEnd($line_number, $pos);
	    }
	    
	    if ($content_start) {
	      for ($char_pos = $start; $char_pos < strlen($line); $char_pos++) {
	        $start = 0;
	        $char = $line{$char_pos};
	        
	        if ($char == '{') {
	          ++$balance;
	        }
	        elseif ($char == '}') {
	          --$balance;
	          if (!$balance) {
	            $this->setContentEnd($line_number, $char_pos);
	            $this->setEnd($line_number, $char_pos);
	            return;
	          }
	        }
	      }
	    }
	  }
  }
  
  public function getReturnComments()
  {
    if ($this->returns) {
      return array_keys($this->returns);
    }
    
    $lines = Text::chop($this->package->getSource(), $this->content_start[0], $this->content_start[1], $this->content_end[0], $this->content_end[1], true);
    $returns = preg_grep('%return.*(//|\*/)%', $lines);
    foreach (array_keys($returns) as $start_line_number) {
      $value = '';
      $multiline = false;
      for ($line_number = $start_line_number; $line_number < count($this->source); $line_number++) {
        $line = $lines[$line_number];
        
        if ($multiline) {
          if ($value) {
            $value .= ' ';
          }
          if (($comment_end = strpos($line, '*/')) !== false) {
            $value .= $this->trim(substr($line, 0, $comment_end));
            $line = $this->blankOutAt($line, 0, $comment_end + 1);
            $multiline = false;
          }
          else {
            $value .= $this->trim($line);
            continue;
          }
        }
        
        $pos = strpos($line, 'return') + 6;
        if (($comment_start = strpos($line, '//', $pos)) !== false) {
          $this->returns[] = $this->trim(substr($line, $comment_start + 2));
          continue 2;
        }
        if (($comment_start = strpos($line, '/*', $pos)) !== false) {
          if (($comment_end = strpos($line, '*/', $comment_start)) !== false) {
            $value .= $this->trim(substr($line, $comment_start + 2, $comment_end));
            $this->returns[] = $value;
            continue 2;
          }
          else {
            $multiline = true;
            $value .= $this->trim(substr($line, $comment_start + 2));
          }
        }
      }
    }
    
    return $this->returns;
  }
  
  /**
   * Finds example.call(this
   * functions
   */
  public function getThisInheritanceCalls() {
    if ($this->this_inheritance_calls) {
      return $this->this_inheritance_calls;
    }
    
    $lines = Text::chop($this->package->getCode(), $this->content_start[0], $this->content_start[1], $this->content_end[0], $this->content_end[1], true);
    if ($calls = preg_grep('%\b[a-zA-Z0-9_.$]+\.call\s*\(%', $lines)) {
      foreach (array_keys($calls) as $start_line_number) {
        for ($line_number = $start_line_number; $line_number < count($this->code); $line_number++) {
          $line = $lines[$line_number];
          
          if ($call) {
            if (($comma_pos = strpos($line, ',')) !== false) {
              $value .= $this->trim(substr($line, 0, $comma_pos));
              if ($value == 'this') {
                $this->this_inheritance_calls[] = $call;
                unset($call);
                continue 2;
              }
            }
          }
          
          if (!$call && preg_match('%\b([a-zA-Z0-9_.$]+)\.call\s*\(%', $line, $match)) {
            $call = $match[1];
            $pos = strpos($line, $match[0]);
            $parameter_pos = strpos($line, '(', $pos);
            if (($comma_pos = strpos($line, ',', $parameter_pos)) !== false) {
              $value = $this->trim(substr($line, $parameter_pos + 1, $comma_pos - $parameter_pos - 1));
            }
            else {
              $value = $this->trim(substr($line, $parameter_pos + 1));
            }
            if ($value == 'this') {
              $this->this_inheritance_calls[] = $call;
              unset($call);
              continue 2;
            }
          }
        }
      }
    }
    
    return $this->this_inheritance_calls;
  }
  
  /**
   * Using the keys set by setContentKeys, return which were actually found.
   */
  public function getBlockCommentKeys()
  {
    if ($this->block_comments) {
      return array_keys($this->block_comments);
    }
    
    $comments = array();
    $multiline = false;
    $lines = Text::chop($this->package->getSource(), $this->content_start[0], $this->content_start[1], $this->content_end[0], $this->content_end[1], true);
    foreach ($lines as $line_number => $line) {
      if ($multiline) {
        if (($pos = strpos($line, '*/')) !== false) {
          $multiline = false;
          $value = trim(substr($line, 0, $pos));
          if ($value) {
            if ($comments[$line_number]) {
              $comments[$line_number] .= ' ';
            }
            $comments[$line_number] .= $value;
          }
          $line = $this->blankOut(substr($line, 0, $pos + 2), $line);
        }
        else {
          preg_match('%[^\s*]%', $line, $match);
          $pos = strpos($line, $match[0]);
          $comments[$line_number] = trim(substr($line, $pos));
          $line = $this->blankOut($line, $line);
        }
      }
      
      if (preg_match_all('%/\*(.*)\*/%U', $line, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
          if (!$this->comment_block_start) {
            $this->comment_block_start = array($line_number, strpos($line, $match[0]));
          }
          $line = $this->blankOut($match[0], $line);
          if ($comments[$line_number]) {
            $comments[$line_number] .= ' ';
          }
          $value = trim($match[1]);
          if ($value) {
            $comments[$line_number] .= $value;
          }
        }
      }

      if(preg_match('%(//|/\*)(.*)$%', $line, $match)) {
        if (!$this->comment_block_start) {
          $this->comment_block_start = array($line_number, strpos($line, $match[0]));
        }
        if ($match[1] == '/*') {
          $multiline = true;
        }
        $line = $this->blankOut($match[0], $line);
        $value = trim($match[2]);
        if ($value) {
          if ($comments[$line_number]) {
            $comments[$line_number] .= ' ';
          }
          $comments[$line_number] .= $value;
        }
      }
      
      if (trim($line) != '') {
        $strlen = strlen($line);
        if ($strlen) {
          --$strlen;
        }
        $this->comment_block_end = array($line_number, $strlen);
        break;
      }
    }
    
    $output = array();
    $value = array();
    foreach ($comments as $comment) {
      list($key,) = preg_split('%\s%', $comment, 2);
      $stripped_key = preg_replace('%(^\W+|\W+$)%', '', $key);
      if (in_array($stripped_key, $this->block_comment_keys)) {
        if ($value) {
          $output[$last_key] = implode(' ', $value);
          $value = array();
        }
        $last_key = $stripped_key;
        $value[] = trim(substr($comment, strlen($key)));
      }
      else {
        $value[] = trim($comment);
      }
    }
    if ($value) {
      $output[$last_key] = implode(' ', $value);
    }
    
    $this->block_comments = $output;
    return array_keys($this->block_comments);
  }
  
  public function getBlockComment($block_comment_key)
  {
    return $this->block_comments[$block_comment_key];
  }
  
  public function getSource()
  {
    $lines = Text::chop($this->package->getSource(), $this->content_start[0], $this->content_start[1], $this->content_end[0], $this->content_end[1], true);
    $comments = $this->getBlockCommentKeys(); // Make sure it's here
    if ($this->comment_block_start && $this->comment_block_end) {
      for ($line_number = $this->comment_block_start[0]; $line_number <= $this->comment_block_end[0]; $line_number++) {
        $line = $lines[$line_number];
        if ($this->comment_block_start[0] == $this->comment_block_end[0]) {
          $lines[$line_number] = $this->blankOutAt($line, $this->comment_block_start[1], $this->comment_block_end[1]);
        }
        elseif ($line_number == $this->comment_block_start[0]) {
          $lines[$line_number] = $this->blankOutAt($line, $this->comment_block_start[1]);
        }
        elseif ($line_number == $this->comment_block_end[0]) {
          $lines[$line_number] = $this->blankOutAt($line, 0, $this->comment_block_end[1]);
        }
        else {
          $lines[$line_number] = $this->blankOut($line, $line);
        }
      }
    }
    
    $started = false;
    foreach ($lines as $line_number => $line) {
      if (trim($line) == '') {
        if (!$started) {
          unset($lines[$line_number]);
        }
      }
      else {
        $started = true;
      }
    }
    foreach (array_reverse($lines, true) as $line_number => $line) {
      if (trim($line) == '') {
        unset($lines[$line_number]);
      }
      else {
        break;
      }
    }
    
    return implode("\n", $lines);
  }
  
  protected function getLines()
	{
		return Text::chop($this->package->getCode(), $this->content_start[0], $this->content_start[1], $this->content_end[0], $this->content_end[1], true);
	}
	
	protected function grepLines($lines)
	{
		return preg_grep('%\bthis\.[a-zA-Z0-9_.$]+\s*=\s*(new\s*)?function\s*\(%', $lines);
	}
	
	protected function lineMatches($line)
	{
		if (preg_match('%\bthis\.([a-zA-Z0-9_.$]+)\s*=\s*(?:new\s*)?function\s*\(%', $line, $match)) {
			return $match;
		}
		return false;
	}
	
	protected function shouldSkipFunction($function_name)
	{
	  return false;
	}
	
	protected function reName($function_name)
	{
	  return $this->function_name . '.' . $function_name;
	}
}

?>