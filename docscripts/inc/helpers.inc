<?php

require_once('lib/JSON.php');
require_once('DojoVariable.php');

function writeToDisk($output, $dir, $format = 'json', $environment = 'remote') {
	if ($dir{strlen($dir) - 1} == '/') {
    $dir = substr($dir, 0, -1);
  }
	if (!file_exists($dir)) {
		mkdir($dir);
		chmod($dir, 0777);
	}
	delTree($dir);

  if ($format == 'xml' && $environment == 'pretty') {
    $document = new DomDocument();
    $dojo = $document->appendChild($document->createElement('dojo'));
    unset($output['function_names']);
    foreach ($output as $package_name => $package_content) {
      $package = $dojo->appendChild($document->createElement('resource'));
      $package->setAttribute('location', $package_name);

      if ($package_content['meta']['requires']) {
        foreach ($package_content['meta']['requires'] as $environment_name => $environment_content) {
          $requires = $package->appendChild($document->createElement('requires'));
          $environment = $requires->appendChild($document->createElement('environment'));
          $environment->setAttribute('type', $environment_name);
          foreach ($environment_content as $require_name) {
            $require = $environment->appendChild($document->createElement('require'));
            $require->appendChild($document->createTextNode($require_name));
          }
        }
      }
      
      if ($package_content['meta']['functions']) {
        foreach ($package_content['meta']['functions'] as $function_name => $function_content) {
          $function = $package->appendChild($document->createElement('function'));
          $function->setAttribute('name', $function_name);
          if ($function_content['meta']['returns']) {
            $returns = $function->appendChild($document->createElement('returns'));
            $returns->appendChild($document->createTextNode($function_content['meta']['returns']));
          }
          if ($function_content['meta']['summary']) {
            $summary = $function->appendChild($document->createElement('summary'));
            $summary->appendChild($document->createTextNode($function_content['meta']['summary']));
          }
          if ($function_content['meta']['parameters']) {
            $parameters = $function->appendChild($document->createElement('parameters'));
            foreach ($function_content['meta']['parameters'] as $parameter_name => $parameter_content) {
              $parameter = $parameters->appendChild($document->createElement('parameter'));
              $parameter->setAttribute('name', $parameter_name);
              if ($parameter_content['type']) {
                $parameter->setAttribute('type', $parameter_content['type']);
              }
            }
          }
          if ($function_content['meta']['prototype']) {
            $prototype = $function->appendChild($document->createElement('prototype'));
            $prototype->appendChild($document->createTextNode($function_content['meta']['prototype']));
          }
          if ($function_content['meta']['call_chain'] || $function_content['meta']['prototype_chain']) {
            $chains = $function->appendChild($document->createElement('chains'));
            if ($function_content['meta']['call_chain']) {
              foreach ($function_content['meta']['call_chain'] as $function_name) {
                $chain = $chains->appendChild($document->createElement('chain'));
                $chain->setAttribute('type', 'call');
                $chain->appendChild($document->createTextNode($function_name));
              }
            }
            if ($function_content['meta']['prototype_chain']) {
              foreach ($function_content['meta']['prototype_chain'] as $function_name) {
                $chain = $chains->appendChild($document->createElement('chain'));
                $chain->setAttribute('type', 'prototype');
                $chain->appendChild($document->createTextNode($function_name));
              }
            }
          }
          if ($function_content['meta']['instance_variables'] || $function_content['meta']['prototype_variables'] || $function_content['meta']['variables']) {
            $variables = $function->appendChild($document->createElement('variables'));
            if ($function_content['meta']['variables']) {
              foreach ($function_content['meta']['variables'] as $variable_name) {
                $variable = $variables->appendChild($document->createElement('variable'));
                $variable->appendChild($document->createTextNode($variable_name));
              }
            }
            if ($function_content['meta']['instance_variables']) {
              foreach ($function_content['meta']['instance_variables'] as $variable_name) {
                $variable = $variables->appendChild($document->createElement('variable'));
                $variable->setAttribute('scope', 'instance');
                $variable->appendChild($document->createTextNode($variable_name));
              }
            }
            if ($function_content['meta']['prototype_variables']) {
              foreach ($function_content['meta']['prototype_variables'] as $variable_name) {
                $variable = $variables->appendChild($document->createElement('variable'));
                $variable->setAttribute('scope', 'prototype');
                $variable->appendChild($document->createTextNode($variable_name));
              }
            }
          }
          if ($function_content['meta']['description']) {
            $summary = $function->appendChild($document->createElement('description'));
            $summary->appendChild($document->createTextNode($function_content['meta']['description']));
          }
        }
      }
    }
    file_put_contents($dir . '/api.xml', $document->saveXML());
  }
	elseif ($format == 'json' && $environment == 'local') {
		$json = new Services_JSON();
		$merged = array();
    if (isset($output['function_names'])) {
      $data = $json->encode($output['function_names']);
      file_put_contents($dir . '/function_names', $data);
			unset($output['function_names']);
    }
		foreach ($output as $package_name => $package) {
			$merged_name = $package_name;
			if (strpos($merged_name, '.')) {
				$merged_parts = explode('.', $merged_name);
				$merged_name = $merged_parts[0] . '.' . $merged_parts[1];
				unset($merged_parts);
			}
			$merged[$merged_name][$package_name] = $package;
		}
		foreach ($merged as $merged_name => $package) {
			$data = $json->encode($package);
			file_put_contents($dir . '/' . $merged_name, $data);
			chmod($dir . '/' . $merged_name, 0777);
		}
		unset($merged_name);
		unset($package_name);
		unset($package);
		unset($merged);
		unset($json);
	}
	else if ($format == 'json' && $environment == 'remote') {
	  $json = new Services_JSON();
    if (isset($output['function_names'])) {
      $data = $json->encode($output['function_names']);
      file_put_contents($dir . '/function_names', $data);
			unset($output['function_names']);
    }
	  foreach ($output as $package_name => $package) {
      if (!file_exists($dir . '/' . $package_name)) {
        mkdir($dir . '/' . $package_name);
				chmod($dir . '/' . $package_name, 0777);
      }
			if (isset($package['meta'])) {
				$meta = array();
				foreach ($package['meta'] as $key => $value) {
					if ($key != 'functions') {
						$meta[$key] = $value;
						unset($package['meta'][$key]);
					}
				}

				if (isset($package['meta']['functions'])) {
					ksort($package['meta']['functions']);

		      foreach ($package['meta']['functions'] as $function_name => $function) {
	          if (!file_exists($dir . '/' . $package_name . '/' . $function_name)) {
	            mkdir($dir . '/' . $package_name . '/' . $function_name);
	          }
            if (isset($function['meta'])) {
              foreach ($function['meta'] as $type => $data) {
                if (empty($data)) {
                  continue;
                }

                if ($type == 'summary') {
                  $meta['functions'][$function_name]['meta']['summary'] = $data;
                  unset($function['meta'][$type]);
                }
                else if ($type == 'description' || $type == 'src') {
                  file_put_contents($dir . '/' . $package_name . '/' . $function_name . '/' . $type, $data);
                  unset($function['meta'][$type]);
                }
              }
              if (!empty($function['meta'])) {
                $data = $json->encode($function['meta']);
                file_put_contents($dir . '/' . $package_name . '/' . $function_name . '/meta', $data);
              }
            }
	        }
				}
				
				$data = $json->encode($meta);
				file_put_contents($dir . '/' . $package_name . '/meta', $data);
      }
	  }
	}
}

