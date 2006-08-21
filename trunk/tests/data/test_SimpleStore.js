dojo.require("dojo.data.SimpleStore");
dojo.require("dojo.logging.Logger");

function test_simple_getters(){
	var data=[
		{Id:1, val1:"testval", simpleNum:1.2, getName:function(){return "Bob Smith";}},
		{Id:2, val1:null, simpleNum:56, getName:function(){return "Jane";}},
		{Id:3, val1:"value", simpleNum:1, getName:function(){return "Bam bam";}, nested:{name:"value"}}
	];
	
	var store=new dojo.data.SimpleStore(data);
	
	jum.assertTrue("store data length", store.getData().length == 3);
	jum.assertEquals("store getByKey", store.getByKey(1)["src"], data[0]);
	jum.assertEquals("store dataByKey", store.getDataByKey("3"), data[2]);
}

function test_null_expression_values(){
	var data=[
		{Id:1, val1:"testval", simpleNum:1.2, getName:function(){return "Bob Smith";}},
		{Id:2, val1:null, simpleNum:56, getName:function(){return "Jane";}},
		{Id:3, val1:"value", simpleNum:1, getName:function(){return "Bam bam";}, nested:{name:"value"}}
	];
	
	var store=new dojo.data.SimpleStore(data);
	
	jum.assertEquals("getFunctionValue", store.getField(data[2], "nested.name"), "value");
	jum.assertEquals("getNullField", store.getField(data[1], "val1"), null);
	
	try {
		store.getField(data[0], "val1.missing");
	} catch (e) { jum.assertTrue("field with syntax missing", e instanceof Error);return;}
	throw new JUMAssertFailure("Previous test should have failed.");
}

function test_null_field_values(){
	var data=[
		{Id:2, val1:null, simpleNum:56, getName:function(){return "Jane";}}
	];
	
	var store=new dojo.data.SimpleStore(data);
	
	try {
		store.getField(data[0], "val1");
	} catch (e) { jum.assertTrue("field missing", e instanceof Error); return;}
	throw new JUMAssertFailure("Previous test should have failed.");
}
