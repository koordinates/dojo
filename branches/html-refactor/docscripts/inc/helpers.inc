<?php

require_once('lib/JSON.php');

function writeToDisk($output, $dir, $format = 'json') {
  $json = new Services_JSON();
  if ($dir{strlen($dir) - 1} == '/') {
    $dir = substr($dir, 0, -1);
  }
  foreach ($output as $package_name => $package) {
    if ($package_name == 'function_names') {
      foreach (array_keys($package) as $package_name) {
        sort($package[$package_name]);
      }
      $data = $json->encode($package);
      file_put_contents($dir . '/function_names', $data);
    }
    else {
      if (!file_exists($dir . '/' . $package_name)) {
        mkdir($dir . '/' . $package_name);
      }
      foreach ($package as $function_name => $function) {
        if ($function_name == 'meta') {
					if ($function['methods']) {
						ksort($function['methods']);
					}
          $data = $json->encode($function);
          file_put_contents($dir . '/' . $package_name  . '/meta', $data);
        }
        else {
          if (!file_exists($dir . '/' . $package_name . '/' . $function_name)) {
            mkdir($dir . '/' . $package_name . '/' . $function_name);
          }
          foreach ($function as $polymorphic_id => $polymorphism) {
            foreach ($polymorphism as $type => $data) {
              if (!file_exists($dir . '/' . $package_name . '/' . $function_name . '/' . $polymorphic_id)) {
                mkdir($dir . '/' . $package_name . '/' . $function_name . '/' . $polymorphic_id);
              }
              if ($type == 'meta') {
                $data = $json->encode($data);
              }
              file_put_contents($dir . '/' . $package_name . '/' . $function_name . '/' . $polymorphic_id . '/' . $type, $data);
            }
          }
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
  
  $output[$package->getPackageName()]['meta']['methods'][$function_name]['_'] = '';
  $parameters = $declaration->getParameters();
  foreach ($parameters as $parameter) {
    $output[$package->getPackageName()][$function_name]['_']['meta']['parameters'][] = array($parameter->getType(), $parameter->getValue());
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
      $output[$package->getPackageName()]['meta']['methods'][$function_name]['_'] = $declaration->getBlockComment($key);
    }
    elseif ($key == 'description') {
      $output[$package->getPackageName()][$function_name]['_']['description'] = $declaration->getBlockComment($key);
    }
  }
  
  $output[$package->getPackageName()][$function_name]['_']['src'] = $declaration->getSource();
  
  $this_variables = $declaration->getThisVariableNames();
  foreach ($this_variables as $this_variable) {
    if ($output[$package->getPackageName()] && $output[$package->getPackageName()][$masquerading_as_function] && $output[$package->getPackageName()][$masquerading_as_function]['_']['meta'] && $output[$package->getPackageName()][$masquerading_as_function]['_']['meta']['this_variables']) {
      if (!in_array($this_variable, $output[$package->getPackageName()][$masquerading_as_function]['_']['meta']['this_variables'])) {
        $output[$package->getPackageName()][$masquerading_as_function]['_']['meta']['this_variables'][] = $this_variable;
      }
    }
    else {
      $output[$package->getPackageName()][$masquerading_as_function]['_']['meta']['this_variables'][] = $this_variable;
    }
  }
  
  $returns = array_unique($declaration->getReturnComments());
  if (count($returns) == 1) {
    $output[$package->getPackageName()][$function_name]['_']['meta']['returns'] = $returns[0];
  }
  elseif ($returns) {
    $output[$package->getPackageName()][$function_name]['_']['meta']['returns'] = 'mixed';
  }
  
  if ($calls = $declaration->getThisInheritanceCalls()) {
    $output[$package->getPackageName()][$function_name]['_']['meta']['this_inherits'] = $calls;
  }
  
  if ($declaration->isThis()) {
    $output[$package->getPackageName()][$function_name]['_']['meta']['this'] = $declaration->getThis();
  }
}

?>