<?php

class Dojo
{
  private $dir;
  
  public function __construct($dir)
  {
    $this->setDir($dir);
  }
  
  public function getPackage($file)
  {
    return new DojoPackage($file);
  }
  
  public function getDir()
  {
    return $this->dir;
  }
  
  public function setDir($dir)
  {
    $this->dir = $dir;
  }

  public function getFileList($dir = false, $recurse = false)
  {
    $output = array();
    if ($dir === false) {
      $dir = $this->getDir();
    }
  
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
        $output = array_merge($output, $this->getFileList($file, true));
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

}

?>