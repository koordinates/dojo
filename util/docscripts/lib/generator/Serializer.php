<?php

abstract class Serializer
{
  protected $header = array(); // Array of lines to begin the file with
  protected $footer = array(); // Array of lines to end the file with
  protected $indent = "\t";
  private $file_location;

  private $file;
  private $length = 9999;

  private $queue;
  private $limit = 50;

  // Deal with line parsing
  abstract protected function lineStarts($line); // Returns the ID of the block that this line starts
  abstract protected function lineEnds($line); // Return true if this line closes a block
  abstract protected function linesToRaw($lines); // Convert an array of lines to a raw output

  // Deal with object conversion
  abstract public function toObject($raw, $id=null); // Convert raw output to an object
  abstract public function toString($raw, $id=null); // Convert raw output to a string for serialization
  abstract protected function convertToRaw($object); // Convert an object to a raw value

  // Public stuff
  public function __construct($directory, $suffix, $filename='api') {
    $this->queue = array();
    $this->file_location = $directory . '/' . $filename . '.' . $suffix;
    touch($this->file_location);
    $this->file = fopen($this->file_location, 'r');
  }

  public function __destruct() {
    $this->flush();

    fclose($this->file);
  }

  public function ids($flush = TRUE) {
    if ($flush) {
      $this->flush();
    }

    $ids = array();
    $started = false;

    rewind($this->file);
    while (!feof($this->file)) {
      $line = stream_get_line($this->file, $this->length, "\n");
      if ($started && $this->lineEnds($line)) {
        $started = false;
        continue;
      }
      elseif ($id = $this->lineStarts($line)) {
        $started = true;
        $ids[] = $id;
      }
    }

    return $ids;
  }

  private function getString($id, $include_queue = TRUE) {
    if ($include_queue) {
      foreach (array_reverse($this->queue) as $queue) {
        list($queue_id, $value) = $queue;
        if ($queue_id == $id) {
          return $this->toString($value, $id);
          break;
        }
      }
    }

    $lines = array();
    $started = false;
    $strlen = strlen($this->indent);

    rewind($this->file);
    while (!feof($this->file)) {
      $line = stream_get_line($this->file, $this->length, "\n");
      if ($started) {
        $lines[] = substr($line, $strlen);
        if ($this->lineEnds($line)) {
          return implode("\n", $lines) . "\n";
        }
      }
      elseif ($this->lineStarts($line) == $id) {
        $started = true;
        $lines[] = substr($line, $strlen);
      }
    }
  }

  public function setObject($id, $value) {
    $raw = $this->toRaw($value, $id);
    $this->set($id, $raw);
    return $raw;
  }

  protected function buildResources(&$node, $object) {
    if (!empty($object['#resource'])) {
      $node['#resources'][] = array();
      $resources_node = &$node['#resources'][count($node['#resources']) - 1];
      foreach ($object['#resource'] as $resource) {
        $resources_node['#resource'][] = array();
        $resource_node = &$resources_node['#resource'][count($resources_node['#resource']) - 1];
        $resource_node['content'] = $resource;
      }
    }

    if (!empty($object['#provides'])) {
      $node['#provides'][] = array();
      $provides_node = &$node['#provides'][count($node['#provides']) - 1];
      foreach ($object['#provides'] as $provide) {
        $provides_node['#provide'][] = array();
        $provide_node = &$provides_node['#provide'][count($provides_node['#provide']) - 1];
        $provide_node['content'] = $provide;
      }
    }
  }

