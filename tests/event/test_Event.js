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
	load(["src/alg/Alg.js"]);
}

// load(["src/event/Event.js"]);
dojo.hostenv.loadModule("dojo.event.*");

obj1 = {
	func1: function(arg1, arg2){
		dojo.hostenv.println("func1, arg1: "+arg1+", arg2: "+arg2);
	},

	func2: function(arg2, arg1){
		dojo.hostenv.println("func2, arg1: "+arg1+", arg2: "+arg2);
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

dojo.event.connect("before-around", obj1, "func1", obj1, "func2", obj1, "adviceFromFunc1ToFunc2");

dojo.hostenv.println(	"\nyou should now see:\n"+
						"	func2, arg1: 1, arg2: 2:\n"+
						"	func1, arg1: 1, arg2: 2:\n");
obj1.func1("1", "2");

dojo.hostenv.println(	"\nyou should now see:\n"+
						"	func2, arg1: foo, arg2: bar:\n"+
						"	func1, arg1: foo, arg2: bar:\n");
obj1.func1("foo", "bar");
