/*
if(!this["djConfig"]){
	djConfig = { 
		isDebug: true,
		baseRelativePath: "../../"
	};
	load(["src/bootstrap1.js"]);
	// load(["../../src/hostenv_rhino.js"]);
	// load(["src/hostenv_spidermonkey.js"]);
	load(["src/hostenv_rhino.js"]);
	load(["src/bootstrap2.js"]);
}
*/

// jum.debug(dojo.hostenv.base_script_uri_);

// load(["src/event/Event.js"]);
// dojo.hostenv.loadModule("alg.*");
// load("../src/alg/Alg.js");
// load("../src/event/Event.js");
dojo.hostenv.loadModule("dojo.event.*");

function test_event_connections(){
	var obj1 = {
		lastReturn: null,
		secondLastReturn: null,

		func1: function(arg1, arg2){
			this.secondLastReturn = this.lastReturn;
			this.lastReturn = "func1, arg1: "+arg1+", arg2: "+arg2;
			jum.debug(this.lastReturn);
			return (this.lastReturn);
		},

		func2: function(arg1, arg2){
			this.secondLastReturn = this.lastReturn;
			this.lastReturn = "func2, arg1: "+arg1+", arg2: "+arg2;
			jum.debug(this.lastReturn);
			return (this.lastReturn);
		},

		adviceFromFunc1ToFunc2: function(miObj){
			// dojo.hostenv.println("in adviceFromFunc1ToFunc2");
			var tmp = miObj.args[1];
			miObj.args[1] = miObj.args[0];
			miObj.args[0] = tmp;
			// dojo.hostenv.println(miObj.args.length);

			// return obj[funcName].apply(obj, argsArr);
			ret = miObj.proceed();
			return ret;
		}
	};

	// dojo.hostenv.println(dojo.event.connect);

	dojo.event.connect("before-around", obj1, "func1", obj1, "func2", obj1, "adviceFromFunc1ToFunc2");

	jum.assertTrue("test1", obj1.func1("1", "2")=="func1, arg1: 1, arg2: 2");
	jum.assertEquals("test2", obj1.secondLastReturn, "func2, arg1: 2, arg2: 1");
	jum.assertEquals("test3", obj1.lastReturn, "func1, arg1: 1, arg2: 2");

	jum.assertTrue("test4", obj1.func1("foo", "bar")=="func1, arg1: foo, arg2: bar");
	jum.assertEquals("test2", obj1.secondLastReturn, "func2, arg1: bar, arg2: foo");
	jum.assertEquals("test2", obj1.lastReturn, "func1, arg1: foo, arg2: bar");

};
