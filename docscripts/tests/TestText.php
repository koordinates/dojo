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
  
  function testFindComments()
  {
    list($first, $middle, $last, $data, $multiline) = Text::findComments('  /* test for multiline');
    $this->assertEqual($first, 'test for multiline');
    $this->assertEqual($middle, '', 'Test 1 has $middle');
    $this->assertEqual($last, '', 'Test 1 has $last');
    $this->assertFalse($data, 'Test 1 has $data');
    $this->assertTrue($multiline, 'Test 1 didn\'t return $multiline');
    
    list($first, $middle, $last, $data, $multiline) = Text::findComments(' and more */ var example = Math.floor(/* floor this */ 1.5 /* to 1 */); // whatnot', true);
    $this->assertEqual($first, 'and more');
    $this->assertEqual($middle, 'floor this to 1');
    $this->assertEqual($last, 'whatnot');
    $this->assertTrue($data, 'Test 2 does not have data');
    $this->assertFalse($multiline, 'Test 2 does not end with multiline');
  }
}

$test = &new TestText();
$test->run(new HtmlReporter());