var outerArgs = [];
ns = ns||dj_global;
if(dojo.lang.isString(func)){
	func = ns[func];
}
for(var x=2; x<arguments.length; x++){
	outerArgs.push(arguments[x]);
}
var ecount = func.length - outerArgs.length;
 borrowed from svend tofte
function gather(nextArgs, innerArgs, expected){
	var texpected = expected;
	var totalArgs = innerArgs.slice(0);  copy
	for(var x=0; x<nextArgs.length; x++){
		totalArgs.push(nextArgs[x]);
	}
	 check the list of provided nextArgs to see if it, plus the
	 number of innerArgs already supplied, meets the total
	 expected.
	expected = expected-nextArgs.length;
	if(expected<=0){
		var res = func.apply(ns, totalArgs);
		expected = texpected;
		return res;
	}else{
		return function(){
			return gather(arguments, 
									 with enough args
						totalArgs,	 a copy
						expected);	 how many more do we need to run?;
		}
	}
}
return gather([], outerArgs, ecount);