/**
* @file bootstrap1.js
*
* bootstrap file that runs before hostenv_*.js file.
*
* @author Copyright 2004 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 2.1 http://www.opensource.org/licenses/afl-2.1.php
*
* $Id: bootstrap1.js,v 1.1 2004/07/27 00:25:15 mda Exp $
*/

/**
 * The global djConfig can be set prior to loading the library, to override certain settings.
 * It does not exist under dojo.* so that it can be set before the dojo variable exists.
 * Setting any of these variables *after* the library has loaded does nothing at all.
 * The variables that can be set are as follows:
 *
 * <dl>
 * <dt>baseScriptUri
 *  <dd>The value that getBaseScriptUri() will return. It is the base URI for loading modules.
 *  If not set in config, we find it using libraryScriptUri (stripping out the name part).
 *
 * <dt>baseRelativePath
 *  <dd>How to get from the parent URI of the URI defining the bootstrap code (libraryScriptUri)
 *  to the base URI. Defaults to '' (meaning that the bootstrap code sits in the top).
 *  If it is non-empty, it has to have a trailing '/'.
 *
 * <dt>libraryScriptUri
 *  <dd>Unless set in config, in a browser environment, this is the full
 *  value of the 'src' attribute of our script element.
 *  In a command line, this is the argument specifying the library file.
 *  If you set baseScriptUri, this is ignored.
 *  Setting it saves us the effort of trying to figure it out, but you
 *  might as well just set baseScriptUri instead.
 *
 * <dt>isDebug
 *  <dd>whether debug output is enabled.
 * </dl>
 */
//:GLVAR Object djConfig
var djConfig;
if(typeof djConfig == 'undefined'){ djConfig = {}; }

/**
 * dojo is the root variable of (almost all) our public symbols.
 */
//=java public class dojo {
var dojo;
if(typeof dojo == 'undefined'){ dojo = {}; }

//=java public static HostEnv hostenv;
dojo.hostenv = {
	is_debug_ : ((typeof djConfig['isDebug'] == 'undefined') ? false : djConfig['isDebug']),
	base_script_uri_ : ((typeof djConfig['baseScriptUri'] == 'undefined') ? undefined : djConfig['baseScriptUri']),
	base_relative_path_ : ((typeof djConfig['baseRelativePath'] == 'undefined') ? '' : djConfig['baseRelativePath']),
	library_script_uri_ : ((typeof djConfig['libraryScriptUri'] == 'undefined') ? '' : djConfig['libraryScriptUri']),

	// for recursion protection
	loading_modules_ : {},

	// lookup cache for modules.
	// NOTE: this is partially redundant a private variable in the jsdown implementation, but we don't want to couple the two.
	modules_ : {}
};

//=java } /* dojo */

/**
 * dj_global is an alias for the top-level global object in the host environment (the "window" object in a browser).
 */
//:GLVAR Object dj_global
var dj_global = this; //typeof window == 'undefined' ? this : window;

// ****************************************************************
// global public utils
// ****************************************************************

/**
 * Produce a line of debug output. 
 * Does nothing unless dojo.hostenv.is_debug_ is true.
 * varargs, joined with ''.
 * Caller should not supply a trailing "\n".
 *
 * TODO: dj_debug() is a convenience for dojo.hostenv.debug()?
 */
// We have a workaround here for the "arguments" object not being legal when using "jsc -fast+".
/*@cc_on @*/
/*@if (@_jscript_version >= 7)
function dj_debug(... args : Object[]) {
@else @*/
function dj_debug(){
	var args = arguments;
/*@end @*/
	if(typeof dojo.hostenv.println != 'function'){
		dj_throw("attempt to call dj_debug when there is no dojo.hostenv println implementation (yet?)");
	}
	if(!dojo.hostenv.is_debug_){ return; }
	var s = 'DEBUG: ';
	for(var i=0;i<args.length;++i){ s += args[i]; }
	dojo.hostenv.println(s);
}

