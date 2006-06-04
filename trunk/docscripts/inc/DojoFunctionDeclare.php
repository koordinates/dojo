<?php

require_once('DojoFunction.php');

class DojoFunctionDeclare extends DojoFunction
{
  protected $content_start = array(0, 0);
  protected $content_end = array(0, 0);
  protected $function_name = "";
  protected $block_comment_keys = array();
  protected $block_comments = array();

  public function __construct(&$source, &$code, $package_name, $compressed_package_name, $function_name = false)
  {
    if ($function_name) {
      $this->setFunctionName($function_name);
    }
    parent::__construct($source, $code, $package_name, $compressed_package_name);
  }
  
  public function setContentStart($line_number, $position)
  {
    $this->content_start = array($line_number, $position);
    $this->content_end = array($line_number, strlen($this->source[$line_number]) - 1);
  }
  
  public function setContentEnd($line_number, $position)
  {
    $this->content_end = array($line_number, $position);
  }
  
  public function setFunctionName($function_name)
  {
    $this->function_name = $function_name;
  }
  
  public function getFunctionName()
  {
    return $this->function_name;
  }

  public function addBlockCommentKey($block_comment_key) {
    $this->block_comment_keys[] = $block_comment_key;
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