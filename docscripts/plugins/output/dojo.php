<?php

function dojo_remote_json($by_resource, $by_object)
{
	$output = array();
	foreach ($by_object as $function_name => $meta) {
		$parts = explode('.', $function_name);
		$last = array_pop($parts);
		$parent = implode('.', $parts);
		if ($parts) {
			array_pop($parts);
			$super_parent = implode('.', $parts);
			$output[$super_parent . '.js']['children'][$parent] = $parent;
		}
	
		if (!$parent) {
			$parent = '_global_';
		}
		else {
			$parent_meta = $by_object[$parent];
			unset($parent_meta['src']);
			unset($parent_meta['type']);
		}
	
		if ($meta['type'] == 'object') {
			$function_name = '{' . $function_name . '}';
		}
		unset($meta['src']);
		unset($meta['type']);
		
		$output[$parent . '.js']['children'][$function_name] = $meta;
		if ($parent_meta) {
			$output[$parent . '.js'] = array_merge($output[$parent . '.js'], $parent_meta);
		}
	}
	
	function insensitive($a, $b) {
		return strcasecmp($a, $b);
	}
	
	function dive(&$output, $array, &$pos, $in_group = false) {
		$parent = $array[$pos];
		if (!$parent) {
			++$pos;
			return;
		}
	
		$group = array();
		for ($i = $pos + 1; $i < count($array); $i++) {
			if (strpos($array[$i], $parent . '.') === 0) {
				$group[] = $array[$i];
				$groups = dive($output, $array, $i, true);
				if ($groups) {
					$group[] = $groups;
				}
			}
			elseif ($group && $in_group) {
				$pos = $i;
				return $group;
			}
			else {
				$pos = $i;
				if (!$in_group || $group) {
					$output[] = $parent;
				}
				if ($group) {
					$output[] = $group;
				}
				return;
			}
		}
		
		++$pos;
	}
	
	$pos = 0;
	$output['item_names.js'] = array();
	$item_names = array_keys($by_object);
	usort($item_names, "insensitive");
	while ($pos < count($item_names)) {
		dive($output['item_names.js'], $item_names, $pos);
	}
	//header('Content-type: text/plain');
	//print_r($output['item_names']);
	return $output;
}

function dojo_local_json($data, $by_object)
{
  $output = array();
  if (isset($data['function_names'])) {
    $output['function_names'] = $data['function_names'];
		foreach($data['object_names'] as $package_name => $object_names) {
			foreach ($object_names as $object_name) {
				$output['function_names'][$package_name][] = '{' .  $object_name . '}';
			}
		}
    unset($data['function_names']);
		unset($data['object_names']);
  }
	foreach ($data as $package_name => $package) {
		$merged_name = $package_name;
		if (strpos($merged_name, '.')) {
			$merged_parts = explode('.', $merged_name);
			$merged_name = $merged_parts[0] . '.' . $merged_parts[1];
		}
		$output[$merged_name][$package_name] = $package;
	}
  return $output;
}

function dojo_storage_xml($output, $by_object)
{
	$document = new DomDocument();
	$flat_list = array();
	foreach ($output as $package_name => $package_content) {
		foreach (array('function', 'object') as $item_type) {
			$items = array();
			if (!empty($package_content['meta']["{$item_type}s"])) {
				$items = array_merge($items, $package_content['meta']["{$item_type}s"]);
			}
			foreach ($items as $item_name => $item_content) {
				if (!empty($item_content['meta']['summary'])) {
					$flat_list[$item_name]['summary'] = $item_content['meta']['summary'];
				}
				else {
					$flat_list[$item_name]['summary'] = '';
				}

				if (!empty($item_content['meta']['description'])) {
					$flat_list[$item_name]['description'] = $item_content['meta']['description'];
				}
				else {
					$flat_list[$item_name]['description'] = '';
				}
			}
		}
	}
	return array('documentation.xml' => $document);
}

