<?php

require_once('DojoFunction.php');
require_once('DojoObject.php');
require_once('DojoArray.php');

class DojoObject extends DojoFunction
{
  public $keys = array();
  
  public function __construct(&$source, &$code, $package_name, $compressed_package_name, $function_name, $compressed_function_name)
  {
    $this->source = $source;
    $this->code = $code;
    $this->package_name = $package_name;
    $this->compressed_package_name = $compressed_package_name;
    $this->function_name = $function_name;
    $this->compressed_function_name = $compressed_function_name;
    
    $this->end = $this->parameter_end = $this->content_end = array(count($this->code) - 1, strlen(end($this->code)) - 1);
  }
  
  public function getKeys() {
    if ($this->keys) {
      return array_keys($this->keys);
    }
    
    $lines = $this->chop($this->code, $this->start[0], $this->start[1], $this->end[0], $this->end[1]);
    foreach ($lines as $line_number => $line) {
      if (($pos = strpos($line, '{')) !== false) {
        $this->setParameterStart($line_number, $pos);
        break;
      }
    }
    foreach (array_reverse($lines, true) as $line_number => $line) {
      if (($pos = strrpos($line, '}')) !== false) {
        $this->setParameterEnd($line_number, $pos);
        break;
      }
    }
    
    $parameters = $this->getParameters();
    foreach ($parameters as $parameter) {
      $lines = $parameter->getRawValue();
      $source_lines = $parameter->getRawSource();
      foreach ($lines as $line_number => $line) {
        if (trim($line) == '') {
          continue;
        }
        
        $trimmed_line = $this->trim($line);
        if (preg_match('%([0-9a-zA-Z_.$]+):%', $trimmed_line, $match)) {
          $lines[$line_number] = $this->blankOut($match[0], $lines[$line_number]);
          $source_lines[$line_number] = $this->blankOut($match[0], $source_lines[$line_number]);
          
          $end = end($lines);
          $this->keys[$match[1]] = array(
            'lines' => $lines,
            'source' => $source_lines
          );
        }
      }
    }
    
    return array_keys($this->keys);
  }
  
  public function isFunction($key) {
    $value = $this->getValue($key);
    return $value instanceof DojoFunctionDeclare;
  }
  
  public function isString($key) {
    $value = $this->getValue($key);
    if (is_string($value)) {
      return $value{0} == '"' || $value{0} == "'";
    }
    return false;
  }
  
  public function getValue($key) {
    if (empty($this->keys)) {
      $this->getKeys();
    }
    
    if (!is_array($this->keys[$key])) {
      return $this->keys[$key];
    }
    
    $lines = $this->keys[$key]['lines'];
    foreach ($lines as $line_number => $line) {
      if (trim($line) == '') {
        continue;
      }
      
      if (preg_match('%^\s*\[%', $line)) {
        $array = new DojoArray($this->source, $this->code, $this->package_name, $this->compressed_package_name);
        $array->setStart($line_number, strpos($line, '['));
        $array->setParameterStart($line_number, strpos($line, '['));
        foreach (array_reverse($lines, true) as $line_number => $line) {
          if (($pos = strrpos($line, ']')) !== false) {
            $array->setParameterEnd($line_number, $pos);
            $array->setEnd($line_number, $pos);
            return $array;
          }
        }
        return;
      }
      elseif (preg_match('%^\s*function\s*\(%', $line)) {
        $declare = new DojoFunctionDeclare($this->source, $this->code, $this->package_name, $this->compressed_package_name, $this->function_name . '.' . $key);
        $declare->setThis($this->function_name);
        $declare->setStart($this->start[0], $this->start[1]);
        $declare->setEnd($this->end[0], $this->end[1]);
        $start = false;
        $end = false;
      }
      
      if ($declare) {
        if (!$start && ($pos = strpos($line, '(')) !== false) {
          $declare->setParameterStart($line_number, $pos);
          $start = true;
        }
        
        if (!$end && ($pos = strpos($line, ')')) !== false) {
          $declare->setParameterEnd($line_number, $pos);
        }
        
        if (($pos = strpos($line, '{')) !== false) {
          $declare->setContentStart($line_number, $pos);
          foreach (array_reverse($lines, true) as $line_number => $line) {
            if (($pos = strrpos($line, '}')) !== false) {
              $declare->setContentEnd($line_number, $pos);
              $declare->setEnd($line_number, $pos);
              $this->keys[$key] = $declare;
              return $this->keys[$key];
            }
          }
        }
      }
    }
    
    return $this->keys[$key] = $this->trim(implode("\n", $this->keys[$key]['source']));
  }
}

?>