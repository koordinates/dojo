// moz matches this.
// ie has different return characters.
var EXPECTED_TEXT = 'Hello World.\nHere is some text with angle brackets: <root></root>\nHere is a parameter entity: &nbsp;\n';

// moz doesn't preserve the trailing white space outside of root. 
// IE seems to do formatting, including indents, for xmlhttp. for iframe, no xml available.
var EXPECTED_XMLNODECL = '<root>\n<content>Hello World</content>\n</root>\n';
// tbd whether to put in front "<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE root []>"
var EXPECTED_XMLDECL = EXPECTED_XMLNODECL;
var do_test_xmldecl = false;

var EXPECTED_HTMLNODOCTYPE = '<html>\n <head><title>some sample html</title></head>\n <body>\n   <div class="divclass"/>\n   <span class=\'spanclass\'></span>\n </body>\n</html>\n';

var EXPECTED_JS = '// this is some javascript source code\nvar a = 17;\nvar b = 1 < 3;\nvar c = "asdf";\nvar d = 3 > 8;\nvar e = true && false;\n';


function tst_compare_string(message, expected, actual) {
  if (expected == actual) return;
  var orig = actual;
  var orig_expected = expected;

  // remove any trailing return
  actual = actual.replace(/\n$/,'');
  expected = expected.replace(/\n$/,'');
  if (expected == actual) {
     bu_alert(message + " differs in trailing return character, actual is: '" + orig + "'");
     return;
  }

  // remove any trailing white
  actual = actual.replace(/\s+$/,'');
  expected = expected.replace(/\s+$/,'');
  if (expected == actual) {
     bu_alert(message + " differs in trailing white space, actual is: '" + orig + "'");
     return;
  }

  // normalize returns
  actual = actual.replace(/\r\n?/g, '\n');
  if (expected == actual) {
     bu_alert(message + " differs in return characters, actual is: '" + orig + "'");
     return;
  }

  // collapse all white space
  actual = actual.replace(/\s+/g, ' ');
  expected = expected.replace(/\s+/g, ' ');
  if (expected == actual)
     bu_alert(message + " differs in white space, actual is: '" + orig + "'");
  else {
     if (typeof jum_compare_strings != 'undefined') bu_alert(jum_compare_strings(expected, actual));
     jum.assertEquals(message + ' differs by more than white space', expected, actual);
  }
}

// just simple tst of create
function test_IframeURIRequest_create() {
  var if_id = burst.Lang.gensym();
  // Moz calls the onload. IE and Opera do not
  burst.xml.HtmlUtil.iframeCreate(if_id, null, function() {jum.debug('(test_IframeURIRequest.js) in iframe element onload')});
}

// load a text file, async
function test_IframeURIRequest_loadText() {
  if (!bu_UA.is_browser()) {jum.untested('IframeURIRequest.loadText'); return;}

  // keep this relative to test relative loading
  var url = tst_data_url('testdata_text.txt');
  //var url = tst_data_url('testdata_htmlnodoctype.html');

  var iframe = new burst.io.IframeURIRequest();

  jum.pause('IframeURIRequest.loadText', null, 'callback from iframe.load()');
  var doc;
  iframe.load(url, function(iframeobj) {
    jum.resume('IframeURIRequest.loadText', null, function() {
      jum.debug('(test_IframeURIRequest.js) in callback for url ' + url + ' with object ' + iframeobj);
      doc = iframeobj.getDocument();
      jum.debug('(test_IframeURIRequest.js) iframeobj.getDocument()=' + doc);
      var text_contents = iframeobj.getText();
      jum.debug('(test_IframeURIRequest.js) iframeobj.getText()="' + text_contents + '"');
      if (doc.documentElement) {
          jum.debug('(test_IframeURIRequest.js) doc.documentElement.outerHTML=' + (typeof doc.documentElement.outerHTML == 'undefined' ? undefined : '"' + doc.documentElement.outerHTML + '"'));
          jum.debug('(test_IframeURIRequest.js) doc.documentElement.innerText=' + (typeof doc.documentElement.innerText == 'undefined' ? undefined : '"' + doc.documentElement.innerText + '"'));
      }
      else {
        jum.debug('(test_IframeURIRequest.js) no doc.documentElement');
      }
      jum.debug('(test_IframeURIRequest.js) doc.parseError=' + (typeof doc.parseError == 'undefined' ? undefined : '"' + doc.parseError + '"'));
      jum.assertTrue('parseError', (typeof doc.parseError == 'undefined') || !doc.parseError);
      tst_compare_string('(test_IframeURIRequest_loadText) text contents', EXPECTED_TEXT, text_contents);
    });
  });
}

function test_IframeURIRequest_loadXml() {
  if (!bu_UA.is_browser()) {jum.untested('IframeURIRequest.loadXml'); return;}

  // wait for IframeURIRequest.loadText to complete, so that we can test re-using the previous iframe object
  jum.waitFor('IframeURIRequest.loadText', null, 'IframeURIRequest.loadXml', null, complete_IframeURIRequest_loadXml);
}

function complete_IframeURIRequest_loadXml() {
  bu_alert('(test_IframeURIRequest.js) completing test_IframeURIRequest_loadXml after wait');
  var url2 = tst_data_url(do_test_xmldecl ? 'testdata_xmldecl.xml' : 'testdata_xmlnodecl.xml');
  var url2abs = burst.xml.HtmlUtil.resolveWindowUrl(url2, window);

  jum.debug('(test_IframeURIRequest.js) creating another iframe');
  var iframe2 = burst.io.IframeURIRequest.getInstance();
  jum.debug('(test_IframeURIRequest.js) made iframe2, about to call load: ' + iframe2);
  jum.pause('IframeURIRequest.loadXml', 1, 'callback from iframe2.load()');

  iframe2.load(url2, function(iframeobj) {
    jum.resume('IframeURIRequest.loadXml', 1, function() {
      jum.debug('(test_IframeURIRequest.js) in url2 callback, url2=' + url2 + " url2abs=" + url2abs);
      jum.assertTrue('iframeobj', iframeobj);
      var doc2 = iframeobj.getDocument();
      jum.debug('(test_IframeURIRequest.js) iframeobj.getDocument()=' + doc2);
      jum.debug('(test_IframeURIRequest.js) iframeobj.getText()="' + iframeobj.getText() + '"');
      var pe = (typeof doc2.parseError == 'undefined' ? null : doc2.parseError);
      jum.debug('(test_IframeURIRequest.js) doc2.parseError=' + pe);
      jum.assertTrue('getDocument', doc2);
      jum.assertFalse('parseError', pe);
      var xml_string = iframeobj.getXML();
      jum.debug('(test_IframeURIRequest.js) XML=' + xml_string);
      tst_compare_string('(test_IframeURIRequest_loadXml) xml contents', do_test_xmldecl ? EXPECTED_XMLDECL : EXPECTED_XMLNODECL, xml_string);
    });
  });
}

//outerwin = window;
//bu_alert('(test_IframeURIRequest.js) inlinewin=outerwin : ' + (inlinewin == outerwin));

//for(var wink in this){if (wink.indexOf('test')!= -1) bu_alert('(test_IframeURIRequest.js) window symbol ' + wink)}

