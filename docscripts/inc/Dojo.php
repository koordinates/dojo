<?php

require_once('DojoPackage.php');

class Dojo
{
  public static $output = array();
  public static $root_dir;
  /** An array (by line #) of full source */ protected $source = array();
  /** $source - comments = $code */ protected $code = array();
  protected $package_name; // The uncompressed name of the package
  protected $compressed_package_name; // The compressed name of the package
  
  public function __construct($dir)
  {
    self::$root_dir = $dir;
  }
  
  public function getPackage($file)
  {
    return new DojoPackage($file);
  }
  
  /**
   * Blanks out a portion of a string with whitespace
   * 
   * @param $to_blank Portion of the string to be removed
   * @param $string Overall string to remove it from
   */
  protected function blankOut($to_blank, $string)
  {
    $length = strlen($to_blank);
    if (!$length) {
      return $string;
    }

    $blanks = array_fill(0, $length, ' ');
    return preg_replace('%' . preg_quote($to_blank, '%') . '%', implode($blanks), $string, 1);
  }
  
  protected function blankOutAt($to_blank, $start, $end = -1)
  {
    $length = $end - $start + 1;
    if (!$length) {
      $to_blank;
    }
    
    $blanks = array_fill(0, $length, ' ');
    return substr($to_blank, 0, $start) . implode($blanks) .  substr($to_blank, $end + 1);
  }
  
  protected function trim($string)
  {
    return trim(preg_replace('%(^\s*/\*.*\*/\s*?|\s*?/\*.*\*/\s*$|^\s*//.*\n\s*?|\s*?//.*$)%U', '', $string));
  }

}

?>