function delTree($directory, $last_directory = false)
{ 
  if($last_directory){ 
    $directory .= '/' . $last_directory; 
  } 

  $files = scandir($directory); 
  foreach($files as $file){ 
    if($file{0} != '.'){ 
      if(is_dir($directory . '/' . $file)){ 
        deltree($directory, $file);
        rmdir($directory . '/' . $file);
      }else{ 
        unlink($directory . '/' . $file); 
      } 
    }
  }
}

function rolloutFunction(&$output, $package, $declaration) {
  $masquerading_as_function = $function_name = $declaration->getFunctionName();
  if ($declaration->isThis()) {
    $masquerading_as_function = $declaration->getThis();
  }

	$package_name = $package->getPackageName();
  
  $output[$package_name]['meta']['functions'][$function_name]['meta']['summary'] = '';
  $parameters = $declaration->getParameters();
  foreach ($parameters as $parameter) {
    if ($parameter->isA(DojoVariable)) {
      $output[$package_name]['meta']['functions'][$function_name]['meta']['parameters'][$parameter->getVariable()]['type'] = $parameter->getType();
      $declaration->addBlockCommentKey($parameter->getVariable());
    }
  }
  
  $declaration->addBlockCommentKey('summary');
  $declaration->addBlockCommentKey('description');
  
  $comment_keys = $declaration->getBlockCommentKeys();
  foreach ($comment_keys as $key) {
    if ($key == 'summary') {
      $output[$package_name]['meta']['functions'][$function_name]['meta']['summary'] = $declaration->getBlockComment($key);
    }
    elseif ($key == 'description') {
      $output[$package_name]['meta']['functions'][$function_name]['meta']['description'] = $declaration->getBlockComment($key);
    }
  }

  $output[$package_name]['meta']['functions'][$function_name]['meta']['src'] = $declaration->getSource();
  
  $instance_variables = $declaration->getInstanceVariableNames();
  foreach ($instance_variables as $instance_variable) {
    if (isset($output[$package_name]['meta']['functions'][$masquerading_as_function]['meta']['instance_variables'])) {
      if (!in_array($instance_variable, $output[$package_name]['meta']['functions'][$masquerading_as_function]['meta']['instance_variables'])) {
        $output[$package_name]['meta']['functions'][$masquerading_as_function]['meta']['instance_variables'][] = $instance_variable;
      }
    }
    else {
      $output[$package_name]['meta']['functions'][$masquerading_as_function]['meta']['instance_variables'][] = $instance_variable;
    }
  }

  $returns = $declaration->getReturnComments();
  if (count($returns) == 1) {
    $output[$package_name]['meta']['functions'][$function_name]['meta']['returns'] = $returns[0];
  }
  elseif ($returns) {
    $output[$package_name]['meta']['functions'][$function_name]['meta']['returns'] = 'mixed';
  }
  
  if ($calls = $declaration->getThisInheritanceCalls()) {
    $output[$package_name]['meta']['functions'][$function_name]['meta']['call_chain'] = $calls;
  }
  
  if ($declaration->getPrototype()) {
    $output[$package_name]['meta']['functions'][$function_name]['meta']['prototype'] = $declaration->getPrototype();
  }
  if ($declaration->getInstance()) {
    $output[$package_name]['meta']['functions'][$function_name]['meta']['instance'] = $declaration->getInstance();
  }
}

?>