dojo.provide("myns.myns");
dojo.require("dojo.namespaces.myns");
dojo.debug('MyNS loaded');

if(typeof(myns) == "undefined"){
	myns = {};	
}
myns.widget = {};
