<?php

require_once('DojoBlock.php');

class DojoFunctionBody extends DojoBlock
{
  private $object = 'DojoFunctionBody';

  private $comment_end;

  private $keys = array();
  private $key_sets = array();
  private $comments = array();
  private $return_comments = array();
  private $instance_variables = array();
  private $externalized = array();
  private $externalized_mixins = array();
  private $this_inheritance_calls = array();
  private $extra_initial_comment_block = array();

  public function build() {
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

  public function addBlockCommentLine($line) {
    if (trim($line) != '') {
      $this->extra_initial_comment_block[] = $line;
    }
  }

  public function addBlockCommentKey($key) {
    $this->comments = array();
    if ($key) {
      $this->keys[] = $key;
    }
  }

  /**
   * This key can occur multiple times. eg: example
   */
  public function addBlockCommentKeySet($key) {
    $this->comments = array();
    if ($key) {
      $this->key_sets[] = $key;
    }
  }

  public function getSource() {
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

  private function cleanBlock($text){
    $lines = explode("\n", trim($text));
    $output = array();
    $indented = false;
    $blank = false;
    foreach ($lines as $i => $line) {
      if ($line{0} == "|") {
        if(!$indented){
          $indented = true;
          if (!$blank) {
            $output[] = "";
            if (!$i) {
              $output[] = "";
            }
          }
        }
        $output[] = substr($line, 1);
      }
      else {
        if($indented){
          $indented = false;
          if (empty($line)) {
            if (!$blank) {
              $output[] = "";
            }
          }
        }
        if (empty($line)) {
          $blank = true;
        }
        $output[] = $line;
      }
    }
    return implode("\n", $output);
  }

  public function getBlockComment($key) {
    $value = $this->comments[$key];
    if (!empty($value)) {
      if (is_array($value)) {
        for ($i = 0; $i < count($value); $i++){
          $value[$i] = $this->cleanBlock($value[$i]);
        }
      }
      else {
        $value = $this->cleanBlock($value);
      }
    }
    return $value;
  }

  public function getBlockCommentKeys() {
    if ($this->comments) { 
      return array_keys($this->comments); 
    }

    $this->build();

    $expression = '%^\b(' . implode('|', array_merge($this->keys, $this->key_sets)) . ')\b\W*%';
    $buffer = array();
    $key = '';
    $started = false;

    $lines = Text::chop($this->package->getSource(), $this->start[0], $this->start[1], $this->end[0], $this->end[1], true);
    for ($i = 0; $i < 2; $i++) {
      if ($i == 1) {
        $lines = $this->extra_initial_comment_block;
      }
      foreach ($lines as $line_number =>  $line) {
        list($comment, , , $data, $multiline) = Text::findComments($line, $multiline);

        if ($started && $comment === false) {
          $this->comment_end = array($line_number, 0);
          break;
        }
        elseif ($comment) {
          $started = true;
        }

        if (preg_match($expression, $comment, $match)) {
          if ($buffer && $key) {
            if (in_array($key, $this->key_sets)) {
              $this->comments[$key][] = implode("\n", $buffer);
            }
            else {
              $this->comments[$key] = implode("\n", $buffer);
            }
            $buffer = array();
          }
          $key = $match[1];
          if ($match[0] == $comment) {
            $comment = '';
          }else{
            $comment = substr($comment, strlen($match[0]));
          }
        }

        if ($data) {
          $this->comment_end = array($line_number, 0);
          break;
        }

        $buffer[] = $comment;
      }

      if ($buffer && $key) {
        if (in_array($key, $this->key_sets)) {
          $this->comments[$key][] = implode("\n", $buffer);
        }
        else {
          $this->comments[$key] = implode("\n", $buffer);
        }
        $buffer = array();
      }

      if ($i == 0 && !$this->comment_end) {
        $this->comment_end = $this->start;
      }
    }
    return array_keys($this->comments);
  }

  public function getLocalVariableNames() {
    $internals = array();

    $this->build();
    $lines = Text::chop($this->package->getCode(), $this->start[0], $this->start[1], $this->end[0], $this->end[1], true);
    // Find simple external variable assignment.
    $matches = preg_grep('%var%', $lines);
    foreach ($matches as $line_number => $line) {
      // Check for var groups, or var name =
      if (preg_match('%var\s+[a-zA-Z0-9_.$]+(\s*,\s*[a-zA-Z0-9_.$]+)*%', $line, $match)) {
        preg_match_all('%(?:var\s+([a-zA-Z0-9_.$]+)|,\s([a-zA-Z0-9_.$]+))%', $match[0], $named_matches, PREG_SET_ORDER);
        foreach ($named_matches as $named_match) {
          if (!empty($named_match[1])) {
            $internals[$named_match[1]] = false;
          }
          if (!empty($named_match[2])) {
            $internals[$named_match[2]] = false;
          }
        }
      }
      if (preg_match('%var\s+([a-zA-Z0-9_.$]+)\s*=\s*([a-zA-Z_.$][a-zA-Z0-9_.$]*)\s*[;\n]%', $line, $match)) {
        if (in_array($match[2], array('null', 'true', 'false', 'this'))) continue;
        $internals[$match[1]] = $match[2];
      }
    }

    return $internals;
  }

  /**
   * If these occur inside this function AND reference a local variable, remove them
   */
  public function removeSwallowedMixins(&$possible_mixins) {
    // If any of the mixins happened inside of an executed function, we need to see if
    // they were used on external variables.
    if ($this->externalized_mixins) {
      return $this->externalized_mixins;
    }

    $this->build();
    $internals = $this->getLocalVariableNames();

    foreach ($possible_mixins as $i => $mixin) {
      $parameter = $mixin->getParameter(0);
      if (!$parameter->isA(DojoVariable)) {
        unset($possible_mixins[$i]);
      }
      else {
        $object = $parameter->getVariable();
        if ($object == "this") {
          unset($possible_mixins[$i]);
          continue;
        }
        if (($mixin->start[0] > $this->start[0] || ($mixin->start[0] == $this->start[0] && $mixin->start[1] > $this->start[1]))
            && ($mixin->end[0] < $this->end[0] || ($mixin->end[0] == $this->end[0] && $mixin->end[1] < $this->end[1]))) {
          if (array_key_exists($object, $internals)) {
              unset($possible_mixins[$i]);
          }
          else {
            foreach ($internals as $internal_name => $external_name) {
              if (strpos($object, $internal_name . '.') === 0) {
                $object = $external_name . substr($object, strlen($internal_name));
              }
            }

            $parameter->setVariable($object);
          }
        }
      }
    }
  }

  public function getExternalizedFunctionDeclarations() {
    if ($this->externalized) {
      return $this->externalized;
    }

    $this->build();
    $lines = Text::chop($this->package->getCode(), $this->start[0], $this->start[1], $this->end[0], $this->end[1], true);
    $internals = $this->getLocalVariableNames();

    $matches = preg_grep('%function%', $lines);
    foreach ($matches as $line_number => $line) {
      if (preg_match('%(var)?\s*([a-zA-Z0-9_.$]+)\s*=\s*function\s*\(%', $line, $match)) {
        if ($match[1] || array_key_exists($match[2], $internals)) continue;

        $externalized = new DojoFunctionDeclare($this->package, $line_number, strpos($line, $match[0]));
        $end = $externalized->build();

        $name = $match[2];
        if (strpos($name, 'this.') === 0) continue;

        foreach ($internals as $internal_name => $external_name) {
          if (strpos($name, $internal_name . '.') === 0) {
            if (!$external_name) continue 2;
            $name = $external_name . substr($name, strlen($internal_name));
          }
        }

        $externalized->setFunctionName($name);
        $this->externalized[] = $externalized;
      }
    }

    return $this->externalized;
  }

  public function getInstanceVariableNames() {
    if ($this->instance_variables) {
      return $this->instance_variables;
    }

    $this->build();
    $lines = Text::chop($this->package->getCode(), $this->start[0], $this->start[1], $this->end[0], $this->end[1], true);
    foreach ($lines as $line) {
      if (preg_match('%\bthis\.([a-zA-Z0-9._$]+)\s*=\s*(?!function)%', $line, $match)) {
        $this->instance_variables[] = $match[1];
      }
    }
    return $this->instance_variables;
  }

  public function getInstanceFunctions($function_name) {
    $functions = array();
    $this->build();
    $lines = Text::chop($this->package->getCode(), $this->start[0], $this->start[1], $this->end[0], $this->end[1], true);
    foreach ($lines as $line_number => $line) {
      if (preg_match('%\bthis\.([a-zA-Z0-9._$]+)\s*=\s*function\b%', $line, $match, PREG_OFFSET_CAPTURE)) {
        $function = new DojoFunctionDeclare($this->package, $line_number, $match[0][1]);
        $function->setFunctionName($function_name);
        $end = $function->build();
        $functions[] = $function;
      }
    }
    return $functions;
  }

  public function getReturnComments() {
    if ($this->return_comments) {
      return $this->return_comments;
    }

    $buffer = array();
    $this->getBlockCommentKeys();
    $lines = Text::chop($this->package->getSource(), $this->comment_end[0], $this->comment_end[1], $this->end[0], $this->end[1], true);
    foreach ($lines as $line) {
      if ($multiline) {
        list($first, $middle, $last, $data, $multiline) = Text::findComments($line, $multiline);
        if ($first) {
          $buffer[] = trim($first);
        }
        if ($data) {
          $multiline = false;
          if ($buffer) {
            $this->return_comments[] = implode(' ', array_diff($buffer, array('')));
            $buffer = array();
          }
        }
      }
      if (strpos($line, 'return') !== false) {
        if ($data && $buffer) {
          $this->return_comments[] = implode(' ', array_diff($buffer, array('')));
          $buffer = array();
        }
        list($first, $middle, $last, $data, $multiline) = Text::findComments($line, $multiline);
        if ($last) {
          $buffer[] = $last;
        }
      }
    }

    if ($data && $buffer) {
      $this->return_comments[] = implode(' ', array_diff($buffer, array('')));
    }

    $this->return_comment = array_unique($this->return_comments);

    return $this->return_comments;
  }

  public function getThisInheritanceCalls() {
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