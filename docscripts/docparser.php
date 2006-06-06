<?php

require_once('inc/Dojo.php');
require_once('inc/DojoObject.php');
require_once('inc/DojoString.php');
require_once('inc/DojoArray.php');
require_once('inc/helpers.inc');

header('Content-type: text/plain');

$output = array();

$dojo = new Dojo('../');

$files = getFileList('../');

foreach ($files as $file) {
  $package = $dojo->getPackage($file);
  
  if (strpos($file, '__package__.js') !== false) {
    // Handle dojo.kwCompoundRequire calls
    $calls = $package->getFunctionCalls('dojo.kwCompoundRequire');
    if ($calls) {
      $call = $calls[0];
      $object = $call->getParameter(0);
      if ($object && $object->getValue() instanceof DojoObject) {
        $object_contents = $object->getValue();
        $keys = $object_contents->getKeys();
        foreach ($keys as $key) {
          $value = $object_contents->getValue($key);
          if ($value instanceof DojoArray) {
            $items = $value->getAll();
            foreach ($items as $item) {
              if ($item instanceof DojoString) {
                $output[$package->getPackageName()][$package->getPackageName() . '._']['meta']['requires'][$key][] = $item->getValue();
              }
            }
          }
        }
      }
    }
  }
  else {
    // Handle dojo.require calls
    $calls = $package->getFunctionCalls('dojo.require');
    foreach ($calls as $call) {
      $require = $call->getParameter(0);
      if ($require) {
        $require = $require->getValue();
        if ($require instanceof DojoString) {
          $output[$package->getPackageName()]['meta']['requires']['common'][] = $require->getValue();
        }
      }
    }
    
    // Handle dojo.requireAfterIf calls
    $calls = array_merge($package->getFunctionCalls('dojo.requireIf'), $package->getFunctionCalls('dojo.requireAfterIf'));
    foreach ($calls as $call) {
      $enviromnent = $call->getParameter(0);
      $require = $call->getParameter(1);
      if ($environment && $require) {
        $environment = $environment->getValue();
        $require = $environment->getValue();
        if ($enviromnent instanceof DojoString && $require instanceof DojoString) {
          $output[$package->getPackageName()]['meta']['require'][$environment->getValue()][] = $require->getValue();
        }
      }
    }
    
    // Handle. dojo.lang.extend calls
    $calls = $package->getFunctionCalls('dojo.lang.extend');
    foreach ($calls as $call) {
      $object = $call->getParameter(0);
      $properties = $call->getParameter(1);
      if ($object && $properties) {
        $object = $object->getValue();
        $properties = $properties->getValue();
        if (is_string($object) && $properties instanceof DojoObject) {
          $keys = $properties->getKeys();
          foreach ($keys as $key) {
            if ($properties->isFunction($key)) {
              $function = $properties->getValue($key);
              $function->setThis($object);
              $function->setFunctionName($object . '.' . $key);
              rolloutFunction($output, $package, $function);
            }
            else {
              $output[$package->getPackageName()][$object]['meta']['protovariables'][] = $key;
            }
          }
        }
        elseif (is_string($object) && is_string($properties)) {
          // Note: inherits expects to be reading from prototype values
          if (strpos($properties, '.prototype') !== false) {
            $output[$package->getPackageName()][$object]['meta']['inherits'][] = str_replace('.prototype', '', $properties);
          }
          elseif (strpos($properties, 'new ') !== false) {
            $output[$package->getPackageName()][$object]['meta']['inherits'][] = str_replace('new ', '', $properties);
            $output[$package->getPackageName()][$object]['meta']['this_inherits'][] = str_replace('new ', '', $properties);
          }
          else {
            $output[$package->getPackageName()][$object]['meta']['this_inherits'][] = $properties;
          }
        }
      }
    }
    
    // Handle dojo.declare calls
    $calls = array_merge($package->getFunctionCalls('dojo.declare'), $package->getFunctionCalls('dojo.widget.defineWidget'));
    foreach ($calls as $call) {
      $parameters = $call->getParameters();
      if ($parameters[0]) {
        $name = $parameters[0]->getValue();
      }
      if ($parameters[1]) {
        $superclass = $parameters[1]->getValue();
      }
      if ($parameters[2]) {
        $props = $parameters[2]->getValue();
      }
      if ($parameters[3]) {
        if ($call->getFunctionCallName() == 'dojo.declare') {
          $init = $parameters[3]->getValue();
        }
        else {
          $renderer = $parameters[3]->getValue();
        }
      }
      if ($parameters[4] && $call->getFunctionCallName() == 'dojo.widget.defineWidget') {
        $init = $parameters[4]->getValue();
      }
      if (!$name instanceof DojoString) continue;
      if (!is_string($superclass)) continue;
      $output[$package->getPackageName()]['meta']['methods'][$name->getValue()]['_'] = "";
      if ($superclass != "null" && $superclass != "false" && $superclass != "undefined") {
        $output[$package->getPackageName()][$name->getValue()]['meta']['inherits'][] = $superclass;
        $output[$package->getPackageName()][$name->getValue()]['meta']['this_inherits'][] = $superclass;
      }
      if ($props instanceof DojoObject) {
        $keys = $props->getKeys();
        foreach ($keys as $key) {
          if ($key == 'initializer') {
            $init = $props->getValue($key);
            continue;
          }
          if ($props->isFunction($key)) {
            $function = $props->getValue($key);
            $function->setThis($superclass);
            $function->setFunctionName($name->getValue() . '.' . $key);
            rolloutFunction($output, $package, $function);
          }
          else {
            $output[$package->getPackageName()][$name->getValue()]['meta']['protovariables'][] = $key;
          }
        }
      }
      
      if ($init instanceof DojoFunctionDeclare) {
        $parameters = $init->getParameters();
        foreach ($parameters as $parameter) {
          $output[$package->getPackageName()]['meta']['parameters'][] = array($parameter->getType(), $parameter->getValue());
        }
      }
    }
    
    // Handle method declarations
    $declarations = $package->getFunctionDeclarations();
    foreach ($declarations as $declaration) {
      rolloutFunction($output, $package, $declaration);
    }
    
    $calls = $package->getFunctionCalls('dojo.inherits');
    foreach ($calls as $call) {
      $subclass = $call->getParameter(0);
      $superclass = $call->getParameter(1);
      if ($subclass && $superclass) {
        $subclass = $subclass->getValue();
        $superclass = $superclass->getValue();
      }
      if (is_string($subclass) && is_string($superclass)) {
        $output[$package->getPackageName()][$subclass]['meta']['inherits'][] = $superclass;
      }
    }
    
    if ($output[$package->getPackageName()]) {
      $output['function_names'][$package->getPackageName()] = array_diff(array_keys($output[$package->getPackageName()]), array('meta'));
    }
  }
}

print_r($output);

?>
