// this really tests AbstractRuntime using the correct AbstractURIRequest instance.
/*
Test matrix
               .txt               xml             html         xhtml                   js
                (text/plain)      (text/xml)      (text/html)  (application/xhtml+xml)   (text/javascript or application/x-javascript)
IE xmlhttp      responseText      responseXml     responseXml
moz xmlhttp     responseText      responseXml

IE iframe       innerText         ?               innerHtml
moz iframe      innerText
opera iframe    innerText

*/

//var TESTDATA_ABS_URL = '';
//var TESTDATA_ABS_URL = 'http://127.0.0.1/~mda/burstproject/tests/testdata/';
var TESTDATA_ABS_URL = null;

// hack to force test data urls be absolute
function tst_data_url(url) {
  // if we are in a browser, ../../testdata.
  var TESTDATA_REL_URL = (typeof window != 'undefined') ? '../../tests/testdata/' : '../tests/testdata/';
  url = TESTDATA_REL_URL + url;
  if (TESTDATA_ABS_URL == null) {
    if (false && typeof window != 'undefined') {
      alert('(test_AbstractURIRequest.js) resolving test data url ' + url + ' with window.location.href=' + window.location.href);
      TESTDATA_ABS_URL = window.location.href;
      TESTDATA_ABS_URL = TESTDATA_ABS_URL.substring(0,TESTDATA_ABS_URL.lastIndexOf('/'));
    }
    else TESTDATA_ABS_URL = '';
  }
  return TESTDATA_ABS_URL + url;
}

// get an DomDocument instance from a url's contents, async
function test_AbstractURIRequest_getDocumentAsync() {
  if (!bu_Runtime.has_HttpRequest() && !bu_UA.is_browser()) {jum.untested('AbstractURIRequest.getDocumentAsync'); return;}

  var url = tst_data_url('testdata_xmlnodecl.xml');

  jum.debug("(test_AbstractURIRequest.js) about to call getDocumentAsync for url " + url);

  jum.pause('AbstractURIRequest.getDocumentAsync', null, 'callback from getDocumentAsync');

  bu_Runtime.getDocumentAsync(url, function(doc) {
    alert('(test_AbstractURIRequest.js) in getDocumentAsync callback');
    jum.resume('AbstractURIRequest.getDocumentAsync', null, function() {
      jum.debug("(test_AbstractURIRequest.js) got doc object=" + doc + ', typeof doc=' + (typeof doc));
      var xml_string = burst.xml.XmlDoc.toXmlString(doc);
      jum.debug("(test_AbstractURIRequest.js) toXmlString(doc)='" + xml_string + "'");
      tst_compare_string('(test_AbstractURIRequest_getDocumentAsync) xml contents', EXPECTED_XMLNODECL, xml_string);
    });
  });
}

// get a text contents from a url's contents, async
function test_AbstractURIRequest_getTextAsync() {
  if (!bu_Runtime.has_HttpRequest() && !bu_UA.is_browser()) {jum.untested('AbstractURIRequest.getTextAsync'); return;}

  var url = tst_data_url('testdata_text.txt');

  jum.debug("(test_AbstractURIRequest.js) about to call getTextAsync for url " + url);
  jum.pause('AbstractURIRequest.getTextAsync', null, 'callback from getTextAsync');

  var handler = function(text) {
    alert('(test_AbstractURIRequest.js) in getTextAsync callback');
    jum.resume('AbstractURIRequest.getTextAsync', null, function() {
      alert('(test_AbstractURIRequest.js) in getTextAsync resume, text=' + text);
      jum.debug("(test_AbstractURIRequest.js) got text=" + text);
      jum.assertEquals('text contents', EXPECTED_TEXT, text);
    });
  };
  jum.debug("(test_AbstractURIRequest.js) handler is " + handler);
  bu_Runtime.getTextAsync(url, handler);

/*
  bu_Runtime.getTextAsync(url, function(text) {
    jum.resume('AbstractURIRequest.getTextAsync', null, function() {
      jum.debug("(test_AbstractURIRequest.js) got text=" + text);
      jum.assertEquals('text contents', EXPECTED_TEXT, text);
    });
  });
*/
}

