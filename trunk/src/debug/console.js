dojo.provide("dojo.debug.console");

// summary:
// 	Console logger, for use with Firebug and Safari's (simpler) console.
// description:
//  This package redirects the normal dojo debugging output to the firebug console.  
//  When using Firebug, it does this  by sending the entire object to the console, 
//	rather than just overriding dojo.hostenv.println, so that Firebug's 
//	interactive object inspector is available.

if (window.console) {
	if (console.info != null) {
		// using a later version of Firebug -- lots of fun stuff!
		
		var logMethod = function() {
			// summary: Write all of the arguments to the Firebug console
			// description: Uses console.info() so that the (i) icon prints next to the debug line
			//	rather than munging the arguments by adding "DEBUG:" in front of them.
			//	This allows us to use Firebug's string handling to do interesting things
			if (!djConfig.isDebug)	{	 return;	}
			console.info.apply(console, arguments);
		}
		dojo.debug = logMethod;
		dojo.debugDeep = logMethod;	

		dojo.debugShallow = function(/*Object*/ obj, /*Boolean?*/showMethods, /*Boolean?*/sort) {
			// summary:  Write first-level properties of obj to the console.
			//	obj:			Object or Array to debug
			//	showMethods:	Pass false to skip outputing methods of object, any other value will output them.
			//	sort:			Pass false to skip sorting properties, any other value will sort.
			if (!djConfig.isDebug) { return; }

			showMethods = (showMethods != false);
			sort = (sort != false);

			// handle null or something without a constructor (in which case we don't know the type)
			if (obj == null || obj.constructor == null) {
				return dojo.debug(obj);
			}
	
			// figure out type via a standard constructor (Object, String, Date, etc)
			var type = obj.declaredClass;
			if (type == null) {
				type = obj.constructor.toString().match(/function\s*(.*)\(/);
				if (type) {	type = type[1]	};
			}
			// if we got a viable type, use Firebug's interactive property dump feature
			if (type) {
				if (type == "String" || type == "Number") {
					return dojo.debug(type+": ", obj);
				}
				if (showMethods && !sort) {
					var sortedObj = obj;
				} else {
					var propNames = [];
					if (showMethods) {
						for (var prop in obj) {	
							propNames.push(prop);
						}
					} else {
						for (var prop in obj) {	
							if (typeof obj[prop] != "function") { propNames.push(prop);	}
							else dojo.debug(prop);
						}					
					}
					if (sort) propNames.sort();
					var sortedObj = {};
					dojo.lang.forEach(propNames, function(prop) {
						sortedObj[prop] = obj[prop];
					});
				}

				return dojo.debug(type+": %o\n%2.o",obj,sortedObj);
			}
		
			// otherwise just output the constructor + object, 
			//	which is nice for a DOM element, etc
			return dojo.debug(obj.constructor + ": ", obj);
		}

	} else if (console.log != null) {
		// using Safari or an old version of Firebug
		
		logMethod = function() {
			if (!djConfig.isDebug) { return ; }
			// make sure we're only writing a single string to Safari's console
			var args = dojo.lang.toArray(arguments);
			console.log("DEBUG: " + args.join(" "));
		}
		dojo.debug = logMethod;
	} else {
		// not supported
		dojo.debug("dojo.debug.console requires Firebug > 0.4");
	}
} else if (dojo.render.html.opera) {
	if (opera && opera.postError) {
		dojo.hostenv.println=opera.postError;
	} else {
		dojo.debug("dojo.debug.Opera requires Opera > 8.0");
	}
}
