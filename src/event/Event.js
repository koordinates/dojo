// dojo.hostenv.loadModule("dojo.alg");

if(!dojo){ /* die? */ }
// FIXME: put dependencies here!
dojo.event = new function(){

	// FIXME: where should we put this method (not here!)?
	this.matchSignature = function(args, signatureArr){

		var end = Math.min(args.length, signatureArr.length);

		for(var x=0; x<end; x++){
			// FIXME: this is naive comparison, can we do better?
			if(compareTypes){
				if((typeof args[x]).toLowerCase() != (typeof signatureArr[x])){
					return false;
				}
			}else{
				if((typeof args[x]).toLowerCase() != signatureArr[x].toLowerCase()){
					return false;
				}
			}
		}

		return true;
	}

	// FIXME: where should we put this method (not here!)?
	this.matchSignatureSets = function(args){
		for(var x=1; x<arguments.length; x++){
			if(this.matchSignature(args, arguments[x])){
				return true;
			}
		}
		return false;
	}

	this.connect = function(){
		var args = arguments;

		var ao = {
			srcObj: null,
			srcFunc: null,
			adviceObj: null,
			adviceFunc: null,
			aroundObj: null,
			aroundFunc: null,
			adviceType: (args.length>2) ? args[0] : "after",
			precedence: "last"
		};

		switch(args.length){
			case 0: return;
			case 1: return;
			case 2:
				ao.srcObj = ao.adviceObj = dj_global;
				ao.srcFunc = args[0];
				ao.adviceFunc = args[1];
				break;
			case 3:
				ao.srcFunc = args[1];
				ao.adviceFunc = args[2];
				break;
			case 4:
				if((typeof args[1]).toLowerCase() == "object"){
					ao.srcObj = args[1];
					ao.srcFunc = args[2];
					ao.adviceObj = dj_global;
					ao.adviceFunc = args[3];
				}else if((typeof args[2]).toLowerCase() == "object"){
					ao.srcObj = dj_global;
					ao.srcFunc = args[1];
					ao.adviceObj = args[2];
					ao.adviceFunc = args[3];
				}else{
					ao.srcObj = ao.adviceObj = ao.aroundObj = dj_global;
					ao.srcFunc = args[1];
					ao.adviceFunc = args[2];
					ao.aroundFunc = args[3];
				}
				break;
			// FIXME: what about 5?
			case 6:
				ao.srcObj = args[1];
				ao.srcFunc = args[2];
				ao.adviceObj = args[3]
				ao.adviceFunc = args[4];
				ao.aroundFunc = args[5];
				ao.aroundObj = dj_global;
				break;
			default:
				ao.srcObj = args[1];
				ao.srcFunc = args[2];
				ao.adviceObj = args[3]
				ao.adviceFunc = args[4];
				ao.aroundObj = args[5];
				ao.aroundFunc = args[6];
				break;
		}

		if((typeof ao.srcFunc).toLowerCase() != "string"){
			ao.srcFunc = dojo.alg.getNameInObj(ao.srcObj, ao.srcFP);
		}

		if((typeof ao.adviceFunc).toLowerCase() != "string"){
			ao.adviceFunc = dojo.alg.getNameInObj(ao.adviceObj, ao.tgtFP);
		}

		if((ao.aroundObj)&&((typeof ao.aroundFunc).toLowerCase() != "string")){
			ao.aroundFunc = dojo.alg.getNameInObj(ao.aroundObj, ao.aroundFP);
		}

		// FIXME: just doing a "getForMethod()" seems to be enough to put this into infinite recursion!!
		var mjp = dojo.event.MethodJoinPoint.getForMethod(ao.srcObj, ao.srcFunc);
		if(ao.tgtFunc){
			var mjp2 = dojo.event.MethodJoinPoint.getForMethod(ao.tgtObj, ao.tgtFunc);
		}
		mjp.kwAddAdvice(ao);
	}

}

/*
dojo.event.kwConnect = function(kwArgs){
}
*/
// exactly one of these is created whenever a method with a joint point is run,
// if there is at least one 'around' advice.
dojo.event.MethodInvocation = function(join_point, obj, args) {
	this.jp_ = join_point;
	this.object = obj;
	this.args = [];
	for(var x=0; x<args.length; x++){
		this.args[x] = args[x];
	}
	// the index of the 'around' that is currently being executed.
	this.around_index = -1;
}

dojo.event.MethodInvocation.prototype.proceed = function() {
	dojo.hostenv.println("in MethodInvocation.proceed()");
	this.around_index++;
	if(this.around_index >= this.jp_.around.length){
		return this.jp_.object[this.jp_.methodname].apply(this.jp_.object, this.args);
		// return this.jp_.run_before_after(this.object, this.args);
	}else{
		var ti = this.jp_.around[this.around_index];
		var mobj = ti[0]||dj_global;
		var meth = ti[1];
		return mobj[meth].call(mobj, this);
	}
} 


