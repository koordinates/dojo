/**
 * Produce a line of debug output. 
 * Does nothing unless djConfig.isDebug is true.
 * varargs, joined with ''.
 * Caller should not supply a trailing "\n".
 */
dojo.debug = function(){
	if (!djConfig.isDebug) { return; }
	var args = arguments;
	if(dj_undef("println", dojo.hostenv)){
		dojo.raise("dojo.debug not available (yet?)");
	}
	var isJUM = dj_global["jum"] && !dj_global["jum"].isBrowser;
	var s = [(isJUM ? "": "DEBUG: ")];
	for(var i=0;i<args.length;++i){
		if(!false && args[i] instanceof Error){
			var msg = "[" + args[i].name + ": " + dojo.errorToString(args[i]) +
				(args[i].fileName ? ", file: " + args[i].fileName : "") +
				(args[i].lineNumber ? ", line: " + args[i].lineNumber : "") + "]";
		} else {
			try {
				var msg = String(args[i]);
			} catch(e) {
				if(dojo.render.html.ie) {
					var msg = "[ActiveXObject]";
				} else {
					var msg = "[unknown]";
				}
			}
		}
		s.push(msg);
	}
	if(isJUM){ // this seems to be the only way to get JUM to "play nice"
		jum.debug(s.join(" "));
	}else{
		dojo.hostenv.println(s.join(" "));
	}
}

/**
 * this is really hacky for now - just 
 * display the properties of the object
**/

dojo.debugShallow = function(obj){
	if (!djConfig.isDebug) { return; }
	dojo.debug('------------------------------------------------------------');
	dojo.debug('Object: '+obj);
	var props = [];
	for(var prop in obj){
		try {
			props.push(prop + ': ' + obj[prop]);
		} catch(E) {
			props.push(prop + ': ERROR - ' + E.message);
		}
	}
	props.sort();
	for(var i = 0; i < props.length; i++) {
		dojo.debug(props[i]);
	}
	dojo.debug('------------------------------------------------------------');
}
