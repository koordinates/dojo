dojo.provide("dojo.namespaces.myns");
dojo.provide("tests.namespaces.myns");

dojo.require("dojo.string.extras");

(function(){
	function mynsResolver(name){
		var pkg = "myns.widget."+dojo.string.capitalize(name);
		dojo.debug("resolver returning '"+pkg+"' for '"+name+"'"); 
		return pkg;
	}

	dojo.defineNamespace("my.namespace","tests/namespaces/myns","myns",mynsResolver,"myns.widget");
})();