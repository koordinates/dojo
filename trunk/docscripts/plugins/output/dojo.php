<?php

function dojo_local_json($data)
{
  $output = array();
  if (isset($data['function_names'])) {
    $output['function_names'] = $data['function_names'];
    unset($data['function_names']);
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

?>