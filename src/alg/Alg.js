dojo.alg = {};
dojo.alg.Alg = {};

dojo.alg.find = function(arr, val){
	for(var i=0;i<arr.length;++i){
		if(arr[i] == val){ return i; }
	}
	return -1;
}

dojo.alg.getNameInObj = function(ns, item){
	if(!ns){ ns = dj_global; }

	for(var x in ns){
		if(ns[x] === item){
			return new String(x);
		}
	}
	return null;
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

dojo.alg.for_each_call = dojo.alg.map; // burst compat
