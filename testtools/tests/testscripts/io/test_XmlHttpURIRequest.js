// just test creation and nothing more
function tst_XmlHttpURIRequest_create() {
  if (!bu_Runtime.has_HttpRequest()) {jum.untested('XmlHttpURIRequest.create'); return;}

  jum.debug("(test_XmlHttpURIRequest.js) about to attempt create");
  var httpreq = burst.io.XmlHttpURIRequest.create();

}

// get a text contents from a url's contents, sync
function test_XmlHttpURIRequest_getTextSync() {
  if (!bu_Runtime.has_HttpRequest()) {jum.untested('XmlHttpURIRequest.getTextSync'); return;}

  var url = tst_data_url('testdata_text.txt');

  /* for debugging relative url bugs in xmlhttprequest
  if (typeof window != 'undefined') {
    bu_alert("(test_XmlHttpURIRequest.js) window.location.href=" + window.location.href);
    bu_alert("(test_XmlHttpURIRequest.js) top.location.href=" + top.location.href);
    bu_alert("(test_XmlHttpURIRequest.js) base=" + burst.xml.HtmlUtil.getWindowBaseUrl(window));
    bu_alert("(test_XmlHttpURIRequest.js) resolved url=" + burst.xml.HtmlUtil.resolveWindowUrl(url, window));
  }
  */

  jum.debug("(test_XmlHttpURIRequest.js) about to getTextSync, for url " + url);

  var text = burst.io.XmlHttpURIRequest.getTextSync(url);
  jum.debug("(test_XmlHttpURIRequest.js) got sync text=" + text);
  jum.assertEquals('text contents', EXPECTED_TEXT, text);

/*
  // IE throws "Unspecified Error" of type Error if httpreq is no send has been done.
  // 0 in Moz
  bu_alert("(test_XmlHttpURIRequest.js) httpreq.status=" + httpreq.status + ' typeof=' + (typeof httpreq.status));
  // null in Moz
  bu_alert("(test_XmlHttpURIRequest.js) httpreq.statusText='" + httpreq.statusText + "'");
*/
}

// do it again, for xml contents
function test_XmlHttpURIRequest_getTextSync2() {
  if (!bu_Runtime.has_HttpRequest()) {jum.untested('XmlHttpURIRequest.getTextSync2'); return;}
  var url = tst_data_url('testdata_xmlnodecl.xml');
  jum.debug("(test_XmlHttpURIRequest.js) about to getTextSync, for url " + url);
  var xml_string = burst.io.XmlHttpURIRequest.getTextSync(url);
  jum.debug("(test_XmlHttpURIRequest.js) got sync text=" + xml_string);
  jum.assertEquals('xml contents', EXPECTED_XMLNODECL, xml_string);
}

