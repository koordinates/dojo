<?php

require_once('DojoFunction.php');

class DojoFunctionDeclare extends DojoFunction
{
  protected $content_start = array(0, 0);
  protected $content_end = array(0, 0);
  protected $function_name = "";
  protected $block_comment_keys = array();
  protected $block_comments = array();
  protected $this_variable_names = array();

  public function __construct(&$source, &$code, $package_name, $compressed_package_name, $function_name = false)
  {
    if ($function_name) {
      $this->setFunctionName($function_name);
    }
    parent::__construct($source, $code, $package_name, $compressed_package_name);
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
    
    $lines = $this->chop($this->code, $this->content_start[0], $this->content_start[1], $this->content_end[0], $this->content_end[1], true);
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
  
  public function getThisVariable($this_variable_name)
  {
    
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
    $lines = $this->chop($this->source, $this->content_start[0], $this->content_start[1], $this->content_end[0], $this->content_end[1], true);
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
        break;
      }
    }
    
    $output = array();
    $value = array();
    foreach ($comments as $comment) {
      list($key,) = preg_split('%\s%', $comment, 2);
      $stripped_key = preg_replace('%(^\W+|\W+$)%', '', $key);
      if (in_array($stripped_key, $this->block_comment_keys)) {
        $value[] = trim(substr($comment, strlen($key)));
        if ($value) {
          $output[$stripped_key] = implode(' ', $value);
          $value = array();
        }
      }
    }
    if ($value) {
      $output[$key] = implode(' ', $value);
    }
    
    $this->block_comments = $output;
    return array_keys($this->block_comments);
  }
  
  public function getBlockComment($block_comment_key)
  {
    return $this->block_comments[$block_comment_key];
  }
}

?>