dojo.provide("dojo.lite");

dojo.lite.removed = function(){
	dojo.debug.apply(dojo, ["dojo.lite removal:"].concat(arguments));
}

dojo.lite.removed("dojo.regexp.time");
dojo.lite.removed("dojo.lang.setObjPathValue");
dojo.lite.removed("dojo.lang.getObject");
dojo.lite.removed("dojo.lang.doesObjectExist");