function dojo_local_xml($output, $by_object)
{
  $document = new DomDocument();
  $dojo = $document->appendChild($document->createElement('dojo'));
  unset($output['function_names']);
	unset($output['object_names']);
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
    
    foreach (array('function', 'object') as $item_type) {
			$items = array();
			if (!empty($package_content['meta']["{$item_type}s"])) {
				$items = array_merge($items, $package_content['meta']["{$item_type}s"]);
			}
      foreach ($items as $item_name => $item_content) {
        $item = $package->appendChild($document->createElement($item_type));
        $item->setAttribute('name', $item_name);
				if (!empty($item_content['meta']['is'])) {
					$item->setAttribute('is', $item_content['meta']['is']);
				}
				if (!empty($item_content['meta']['initialized'])) {
					$item->setAttribute('initialized', 'true');
				}
        if ($item_content['meta']['returns']) {
          $returns = $item->appendChild($document->createElement('returns'));
					$returns->setAttribute('type', $item_content['meta']['returns']);
					if (!empty($item_content['extra']['returns'])) {
						$returns->appendChild($document->createTextNode($item_content['extra']['returns']));
					}
        }
        if ($item_content['meta']['summary']) {
          $summary = $item->appendChild($document->createElement('summary'));
          $summary->appendChild($document->createTextNode($item_content['meta']['summary']));
        }
        if ($item_content['meta']['parameters']) {
          $parameters = $item->appendChild($document->createElement('parameters'));
          foreach ($item_content['meta']['parameters'] as $parameter_name => $parameter_content) {
            $parameter = $parameters->appendChild($document->createElement('parameter'));
            $parameter->setAttribute('name', $parameter_name);
						$type = '';
            if ($parameter_content['type']) {
              $type = $parameter_content['type'];
            }
						if (!empty($item_content['extra']['parameters'][$parameter_name]['type'])) {
							$type = $item_content['extra']['parameters'][$parameter_name]['type'];
						}
						
						if ($type) {
							if (substr($type, -1) == '?') {
                $parameter->setAttribute('optional', 'true');
                $type = trim(substr($type, 0, -1));
              }
              $parameter->setAttribute('type', $type);
						}
						
            if (!empty($item_content['extra']['parameters'][$parameter_name])) {
              $parameter->appendChild($document->createTextNode($item_content['extra']['parameters'][$parameter_name]['summary']));
            }
          }
        }
        if ($item_content['meta']['instance']) {
					$item->setAttribute('instance', $item_content['meta']['instance']);
        }
        if ($item_content['meta']['prototype']) {
          $item->setAttribute('prototype', $item_content['meta']['prototype']);
        }
        if ($item_content['meta']['call_chain'] || $item_content['meta']['prototype_chain']) {
          $chains = $item->appendChild($document->createElement('chains'));
          if ($item_content['meta']['call_chain']) {
            foreach ($item_content['meta']['call_chain'] as $item_name) {
              $chain = $chains->appendChild($document->createElement('chain'));
              $chain->setAttribute('type', 'call');
              $chain->appendChild($document->createTextNode($item_name));
            }
          }
          if ($item_content['meta']['prototype_chain']) {
            foreach ($item_content['meta']['prototype_chain'] as $item_name) {
              $chain = $chains->appendChild($document->createElement('chain'));
              $chain->setAttribute('type', 'prototype');
              $chain->appendChild($document->createTextNode($item_name));
            }
          }
        }
        if ($item_content['meta']['instance_variables'] || $item_content['meta']['prototype_variables'] || $item_content['meta']['variables']) {
          $variables = $item->appendChild($document->createElement('variables'));
          if ($item_content['meta']['variables']) {
            foreach ($item_content['meta']['variables'] as $variable_name) {
              $variable = $variables->appendChild($document->createElement('variable'));
              $variable->setAttribute('name', $variable_name);
              if (!empty($item_content['extra']['variables'][$variable_name])) {
                $variable->setAttribute('type', $item_content['extra']['variables'][$variable_name]['type']);
                $variable->appendChild($document->createTextNode($item_content['extra']['variables'][$variable_name]['summary']));
              }
            }
          }
          if ($item_content['meta']['instance_variables']) {
            foreach ($item_content['meta']['instance_variables'] as $variable_name) {
              $variable = $variables->appendChild($document->createElement('variable'));
              $variable->setAttribute('scope', 'instance');
              $variable->setAttribute('name', $variable_name);
              if (!empty($item_content['extra']['variables'][$variable_name])) {
                $variable->setAttribute('type', $item_content['extra']['variables'][$variable_name]['type']);
                $variable->appendChild($document->createTextNode($item_content['extra']['variables'][$variable_name]['summary']));
              }
              $parent_item_name = preg_replace('%\.([^.]+)$%', '', $item_name);
              if (!empty($package_content['meta']['functions'][$parent_item_name]) && !empty($package_content['meta']['functions'][$parent_item_name]['extra']['variables'][$variable_name])) {
                $variable->setAttribute('type', $package_content['meta']['functions'][$parent_item_name]['extra']['variables'][$variable_name]['type']);
                $variable->appendChild($document->createTextNode($package_content['meta']['functions'][$parent_item_name]['extra']['variables'][$variable_name]['summary']));
              }
            }
          }
          if ($item_content['meta']['prototype_variables']) {
            foreach ($item_content['meta']['prototype_variables'] as $variable_name) {
              $variable = $variables->appendChild($document->createElement('variable'));
              $variable->setAttribute('scope', 'prototype');
              $variable->setAttribute('name', $variable_name);
              if (!empty($item_content['extra']['variables'][$variable_name])) {
                $variable->appendChild($document->createTextNode($item_content['extra']['variables'][$variable_name]['summary']));
              }
            }
          }
        }
        if ($item_content['meta']['description']) {
          $summary = $item->appendChild($document->createElement('description'));
          $summary->appendChild($document->createTextNode($item_content['meta']['description']));
        }
      }
    }
  }
  return array('api.xml' => $document);
}

?>