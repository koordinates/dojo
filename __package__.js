(function(){
	var tmps = ["bootstrap1.js", "hostenv_browser.js", "bootstrap2.js"];
	var root = ((this["djConfig"])&&(djConfig["baseScriptUri"])) ?  djConfig.baseScriptUri : "";
	for(var x in tmps){
		document.write("<script type='text/javascript' src='"+root+"/src/"+tmps[x]+"'></script>");
	}
})();
