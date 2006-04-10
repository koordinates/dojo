// needed in test_RemotePaths.html
// needs executescripts true
	top.extScriptToggle = function(){
		var a = document.getElementById("extToggler");
		var txt = a.firstChild.nodeValue;
		if(txt == "Ext js file scripttest, Released"){
			txt = "Ext js file scripttest, Pushed";
		}else{
			txt = "Ext js file scripttest, Released";
		}
		a.firstChild.nodeValue = txt;
	}