  protected function buildMethod(&$method_node, $method, $method_id, $child = TRUE) {
    if ($child) {
      $this->buildResources($method_node, $method);

      $method_node['@name'] = $method_id;

      if ($method_id == 'preamble' || $method_id == 'postscript') {
        $method_node['@constructor'] = $method_id;
      }

      if ($method['instance'] && $method['prototype']) {
        $method_node['@scope'] = 'instance-prototype';
      }
      elseif($method['instance']) {
        $method_node['@scope'] = 'instance';
      }
      elseif($method['prototype']) {        
        $method_node['@scope'] = 'prototype';
      }
      else {                      
        $method_node['@scope'] = 'normal';
      }

      if (!empty($method['tags'])) {
        $method_node['@tags'] = implode(' ', $method['tags']);
      }

      if ($method['private']) {
        $method_node['@private'] = true;
      }

      if ($method['private_parent']) {
        $method_node['@privateparent'] = true;
      }

      if (trim($method['summary'])) {
        $method_node['#summary'][] = array();
        $description_node = &$method_node['#summary'][count($method_node['#summary']) - 1];
        $description_node['content'] = $method['summary'];
      }

      if (trim($method['description'])) {
        $method_node['#description'][] = array();
        $description_node = &$method_node['#description'][count($method_node['#description']) - 1];
        $description_node['content'] = $method['description'];
      }

      if (!empty($method['examples'])) {
        $method_node['#examples'][] = array();
        $examples_node = &$method_node['#examples'][count($method_node['#examples']) - 1];
        foreach ($method['examples'] as $example) {
          $examples_node['#example'][] = array();
          $example_node = &$examples_node['#example'][count($examples_node['#example']) - 1];
          $example_node['content'] = $example;
        }
      }
    }

    if (trim($method['return_summary'])) {
      $method_node['#return-description'][] = array();
      $description_node = &$method_node['#return-description'][count($method_node['#return-description']) - 1];
      $description_node['content'] = $method['return_summary'];
    }

    if (!empty($method['parameters'])) {
      $method_node['#parameters'][] = array();
      $parameters_node = &$method_node['#parameters'][count($method_node['#parameters']) - 1];
      foreach ($method['parameters'] as $parameter_name => $parameter) {
        $parameters_node['#parameter'][] = array();
        $parameter_node = &$parameters_node['#parameter'][count($parameters_node['#parameter']) - 1];
        $parameter_node['@name'] = $parameter_name;
        $parameter_node['@type'] = $parameter['type'];
        $parameter_node['@usage'] = ($parameter['optional']) ? 'optional' : (($parameter['repeating']) ? 'one-or-more' : 'required');
        if ($parameter['summary']) {
          $parameter_node['#summary'][] = array();
          $description_node = &$parameter_node['#summary'][count($parameter_node['#summary']) - 1];
          $description_node['content'] = $parameter['summary'];
        }
      }
    }

    if (!empty($method['returns'])) {
      $method_node['#return-types'][] = array();
      $returns_node = &$method_node['#return-types'][count($method_node['#return-types']) - 1];
      foreach ($method['returns'] as $return) {
        $returns_node['#return-type'][] = array();
        $return_node = &$returns_node['#return-type'][count($returns_node['#return-type']) - 1];
        $return_node['@type'] = $return;
      }
    }

    return $method_node;
  }

  public function set($id, $value) {
    $this->queue[] = array($id, $value);
    if (count($this->queue) > $this->limit) {
      $this->flush();
    }
  }

