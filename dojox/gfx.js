dojo.provide("dojox.gfx");

dojo.require("dojox.gfx.matrix");
dojo.require("dojox.gfx._base");

dojo.required(["dojox.gfx._base", "dojox.gfx.matrix"], function() {


	var gfx = dojo.getObject("dojox.gfx", true), sl, flag, match;

	if(!gfx.renderer){

		var renderers = (typeof dojo.config.gfxRenderer == "string" ?
			dojo.config.gfxRenderer : "svg,vml,silverlight,canvas").split(",");


		for(var i = 0; !dojox.gfx.renderer && i < renderers.length; ++i){
			switch(renderers[i]){
				case "svg":
					if (dojo.isHostMethod(dojo.doc, 'createElementNS')) {
						try {
							var svg = dojo.doc.createElementNS("http://www.w3.org/2000/svg", 'svg');
							if (/svg/i.test(svg.nodeName)) {
								dojox.gfx.renderer = "svg";
							}
						} catch(e) {
						}
					}
					break;
				case "vml":
					var doc = dojo.doc;
					if (dojo.isHostObjectProperty(doc, 'namespaces') && dojo.isHostMethod(doc.namespaces, 'add')) {
						doc.namespaces.add("v","urn:schemas-microsoft-com:vml");
						if (dojo.isHostMethod(doc, 'createStyleSheet')) {
							doc.createStyleSheet().addRule("v\\:*", "behavior:url(#default#VML); display:inline-block");
							dojox.gfx.renderer = "vml";
						}
					}
					doc = null;
					break;
				case "silverlight":
					try{
						if(dojo.isHostObjectProperty(window, "ActiveXObject")){
							sl = new window.ActiveXObject("AgControl.AgControl");
							flag = sl && sl.IsVersionSupported("1.0");
						}else{

							// NOTE: Need plugins module
							
							flag = dojo.isHostObjectProperty(window, 'navigator') && dojo.isHostObjectProperty(window.navigator, 'plugins') && window.navigator.plugins["Silverlight Plug-In"];
						}
					}catch(e){
					}
					sl = null;					
					if (flag) {
						dojox.gfx.renderer = "silverlight";
					}
					break;
				case "canvas":
					// TODO: need test for Canvas
					
					dojox.gfx.renderer = "canvas";
					
					break;
			}
		}
		if (dojo.config.isDebug) {
			console.log("Renderer: " + dojox.gfx.renderer);
		}
	}

	dojo.require("dojox.gfx.shape");
	dojo.require("dojox.gfx.path");
	dojo.require("dojox.gfx.arc");

	// include a renderer conditionally

	// NOTE: Combine these four into one file, optinally exclude with builder

	dojo.requireIf(dojox.gfx.renderer == "svg", "dojox.gfx.svg");
	dojo.requireIf(dojox.gfx.renderer == "vml", "dojox.gfx.vml");
	dojo.requireIf(dojox.gfx.renderer == "silverlight", "dojox.gfx.silverlight");
	dojo.requireIf(dojox.gfx.renderer == "canvas", "dojox.gfx.canvas");

	dojo.provided("dojox.gfx");
});