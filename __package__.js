(function(){
	var isRhino = ((typeof this["load"] == "function")&&(typeof this["Packages"] == "object"));
	var tmps = ["bootstrap1.js", "hostenv_"+((isRhino) ? "rhino" : "browser")+".js", "bootstrap2.js"];
	var root = ((this["djConfig"])&&(djConfig["baseScriptUri"])) ?  djConfig.baseScriptUri : ".";
	for(var x in tmps){
		var spath = root+"/src/"+tmps[x];
		if(isRhino){
			load(spath);
		}else{
			document.write("<script type='text/javascript' src='"+spath+"'></script>");
		}
	}
})();