  public function flush() {
    $deferred = array();
    $ids = $this->ids(FALSE);

    foreach ($this->queue as $position => $queue) {
      list($id, $value) = $queue;
      $last = ($position + 1 == count($this->queue));
      $tostring = $this->toString($value, $id);
      if (!in_array($id, $ids)) {
        if (!$last) {
          $deferred[$id] = $tostring;
          continue;
        }
      }

      if (!$id) {
        debug_print_backtrace();
        die("Called set without an ID\n");
      }

      if ($tostring == $this->getString($id, FALSE)) {
        continue;
      }

      $lines = array();
      $started = false;
      $found = false;
      $header = false;
      $buffer = array();

      $tmp = fopen($this->file_location . '_tmp', 'w');
      foreach ($this->header as $header_line) {
        fwrite($tmp, $header_line . "\n");
      }

      rewind($this->file);
      while (!feof($this->file)) {
        $line = stream_get_line($this->file, $this->length, "\n");
        if (!trim($line)) {
          continue;
        }

        if ($started) {
          $lines[] = $line;
          if ($this->lineEnds($line)) {
            $lines = explode("\n", $tostring);
            foreach ($lines as $line) {
              fwrite($tmp, $this->indent . $line . "\n");
            }
            $started = false;
            $found = true;
          }
        }
        elseif (!$found && $this->lineStarts($line) == $id) {
          foreach ($buffer as $line) {
            fwrite($tmp, $line . "\n");
          }
          $buffer = array();
          $started = true;
          $lines[] = $line;
        }
        else {        
          // Search through non-block data for headers first, then footers
          if (!isset($searching)) {
            $searching = $this->header;
          }

          $buffer[] = $line;
          if (count($buffer) == count($searching) && count(array_intersect($buffer, $searching)) == count($searching)) {
            // Successful match
            if ($searching === $this->header) {
              $buffer = array();
              $searching = $this->footer;
            }
            else {
              // Break before the footer is added
              break;
            }
          }
          elseif(count($buffer) > count($searching)) {
            fwrite($tmp, array_shift($buffer) . "\n");
          }
        }
      }

      if (!$found) {
        if ($last) {
          foreach ($deferred as $lines) {
            foreach (explode("\n", $lines) as $line) {
              fwrite($tmp, $this->indent . $line . "\n");
            }
          }
        }
        $lines = explode("\n", $tostring);
        foreach ($lines as $line) {
          fwrite($tmp, $this->indent . $line . "\n");
        }
      }

      foreach ($this->footer as $footer_line) {
        fwrite($tmp, $footer_line . "\n");
      }

      fclose($tmp);
      fclose($this->file);

      unlink($this->file_location);
      rename($this->file_location . '_tmp', $this->file_location);
      $this->file = fopen($this->file_location, 'r');
    }

    $this->queue = array();
  }

