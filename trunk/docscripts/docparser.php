<?php

require_once('inc/Dojo.php');
require_once('inc/DojoObject.php');
require_once('inc/DojoString.php');
require_once('inc/helpers.inc');

header('Content-type: text/plain');

$output = array();

$dojo = new Dojo('../');
$package = $dojo->getPackage('src/widget/Widget.js');

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
    $init = $parameters[3]->getValue();
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
        $function->setThis($name->getValue());
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

$output['function_names'][$package->getPackageName()] = array_diff(array_keys($output[$package->getPackageName()]), array('meta'));

print_r($output);

?>
