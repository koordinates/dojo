function test_URI_queryToMap() {
  jum.assertTrue("[].constructor ok", ([1,2,3].constructor == Array));

  jum.assertEquals('test1', {a: 'v1', baz: 'v2'}, burst.URI.queryToMap('a=v1;baz=v2'));
  jum.assertEquals('test2', {a: 'a b', baz: ['a','b']}, burst.URI.queryToMap('a=a%20b&baz=a&baz=b', 'array'));
}

function test_URI_queryToArray() {
  jum.assertEquals('test1', ['a', 'v1', 'baz', 'v2'], burst.URI.queryToArray('a=v1;baz=v2'));
  var actual2 = burst.URI.queryToArray('a=a%20b&baz=a&baz=b');
  bu_debug('actual2=' + actual2.join('|'));
  jum.assertEquals('test2', ['a', 'a b', 'baz', 'a', 'baz', 'b'], actual2);
}

function test_URI_queryToPairs() {
  jum.assertEquals('test1', [['a', 'v1'], ['baz', 'v2']], burst.URI.queryToPairs('a=v1;baz=v2'));
}

function test_URI_mapToQuery() {
  jum.assertEquals('test1', 'a=v1;baz=v2', burst.URI.mapToQuery({a: 'v1', baz: 'v2'}));
}

function test_URI_isAbsolute() {
  jum.assertTrue('test1', burst.URI.isAbsolute('http://foo.com'));
  jum.assertTrue('test2', burst.URI.isAbsolute('file:///a/b'));
  jum.assertTrue('test3', burst.URI.isAbsolute('https://foo.com/a/b'));
  jum.assertFalse('test4', burst.URI.isAbsolute('./foo/a.html'));
}

function test_URI_parse() {
  jum.assertEquals('test1', ['file',null,'',null,null], burst.URI.parse('file:'))
  jum.assertEquals('test2', [null,null,'file',null,null], burst.URI.parse('file'))
  jum.assertEquals('test3', ['http','foo.org','/path','query','fragment'], burst.URI.parse('http://foo.org/path?query#fragment'));
}

function test_URI_pathSuffix() {
  jum.assertEquals('test1', 'txt', burst.URI.pathSuffix('foo.txt'));
  jum.assertEquals('test2', 'txt', burst.URI.pathSuffix('http://bar.org/a/foo.txt'));
}


function test_URI_guessMimeType() {
  jum.assertEquals('test1', 'text/plain', burst.URI.guessMimeType('http://foo.bar/a/b.txt?asdf'));
}

function test_URI_resolveUrl() {
  jum.assertEquals('test1', 'http://a.com', burst.URI.resolveUrl('http://a.com', 'http://b.com'));
  jum.assertEquals('test2', 'a.html', burst.URI.resolveUrl('a.html', ''));
  jum.assertEquals('test3', 'b/a.html', burst.URI.resolveUrl('a.html', 'b/'));
  jum.assertEquals('test4', 'b/a.html', burst.URI.resolveUrl('a.html', 'b/idex.html'));
  jum.assertEquals('test5', 'http://b.com/a/bar.html', burst.URI.resolveUrl('a/bar.html', 'http://b.com/'));
  jum.assertEquals('test6', 'http://b.com/bar.html', burst.URI.resolveUrl('bar.html', 'http://b.com'));
  jum.assertEquals('test7', 'http://b.com/bar.html', burst.URI.resolveUrl('./bar.html', 'http://b.com/'));
  jum.assertEquals('test8', 'http://b.com/bar.html', burst.URI.resolveUrl('../bar.html', 'http://b.com/baz/index.html'));
}