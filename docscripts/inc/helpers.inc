<?php

require_once('lib/JSON.php');

function writeToDisk($output, $dir, $format = 'json', $environment = 'remote') {
	if ($dir{strlen($dir) - 1} == '/') {
    $dir = substr($dir, 0, -1);
  }
	if (!file_exists($dir)) {
		mkdir($dir);
		chmod($dir, 0777);
	}
	delTree($dir);

	if ($format == 'json' && $environment == 'local') {
		$json = new Services_JSON();
		$merged = array();
		foreach ($output as $package_name => $package) {
			$merged_name = $package_name;
			if (strpos($merged_name, '.')) {
				$merged_parts = explode('.', $merged_name);
				$merged_name = $merged_parts[0] . '.' . $merged_parts[1];
				unset($merged_parts);
				$merged[$merged_name][$package_name] = $package;
			}
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
	  foreach ($output as $package_name => $package) {
	    if ($package_name == 'function_names') {
	      $data = $json->encode($package);
	      file_put_contents($dir . '/function_names', $data);
	    }
	    else {
	      if (!file_exists($dir . '/' . $package_name)) {
	        mkdir($dir . '/' . $package_name);
					chmod($dir . '/' . $package_name, 0777);
	      }
				if (isset($package['meta'])) {
					$meta = array();
					foreach ($package['meta'] as $key => $value) {
						if ($key != 'methods') {
							$meta[$key] = $value;
							unset($package['meta'][$key]);
						}
					}

					if (isset($package['meta']['methods'])) {
						ksort($package['meta']['methods']);

			      foreach ($package['meta']['methods'] as $function_name => $function) {
		          if (!file_exists($dir . '/' . $package_name . '/' . $function_name)) {
		            mkdir($dir . '/' . $package_name . '/' . $function_name);
		          }
		          foreach ($function as $polymorphic_id => $polymorphism) {
								if (isset($polymorphism['meta'])) {
									if (!file_exists($dir . '/' . $package_name . '/' . $function_name . '/' . $polymorphic_id)) {
		                mkdir($dir . '/' . $package_name . '/' . $function_name . '/' . $polymorphic_id);
		              }
			            foreach ($polymorphism['meta'] as $type => $data) {
										if (empty($data)) {
											continue;
										}

										if ($type == 'summary') {
											$meta['methods'][$function_name][$polymorphic_id]['meta']['summary'] = $data;
											unset($polymorphism['meta'][$type]);
										}
										else if ($type == 'description' || $type == 'src') {
											file_put_contents($dir . '/' . $package_name . '/' . $function_name . '/' . $polymorphic_id . '/' . $type, $data);
											unset($polymorphism['meta'][$type]);
										}
			            }
									if (!empty($polymorphism['meta'])) {
		                $data = $json->encode($polymorphism['meta']);
		              	file_put_contents($dir . '/' . $package_name . '/' . $function_name . '/' . $polymorphic_id . '/meta', $data);
									}
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

function getFileList($dir, $recurse = false)
{
  $output = array();

  if (!$recurse) {
    $old_dir = getcwd();
    chdir($dir);
    $dir = '.';
  }
  $files = scandir($dir);

  foreach ($files as $file) {
    if ($file{0} == '.') continue;
    if (is_dir($dir . '/' . $file)) {
      if (!$recurse && $file != 'src') continue;
      if ($recurse) {
        $file = $dir . '/' . $file;
      }
      $output = array_merge($output, getFileList($file, true));
    }
    else {
      if (substr($file, -2) == 'js') {
        if ($recurse) {
          $file = $dir . '/' . $file;
        }
        $output[] = $file;
      }
    }
  }
  
  if (!$recurse) {
    chdir($old_dir);
  }
  return $output;
}

function rolloutFunction(&$output, $package, $declaration) {
  $masquerading_as_function = $function_name = $declaration->getFunctionName();
  if ($declaration->isThis()) {
    $masquerading_as_function = $declaration->getThis();
  }
  
  $output[$package->getPackageName()]['meta']['methods'][$function_name]['_']['meta']['summary'] = '';
  $parameters = $declaration->getParameters();
  foreach ($parameters as $parameter) {
    $output[$package->getPackageName()]['meta']['methods'][$function_name]['_']['meta']['parameters'][$parameter->getValue()]['type'] = $parameter->getType();
  }
  
  $declaration->addBlockCommentKey('summary');
  $declaration->addBlockCommentKey('description');
  $parameters = $declaration->getParameters();
  foreach ($parameters as $parameter) {
    $declaration->addBlockCommentKey($parameter->getValue());
  }
  
  $comment_keys = $declaration->getBlockCommentKeys();
  foreach ($comment_keys as $key) {
    if ($key == 'summary') {
      $output[$package->getPackageName()]['meta']['methods'][$function_name]['_']['meta']['summary'] = $declaration->getBlockComment($key);
    }
    elseif ($key == 'description') {
      $output[$package->getPackageName()]['meta']['methods'][$function_name]['_']['meta']['description'] = $declaration->getBlockComment($key);
    }
  }
  
  $output[$package->getPackageName()]['meta']['methods'][$function_name]['_']['meta']['src'] = $declaration->getSource();
  
  $this_variables = $declaration->getThisVariableNames();
  foreach ($this_variables as $this_variable) {
    if (isset($output[$package->getPackageName()][$masquerading_as_function]['_']['meta']['this_variables'])) {
      if (!in_array($this_variable, $output[$package->getPackageName()]['meta']['methods'][$masquerading_as_function]['_']['meta']['this_variables'])) {
        $output[$package->getPackageName()]['meta']['methods'][$masquerading_as_function]['_']['meta']['this_variables'][] = $this_variable;
      }
    }
    else {
      $output[$package->getPackageName()]['meta']['methods'][$masquerading_as_function]['_']['meta']['this_variables'][] = $this_variable;
    }
  }
  
  $returns = array_unique($declaration->getReturnComments());
  if (count($returns) == 1) {
    $output[$package->getPackageName()]['meta']['methods'][$function_name]['_']['meta']['returns'] = $returns[0];
  }
  elseif ($returns) {
    $output[$package->getPackageName()]['meta']['methods'][$function_name]['_']['meta']['returns'] = 'mixed';
  }
  
  if ($calls = $declaration->getThisInheritanceCalls()) {
    $output[$package->getPackageName()]['meta']['methods'][$function_name]['_']['meta']['this_inherits'] = $calls;
  }
  
  if ($declaration->isThis()) {
    $output[$package->getPackageName()]['meta']['methods'][$function_name]['_']['meta']['this'] = $declaration->getThis();
  }
}

?>