<?php

require_once('../lib/simpletest/unit_tester.php');
require_once('../lib/simpletest/reporter.php');
require_once('../inc/Text.php');

class TestText extends UnitTestCase
{
  function testTrim()
  {
    $this->assertEqual(implode('|', Text::toArray("A string")), 'A| |s|t|r|i|n|g');
  }
  
  function testFindTermination()
  {
    $source_array = array(' null,');
    list($line_number, $position) = Text::findTermination($source_array, ',');
    $this->assertEqual($line_number . '/' . $position, '0/5');
    
    $source_array = array(' function(key, value){},');
    list($line_number, $position) = Text::findTermination($source_array, ',', '()[]{}');
    $this->assertEqual($line_number . '/' . $position, '0/23');
    
    $source_array = array(' "     ")');
    list($line_number, $position) = Text::findTermination($source_array, ')', '()');
    $this->assertEqual($line_number . '/' . $position, '0/8');
    
    $source_array = array(' function() {', '   ', '},');
    list($line_number, $position) = Text::findTermination($source_array, ',)', '(){}');
    $this->assertEqual($line_number . '/' . $position, '2/1');
  }
}

$test = &new TestText();
$test->run(new HtmlReporter());