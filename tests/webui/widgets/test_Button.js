dojo.hostenv.loadModule("dojo.webui.widgets.Button");

function test_button_ctor(){
	var b1 = new dojo.webui.widgets.Button();

	jum.assertTrue("test10", typeof b1 == "object");
	jum.assertTrue("test20", b1.widgetType == "Button");
	jum.assertTrue("test21", typeof b1["attachProperty"] == "undefined");

	var db1 = new dojo.webui.widgets.DomButton();
	jum.assertTrue("test30", typeof db1 == "object");
	jum.assertTrue("test40", db1.widgetType == "Button");
	jum.assertTrue("test50", db1.attachProperty == "dojoAttachPoint");
	jum.assertTrue("test60", typeof db1.domNode != "undefined");

}
