dojo.hostenv.startPackage("dojo.alg.Alg");

dojo.alg.find = function(arr, val){
	for(var i=0;i<arr.length;++i){
		if(arr[i] == val){ return i; }
	}
	return -1;
}

dojo.alg.inArray = function(arr, val){
	// support both (arr, val) and (val, arr)
	if( (!arr || arr.constructor != Array) && (val && val.constructor == Array) ) {
		var a = arr;
		arr = val;
		val = a;
	}
	return dojo.alg.find(arr, val) > -1;
}
dojo.alg.inArr = dojo.alg.inArray; // for backwards compatibility

dojo.alg.getNameInObj = function(ns, item){
	if(!ns){ ns = dj_global; }

	for(var x in ns){
		if(ns[x] === item){
			return new String(x);
		}
	}
	return null;
}

// is this the right place for this?
dojo.alg.has = function(obj, name){
	return (typeof obj[name] !== 'undefined');
}

dojo.alg.forEach = function(arr, unary_func){
	for(var i=0; i<arr.length; i++){
		unary_func(arr[i]);
	}
}

dojo.alg.for_each = dojo.alg.forEach; // burst compat

dojo.alg.map = function(arr, obj, unary_func){
	for(var i=0;i<arr.length;++i){
		unary_func.call(obj, arr[i]);
	}
}

dojo.alg.tryThese = function(){
	for(var x=0; x<arguments.length; x++){
		try{
			if(typeof arguments[x] == "function"){
				var ret = (arguments[x]());
				if(ret){
					return ret;
				}
			}
		}catch(e){
			dj_debug(e);
		}
	}
}

dojo.alg.delayThese = function(farr, cb, delay){
	if(!farr.length){ return; }
	setTimeout(function(){
		(farr.shift())();
		cb();
		dojo.alg.delayThese(farr, cb, delay);
	}, delay);
}

dojo.alg.for_each_call = dojo.alg.map; // burst compat
