dojo.provide("dojo.widget.html.ContentPane");

dojo.require("dojo.widget.*");
dojo.require("dojo.io.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.ContentPane");
dojo.require("dojo.string");
dojo.require("dojo.style");

dojo.widget.html.ContentPane = function(){
	dojo.widget.HtmlWidget.call(this);
}
dojo.inherits(dojo.widget.html.ContentPane, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.html.ContentPane, {
	widgetType: "ContentPane",
	isContainer: true,

	// remote loading options
	href: "",
	extractContent: true,
	parseContent: true,
	cacheContent: true,
	executeScripts: false,
	preload: false,			// force load of data even if pane is hidden
	refreshOnShow: false,
	handler: "",			// generate pane content from a java function


	// private
	_remoteStyles: null,		// array of stylenodes inserted to document head
					// by remote content, used when we clean up for new content


	postCreate: function(args, frag, parentComp){
		if ( this.handler != "" ){
			this.setHandler(this.handler);
		}
		if(this.preload){ this.loadContents(); }
	},

	onResized: function(){
		if(this.isVisible()){
			this.loadContents();
		}
		dojo.widget.html.ContentPane.superclass.onResized.call(this);
	},

	show: function(){
		// if refreshOnShow is true, reload the contents every time; otherwise, load only the first time
		if(this.refreshOnShow){
			this.refresh();
		}else{
			this.loadContents();
		}
		dojo.widget.html.ContentPane.superclass.show.call(this);
	},

	refresh: function(){
		this.isLoaded=false;
		this.loadContents();
	},

	loadContents: function() {
		if ( this.isLoaded ){
			return;
		}
		this.isLoaded=true;
		if ( dojo.lang.isFunction(this.handler)) {
			this._runHandler();
		} else if ( this.href != "" ) {
			this._downloadExternalContent(this.href, this.cacheContent);
		}
	},

	// Reset the (external defined) content of this pane
	setUrl: function(url) {
		this.href = url;
		this.isLoaded = false;
		if ( this.preload || this.isVisible() ){
			this.loadContents();
		}
	},

	_downloadExternalContent: function(url, useCache) {
		this.setContent("Loading...");
		var self = this;
		dojo.io.bind({
			url: url,
			useCache: useCache,
			preventCache: !useCache,
			mimetype: "text/html",
			handler: function(type, data, e) {
				if(type == "load") {
					self.onLoad.call(self, url, data);
				} else {
					self.setContent.call(self, "Error loading '" + url + "' (" + e.status + " " + e.statusText + ")");
				}
			}
		});
	},

	onLoad: function(url, data){
		data = this.splitAndFixPaths(data, url);
		this.setContent(data);
	},

	// fix all remote paths in (hopefully) all cases for example images, remote scripts, links etc.
	// splits up content in different pieces, scripts, title, style, link and whats left becomes .xml
	splitAndFixPaths: function(s, url){
		if(!url) { url = dojo.hostenv.getBaseScriptUri(); }

		// fix up paths in data
		var titles = []; var scripts = []; var linkStyles = [];
		var styles = []; var remoteScripts = [];

		// khtml is much more picky about dom faults, you can't for example attach a style node under body of document
		// must go into head, as does a title node, so we need to cut out those tags
		// cut out title tags
		var match = [];
		while(match){
			match = s.match(/<title[^>]*>([\s\S]*?)<\/title>/i); // can't match with dot as that 
			if(!match){ break;}					//doesnt match newline in js
			titles.push(match[1]);
			s = s.replace(/<title[^>]*>[\s\S]*?<\/title>/i, "");
		}

		// cut out <style> url(...) </style>, as that bails out in khtml
		var match = [];
		while(match){
			match = s.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
			if(!match){ break; }
			styles.push(dojo.style.fixPathsInCssText(match[1], url));
			s = s.replace(/<style[^>]*?>[\s\S]*?<\/style>/i, "");
		}


		// attributepaths one tag can have multiple paths example:
		// <input src="..." style="url(..)"/> or <a style="url(..)" href="..">
		// strip out the tag and run fix on that.
		// this guarantees that we won't run replace another tag's attribute + it was easier do
		var pos = 0; var pos2 = 0; var stop = 0 ;var str = ""; var fixedPath = "";
		var attr = []; var fix = ""; var tagFix = ""; var tag = ""; var regex = ""; 
		while(pos>-1){
			pos = s.search(/<[a-z][a-z0-9]*[^>]*\s(?:(?:src|href|style)=[^>])+[^>]*>/i);
			if(pos==-1){ break; }
			str += s.substring(0, pos);
			s = s.substring(pos, s.length);
			tag = s.match(/^<[a-z][a-z0-9]*[^>]*>/i)[0];
			s = s.substring(tag.length, s.length);

			// loop through attributes
			pos2 = 0; tagFix = ""; fix = ""; regex = "";
			while(pos2!=-1){
				// slices up before next attribute check, values from previous loop
				tagFix += tag.substring(0, pos2) + fix;
				tag = tag.substring(pos2+regex.length, tag.length);

				// fix next attribute or bail out when done
				attr = tag.match(/ (src|href|style)=(['"]?)([^>]+)\2[^>]*>/i);
				if(!attr){ break; }

				switch(attr[1].toLowerCase()){
					case "src":// falltrough
					case "href":
						if(attr[3].search(/(https?|ftps?|file):\/\//)==-1){ 
							fixedPath = (new dojo.uri.Uri(url, attr[3]).toString());
						}
						break;
					case "style":// style
						fixedPath = dojo.style.fixPathsInCssText(attr[3], url);
						break;
					default:
						fixedPath = attr[3];
				}

				regex = " " + attr[1] + "=" + attr[2] + attr[3] + attr[2];
				fix = " " + attr[1] + "=" + attr[2] + fixedPath + attr[2];
				pos2 = tag.search(new RegExp(regex));
			}
			str += tagFix + tag;
			pos = 0; // reset for next mainloop
		}
		s = str+s;

		// cut out all script tags, stuff them into scripts array
		match = [];
		while(match){
			match = s.match(/<script([^>]*)>([\s\S]*?)<\/script>/i);
			if(!match){ break; }
			if(match[1]){
				attr = match[1].match(/src=(['"]?)([^"']*)\1/i);
				if(attr){
					// remove a dojo.js or dojo.js.uncompressed.js from remoteScripts
					if( (attr[2].search(/\/?dojo.js(?:\.uncompressed.js)?/i) != -1) &&
					(dojo.hostenv.getBaseScriptUri() == attr[2].match(/[.\/]*/)[0]) )
					{	
						dojo.debug("Security note! inhibit:"+attr[2]+" from  beeing remotly loaded.");
					}else{
						remoteScripts.push(attr[2]);
					}
				}
			}
			if(match[2]){
				// strip out all djConfig variables from script tags nodeValue
				// this is ABSOLUTLY needed as reinitialize djConfig after dojo is initialised
				// makes a dissaster greater than Titanic
				scripts.push(match[2].replace(/(?:var )?\bdjConfig\b(?:[\s]*=[\s]*\{[^}]+\}|\.[\w]*[\s]*=[\s]*[^;\n]*)?;?/g, ""));
			}
			s = s.replace(/<script[^>]*>[\s\S]*?<\/script>/i, "");
		}

		// cut out all <link rel="stylesheet" href="..">
		match = [];
		while(match){
			match = s.match(/<link ([^>]*rel=['"]?stylesheet['"]?[^>]*)>/i);
			if(!match){ break; }
			attr = match[1].match(/href=(['"]?)([^'">]*)\1/i);
			if(attr){
				linkStyles.push(attr[2]);
			}
			s = s.replace(new RegExp(match[0]), "");
		}

		return {"xml": s,
			"styles": styles,
			"linkStyles": linkStyles,
			"titles": titles,
			"scripts": scripts,
			"remoteScripts": remoteScripts,
			"url": url};
	},

	setContent: function(data){
		// need to run splitAndFixPaths? ie. manually setting content
		if(!data.xml){
			data = this.splitAndFixPaths(data);
		}

		// remove old children from current content
		this.destroyChildren();

		// remove old stylenodes
		if(this._remoteStyles){
			for(var i = 0; i < this._remoteStyles.length; i++){
				if(this._remoteStyles[i] && this._remoteStyles.parentNode){
					this._remoteStyles[i].parentNode.removeChild(this._remoteStyles[i]);
				}
			}
			this._remoteStyles = null;
		}

		var node = this.containerNode || this.domNode;
		try{
			node.innerHTML = data.xml;
		} catch(e){
			// FIXME: should this get pushed to an onError function?
			dojo.debug("couldnt load html:"+e);
			dojo.debugShallow(data);
			return;
		}
		// insert styleNodes, from <style>....
		for(var i = 0; i < data.styles.length; i++){
			if(i==0){ 
				this._remoteStyles = []; 
			}
			this._remoteStyles.push(dojo.style.insertCssText(data.styles[i]));
		}
		// insert styleNodes, form <link href="...">
		for(var i = 0; i < data.linkStyles.length; i++){
			if(i==0){ 
				this._remoteStyles = []; 
			}
			this._remoteStyles.push(dojo.style.insertCssFile(data.linkStyles[i]));
		}

		if(this.executeScripts){
			this._executeScripts(data);
		}
		if(this.extractContent) {
			var matches = data.xml.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
			if(matches) { data.xml = matches[1]; }
		}
		if(this.parseContent){
			var parser = new dojo.xml.Parse();
			var frag = parser.parseElement(node, null, true);
			dojo.widget.getParser().createComponents(frag, this);
			this.onResized();
		}
	},

	// Generate pane content from given java function
	setHandler: function(handler) {
		var fcn = dojo.lang.isFunction(handler) ? handler : window[handler];
		if(!dojo.lang.isFunction(fcn)) {
			throw new Error("Unable to set handler, '" + handler + "' not a function.");
			return;
		}
		this.handler = function() {
			return fcn.apply(this, arguments);
		}
	},

	_runHandler: function() {
		if(dojo.lang.isFunction(this.handler)) {
			this.handler(this, this.domNode);
			return false;
		}
		return true;
	},

	_executeScripts: function(data) {
		// do remoteScripts first
		for(var i = 0; i < data.remoteScripts.length; i++){
			dojo.io.bind({
				"url": data.remoteScripts[i],
				"load":     function(type, evaldObj) {/* do nothing */ },
				"error":    function(type, error) {alert(type); alert(error); /* do nothing */ },
				"mimetype": "text/javascript",
				"sync":     true
			});
		}

		// do inline scripts
		var repl = null;
		for(var i = 0; i < data.scripts.length; i++){
			// not sure why comment and carraige return clean is needed
			// but better safe than sorry so we keep it, Fredrik
			// Clean up content: remove inline script  comments
			repl = new RegExp('//.*?$', 'gm');
			data.scripts[i] = data.scripts[i].replace(repl, '\n');
	
			// Clean up content: remove carraige returns
			repl = new RegExp('[\n\r]', 'g');
			data.scripts[i] = data.scripts[i].replace(repl, ' ');

			// Execute commands
			eval(data.scripts[i]);
		}
	}
});

dojo.widget.tags.addParseTreeHandler("dojo:ContentPane");
