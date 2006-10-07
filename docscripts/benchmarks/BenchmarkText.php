<?php

require_once('../lib/benchmark/Timer.php');
require_once('../inc/Text.php');

$timer = new Benchmark_Timer();
$timer->start();
for ($i = 0; $i < 10000; $i++) {
  Text::toArray('A string');
}
$timer->setMarker("Text::toArray");
for ($i = 0; $i < 1000; $i++) {
  Text::findTermination(array(' function(key, value){},'), ',', '()[]{}');
}
$timer->setMarker("Text::findTermination");    
$timer->stop();
$timer->display();

?>