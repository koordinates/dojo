<?php

require_once('inc/Dojo.php');
require_once('inc/DojoPackage.php');
require_once('inc/helpers.inc');
require_once('lib/benchmark/Timer.php');

$output = array();

$timer = new Benchmark_Timer();
$timer->start();

$dojo = new Dojo('../');
$files = $dojo->getFileList();

foreach ($files as $file) {
  $package = new DojoPackage($dojo, $file);
  $package_name = $package->getPackageName();

  // Handle compound require calls
  $calls = $package->getFunctionCalls('dojo.kwCompoundRequire');
  foreach ($calls as $call) {
    if ($call->getParameter(0)->isA(DojoObject)) {
      $object = $call->getParameter(0)->getObject();
      foreach ($object->getValues() as $key => $value) {
        if ($value->isA(DojoArray)) {
          foreach ($value->getArray()->getItems() as $item) {
            if ($item->isA(DojoString)) {
              $output[$package_name]['meta']['requires'][$key][] = $item->getString();
              if (!$output['function_names'][$package_name]) {
                $output['function_names'][$package_name] = array();
              }
            }
          }
        }
      }
    }
  }
  // Handle dojo.require calls
  $calls = $package->getFunctionCalls('dojo.require');
  foreach ($calls as $call) {
    $require = $call->getParameter(0);
    if ($require->isA(DojoString)) {
      $output[$package_name]['meta']['requires']['common'][] = $require->getString();
    }
  }
  
  // Handle dojo.requireAfterIf calls
  $calls = array_merge($package->getFunctionCalls('dojo.requireIf'), $package->getFunctionCalls('dojo.requireAfterIf'));
  foreach ($calls as $call) {
    $environment = $call->getParameter(0);
    $require = $call->getParameter(1);
    if ($environment && $require) {
      $environment = $environment->getValue();
      $require = $environment->getValue();
      if ($environment instanceof DojoString && $require instanceof DojoString) {
        $output[$package_name]['meta']['requires'][$environment->getValue()][] = $require->getValue();
      }
    }
  }
  
  // This closely matches dojo.widget.defineWidget as declared in src/widget/Widget.js
  $calls = array_merge($package->getFunctionCalls('dojo.declare'), $package->getFunctionCalls('dojo.widget.defineWidget'));
  foreach ($calls as $call) {
    if ($call->getName() == 'dojo.declare') {
      $args = array($call->getParameter(0), null, $call->getParameter(1), $call->getParameter(2), $call->getParameter(3));
      $name = $args[0]->getString();
      if ($args[3]->isA(DojoFunctionDeclare)) {
        $init = $args[3]->getFunction();
      }
    }
    else {
      if ($call->getParameter(3)->isA(DojoString)) {
        $args = array($call->getParameter(0), $call->getParameter(3), $call->getParameter(1), $call->getParameter(4), $call->getParameter(2));
      }
      else {
        $args = array($call->getParameter(0));
        $p = 3;
        if ($call->getParameter(1)->isA(DojoString)) {
          array_push($args, $call->getParameter(1), $call->getParameter(2));
        }
        else {
          array_push($args, null, $call->getParameter(1));
          $p = 2;
        }
        if ($call->getParameter($p)->isA(DojoFunctionDeclare)) {
          $init = $call->getParameter($p)->getFunction();
          array_push($args, $call->getParameter($p), $call->getParameter($p + 1));
        }
        else {
          array_push($args, null, $call->getParameter($p));
        }
      }
    }
    
    $package_name = $package_name;
    $name = $args[0]->getString();

    // $args looks like (name, null, superclass(es), initializer, mixins)      
    if ($args[2]->isA(DojoVariable)) {
      $output[$package_name]['meta']['functions'][$name]['meta']['prototype_chain'][] = $args[2]->getVariable();
      $output[$package_name]['meta']['functions'][$name]['meta']['call_chain'][] = $args[2]->getVariable();
    }
    elseif ($args[2]->isA(DojoArray)) {
      $items = $args[2]->getArray();
      foreach ($items as $item) {
        if ($item->isA(DojoString)) {
          $output[$package_name]['meta']['functions'][$name]['meta']['prototype_chain'][] = $item->getString();
          $output[$package_name]['meta']['functions'][$name]['meta']['call_chain'][] = $item->getString();
        }
      }
    }

    if ($args[4]->isA(DojoObject)) {
      $object = $args[4]->getObject();
      $values = $object->getValues();
      foreach ($values as $key => $value) {
        if ($key == 'initializer') {
          $init = $value;
          continue;
        }
        if ($value->isA(DojoFunctionDeclare)) {
          $function = $value->getFunction($value);
          $function->setPrototype($name);
          $function->setFunctionName($name . '.' . $key);
          rolloutFunction($output, $package, $function);
        }
        else {
          $output[$package_name]['meta']['functions'][$name]['meta']['instance_variables'][] = $key;
        }
      }
    }
    
    if ($init) {
      $init->setFunctionName($name);
      rolloutFunction($output, $package, $init);
    }
  }
  
  // Handle function declarations
  $declarations = $package->getFunctionDeclarations();
  foreach ($declarations as $declaration) {
    rolloutFunction($output, $package, $declaration);
  }
  
  $calls = $package->getFunctionCalls('dojo.inherits', true);
  foreach ($calls as $call) {
    if ($call->getParameter(0)->isA(DojoVariable) && $call->getParameter(1)->isA(DojoVariable)) {
      $output[$package_name]['meta']['functions'][$call->getParameter(0)->getVariable()]['meta']['prototype_chain'][] = $call->getParameter(1)->getVariable();
    }
  }

  // Handle. dojo.lang.extend and dojo.lang.mixin calls
  $calls = array_merge($package->getFunctionCalls('dojo.lang.extend', true), $package->getFunctionCalls('dojo.lang.mixin'));
  foreach ($calls as $call) {
    $object = $call->getParameter(0);
    $properties = $call->getParameter(1);
    if ($object && $properties) {
      $object = $object->getValue();
      $call_name = $call->getName();
      if($call_name == 'dojo.lang.mixin' && $object != $package_name) continue;
      $properties = $properties->getValue();
      if (is_string($object) && $properties instanceof DojoObject) {
        $keys = $properties->getKeys();
        foreach ($keys as $key) {
          if ($properties->isFunction($key)) {
            $function = $properties->getValue($key);
            if ($call_name == 'dojo.lang.extend') {
              $function->setThis($object);
            }
            $function->setFunctionName($object . '.' . $key);
            rolloutFunction($output, $package, $function);
          }
          else {
            if ($call_name == 'dojo.lang.mixin') {
              $output[$package_name]['meta']['functions'][$object]['meta']['variables'][$key] = "";
            }
            else {
              $output[$package_name]['meta']['functions'][$object]['meta']['protovariables'][$key] = "";
            }
          }
        }
      }
      elseif (is_string($object) && is_string($properties)) {
        // Note: inherits expects to be reading from prototype values
        if ($call_name == 'dojo.lang.extend' && strpos($properties, '.prototype') !== false) {
          $output[$package_name]['meta']['functions'][$object]['meta']['prototype_chain'][] = str_replace('.prototype', '', $properties);
        }
        elseif ($call_name == 'dojo.lang.extend' && strpos($properties, 'new ') !== false) {
          $output[$package_name]['meta']['functions'][$object]['meta']['prototype_chain'][] = str_replace('new ', '', $properties);
          $output[$package_name]['meta']['functions'][$object]['meta']['call_chain'][] = str_replace('new ', '', $properties);
        }
        else {
          $output[$package_name]['meta']['functions'][$object]['meta']['object_inherits'][] = $properties;
        }
      }
    }
  }
  
  if ($output[$package_name]) {
    $output['function_names'][$package_name] = array();
    if (!empty($output[$package_name]['meta']['functions'])) {
      $output['function_names'][$package_name] = array_values(array_keys($output[$package_name]['meta']['functions']));
    }
  }
  
  $objects = $package->getObjects();
  foreach ($objects as $object) {
    $values = $object->getValues();
    $name = $object->getName();
    foreach ($values as $key => $value) {
      if ($value->isA(DojoFunctionDeclare)) {
        $function = $value->getFunction($value);
        $function->setFunctionName($name . '.' . $key);
        rolloutFunction($output, $package, $function);
      }
      else {
        $output[$package_name]['meta']['functions'][$name]['meta']['variables'][] = $key;
      }
    }
  }
}

