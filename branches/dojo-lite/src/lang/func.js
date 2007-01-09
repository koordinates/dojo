dojo.provide("dojo.lang.func");
dojo.require("dojo.lang.common");

dojo.lang.hitch = function(/*Object*/thisObject, /*Function|String*/method /*, ...*/){
	// summary: 
	//		Returns a function that will only ever execute in the a given scope
	//		(thisObject). This allows for easy use of object member functions
	//		in callbacks and other places in which the "this" keyword may
	//		otherwise not reference the expected scope. Any number of default
	//		positional arguments may be passed as parameters beyond "method".
	//		Each of these values will be used to "placehold" (similar to curry)
	//		for the hitched function. Note that the order of arguments may be
	//		reversed in a future version.
	// thisObject: the scope to run the method in
	// method:
	//		a function to be "bound" to thisObject or the name of the method in
	//		thisObject to be used as the basis for the binding
	// usage:
	//		dojo.lang.hitch(foo, "bar")(); // runs foo.bar() in the scope of foo
	//		dojo.lang.hitch(foo, myFunction); // returns a function that runs myFunction in the scope of foo

	// FIXME:
	//		should this be extended to "fixate" arguments in a manner similar
	//		to dojo.lang.curry, but without the default execution of curry()?
	var args = [];
	for(var x=2; x<arguments.length; x++){
		args.push(arguments[x]);
	}
	var fcn = (dojo.lang.isString(method) ? thisObject[method] : method) || function(){};
	return function(){
		var ta = args.concat([]); // make a copy
		for(var x=0; x<arguments.length; x++){
			ta.push(arguments[x]);
		}
		return fcn.apply(thisObject, ta); // Function
		// return fcn.apply(thisObject, arguments); // Function
	};
}

dojo.lang.anonCtr = 0;
dojo.lang.anon = {};

dojo.lang.nameAnonFunc = function(/*Function*/anonFuncPtr, /*Object*/thisObj, /*Boolean*/searchForNames){
	// summary:
	//		Creates a reference to anonFuncPtr in thisObj with a completely
	//		unique name. The new name is returned as a String.  If
	//		searchForNames is true, an effort will be made to locate an
	//		existing reference to anonFuncPtr in thisObj, and if one is found,
	//		the existing name will be returned instead. The default is for
	//		searchForNames to be false.
	var nso = (thisObj|| dojo.lang.anon);
	if( (searchForNames) ||
		((dj_global["djConfig"])&&(djConfig["slowAnonFuncLookups"] == true)) ){
		for(var x in nso){
			try{
				if(nso[x] === anonFuncPtr){
					return x;
				}
			}catch(e){} // window.external fails in IE embedded in Eclipse (Eclipse bug #151165)
		}
	}
	var ret = "__"+dojo.lang.anonCtr++;
	while(typeof nso[ret] != "undefined"){
		ret = "__"+dojo.lang.anonCtr++;
	}
	nso[ret] = anonFuncPtr;
	return ret; // String
}

dojo.lang.forward = function(funcName){
	// summary:
	// 		Returns a function that forwards a method call to
	// 		this.funcName(...).  Unlike dojo.lang.hitch(), the "this" scope is
	// 		not fixed on a single object. Ported from MochiKit.
	return function(){
		return this[funcName].apply(this, arguments);
	}; // Function
}

dojo.lang.tryThese = function(/*...*/){
	// summary:
	//		executes each function argument in turn, returning the return value
	//		from the first one which does not throw an exception in execution.
	//		Any number of functions may be passed.
	for(var x=0; x<arguments.length; x++){
		try{
			if(typeof arguments[x] == "function"){
				var ret = (arguments[x]());
				if(ret){
					return ret;
				}
			}
		}catch(e){
			dojo.debug(e);
		}
	}
}

dojo.lang.delayThese = function(/*Array*/farr, /*Function, optional*/cb, /*Integer*/delay, /*Function, optional*/onend){
	// summary:
	//		executes a series of functions contained in farr, but spaces out
	//		calls to each function by the millisecond delay provided. If cb is
	//		provided, it will be called directly after each item in farr is
	//		called and if onend is passed, it will be called when all items
	//		have completed executing.

	/**
	 * alternate: (array funcArray, function callback, function onend)
	 * alternate: (array funcArray, function callback)
	 * alternate: (array funcArray)
	 */
	if(!farr.length){ 
		if(typeof onend == "function"){
			onend();
		}
		return;
	}
	if((typeof delay == "undefined")&&(typeof cb == "number")){
		delay = cb;
		cb = function(){};
	}else if(!cb){
		cb = function(){};
		if(!delay){ delay = 0; }
	}
	setTimeout(function(){
		(farr.shift())();
		cb();
		dojo.lang.delayThese(farr, cb, delay, onend);
	}, delay);
}