  public function toRaw($object, $id) {
    $object_node = array();

    $object_node['@location'] = $id;

    $this->buildResources($object_node, $object);

    $methods_node = NULL;
    if ($object['type'] == 'Function') {
      $object_node['@type'] = 'Function';
      if (!$object['classlike']) {
        $this->buildMethod($object_node, $object, $object['location'], FALSE);
      }
      else {
        $object_node['@classlike'] = TRUE;

        $methods_node = array();
        $method_node = array(
          '@constructor' => 'constructor'
        );
        if (!empty($object['chains']['prototype'])) {
          $superclass = array_shift($object['chains']['prototype']);
          $object_node['@superclass'] = $superclass;
        }
        $methods_node['#method'][] = $this->buildMethod($method_node, $object, $object['location'], FALSE);
      }
    }
    elseif ($object['type'] != 'Object') {
      $object_node['@type'] = $object['type'];
    }

    if (!empty($object['tags'])) {
      $object_node['@tags'] = implode(' ', $object['tags']);
    }

    if ($object['private']) {
      $object_node['@private'] = true;
    }

    if ($object['private_parent']) {
      $object_node['@privateparent'] = true;
    }

    if (trim($object['summary'])) {
      $object_node['#summary'][] = array();
      $description_node = &$object_node['#summary'][count($object_node['#summary']) - 1];
      $description_node['content'] = $object['summary'];
    }

    if (trim($object['description'])) {
      $object_node['#description'][] = array();
      $description_node = &$object_node['#description'][count($object_node['#description']) - 1];
      $description_node['content'] = $object['description'];
    }

    if (!empty($object['examples'])) {
      $object_node['#examples'][] = array();
      $examples_node = &$object_node['#examples'][count($object_node['#examples']) - 1];
      foreach ($object['examples'] as $example) {
        $examples_node['#example'][] = array();
        $example_node = &$examples_node['#example'][count($examples_node['#example']) - 1];
        $example_node['content'] = $example;
      }
    }

    $mixins = array();
    if (!empty($object['chains']['prototype'])) {
      foreach ($object['chains']['prototype'] as $mixin) {
        // Classes are assumed here
        $mixins['prototype']['prototype'][] = $mixin;
      }
    }
    if (!empty($object['mixins']['prototype'])) {
      foreach ($object['mixins']['prototype'] as $mixin) {
        if (strlen($mixin) > 10 && substr($mixin, -10) == '.prototype') {
          $mixins['prototype']['prototype'][] = substr($mixin, 0, -10);
        }
        else {
          $mixins['prototype']['normal'][] = $mixin;
        }
      }
    }
    if (!empty($object['chains']['call'])) {
      foreach ($object['chains']['call'] as $mixin) {
        $mixins['instance']['instance'][] = $mixin;
      }
    }
    if (!empty($object['mixins']['normal'])) {
      foreach ($object['mixins']['normal'] as $mixin) {
        if (strlen($mixin) > 10 && substr($mixin, -10) == '.prototype') {
          $mixins['normal']['prototype'][] = substr($mixin, 0, -10);
        }
        else {
          $mixins['normal']['normal'][] = $mixin;
        }
      }
    }

    foreach ($mixins as $scope => $mixins) {
      $object_node['#mixins'][] = array();
      $mixins_node = &$object_node['#mixins'][count($object_node['#mixins']) - 1];
      $mixins_node['@scope'] = $scope;
      foreach ($mixins as $scope => $mixins) {
        foreach (array_unique($mixins) as $mixin) {
          $mixins_node['#mixin'][] = array();
          $mixin_node = &$mixins_node['#mixin'][count($mixins_node['#mixin']) - 1];
          $mixin_node['@scope'] = $scope;
          $mixin_node['@location'] = $mixin;
        }
      }
    }

    $methods = array();
    $properties = array();
    if (!empty($object['#children'])) {
      foreach ($object['#children'] as $child_id => $child) {
        if ($child['type'] == 'Function') {
          $methods[$child_id] = $child;
        }
        else {
          $properties[$child_id] = $child;
        }
      }
    }

    if (!empty($properties)) {                    
      $object_node['#properties'][] = array();
      $properties_node = &$object_node['#properties'][count($object_node['#properties']) - 1];
      foreach ($properties as $property_id => $property) {
        $properties_node['#property'][] = array();
        $property_node = &$properties_node['#property'][count($properties_node['#property']) - 1];
                                                    
        $property_node['@name'] = $property_id;

        $this->buildResources($property_node, $property);

        if ($property['instance'] && $property['prototype']) {
          $property_node['@scope'] = 'instance-prototype';
        }
        elseif($property['instance']) {
          $property_node['@scope'] = 'instance';
        }
        elseif($property['prototype']) {
          $property_node['@scope'] = 'prototype';
        }
        else {                        
          $property_node['@scope'] = 'normal';
        }

        $property_node['@type'] = $property['type'];

        if (!empty($property['tags'])) {
          $property_node['@tags'] = implode(' ', $property['tags']);
        }

        if ($property['private']) {
          $property_node['@private'] = true;
        }

        if ($property['private_parent']) {
          $property_node['@privateparent'] = true;
        }

        if ($property['summary']) {                      
          $property_node['#summary'][] = array();
          $description_node = &$property_node['#summary'][count($property_node['#summary']) - 1];
          $description_node['content'] = $property['summary'];
        }
      }
    }

    if (!empty($methods)) {
      if (!$methods_node) {                     
        $methods_node = array();
      }                        
      $object_node['#methods'][] = $methods_node;
      $methods_node = &$object_node['#methods'][count($object_node['#methods']) - 1];

      foreach ($methods as $method_id => $method) {
        $method_node = array();
        $methods_node['#method'][] = $this->buildMethod($method_node, $method, $method_id);
      }
    }

    return $this->convertToRaw($object_node);
  }
}