/**
* Throws an Error object given the string err. For now, will also do a println to the user first.
*/
function dj_throw(message){
	if((typeof dojo.hostenv != 'undefined')&&(typeof dojo.hostenv.println != 'undefined')){ 
		dojo.hostenv.println("fatal error: " + message);
	}
	throw Error(message);
}

/*
 * utility to print an Error. 
 * TODO: overriding Error.prototype.toString won't accomplish this?
 * ... since natively generated Error objects do not always reflect such things?
 */
function dj_error_to_string(excep){
	return (typeof excep.message !== 'undefined' ? excep.message : (typeof excep.description !== 'undefined' ? excep.description : excep));
}


/**
 * Rethrows the provided Error object excep, with the additional message given by message.
 */
function dj_rethrow(message, excep){
	var emess = dj_error_to_string(excep);
	dj_throw(message + ": " + emess);
}

/**
 * We put eval() in this separate function to keep down the size of the trapped
 * evaluation context.
 *
 * Note that:
 * - JSC eval() takes an optional second argument which can be 'unsafe'.
 * - Mozilla/SpiderMonkey eval() takes an optional second argument which is the scope object for new symbols.
*/
function dj_eval(s){ return eval(s); }


/**
 * Convenience for throwing an exception because some function is not implemented.
 */
function dj_unimplemented(funcname, extra){
	var mess = "No implementation of function '" + funcname + "'";
	if((typeof extra != 'undefined')&&(extra)){ mess += " " + extra; }
	mess += " (host environment '" + dojo.hostenv.getName() + "')";
	dj_throw(mess);
}

/**
 * Does inheritance
 */
function dj_inherits(subclass, superclass){
	if(typeof superclass != 'function'){ 
		dj_throw("eek: superclass not a function: " + superclass + "\nsubclass is: " + subclass);
	}
	subclass.prototype = new superclass();
	subclass.prototype.constructor = subclass;
	// TODO: subclass.super = superclass gives JScript error?
	subclass['super'] = superclass;
}


// ****************************************************************
// dojo.hostenv methods that must be defined in hostenv_*.js
// ****************************************************************

/**
 * The interface definining the interaction with the EcmaScript host environment.
*/
//=java public abstract class HostEnv {

/*
 * None of these methods should ever be called directly by library users.
 * Instead public methods such as loadModule should be called instead.
 */
//=java protected String name_ = '(unset)';
dojo.hostenv.name_ = '(unset)';
dojo.hostenv.version_ = '(unset)';

/**
 * Return the name of the hostenv.
 */
//=java public abstract String getName() {}
dojo.hostenv.getName = function(){ return this.name_; }

/**
* Return the version of the hostenv.
*/
//=java public abstract String getVersion() {}
dojo.hostenv.getVersion = function(){ return this.version_; }

/**
 * Display a line of text to the user.
 * The line argument should not contain a trailing "\n"; that is added by the implementation.
 */
//=java protected abstract void println();
//dojo.hostenv.println = function(line) {}

/**
 * Read the plain/text contents at the specified uri.
 * If getText() is not implemented, then it is necessary to override loadUri()
 * with an implementation that doesn't rely on it.
 */
//=java protected abstract String getText(String uri);
dojo.hostenv.getText = function(uri){
	dj_unimplemented('dojo.hostenv.getText', "uri=" + uri);
}

/**
 * return the uri of the script that defined this function
 * private method that must be implemented by the hostenv.
 */
//=java protected abstract String getLibraryScriptUri();
dojo.hostenv.getLibraryScriptUri = function(){
	// FIXME: need to implement!!!
	dj_unimplemented('dojo.hostenv.getLibraryScriptUri','');
}

// ****************************************************************
// dojo.hostenv methods not defined in hostenv_*.js
// ****************************************************************

/**
 * Return the base script uri that other scripts are found relative to.
 * It is either the empty string, or a non-empty string ending in '/'.
 */
