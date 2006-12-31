dojo.provide("dojo.html.extras");
dojo.require("dojo.html.common");
dojo.require("dojo.uri.Uri");

dojo.html.fixPathsInCssText = function(/* string */cssStr, /* string */URI){
	//	summary
	// usage: cssText comes from dojoroot/src/widget/templates/Foobar.css
	// 	it has .dojoFoo { background-image: url(images/bar.png);} then uri should point to dojoroot/src/widget/templates/
	if(!cssStr || !URI){ return; }
	var match, str = "", url = "", urlChrs = "[\\t\\s\\w\\(\\)\\/\\.\\\\'\"-:#=&?~]+";
	var regex = new RegExp('url\\(\\s*('+urlChrs+')\\s*\\)');
	var regexProtocol = /(file|https?|ftps?):\/\//;
	regexTrim = new RegExp("^[\\s]*(['\"]?)("+urlChrs+")\\1[\\s]*?$");
	if(dojo.render.html.ie55 || dojo.render.html.ie60){
		var regexIe = new RegExp("AlphaImageLoader\\((.*)src\=['\"]("+urlChrs+")['\"]");
		// TODO: need to decide how to handle relative paths and AlphaImageLoader see #1441
		// current implementation breaks on build with intern_strings
		while(match = regexIe.exec(cssStr)){
			url = match[2].replace(regexTrim, "$2");
			if(!regexProtocol.exec(url)){
				url = (new dojo.uri.Uri(URI, url).toString());
			}
			str += cssStr.substring(0, match.index) + "AlphaImageLoader(" + match[1] + "src='" + url + "'";
			cssStr = cssStr.substr(match.index + match[0].length);
		}
		cssStr = str + cssStr;
		str = "";
	}

	while(match = regex.exec(cssStr)){
		url = match[1].replace(regexTrim, "$2");
		if(!regexProtocol.exec(url)){
			url = (new dojo.uri.Uri(URI, url).toString());
		}
		str += cssStr.substring(0, match.index) + "url(" + url + ")";
		cssStr = cssStr.substr(match.index + match[0].length);
	}
	return str + cssStr;	//	string
}

