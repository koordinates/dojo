function test_BurstError_BurstError() {
  jum.assertTrue("[].constructor ok", ([1,2,3].constructor == Array));

  var foo = burst.BurstError('asdf');
  jum.assertEquals('test1', 'burst.BurstError', foo.name);
  jum.assertEquals('test2', 'asdf', foo.message);

  jum.assertTrue("[].constructor ok 2", ([1,2,3].constructor == Array));
}
