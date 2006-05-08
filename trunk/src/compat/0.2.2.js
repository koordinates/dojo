/*
Compatibility package to get 0.2.2 functionality in later Dojo releases.
*/

//**********************************
//From bootstrap1.js
dj_throw = dj_rethrow = function(m, e){
	dojo.deprecated("dj_throw and dj_rethrow deprecated, use dojo.raise instead");
	dojo.raise(m, e);
}

var dj_debug = dojo.debug;
dj_unimplemented = dojo.unimplemented;
dj_deprecated = dojo.deprecated;

dj_inherits = function(subclass, superclass){
	dojo.deprecated("dj_inherits deprecated, use dojo.inherits instead");
	dojo.inherits(subclass, superclass);
}

/**
* Set the base script uri.
*/
// In JScript .NET, see interface System._AppDomain implemented by
// System.AppDomain.CurrentDomain. Members include AppendPrivatePath,
// RelativeSearchPath, BaseDirectory.
dojo.hostenv.setBaseScriptUri = function(uri){ djConfig.baseScriptUri = uri }

//**********************************
//From bootstrap2.js
dojo.hostenv.moduleLoaded = function(){
	return dojo.hostenv.startPackage.apply(dojo.hostenv, arguments);
}

dojo.hostenv.require = dojo.hostenv.loadModule;
dojo.requireAfter = dojo.require;
dojo.conditionalRequire = dojo.requireIf;

dojo.requireAll = function() {
	for(var i = 0; i < arguments.length; i++) { dojo.require(arguments[i]); }
}

dojo.hostenv.conditionalLoadModule = function(){
	dojo.kwCompoundRequire.apply(dojo, arguments);
}

dojo.hostenv.provide = dojo.hostenv.startPackage;

//**********************************
//From hostenv_browser.js
dojo.hostenv.byId = dojo.byId;

dojo.hostenv.byIdArray = dojo.byIdArray = function(){
	var ids = [];
	for(var i = 0; i < arguments.length; i++){
		if((arguments[i] instanceof Array)||(typeof arguments[i] == "array")){
			for(var j = 0; j < arguments[i].length; j++){
				ids = ids.concat(dojo.hostenv.byIdArray(arguments[i][j]));
			}
		}else{
			ids.push(dojo.hostenv.byId(arguments[i]));
		}
	}
	return ids;
}
