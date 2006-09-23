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
                $output[$package->getPackageName() . '._']['meta']['requires'][$key][] = $item->getValue();
								$output['function_names'][$package->getPackageName() . '._'] = array();
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
          $output[$package->getPackageName()]['meta']['requires'][$environment->getValue()][] = $require->getValue();
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
      $output[$package->getPackageName()]['meta']['functions'][$name->getValue()]['_']['meta']['summary'] = '';
      if ($superclass != "null" && $superclass != "false" && $superclass != "undefined") {
        $output[$package->getPackageName()]['meta']['functions'][$name->getValue()]['_']['meta']['inherits'][] = $superclass;
        $output[$package->getPackageName()]['meta']['functions'][$name->getValue()]['_']['meta']['this_inherits'][] = $superclass;
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
            $output[$package->getPackageName()]['meta']['functions'][$name->getValue()]['_']['meta']['protovariables'][$key] = "";
          }
        }
      }
      
      if ($init instanceof DojoFunctionDeclare) {
        $parameters = $init->getParameters();
        foreach ($parameters as $parameter) {
          $output[$package->getPackageName()]['meta']['functions'][$name->getValue()]['_']['meta']['parameters'][$parameter->getValue()]['type'] = $parameter->getType();
        }
      }
    }
    
    // Handle function declarations
    $declarations = $package->getFunctionDeclarations();
    foreach ($declarations as $declaration) {
      rolloutFunction($output, $package, $declaration);
    }
    
    $calls = $package->getFunctionCalls('dojo.inherits', true);
    foreach ($calls as $call) {
      $subclass = $call->getParameter(0);
      $superclass = $call->getParameter(1);
      if ($subclass && $superclass) {
        $subclass = $subclass->getValue();
        $superclass = $superclass->getValue();
      }
      if (is_string($subclass) && is_string($superclass)) {
        $output[$package->getPackageName()]['meta']['functions'][$subclass]['_']['meta']['inherits'][] = $superclass;
      }
    }

    // Handle. dojo.lang.extend and dojo.lang.mixin calls
    $calls = array_merge($package->getFunctionCalls('dojo.lang.extend', true), $package->getFunctionCalls('dojo.lang.mixin'));
    foreach ($calls as $call) {
      $object = $call->getParameter(0);
      $properties = $call->getParameter(1);
      if ($object && $properties) {
        $object = $object->getValue();
				$call_name = $call->getFunctionCallName();
				if($call_name == 'dojo.lang.mixin' && $object != $package->getPackageName()) continue;
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
              	$output[$package->getPackageName()]['meta']['functions'][$object]['_']['meta']['variables'][$key] = "";
							}
							else {
              	$output[$package->getPackageName()]['meta']['functions'][$object]['_']['meta']['protovariables'][$key] = "";
							}
            }
          }
        }
        elseif (is_string($object) && is_string($properties)) {
          // Note: inherits expects to be reading from prototype values
          if ($call_name == 'dojo.lang.extend' && strpos($properties, '.prototype') !== false) {
            $output[$package->getPackageName()]['meta']['functions'][$object]['_']['meta']['inherits'][] = str_replace('.prototype', '', $properties);
          }
          elseif ($call_name == 'dojo.lang.extend' && strpos($properties, 'new ') !== false) {
            $output[$package->getPackageName()]['meta']['functions'][$object]['_']['meta']['inherits'][] = str_replace('new ', '', $properties);
            $output[$package->getPackageName()]['meta']['functions'][$object]['_']['meta']['this_inherits'][] = str_replace('new ', '', $properties);
          }
          else {
            $output[$package->getPackageName()]['meta']['functions'][$object]['_']['meta']['object_inherits'][] = $properties;
          }
        }
      }
    }
    
    if ($output[$package->getPackageName()]) {
			$output['function_names'][$package->getPackageName()] = array();
			if (!empty($output[$package->getPackageName()]['meta']['functions'])) {
      	$output['function_names'][$package->getPackageName()] = array_values(array_keys($output[$package->getPackageName()]['meta']['functions']));
			}
    }
  }
}

foreach (array_keys($output['function_names']) as $package_name) {
  sort($output['function_names'][$package_name]);
}

//print_r($output);
writeToDisk($output, 'json');

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
		
		$output[$require]['meta']['functions'][$name]['_']['meta']['description'] = $main_text;
		$output[$require]['meta']['functions'][$name]['_']['meta']['returns']['descriptionscription'] = $returns;

		unset($require);
		unset($name);
		unset($returns);
	}
	else if (strpos($wiki_file, 'DocParam') === 0) {
		list($require, $name) = explode('=>', $xpath->query("//*[@name = 'DocParamForm/fns']")->item(0)->textContent);
		$parameter = $xpath->query("//*[@name = 'DocParamForm/name']")->item(0)->textContent;
		$description = $xpath->query("//*[@name = 'DocParamForm/desc']")->item(0)->textContent;
		
		$output[$require]['meta']['functions'][$name]['_']['meta']['parameters'][$parameter]['description'] = $description;
		
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

writeToDisk($output, 'local_json', 'json', 'local');
//writeToDisk($output, 'json', 'xml', 'eclipse');

?>
