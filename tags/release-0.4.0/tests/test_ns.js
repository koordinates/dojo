dojo.require("dojo.ns");

function test_ns_Resolver(){
	
	var testResolver = function(name){
		var module = "test.ns."+dojo.string.capitalize(name);
		return module;
	};
	
	var ns=new dojo.ns.Ns("testx", "test.ns", testResolver);
	
	try {
		jum.assertFalse(ns.resolve("NonExistant"));
	} catch (e) { 
		jum.assertTrue(e instanceof Error);
		jum.assertTrue(e.message.indexOf("not found after loading") > -1);
		return;
	}
	throw new JUMAssertFailure("Previous test should have failed.");
}
