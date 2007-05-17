<?php

class Plugins
{
  private $dir;
  private static $json;
  private static $formats = array('xml', 'json', 'database');
  private static $types = array('local', 'remote', 'storage');
  
  public function __construct($dir)
  {
    $this->dir = $dir;
    $this->json = new Services_JSON();
  }

  public function write($by_resource, $by_object)
  {
    $dir = $this->dir . '/plugins/output/';
    $output_dir = $this->dir . '/output/';
    $this->delTree($output_dir);

    $files = scandir($dir);
    foreach ($files as $file) {
      if (substr($file, -4) == '.php') {
        include_once($dir . $file);
        $name = substr($file, 0, -4);
        foreach (self::$types as $type) {
          foreach (self::$formats as $format) {
            $function = "{$name}_{$type}_{$format}";
            if (function_exists($function)) {
              if(!file_exists($output_dir)) {
                mkdir($output_dir, 0777);
              }
              if (!file_exists("{$output_dir}{$type}")) {
                mkdir("{$output_dir}{$type}", 0777);
              }
              if (!file_exists("{$output_dir}{$type}/{$format}")) {
                mkdir("{$output_dir}{$type}/{$format}", 0777);
              }

              $data = call_user_func($function, $by_resource, $by_object);
							if(!is_array($data)) continue;
              foreach ($data as $file => $contents) {
                $file = "{$output_dir}{$type}/{$format}/{$file}";
                if ($format == 'json') {
                  file_put_contents($file, $this->json->encode($contents));
                }
                elseif ($format == 'xml') {
                  file_put_contents($file, $contents->saveXML());
                }
                chmod($file, 0777);
              }
							
							global $timer;
							$timer->setMarker("$function run");
            }
          }
        }
      }
    }
  }
  
  private function delTree($directory, $last_directory = false)
  { 
    if($last_directory){ 
      $directory .= '/' . $last_directory; 
    } 
  
    if (file_exists($directory)) {
      $files = scandir($directory); 
      foreach($files as $file){ 
        if($file{0} != '.'){ 
          if(is_dir($directory . '/' . $file)){ 
            $this->delTree($directory, $file);
						if (!in_array('.svn',  $files) && scandir($directory . '/' . $file) == 2) {
							rmdir($directory . '/' . $file);
						}
          }else{ 
            unlink($directory . '/' . $file); 
          } 
        }
      }
    }
  }
}

?>