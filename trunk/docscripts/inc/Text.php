<?php

class Text
{
  /**
   * Blanks out a portion of a string with whitespace
   * 
   * @param $to_blank Portion of the string to be removed
   * @param $string Overall string to remove it from
   */
  public static function blankOut($to_blank, $string)
  {
    $length = strlen($to_blank);
    if (!$length) {
      return $string;
    }

    $blanks = array_fill(0, $length, ' ');
    return preg_replace('%' . preg_quote($to_blank, '%') . '%', implode($blanks), $string, 1);
  }
  
  public static function blankOutAt($to_blank, $start, $end = -1)
  {
    if($end == -1) {
      $end = strlen($to_blank) - 1;
    }
    $length = $end - $start + 1;
    if (!$length) {
      return $to_blank;
    }
    if ($length < 0) {
      print 'hi';
    }
    $blanks = array_fill(0, $length, ' ');
    return substr($to_blank, 0, $start) . implode($blanks) .  substr($to_blank, $end + 1);
  }
  
  public static function trim($string)
  {
    return trim(preg_replace('%(^\s*/\*.*\*/\s*?|\s*?/\*.*\*/\s*$|^\s*//.*\n\s*?|\s*?//.*$)%U', '', $string));
  }
  
  public static function chop($array, $start_line, $start_position, $end_line = false, $end_position = false, $exclusive = false)
  {
    if (!is_numeric($end_line)) {
      $end_line = end(array_keys($array));
    }
    if (!is_numeric($end_position)) {
      $end_position = strlen($array[$end_line]) - 1;
      if($end_position < 0){
        $end_position = 0;
      }
    }
    
    $lines = array_slice($array, $start_line, $end_line - $start_line + 1, true);
    if ($start_position > 0) {
      $lines[$start_line] = Text::blankOutAt($lines[$start_line], 0, $start_position - 1);
    }
    $lines[$end_line] = Text::blankOutAt($lines[$end_line], $end_position + 1, strlen($lines[$end_line]));
    if ($exclusive) {
      $lines[$start_line]{$start_position} = ' ';
      $lines[$end_line]{$end_position} = ' ';
    }
    
    return $lines;
  }
  
  public static function toArray($string)
  {
    $chars = array();
    for ($i = 0; $i < strlen($string); $i++) {
      $chars[] = $string{$i};
    }
    return $chars;
  }
}

?>