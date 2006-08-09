
function test_dojo_doc () {
    // when fixed, remove the workaround in test_dom.js#test_dom_getUniqueId
	jum.assertTrue("document is undefined in test environment", typeof(dojo.doc()) != "undefined");
}
