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
                $type = $parameter_content['type'];
                if (substr($type, -1) == '?') {
                  $parameter->setAttribute('optional', 'true');
                  $type = trim(substr($type, 0, -1));
                }
                $parameter->setAttribute('type', $type);
              }
              if (!empty($function_content['extra']['parameters'][$parameter_name])) {
                $parameter->appendChild($document->createTextNode($function_content['extra']['parameters'][$parameter_name]));
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
                $variable->setAttribute('name', $variable_name);
                if (!empty($function_content['extra']['variables'][$variable_name])) {
                  $variable->setAttribute('type', $function_content['extra']['variables'][$variable_name]['type']);
                  $variable->appendChild($document->createTextNode($function_content['extra']['variables'][$variable_name]['summary']));
                }
              }
            }
            if ($function_content['meta']['instance_variables']) {
              foreach ($function_content['meta']['instance_variables'] as $variable_name) {
                $variable = $variables->appendChild($document->createElement('variable'));
                $variable->setAttribute('scope', 'instance');
                $variable->setAttribute('name', $variable_name);
                if (!empty($function_content['extra']['variables'][$variable_name])) {
                  $variable->setAttribute('type', $function_content['extra']['variables'][$variable_name]['type']);
                  $variable->appendChild($document->createTextNode($function_content['extra']['variables'][$variable_name]['summary']));
                }
                $parent_function_name = preg_replace('%\.([^.]+)$%', '', $function_name);
                if (!empty($package_content['meta']['functions'][$parent_function_name]) && !empty($package_content['meta']['functions'][$parent_function_name]['extra']['variables'][$variable_name])) {
                  $variable->setAttribute('type', $package_content['meta']['functions'][$parent_function_name]['extra']['variables'][$variable_name]['type']);
                  $variable->appendChild($document->createTextNode($package_content['meta']['functions'][$parent_function_name]['extra']['variables'][$variable_name]['summary']));
                }
              }
            }
            if ($function_content['meta']['prototype_variables']) {
              foreach ($function_content['meta']['prototype_variables'] as $variable_name) {
                $variable = $variables->appendChild($document->createElement('variable'));
                $variable->setAttribute('scope', 'prototype');
                $variable->setAttribute('name', $variable_name);
                if (!empty($function_content['extra']['variables'][$variable_name])) {
                  $variable->appendChild($document->createTextNode($function_content['extra']['variables'][$variable_name]));
                }
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

?>