dojo.event.MethodJoinPoint = function(obj, methname){
	this.object = obj||dj_global;
	this.methodname = methname;
	this.methodfunc = this.object[methname];
	this.before = [];
	this.after = [];
	this.around = [];
}

dojo.event.MethodJoinPoint.getForMethod = function(obj, methname) {
	if(!(methname in obj)){
		// supply a do-nothing method implementation
		obj[methname] = function(){};
	}else if(typeof obj[methname] != "function"){
		return null; // FIXME: should we throw an exception here instead?
	}
	// we hide our joinpoint instance in obj[methname + '$joinpoint']
	var jpname = methname + "$joinpoint";
	var jpfuncname = methname + "$joinpoint$method";
	var joinpoint = obj[jpname];
	if(!joinpoint){
		obj[jpfuncname] = obj[methname];
		// joinpoint = obj[jpname] = new dojo.event.MethodJoinPoint(obj, methname);
		joinpoint = obj[jpname] = new dojo.event.MethodJoinPoint(obj, jpfuncname);
		obj[methname] = function(){ 
			return joinpoint.run.apply(joinpoint, arguments); 
		}
	}
	// dojo.hostenv.println("returning joinpoint");
	return joinpoint;
}

dojo.event.MethodJoinPoint.prototype.unintercept = function() {
	this.object[this.methodname] = this.methodfunc;
}

dojo.event.MethodJoinPoint.prototype.run = function() {
	// dojo.hostenv.println("in run()");
	var obj = this.object||dj_global;
	var args = arguments;

	var unrollAdvice  = function(marr){ 
		// dojo.hostenv.println("in unrollAdvice()");
		var callObj = marr[0]||dj_global;
		var callFunc = marr[1];
		var aroundObj = marr[2]||dj_global;
		var aroundFunc = marr[3];
		var to = {
			args: [],
			jp_: this,
			object: obj,
			proceed: function(){
				return callObj[callFunc].apply(callObj, to.args);
			}
		};
		// FIXME: how slow is this? Is there a better/faster way to get this
		// done?
		for(var x=0; x<args.length; x++){
			to.args[x] = args[x];
		}

		if(aroundFunc){
			aroundObj[aroundFunc].call(aroundObj, to);
		}else{
			// var tmjp = dojo.event.MethodJoinPoint.getForMethod(obj, methname);
			callObj[callFunc].apply(callObj, args); 
		}
	}

	dojo.alg.forEach(this.before, unrollAdvice);

	var result;
	if(this.around.length>0){
		var mi = new dojo.event.MethodInvocation(this, obj, args);
		result = mi.proceed();
	}else if(this.methodfunc){
		// dojo.hostenv.println("calling: "+this.methodname)
		result = this.object[this.methodname].apply(this.object, args);
	}

	dojo.alg.forEach(this.after, unrollAdvice);

	return (this.methodfunc) ? result : null;
}

dojo.event.MethodJoinPoint.prototype.kwAddAdvice = function(args){
	this.addAdvice(	args["adviceObj"], args["adviceFunc"], 
					args["aroundObj"], args["aroundFunc"], 
					args["adviceType"], args["precedence"] );
}

dojo.event.MethodJoinPoint.prototype.addAdvice = function(adviceObj, advice, thisAroundObj, thisAround, advice_kind, precedence){
	var arr = this.after;
	// FIXME: we should be able to do this through props or Array.in()
	if(advice_kind.indexOf("before")!=-1){
		arr = this.before;
	}else if(advice_kind=="around"){
		arr = this.around;
	}

	if(!arr){
		dj_throw("bad this: " + this);
	}

	var ao = [adviceObj, advice, thisAroundObj, thisAround];

	if(precedence == "first"){
		arr.unshift(ao);
	}else{
		arr.push(ao);
	}
}

dojo.event.MethodJoinPoint.prototype.removeAdvice = function(adviceObj, advice, advice_kind) {
	var arr = this.after;
	// FIXME: we should be able to do this through props or Array.in()
	if(advice_kind.indexOf("before")!=-1){
		arr = this.before;
	}else if(advice_kind=="around"){
		arr = this.around;
	}

	if(!arr){
		dj_throw("bad this: " + this);
	}

	// FIXME: will this work if we pass it an arr?
	var ind = -1;
	for(var x=0; x<arr.length; x++){
		if((arr[x][0] == adviceObj)&&(arr[x][1] == advice)){
			ind = x;
		}
	}
	/*
	var ind = dojo.alg.find(arr, [adviceObj, advice]);
	*/
	if(ind == -1){
		return false;
	}
	arr.splice(ind, 1);
	return true;
}

