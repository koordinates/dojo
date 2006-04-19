
/**
 * dj_global is an alias for the top-level global object in the host
 * environment (the "window" object in a browser).
 */
var dj_global = this; //typeof window == 'undefined' ? this : window;

/**
 *  True if name is defined, either on obj or globally if obj is false
 *  Note that 'defined' and 'exists' are not the same concept. 
 */
function dj_undef (name, obj) {
	return typeof((obj || dj_global)[name]) == "undefined";
}

/** dojo is the root variable of (almost all) our public symbols. */
if (dj_undef("dojo")) { dj_global.dojo = {}; }


// Configuration
if (dj_undef("djConfig")) { dj_global.djConfig = {}; }
djConfig.add = function (name, value) {
	if (typeof(this[name]) == 'undefined') { this[name] == value; }
}


dojo.version = {
	major: 0, minor: 2, patch: 2, flag: "+",
	revision: Number("$Rev$".match(/[0-9]+/)[0]),
	toString: function () {
		with (dojo.version) {
			return major + "." + minor + "." + patch + flag + " (" + revision + ")";
		}
	}
}



// These should not exits
dojo.errorToString = function (e) { return String(e); }
dojo.raise = function (msg) { throw Error(msg); }



// stubs
dojo.debug = dojo.debugShallow = function () {}

/**
 * We put eval() in this separate function to keep down the size of the trapped
 * evaluation context.
 *
 * Note that:
 * - JSC eval() takes an optional second argument which can be 'unsafe'.
 * - Mozilla/SpiderMonkey eval() takes an optional second argument which is the
 *   scope object for new symbols.
*/
function dj_eval (s) { return (dj_global.eval || eval)(s); }


/**
 * Convenience for throwing an exception because some function is not
 * implemented.
 */
dojo.unimplemented = function (funcname, extra) {
	var msg = "'" + funcname + "' not implemented";
	if (arguments.length == 2) { msg += " " + extra; }
	throw new Error(msg);
}

/** Convenience for informing of deprecated behaviour. */
dojo.deprecated = function (behaviour, extra, removal) {
	var msg = "DEPRECATED: " + behaviour;
	if (extra) { mess += " " + extra; }
	if (removal) { mess += " -- will be removed in version: " + removal; }
	dojo.debug(mess);
}

/** Does inheritance */
dojo.inherits = function(subclass, superclass) {
	if(typeof superclass != 'function'){ 
		dojo.raise("superclass: "+superclass+" borken");
	}
	subclass.prototype = new superclass();
	subclass.prototype.constructor = subclass;
	subclass.superclass = superclass.prototype;
	// DEPRICATED: super is a reserved word, use 'superclass'
	subclass['super'] = superclass.prototype;
}

// an object that authors use determine what host we are running under
dojo.render = (function(){

	function vscaffold(prefs, names){
		var tmp = {
			capable: false,
			support: {
				builtin: false,
				plugin: false
			},
			prefixes: prefs
		};
		for (var name in names) { tmp[x] = false; }
		return tmp;
	}

	return {
		name: "",
		ver: dojo.version,
		os: { win: false, linux: false, osx: false },
		html: vscaffold(["html"], ["ie", "opera", "khtml", "safari", "moz"]),
		svg: vscaffold(["svg"], ["corel", "adobe", "batik"]),
		vml: vscaffold(["vml"], ["ie"]),
		swf: vscaffold(["Swf", "Flash", "Mm"], ["mm"]),
		swt: vscaffold(["Swt"], ["ibm"])
	};
})();


/** interface definining the interaction with the EcmaScript host environment. */
dojo.hostenv = {
	/** the name of the hostenv. */
	name: '[unknown]',
	
	/** the version of the hostenv. */
	version: '[unknown]',
}





dojo.require = function (module_name) {
	var obj = dj_global, parts = module_name.split('.');
	while (parts.length && obj) { obj = obj[parts.shift()]; }
	if (parts.length || !obj) { throw new Error(module_name + ' not found'); }
}

dojo.provide = function (module_name) {
	var obj = dj_global, parts = module_name.split('.');
	while (parts.length) {
		var part = parts.shift();
		if (!obj[part]) { obj[part] = {}; }
		obj = obj[part];
	}
}