//=java public String getBaseScriptUri();
dojo.hostenv.getBaseScriptUri = function(){
	if(typeof this.base_script_uri_ != 'undefined'){ return this.base_script_uri_; }
	var uri = this.library_script_uri_;
	if(!uri){
		uri = this.library_script_uri_ = this.getLibraryScriptUri();
		if(!uri){
			dj_throw("Nothing returned by getLibraryScriptUri(): " + uri);
		}
	}

	var lastslash = uri.lastIndexOf('/');
	// inclusive of slash
	var base = (lastslash == -1 ? '' : uri.substring(0,lastslash + 1)) + this.base_relative_path_;
	return base;
}

/**
* Set the base script uri.
*/
//=java public void setBaseScriptUri(String uri);
// In JScript .NET, see interface System._AppDomain implemented by System.AppDomain.CurrentDomain. Members include AppendPrivatePath, RelativeSearchPath, BaseDirectory.
dojo.hostenv.setBaseScriptUri = function(uri){ this.base_script_uri_ = uri }

/**
 * Loads and interprets the script located at relpath, which is relative to the script root directory.
 * If the script is found but its interpretation causes a runtime exception, that exception is not caught
 * by us, so the caller will see it.
 * We return a true value if and only if the script is found.
 *
 * For now, we do not have an implementation of a true search path.
 * We consider only the single base script uri, as returned by getBaseScriptUri().
 *
 * @param relpath A relative path to a script (no leading '/', and typically ending in '.js').
 * @param module A module whose existance to check for after loading a path. Can be used to determine success or failure of the load.
 */
//=java public Boolean loadPath(String relpath);
dojo.hostenv.loadPath = function(relpath, module /*optional*/ ){
	if(!relpath){
		dj_throw("Missing relpath argument");
	}
	if((relpath.charAt(0) == '/')||(relpath.match(/^\w+:/))){
		dj_throw("Illegal argument '" + relpath + "'; must be relative path");
	}
	var base = this.getBaseScriptUri();
	var uri = base + relpath;
	//this.println("base=" + base + " relpath=" + relpath);
	try{
		var ok;
		if(!module){
			ok = this.loadUri(uri);
		}else{
			ok = this.loadUriAndCheck(uri, module);
		}
		return ok;
	}catch(e){
		return false;
	}
}

/**
 * Reads the contents of the URI, and evaluates the contents.
 * Returns true if it succeeded. Returns false if the URI reading failed. Throws if the evaluation throws.
 * The result of the eval is not available to the caller.
 */
dojo.hostenv.loadUri = function(uri){
	var contents = this.getText(uri, null, true);
	if(contents == null){ return 0; }
	var value = dj_eval(contents);
	return 1;
}

// FIXME: probably need to add logging to this method
dojo.hostenv.loadUriAndCheck = function(uri, module){
	var ok = true;
	try{
		ok = this.loadUri(uri);
	}catch(e){
		dj_debug("failed loading ", uri, " with error: ", e);
	}
	return ((ok)&&(this.findModule(module, false))) ? true : false;
}

