dojo.hostenv.loadModule("dojo.event.Event");

function testObjectClass(){
	this.funcCallCount = 0;
	this.lastReturn =  null;
	this.secondLastReturn = null;

	this.func1 = function(arg1, arg2){
		this.funcCallCount++;
		this.secondLastReturn = this.lastReturn;
		this.lastReturn = "func1, arg1: "+arg1+", arg2: "+arg2;
		jum.debug(this.lastReturn);
		return this.lastReturn;
	}

	this.func2 = function(arg1, arg2){
		this.funcCallCount++;
		this.secondLastReturn = this.lastReturn;
		this.lastReturn = "func2, arg1: "+arg1+", arg2: "+arg2;
		jum.debug(this.lastReturn);
		return this.lastReturn;
	}

	this.argSwapAroundAdvice =  function(miObj){
		// dojo.hostenv.println("in adviceFromFunc1ToFunc2");
		var tmp = miObj.args[1];
		miObj.args[1] = miObj.args[0];
		miObj.args[0] = tmp;
		// dojo.hostenv.println(miObj.args.length);

		// return obj[funcName].apply(obj, argsArr);
		ret = miObj.proceed();
		return ret;
	}
}

function test_event_beforeAround(){
	var obj1 = new testObjectClass();

	dojo.event.connect("before", obj1, "func1", obj1, "func2", obj1, "argSwapAroundAdvice");

	jum.assertTrue("test1", obj1.func1("1", "2")=="func1, arg1: 1, arg2: 2");
	jum.assertEquals("test2", obj1.secondLastReturn, "func2, arg1: 2, arg2: 1");
	jum.assertEquals("test3", obj1.lastReturn, "func1, arg1: 1, arg2: 2");
}

function test_event_before(){
	var obj1 = new testObjectClass();

	dojo.event.connect("before", obj1, "func1", obj1, "func2");

	jum.assertTrue("test4", obj1.func1("1", "2")=="func1, arg1: 1, arg2: 2");
	// we expected func2 to fire before func1 and neither to mangle arguments
	jum.assertEquals("test5", obj1.secondLastReturn, "func2, arg1: 1, arg2: 2");
	// so the most recent return should be from func1
	jum.assertEquals("test6", obj1.lastReturn, "func1, arg1: 1, arg2: 2");
}

function test_event_afterAround(){
	var obj1 = new testObjectClass();

	dojo.event.connect("after", obj1, "func1", obj1, "func2", obj1, "argSwapAroundAdvice");

	jum.assertTrue("test7", obj1.func1("1", "2")=="func1, arg1: 1, arg2: 2");
	jum.assertEquals("test8", obj1.lastReturn, "func2, arg1: 2, arg2: 1");
	jum.assertEquals("test9", obj1.secondLastReturn, "func1, arg1: 1, arg2: 2");
}

function test_event_after(){
	var obj1 = new testObjectClass();

	dojo.event.connect("after", obj1, "func1", obj1, "func2");

	jum.assertTrue("test10", obj1.func1("1", "2")=="func1, arg1: 1, arg2: 2");
	jum.assertEquals("test11", obj1.secondLastReturn, "func1, arg1: 1, arg2: 2");
	jum.assertEquals("test12", obj1.lastReturn, "func2, arg1: 1, arg2: 2");
}

function test_event_around(){
	var obj1 = new testObjectClass();
	dojo.event.connect("around", obj1, "func1", obj1, "argSwapAroundAdvice");
	jum.assertTrue("test13", obj1.func1("1", "2")=="func1, arg1: 2, arg2: 1");
	jum.assertEquals("test14", obj1.lastReturn, "func1, arg1: 2, arg2: 1");
	jum.assertEquals("test15", obj1.secondLastReturn, null);
}

function test_event_kwConnect(){
	var obj1 = new testObjectClass();

	// test to see if "after" gets set as the default type
	dojo.event.kwConnect({
		srcObj: obj1, 
		srcFunc: "func1", 
		adviceObj: obj1, 
		adviceFunc: "func2"
	});

	jum.assertTrue("test16", obj1.func1("1", "2")=="func1, arg1: 1, arg2: 2");
	jum.assertEquals("test17", obj1.secondLastReturn, "func1, arg1: 1, arg2: 2");
	jum.assertEquals("test18", obj1.lastReturn, "func2, arg1: 1, arg2: 2");
}

function test_event_connectOnce(){
	var obj1 = new testObjectClass();

	// connect once via kwConnect()
	dojo.event.kwConnect({
		once: true,
		type: "after",
		srcObj: obj1, 
		srcFunc: "func1", 
		adviceObj: obj1, 
		adviceFunc: "func2"
	});

	// and then through connect()
	dojo.event.connect("after", obj1, "func1", obj1, "func2", null, null, true);

	jum.assertTrue("test19", obj1.func1("1", "2")=="func1, arg1: 1, arg2: 2");
	jum.assertEquals("test20", obj1.funcCallCount, 2);
}

