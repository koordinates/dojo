// dojo.hostenv.loadModule("dojo.alg.*");
dojo.hostenv.startPackage("dojo.text");

dojo.text = new function(){
	this.trim = function(iString){
		if(!iString){ // allow String.prototyp-ing
			iString = this; 
		}
		if(typeof iString != "string"){ return iString; }
		if(!iString.length){ return iString; }
		return iString.replace(/^\s*/, "").replace(/\s*$/, "");
	}
}