foreach (array_keys($output['function_names']) as $package_name) {
  sort($output['function_names'][$package_name]);
}

$timer->setMarker("Main Processing finished");

//print_r($output);
//header('Content-type: text/xml');
writeToDisk($output, 'pretty_xml', 'xml', 'pretty');
//writeToDisk($output, 'json');

$timer->setMarker("Main JSON output done");

if (file_exists('wiki')) {
  $wiki_files = scandir('wiki/WikiHome/DojoDotDoc');
  foreach ($wiki_files as $wiki_file) {
    if ($wiki_file{0} == '.') {
      continue;
    }
  
    $doc = DOMDocument::load('wiki/WikiHome/DojoDotDoc/' . $wiki_file);
    $xpath = new DOMXPath($doc);
    $main_property = $xpath->query("//*[@name = 'main/text']")->item(0);
    $main_text = '';
    if ($main_property = $main_property->firstChild) {
      $main_text = preg_replace('%</?html[^>]*>%', '', $doc->saveXML($main_property));
    }
    unset($main_property);
  
    if (strpos($wiki_file, 'DocPkg') === 0) {
      $require = $xpath->query("//*[@name = 'DocPkgForm/require']")->item(0)->textContent;
      $output[$require]['meta']['description'] = $main_text;
      
      unset($require);
    }
    else if (strpos($wiki_file, 'DocFn') === 0) {
      $require = $xpath->query("//*[@name = 'DocFnForm/require']")->item(0)->textContent;
      $name = $xpath->query("//*[@name = 'DocFnForm/name']")->item(0)->textContent;
      $returns = $xpath->query("//*[@name = 'DocFnForm/returns']")->item(0)->textContent;
      
      $output[$require]['meta']['functions'][$name]['meta']['description'] = $main_text;
      $output[$require]['meta']['functions'][$name]['meta']['returns']['description'] = $returns;
  
      unset($require);
      unset($name);
      unset($returns);
    }
    else if (strpos($wiki_file, 'DocParam') === 0) {
      list($require, $name) = explode('=>', $xpath->query("//*[@name = 'DocParamForm/fns']")->item(0)->textContent);
      $parameter = $xpath->query("//*[@name = 'DocParamForm/name']")->item(0)->textContent;
      $description = $xpath->query("//*[@name = 'DocParamForm/desc']")->item(0)->textContent;
      
      $output[$require]['meta']['functions'][$name]['meta']['parameters'][$parameter]['description'] = $description;
      
      unset($require);
      unset($name);
      unset($parameter);
      unset($description);
    }
  
    unset($main_text);
    unset($xpath);
    unset($doc);
  }
  unset($wiki_files);
}

writeToDisk($output, 'local_json', 'json', 'local');
//writeToDisk($output, 'json', 'xml', 'eclipse');

$timer->stop();
if ($_GET['benchmark']) {
  header('Content-type: text/html');  
  $timer->display();
}

?>
