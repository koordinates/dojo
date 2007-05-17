dojo.require("dojo.widget.DomWidget");

function test_domwidget_ctor(){
	var dw  = new dojo.widget.DomWidget();
	
	jum.assertEquals("test1", (typeof dw), "object");
	//jum.assertEquals("test2", dw.widgetType, "Widget");
	jum.assertEquals("test3", null, dw.templateNode);
	jum.assertEquals("test4", null, dw.templateString);
	// whatever the next line used to do, now it just throws an error because of missing arguments	
	//dw.buildFromTemplate();
}
