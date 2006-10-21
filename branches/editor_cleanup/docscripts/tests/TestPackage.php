<?php

require_once('../lib/simpletest/unit_tester.php');
require_once('../lib/simpletest/reporter.php');
require_once('../inc/Dojo.php');
require_once('../inc/DojoPackage.php');

class SubDojoPackage extends DojoPackage
{
  public function __construct($source, $second_line = false) {
    parent::__construct(new Dojo('../'), '');
    $this->source = array($source);
    if ($second_line) {
      $this->source[] = $second_line;
    }
  }
}

class TestPackage extends UnitTestCase
{
  function testGetSource()
  {
    $package = new SubDojoPackage('var rePkg = /(__package__|dojo)\.js([\?\.]|$)/i;');
    $code = $package->getCode();
    $this->assertEqual($code[0],  'var rePkg = /                                /i;');
    
    $package = new SubDojoPackage('var url = "http://site.com";');
    $code = $package->getCode();
    $this->assertEqual($code[0],  'var url = "               ";');
    
    $package = new SubDojoPackage('var regex = /(")/; // Check for double quote (")');
    $code = $package->getCode();
    $this->assertEqual($code[0],  'var regex = /   /;                              ');
    
    $package = new SubDojoPackage('if((typeof this["load"] == "function")&&((typeof this["Packages"] == "function")||(typeof this["Packages"] == "object"))){');
    $code = $package->getCode();
    $this->assertEqual($code[0],  'if((typeof this["    "] == "        ")&&((typeof this["        "] == "        ")||(typeof this["        "] == "      "))){');
    
    $package = new SubDojoPackage(         '/* Test', ' multiline */');
    $code = $package->getCode();
    $this->assertEqual(implode("\n", $code), "       \n             ");
    
    $package = new SubDojoPackage('return "["+this.widgetType+" ID:"+this.widgetId+"]"');
    $code = $package->getCode();
    $this->assertEqual($code[0],  'return " "+this.widgetType+"    "+this.widgetId+" "');
  }
}

$test = &new TestPackage();
$test->run(new HtmlReporter());

?>