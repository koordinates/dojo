dojo.hostenv.loadModule("dojo.webui.widgets.Button");

function test_button_ctor(){
	var b1 = new dojo.webui.widgets.Button();

	jum.assertTrue("test1", typeof b1 == "object");
	jum.assertTrue("test2", b1.widgetType == "Button");

	var db1 = new dojo.webui.widgets.DomButton();
	jum.assertTrue("test3", typeof db1 == "object");
	jum.assertTrue("test4", db1.widgetType == "Button");

}