/**
* loadModule("A.B") first checks to see if symbol A.B is defined. 
* If it is, it is simply returned (nothing to do).
* If it is not defined, it will look for "A/B.js" in the script root directory, followed
* by "A.js".
* It throws if it cannot find a file to load, or if the symbol A.B is not defined after loading.
* It returns the object A.B.
*
* This does nothing about importing symbols into the current package.
* It is presumed that the caller will take care of that. For example, to import
* all symbols:
*
*    with (dojo.hostenv.loadModule("A.B")) {
*       ...
*    }
*
* And to import just the leaf symbol:
*
*    var B = dojo.hostenv.loadModule("A.B");
*    ...
*
* dj_load is an alias for dojo.hostenv.loadModule
*/
dojo.hostenv.loadModule = function(modulename, exact_only){
	var module = this.findModule(modulename, 0);
	if(module){
		return module;
	}

	// protect against infinite recursion from mutual dependencies
	if (typeof this.loading_modules_[modulename] !== 'undefined'){
		dj_throw("recursive attempt to load module '" + modulename + "'");
	}
	this.loading_modules_[modulename] = 1;

	// convert periods to slashes
	var relpath = modulename.replace(/\./g, '/') + '.js';

	var syms = modulename.split(/\./);
	if(syms[0]=="dojo"){ syms[0] == "src"; } // FIXME: need a smarter way to do this!
	var last = syms.pop();
	syms.push(last);
	// figure out if we're looking for a full package, if so, we want to do
	// things slightly diffrently
	if(last=="*"){
		modulename = (syms.slice(0, -1)).join('.');
		//first try package/name/__package__.js
		while(syms.length){
			syms.pop();
			syms.push("__package__");
			relpath = syms.join('/') + '.js';
			ok = this.loadPath(relpath, modulename);
			if(ok){ break; }
			syms.pop();
		}
	}else{
		var ok = this.loadPath(relpath, modulename);
		this.println(relpath);
		if((!ok)&&(!exact_only)){
			// var syms = modulename.split(/\./);
			syms.pop();
			while(syms.length){
				relpath = syms.join('/') + '.js';
				ok = this.loadPath(relpath, modulename);
				if(ok){ break; }
				syms.pop();
				relpath = syms.join('/') + '__package__.js';
				ok = this.loadPath(relpath, modulename);
				if(ok){ break; }
			}
		}

		if(!ok){
			dj_throw("Could not find module '" + modulename + "'; last tried path '" + relpath + "'");
		}
	}

	// check that the symbol was defined
	module = this.findModule(modulename, false); // pass in false so we can give better error
	if(!module){
		dj_throw("Module symbol '" + modulename + "' is not defined after loading '" + relpath + "'"); 
	}

	return module;
}

function dj_load(modulename, exact_only){
	return dojo.hostenv.loadModule(modulename, exact_only); 
}


/*
 * private utility to  evaluate a string like "A.B" without using eval.
 */
function dj_eval_object_path(objpath){
	// fast path for no periods
	if(objpath.indexOf('.') == -1){
		dj_debug("typeof this[",objpath,"]=",typeof(this[objpath]), " and typeof dj_global[]=", typeof(dj_global[objpath])); 
		// dojo.hostenv.println(typeof dj_global[objpath]);
		return (typeof dj_global[objpath] == 'undefined') ? undefined : dj_global[objpath];
	}

	var syms = objpath.split(/\./);
	var obj = dj_global;
	for(var i=0;i<syms.length;++i){
		obj = obj[syms[i]];
		if((typeof obj == 'undefined')||(!obj)){
			return obj;
		}
	}
	return obj;
}

/**
* startPackage("A.B") follows the path, and at each level creates a new empty object
* or uses what already exists. It returns the result.
* dj_package(packname) is an alias for dojo.hostenv.startPackage(packname).
*/
function dj_package(packname){
	var syms = packname.split(/\./);
	var obj = dj_global;
	for(var i=0;i<syms.length;++i){
		var childobj = obj[syms[i]];
		if((typeof childobj == 'undefined')||(!childobj)){
			obj = (obj[syms[i]] = {});
		}
	}
	return obj;
}

dojo.hostenv.startPackage = dj_package;


/**
 * findModule("A.B") returns the object A.B if it exists, otherwise null.
 * @param modulename A string like 'A.B'.
 * @param must_exist Optional, defualt false. throw instead of returning null if the module does not currently exist.
 */
//=java public Object findModule(String modulename, boolean must_exist);
dojo.hostenv.findModule = function(modulename, must_exist) {
	// check cache
	if(typeof this.modules_[modulename] != 'undefined'){
		return this.modules_[modulename];
	}

	// see if symbol is defined anyway
	var module = dj_eval_object_path(modulename);
	this.println(modulename+": "+module);
	if((typeof module !== 'undefined')&&(module)){
		return this.modules_[modulename] = module;
	}

	if(must_exist){
		dj_throw("no loaded module named '" + modulename + "'");
	}
	return null;
}

//=java } /* class HostEnv */
