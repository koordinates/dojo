<?php

require_once('../lib/benchmark/Timer.php');
require_once('../inc/Text.php');

print '<h2>Text::toArray</h2>';

$timer = new Benchmark_Timer();
$timer->start();
for ($i = 0; $i < 10000; $i++) {
  Text::toArray('A string');
}
$timer->stop();
$timer->display();

print '<h2>Text::findTermination</h2>';

$timer->start();
for ($i = 0; $i < 1000; $i++) {
  Text::findTermination(array(' function(key, value){},'), ',', '()[]{}');
}
$timer->stop();
$timer->display();

print '<h2>Text::findComments</h2>';

$timer->start();
for ($i = 0; $i < 1000; $i++) {
  Text::findComments(' and more */ var example = Math.floor(/* floor this */ 1.5 /* to 1 */); // whatnot', true);
}
$timer->stop();
$timer->display();

?>