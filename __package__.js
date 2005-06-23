(function(){
	var isRhino = ((typeof this["load"] == "function")&&(typeof this["Packages"] == "object"));
	var tmps = ["bootstrap1.js", "hostenv_"+((isRhino) ? "rhino" : "browser")+".js", "bootstrap2.js"];
	if((this["djConfig"])&&(djConfig["baseScriptUri"])) {
		var root = djConfig["baseScriptUri"];
	} else if((this["djConfig"])&&(djConfig["baseRelativePath"])) {
		var root = djConfig["baseRelativePath"];
	} else {
		var root = ".";
	}
	for(var x in tmps){
		var spath = root+"/src/"+tmps[x];
		if(isRhino){
			load(spath);
		}else{
			document.write("<script type='text/javascript' src='"+spath+"'></script>");
		}
	}
})();
