<?php

require_once('inc/Dojo.php');
require_once('inc/DojoPackage.php');
require_once('inc/Plugins.php');
require_once('inc/helpers.inc');
require_once('lib/benchmark/Timer.php');

$output = array();

$timer = new Benchmark_Timer();
$timer->start();

$dojo = new Dojo('../');
$files = $dojo->getFileList();

foreach ($files as $file) {
  echo "Parsing  $file ...\n";

  // NOTE: if the output dies on a particular file, you can skip it like the below
  if ($file == 'src/widget/RichText.js') continue;

  $package = new DojoPackage($dojo, $file);
  $package_name = $package->getPackageName();

  $compound_calls = $package->getFunctionCalls('dojo.kwCompoundRequire');
  $require_calls = $package->getFunctionCalls('dojo.require');
  $require_if_calls = array_merge($package->getFunctionCalls('dojo.requireIf'), $package->getFunctionCalls('dojo.requireAfterIf'));
  $declare_calls = array_merge($package->getFunctionCalls('dojo.declare'), $package->getFunctionCalls('dojo.widget.defineWidget'));
  $inherit_calls = $package->getFunctionCalls('dojo.inherits', true);
  $mixin_calls = array_merge($package->getFunctionCalls('dojo.extend'), $package->getFunctionCalls('dojo.lang.extend', true), $package->getFunctionCalls('dojo.mixin'), $package->getFunctionCalls('dojo.lang.mixin'));
  $declarations = $package->getFunctionDeclarations();
  $objects = $package->getObjects();
  $aliases = $package->getAliases();

  // Since there can be chase conditions between declarations and calls, we need to find which were "swallowed" by larger blocks
  $package->removeSwallowed($mixin_calls);
  $package->removeSwallowed($declarations);

  // Handle compound require calls
  foreach ($compound_calls as $call) {
    if ($call->getParameter(0)->isA(DojoObject)) {
      $object = $call->getParameter(0)->getObject();
      foreach ($object->getValues() as $key => $value) {
        if ($value->isA(DojoArray)) {
          foreach ($value->getArray()->getItems() as $item) {
            if ($item->isA(DojoString)) {
              if (!$output['function_names'][$package_name]) {
                $output['function_names'][$package_name] = array();
              }
              $output[$package_name]['meta']['requires'][$key][] = $item->getString();
            }
          }
        }
      }
    }
  }

  // Handle dojo.require calls
  foreach ($require_calls as $call) {
    $require = $call->getParameter(0);
    if ($require->isA(DojoString)) {
      $output[$package_name]['meta']['requires']['common'][] = $require->getString();
    }
  }
  
  // Handle dojo.requireAfterIf calls
  foreach ($require_if_calls as $call) {
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
  foreach ($declare_calls as $call) {
    $init = null;
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
      $items = $args[2]->getArray()->getItems();
      foreach ($items as $item) {
        if ($item->isA(DojoString)) {
          $item = $item->getString();
          $output[$package_name]['meta']['functions'][$name]['meta']['prototype_chain'][] = $item;
          $output[$package_name]['meta']['functions'][$name]['meta']['call_chain'][] = $item;
        }
      }
    }

    if ($args[4]->isA(DojoObject)) {
      $object = $args[4]->getObject();
			$object->setName($name);
      $object->setAnonymous(true);
      $values = $object->getValues();
      foreach ($values as $key => $value) {
        if ($key == 'initializer' && $value->isA(DojoFunctionDeclare)) {
          $init = $value->getFunction();
					$init->setConstructor(true);
          continue;
        }
        if ($value->isA(DojoFunctionDeclare)) {
          $function = $value->getFunction($value);
          $function->setPrototype($name);
        }
        elseif (!$value->isA(DojoObject)) {
          $output[$package_name]['meta']['functions'][$name]['meta']['prototype_variables'][] = $key;
        }
      }
      $object->rollOut($output, 'function');
      if ($object->getBlockComment('summary')) {
        $output[$package_name]['meta']['functions'][$name]['meta']['summary'] = $object->getBlockComment('summary');
      }
      if ($object->getBlockComment('description')) {
        $output[$package_name]['meta']['functions'][$name]['meta']['description'] = $object->getBlockComment('description');
      }
    }
    
    if ($init) {
      $init->setFunctionName($name);
      $init->rollOut($output);
    }
  }
  
  // Handle function declarations
  foreach ($declarations as $declaration) {
    $declaration->rollOut($output);
  }
  
  foreach ($inherit_calls as $call) {
    if ($call->getParameter(0)->isA(DojoVariable) && $call->getParameter(1)->isA(DojoVariable)) {
      $output[$package_name]['meta']['functions'][$call->getParameter(0)->getVariable()]['meta']['prototype_chain'][] = $call->getParameter(1)->getVariable();
    }
  }

  // Handle. dojo.lang.extend and dojo.lang.mixin calls
  foreach ($mixin_calls as $call) {
    if ($call->getParameter(0)->isA(DojoVariable)) {
      $object = $call->getParameter(0)->getVariable();
      $call_name = $call->getName();

      if ($call->getParameter(1)->isA(DojoObject)) {
        $properties = $call->getParameter(1)->getObject();
        $keys = $properties->getValues();
        foreach ($keys as $key => $function) {
          if ($function->isA(DojoFunctionDeclare)) {
            $function = $function->getFunction();
            if ($call_name == 'dojo.lang.extend') {
              $function->setPrototype($object);
            }
            $function->setFunctionName($object . '.' . $key);
            $function->rollOut($output);
          }
          else {
            if ($call_name == 'dojo.lang.mixin' || $call_name == 'dojo.mixin') {
              $output[$package_name]['meta']['functions'][$object]['meta']['variables'][] = $key;
            }
            else {
              $output[$package_name]['meta']['functions'][$object]['meta']['prototype_variables'][] = $key;
            }
          }
        }
      }
      elseif ($call->getParameter(1)->isA(DojoString)) {
        $properties = $call->getParameter(1)->getString();
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
  
  foreach ($objects as $object) {
    $object->rollOut($output);
  }
  
  if ($output[$package_name]) {
    $output['function_names'][$package_name] = array();
    if (!empty($output[$package_name]['meta']['functions'])) {
      $output['function_names'][$package_name] = array_values(array_keys($output[$package_name]['meta']['functions']));
    }
    $output['object_names'][$package_name] = array();
    if (!empty($output[$package_name]['meta']['objects'])) {
      $output['object_names'][$package_name] = array_values(array_keys($output[$package_name]['meta']['objects']));
    }    
  }
}

foreach (array_keys($output['function_names']) as $package_name) {
  sort($output['function_names'][$package_name]);
}

$timer->setMarker("Main Processing finished");

//print_r($output);
//header('Content-type: text/xml');

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

$plugins = new Plugins('.');
$plugins->write($output);

$timer->stop();
if (isset($_GET['benchmark'])) {
  $timer->display();
}

echo "Parsing complete!\n";

?>
