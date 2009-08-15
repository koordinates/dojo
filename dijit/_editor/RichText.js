dojo.provide("dijit._editor.RichText");

dojo.require("dijit._Widget");
dojo.require("dijit._editor.selection");
dojo.require("dijit._editor.range");
dojo.require("dijit._editor.html");
dojo.require("dojo.i18n");

dojo.required(["dojo.i18n", "dijit._Widget"], function() {

dojo.requireLocalization("dijit.form", "Textarea");

// used to restore content when user leaves this page then comes back
// but do not try doing dojo.doc.write if we are using xd loading.
// dojo.doc.write will only work if RichText.js is included in the dojo.js
// file. If it is included in dojo.js and you want to allow rich text saving
// for back/forward actions, then set dojo.config.allowXdRichTextSave = true.

if(!dojo.config.useXDomain || dojo.config.allowXdRichTextSave){
	if(dojo._postLoad){
		(function(){
			var savetextarea = dojo.doc.createElement('textarea');
			savetextarea.id = dijit._scopeName + "._editor.RichText.savedContent";
			dojo.style(savetextarea, {
				display:'none',
				position:'absolute',
				top:"-100px",
				height:"3px",
				width:"3px"
			});
			dojo.body().appendChild(savetextarea);
		})();
	}else{
		// body is not available before onLoad is fired
		try {
			dojo.doc.write('<textarea id="' + dijit._scopeName + '._editor.RichText.savedContent" ' +
				'style="display:none;position:absolute;top:-100px;left:-100px;height:3px;width:3px;overflow:hidden;"></textarea>');
		}catch(e){ }
	}
}

dojo.declare("dijit._editor.RichText", dijit._Widget, {
	constructor: function(params){
		// summary:
		//		dijit._editor.RichText is the core of dijit.Editor, which provides basic
		//		WYSIWYG editing features.
		//
		// description:
		//		dijit._editor.RichText is the core of dijit.Editor, which provides basic
		//		WYSIWYG editing features. It also encapsulates the differences
		//		of different js engines for various browsers.  Do not use this widget
		//		with an HTML &lt;TEXTAREA&gt; tag, since the browser unescapes XML escape characters,
		//		like &lt;.  This can have unexpected behavior and lead to security issues
		//		such as scripting attacks.
		//
		// tags:
		//		private

		// contentPreFilters: Function(String)[]
		//		Pre content filter function register array.
		//		these filters will be executed before the actual
		//		editing area gets the html content.
		this.contentPreFilters = [];

		// contentPostFilters: Function(String)[]
		//		post content filter function register array.
		//		These will be used on the resulting html
		//		from contentDomPostFilters. The resulting
		//		content is the final html (returned by getValue()).
		this.contentPostFilters = [];

		// contentDomPreFilters: Function(DomNode)[]
		//		Pre content dom filter function register array.
		//		These filters are applied after the result from
		//		contentPreFilters are set to the editing area.
		this.contentDomPreFilters = [];

		// contentDomPostFilters: Function(DomNode)[]
		//		Post content dom filter function register array.
		//		These filters are executed on the editing area dom.
		//		The result from these will be passed to contentPostFilters.
		this.contentDomPostFilters = [];

		// editingAreaStyleSheets: dojo._URL[]
		//		array to store all the stylesheets applied to the editing area
		this.editingAreaStyleSheets=[];

		this._keyHandlers = {};
		this.contentPreFilters.push(dojo.hitch(this, "_preFixUrlAttributes"));
		if(dojo.isMoz){
			this.contentPreFilters.push(this._fixContentForMoz);
			this.contentPostFilters.push(this._removeMozBogus);
		}
		if(dojo.isSafari){
			this.contentPostFilters.push(this._removeSafariBogus);
		}
		//this.contentDomPostFilters.push(this._postDomFixUrlAttributes);

		this.onLoadDeferred = new dojo.Deferred();
	},

	// inheritWidth: Boolean
	//		whether to inherit the parent's width or simply use 100%
	inheritWidth: false,

	// focusOnLoad: [deprecated] Boolean
	//		Focus into this widget when the page is loaded
	focusOnLoad: false,

	// name: String?
	//		Specifies the name of a (hidden) <textarea> node on the page that's used to save
	//		the editor content on page leave.   Used to restore editor contents after navigating
	//		to a new page and then hitting the back button.
	name: "",

	// styleSheets: [const] String
	//		semicolon (";") separated list of css files for the editing area
	styleSheets: "",

	// _content: [private] String
	//		temporary content storage
	_content: "",

	// height: String
	//		Set height to fix the editor at a specific height, with scrolling.
	//		By default, this is 300px.  If you want to have the editor always
	//		resizes to accommodate the content, use AlwaysShowToolbar plugin
	//		and set height="".  If this editor is used within a layout widget,
	//		set height="100%".
	height: "300px",

	// minHeight: String
	//		The minimum height that the editor should have.
	minHeight: "1em",
	
	// isClosed: [private] Boolean
	isClosed: true,

	// isLoaded: [private] Boolean
	isLoaded: false,

	// _SEPARATOR: [private] String
	//		Used to concat contents from multiple editors into a single string,
	//		so they can be saved into a single <textarea> node.  See "name" attribute.
	_SEPARATOR: "@@**%%__RICHTEXTBOUNDRY__%%**@@",

	// onLoadDeferred: [protected] dojo.Deferred
	//		Deferred which is fired when the editor finishes loading
	onLoadDeferred: null,
	
	// isTabIndent: Boolean
	//		Make tab key and shift-tab indent and outdent rather than navigating.
	//		Caution: sing this makes web pages inaccessible to users unable to use a mouse.
	isTabIndent: false,

	// disableSpellCheck: [const] Boolean
	//		When true, disables the browser's native spell checking, if supported.
	//		Works only in Firefox.
	disableSpellCheck: false,

	postCreate: function(){
		if("textarea" == this.domNode.tagName.toLowerCase()){
			console.warn("RichText should not be used with the TEXTAREA tag.  See dijit._editor.RichText docs.");
		}
		dojo.publish(dijit._scopeName + "._editor.RichText::init", [this]);
		this.open();
		this.setupDefaultShortcuts();
	},

	setupDefaultShortcuts: function(){
		// summary:
		//		Add some default key handlers
		// description:
		// 		Overwrite this to setup your own handlers. The default
		// 		implementation does not use Editor commands, but directly
		//		executes the builtin commands within the underlying browser
		//		support.
		// tags:
		//		protected
		var exec = dojo.hitch(this, function(cmd, arg){
			return function(){
				return !this.execCommand(cmd,arg);
			};
		});

		var ctrlKeyHandlers = { 
			b: exec("bold"),
			i: exec("italic"),
			u: exec("underline"),
			a: exec("selectall"),
			s: function(){ this.save(true); },
			m: function(){ this.isTabIndent = !this.isTabIndent; },

			"1": exec("formatblock", "h1"),
			"2": exec("formatblock", "h2"),
			"3": exec("formatblock", "h3"),
			"4": exec("formatblock", "h4"),

			"\\": exec("insertunorderedlist")
		};

		ctrlKeyHandlers.Z = exec("undo");

		for(var key in ctrlKeyHandlers){
			if (dojo.isOwnProperty(ctrlKeyHandlers, key)) {
				this.addKeyHandler(key, true, false, ctrlKeyHandlers[key]);
			}
		}
	},

	// events: [private] String[]
	//		 events which should be connected to the underlying editing area
	events: ["onKeyPress", "onKeyDown", "onKeyUp", "onClick", "onMouseUp"],

	// captureEvents: [deprecated] String[]
	//		 Events which should be connected to the underlying editing
	//		 area, events in this array will be addListener with
	//		 capture=true.
	// TODO: looking at the code I don't see any distinction between events and captureEvents,
	// so get rid of this for 2.0 if not sooner
	captureEvents: [],

	_editorCommandsLocalized: false,
	_localizeEditorCommands: function(){
		// summary:
		//		When IE is running in a non-English locale, the API actually changes,
		//		so that we have to say (for example) danraku instead of p (for paragraph).
		//		Handle that here.
		// tags:
		//		private
		if(this._editorCommandsLocalized){
			return;
		}
		this._editorCommandsLocalized = true;

		//in IE, names for blockformat is locale dependent, so we cache the values here

		//if the normal way fails, we try the hard way to get the list

		//do not use _cacheLocalBlockFormatNames here, as it will
		//trigger security warning in IE7

		//put p after div, so if IE returns Normal, we show it as paragraph
		//We can distinguish p and div if IE returns Normal, however, in order to detect that,
		//we have to call this.document.selection.createRange().parentElement() or such, which
		//could slow things down. Leave it as it is for now

		var formats = ['div', 'p', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ol', 'ul', 'address'];
		var localhtml = "", format, i=0;
		while((format=formats[i++])){

			//append a <br> after each element to separate the elements more reliably

			if(format.charAt(1) != 'l'){
				localhtml += "<"+format+"><span>content</span></"+format+"><br/>";
			}else{
				localhtml += "<"+format+"><li>content</li></"+format+"><br/>";
			}
		}

		// queryCommandValue returns empty if we hide editNode, so move it out of screen temporarily

		var div = dojo.doc.createElement('div');
		dojo.style(div, {
			position: "absolute",
			top: "-2000px"
		});
		dojo.doc.body.appendChild(div);
		div.innerHTML = localhtml;
		var node = div.firstChild;
		while(node){
			dojo.withGlobal(this.window, dijit._editor.selection, 'selectElement', [node.firstChild]);
			var nativename = node.tagName.toLowerCase();
			try {
				this._local2NativeFormatNames[nativename] = this.document.queryCommandValue("formatblock");
				this._native2LocalFormatNames[this._local2NativeFormatNames[nativename]] = nativename;
			} catch(e) {}
			node = node.nextSibling.nextSibling;
		}
		dojo.doc.body.removeChild(div);
	},

	open: function(/*DomNode?*/ element){
		//	summary:
		//		Transforms the node referenced in this.domNode into a rich text editing
		//		node. 
		//	description:
		//		Sets up the editing area asynchronously. This will result in
		//		the creation and replacement with an <iframe> if
		//		designMode(FF)/contentEditable(IE) is used and stylesheets are
		//		specified, if we're in a browser that doesn't support
		//		contentEditable.
		//
		//		A dojo.Deferred object is created at this.onLoadDeferred, and
		//		users may attach to it to be informed when the rich-text area
		//		initialization is finalized.
		// tags:
		//		private

		if(!this.onLoadDeferred || this.onLoadDeferred.fired >= 0){
			this.onLoadDeferred = new dojo.Deferred();
		}

		if(!this.isClosed){ this.close(); }
		dojo.publish(dijit._scopeName + "._editor.RichText::open", [ this ]);

		this._content = "";
		if(arguments.length == 1 && element.nodeName){ // else unchanged
			this.domNode = element; 
		} 

		var dn = this.domNode;

		var html;
		if(dn.nodeName && dn.nodeName.toLowerCase() == "textarea"){
			// if we were created from a textarea, then we need to create a
			// new editing harness node.
			var ta = (this.textarea = dn);
			this.name = ta.name;
			html = this._preFilterContent(ta.value);
			dn = this.domNode = dojo.doc.createElement("div");
			dn.setAttribute('widgetId', this.id);
			ta.removeAttribute('widgetId');
			dn.cssText = ta.cssText;
			dn.className += " " + ta.className;
			dojo.place(dn, ta, "before");
			var tmpFunc = dojo.hitch(this, function(){

				// Some browsers refuse to submit display=none textarea, so
				// move the textarea out of screen instead

				dojo.style(ta, {
					display: "block",
					position: "absolute",
					top: "-1000px"
				});

				// nasty IE bug: abnormal formatting if overflow is not hidden

				var s = ta.style;
				this.__overflow = s.overflow;
				s.overflow = "hidden";
			});

			window.setTimeout(tmpFunc, 10);
			
			// this.domNode.innerHTML = html;

			if(ta.form){
				dojo.connect(ta.form, "onsubmit", this, function(){
					// FIXME: should we be calling close() here instead?
					ta.value = this.getValue();
				});
			}
		}else{
			html = this._preFilterContent(dijit._editor.getChildrenHtml(dn));
			dn.innerHTML = "";
		}

		var content = dojo.contentBox(dn);

		this._oldHeight = content.h;
		this._oldWidth = content.w;

		this.savedContent = html;

		// If we're a list item we have to put in a blank line to force the
		// bullet to nicely align at the top of text
		if(dn.nodeName && dn.nodeName == "LI"){
			dn.innerHTML = " <br>";
		}

		this.editingArea = dn.ownerDocument.createElement("div");
		dn.appendChild(this.editingArea);

		if(this.name && (!dojo.config.useXDomain || dojo.config.allowXdRichTextSave)){
			var saveTextarea = dojo.byId(dijit._scopeName + "._editor.RichText.savedContent");
			if(saveTextarea.value){
				var datas = saveTextarea.value.split(this._SEPARATOR), i=0, dat;
				while((dat=datas[i++])){
					var data = dat.split(":");
					if(data[0] == this.name){
						html = data[1];
						datas.splice(i, 1);
						break;
					}
				}
			}
			this.connect(window, "onbeforeunload", "_saveContent");
		}

		this.isClosed = false;		
		var ifr = this.editorObject = this.iframe = dojo.doc.createElement('iframe');
		ifr.id = this.id+"_iframe";
		this._iframeSrc = this._getIframeDocTxt(html);
		ifr.style.border = "none";
		ifr.style.width = "100%";
		if(this._layoutMode) {

			// iframe should be 100% height, thus getting it's height from surrounding
			// <div> (which has the correct height set by Editor)

			ifr.style.height = "100%";
		}else{
			if(this.height){
				ifr.style.height = this.height;
			}
			if(this.minHeight && typeof ifr.style.minHeight == 'string'){
				ifr.style.minHeight = this.minHeight;
			}

		}
		ifr.frameBorder = 0;
		var s = 'javascript:parent.dijit.byId("'+this.id+'")._iframeSrc';
		ifr.src = s;
		this.editingArea.appendChild(ifr);
		ifr = null;

		// TODO: this is a guess at the default line-height, kinda works

		if(dn.nodeName == "LI"){
			dn.lastChild.style.marginTop = "-1.2em";
		}

		if(this.domNode.nodeName == "LI"){ this.domNode.lastChild.style.marginTop = "-1.2em"; }
		dojo.addClass(this.domNode, "RichTextEditable");
	},

	//static cache variables shared among all instance of this class
	_local2NativeFormatNames: {},
	_native2LocalFormatNames: {},
	_localizedIframeTitles: null,

	_getIframeDocTxt: function(/* String */ html){
		// summary:
		//		Generates text of the document inside the iframe (ie, <html>....editor content...</html>
		// tags:
		//		private
		var _cs = dojo.getComputedStyle(this.domNode);
		html="<div>"+html+"</div>";
		var font = [ _cs.fontWeight, _cs.fontSize, _cs.fontFamily ].join(" ");
		
		// line height is tricky - applying a units value will mess things up.
		// if we can't get a non-units value, bail out.
		var lineHeight = _cs.lineHeight;
		if(lineHeight.indexOf("px") >= 0){
			lineHeight = parseFloat(lineHeight)/parseFloat(_cs.fontSize);
		}else if(lineHeight.indexOf("em")>=0){
			lineHeight = parseFloat(lineHeight);
		}else{
			lineHeight = "1.0";
		}
		var userStyle = "";
		this.style.replace(/(^|;)(line-|font-?)[^;]+/g, function(match){ userStyle += match.replace(/^;/g,"") + ';'; });
		return [
			this.isLeftToRight() ? "<html><head>" : "<html dir='rtl'><head>",
			(this._localizedIframeTitles && this._localizedIframeTitles.iframeEditTitle ? "<title>" + this._localizedIframeTitles.iframeEditTitle + "</title>" : ""),
			"<style>",
			"body,html {",
			"\tbackground:transparent;",
			"\tpadding: 1em 0 0 0;",
			"\tmargin: -1em 0 0 0;", // remove extraneous vertical scrollbar on safari and firefox
			"}",
			// TODO: left positioning will cause contents to disappear out of view
			//	   if it gets too wide for the visible area
			"body{",
			"\ttop:0px; left:0px; right:0px;",
			"\tfont:", font, ";",
				((this.height) ? "" : "position: fixed;"),
			// FIXME: IE 6 won't understand min-height (nor will IE7+ in quirks mode.)
			"\tmin-height:", this.minHeight, ";",
			"\tline-height:", lineHeight,
			"}",
			"p{ margin: 1em 0 !important; }",
			(this.height ? // height:auto undoes the height:100%
				"" : "body,html{overflow-y:hidden;/*for IE*/} body > div {overflow-x:auto;/*FF:horizontal scrollbar*/ overflow-y:hidden;/*safari*/ min-height:"+this.minHeight+";/*safari*/}"
			),
			"li > ul:-moz-first-node, li > ol:-moz-first-node{ padding-top: 1.2em; } ",
			"li{ min-height:1.2em; }",
			"</style>",
			this._applyEditingAreaStyleSheets(),
			"</head><body onload=\"parent.dijit.byId('", this.id, "').onLoad(window);\" style='", userStyle, "'>", html, "</body></html>"
		].join(""); // String
	},

	_applyEditingAreaStyleSheets: function(){
		// summary:
		//		apply the specified css files in styleSheets
		// tags:
		//		private
		var files = [];
		if(this.styleSheets){
			files = this.styleSheets.split(';');
			this.styleSheets = '';
		}

		//empty this.editingAreaStyleSheets here, as it will be filled in addStyleSheet
		files = files.concat(this.editingAreaStyleSheets);
		this.editingAreaStyleSheets = [];

		var text='', i=0, url;
		while((url=files[i++])){
			var abstring = (new dojo._Url(dojo.global.location, url)).toString();
			this.editingAreaStyleSheets.push(abstring);
			text += '<link rel="stylesheet" type="text/css" href="'+abstring+'"/>';
		}
		return text;
	},

	addStyleSheet: function(/*dojo._Url*/ uri){
		// summary:
		//		add an external stylesheet for the editing area
		// uri:
		//		A dojo.uri.Uri pointing to the url of the external css file
		var url=uri.toString();

		// if uri is relative, then convert it to absolute so that it can be resolved correctly in iframe

		if(url.charAt(0) == '.' || (url.charAt(0) != '/' && !uri.host)){
			url = (new dojo._Url(dojo.global.location, url)).toString();
		}

		if(dojo.indexOf(this.editingAreaStyleSheets, url) > -1){
			console.warn('Style sheet already added: ' + url);
		} else {
			this.editingAreaStyleSheets.push(url);
			var head = this.document.getElementsByTagName("head")[0];
			var stylesheet = this.document.createElement("link");
			stylesheet.rel="stylesheet";
			stylesheet.type="text/css";
			stylesheet.href=url;
			head.appendChild(stylesheet);
		}
	},

	removeStyleSheet: function(/*dojo._Url*/ uri){

		// summary:
		//		remove an external stylesheet for the editing area

		var index, url=uri.toString();

		// if uri is relative, then convert it to absolute so that it can be resolved correctly in iframe

		if (url.charAt(0) == '.' || (url.charAt(0) != '/' && !uri.host)) {
			url = (new dojo._Url(dojo.global.location, url)).toString();
		}

		index = dojo.indexOf(this.editingAreaStyleSheets, url);
		if (index != -1) {
			delete this.editingAreaStyleSheets[index];
			dojo.withGlobal(this.window, 'query', dojo, ['link:[href="' + url + '"]']).orphan();
		}
	},

	// disabled: Boolean
	// 		The editor is disabled; the text cannot be changed.
	disabled: false,

	_mozSettingProps: ['styleWithCSS','insertBrOnReturn'],
	_setDisabledAttr: function(/*Boolean*/ value){
		this.disabled = value;
		if(!this.isLoaded){ return; } // this method requires init to be complete
		value = !!value;
		//if(dojo.isIE || dojo.isWebKit || dojo.isOpera){
			var preventIEfocus = (this.isLoaded || !this.focusOnLoad);
			if(preventIEfocus){ this.editNode.unselectable = "on"; }
			this.editNode.contentEditable = !value;
			if(preventIEfocus){
				var _this = this;
				setTimeout(function(){ _this.editNode.unselectable = "off"; }, 0);
			}
		//}else{ //moz
			if(value){
				//AP: why isn't this set in the constructor, or put in mozSettingProps as a hash?
				this._mozSettings=[false,this.blockNodeForEnter==='BR'];
			}
			try{
				this.document.designMode=(value?'off':'on');
			}catch(e){ return; } // ! _disabledOK
			if(!value && this._mozSettingProps){
				var ps = this._mozSettingProps;
				for(var n in ps){
					if(ps.hasOwnProperty(n)){
						try{
							this.document.execCommand(n,false,ps[n]);
						}catch(e2){}
					}
				}
			}
//			this.document.execCommand('contentReadOnly', false, value);
//				if(value){
//					this.blur(); //to remove the blinking caret
//				}
		//}
		this._disabledOK = true;
	},

	onFocusFactory: function() {
		var id = this.id;

		return function() {
			dijit.byId(id).editNode.setActive();
		};
	},

	_focusTimer: function(){
		window.setTimeout(dojo.hitch(this, "focus"), this.updateInterval);
	},

	_connectEvent: function(item){
		this.connect((this.iframe && item.indexOf('Key') != -1) ? this.document : this.editNode, item.toLowerCase(), item);
	},

/* Event handlers
 *****************/

	// TODO: _isResized seems to be unused anywhere; remove for 2.0
	_isResized: function(){ return false; },

	onLoad: function(win){
		// summary:
		//		Handler after the content of the document finishes loading.
		// tags:
		//		protected

		// TODO: rename this to _onLoad, make empty public onLoad() method, deprecate/make protected onLoadDeferred handler?

		if (win) {
			this.window = win;
			this.document = this.window.document;
		}

		if(this._localizeEditorCommands){
			this._localizeEditorCommands();
		}

		if(!this.window.__registeredWindow){
			this.window.__registeredWindow = true;
			dijit.registerIframe(this.iframe);
		}
		var editNode = this.editNode = this.document.body.firstChild;
		var tabStop = this.tabStop = dojo.doc.createElement('div');
		tabStop.tabIndex = -1;

		if (typeof editNode.setActive != 'undefined') {
			this.editingArea.appendChild(tabStop);
			if (this.iframe && this._onFocusFactory) {
				this.iframe.onfocus = this._onFocusFactory();
			}
		}

		this.focusNode = this.editNode; // for InlineEditBox

		this._preDomFilterContent(this.editNode);

		var events = this.events.concat(this.captureEvents);
		dojo.forEach(events, this._connectEvent, this);

		// give the node Layout on IE
		// this.connect(this.document, "onmousedown", "_onIEMouseDown"); // #4996 fix focus
		if (typeof this.editNode.style.zoom == 'string') {
			this.editNode.style.zoom = 1;
		}

		this.isLoaded = true;

		this.attr('disabled', this.disabled); // initialize content to editable (or not)

		if(this.onLoadDeferred){
			this.onLoadDeferred.callback(true);
		}

		this.onDisplayChanged();

		if(this.focusOnLoad){
			// after the document loads, then set focus after updateInterval expires so that 
			// onNormalizedDisplayChanged has run to avoid input caret issues
			dojo.addOnLoad(dojo.hitch(this, this._focusTimer));
		}

		this.savedContent = this.getValue(true);

		editNode = tabStop = win = null;
	},

	onKeyDown: function(/* Event */ e){
		// summary:
		//		Handler for onkeydown event
		// tags:
		//		protected

		// we need this event at the moment to get the events from control keys
		// such as the backspace. It might be possible to add this to Dojo, so that
		// keyPress events can be emulated by the keyDown and keyUp detection.
		
		if(e.keyCode === dojo.keys.TAB && this.isTabIndent ){
			dojo.stopEvent(e); //prevent tab from moving focus out of editor

			// FIXME: this is a poor-man's indent/outdent. It would be
			// better if it added 4 "&nbsp;" chars in an undoable way.
			// Unfortunately pasteHTML does not prove to be undoable

			if(this.queryCommandEnabled((e.shiftKey ? "outdent" : "indent"))){
				this.execCommand((e.shiftKey ? "outdent" : "indent"));
			}			
		}
		if(dojo.isIE){
			if(e.keyCode == dojo.keys.TAB && !this.isTabIndent){
				if(e.shiftKey && !e.ctrlKey && !e.altKey){
					// focus the BODY so the browser will tab away from it instead
					this.iframe.focus();
				}else if(!e.shiftKey && !e.ctrlKey && !e.altKey){
					// focus the BODY so the browser will tab away from it instead
					this.tabStop.focus();
				}
			}else if(e.keyCode === dojo.keys.BACKSPACE && this.document.selection.type === "Control"){
				// IE has a bug where if a non-text object is selected in the editor,
				// hitting backspace would act as if the browser's back button was
				// clicked instead of deleting the object. see #1069
				dojo.stopEvent(e);
				this.execCommand("delete");
			}else if((65 <= e.keyCode&&e.keyCode <= 90) ||
				(e.keyCode>=37&&e.keyCode<=40) // FIXME: get this from connect() instead!
			){ //arrow keys
				e.charCode = e.keyCode;
				this.onKeyPress(e);
			}
		}else if(dojo.isMoz  && !this.isTabIndent){
			if(e.keyCode == dojo.keys.TAB && !e.shiftKey && !e.ctrlKey && !e.altKey && this.iframe){
				// update iframe document title for screen reader
				var titleObj = dojo.isFF<3 ? this.iframe.contentDocument : this.iframe;
			 	titleObj.title = this._localizedIframeTitles.iframeFocusTitle;

				// Place focus on the iframe. A subsequent tab or shift tab will put focus
				// on the correct control.

				this.iframe.focus();  // this.focus(); won't work
				dojo.stopEvent(e);
			}else if(e.keyCode == dojo.keys.TAB && e.shiftKey){

				// if there is a toolbar, set focus to it, otherwise ignore

				if(this.toolbar){
					this.toolbar.focus();
				}
				dojo.stopEvent(e);
			}
		}
		return true;
	},

	onKeyUp: function(e){
		// summary:
		//		Handler for onkeyup event
		// tags:
		//      callback
		return;
	},

	setDisabled: function(/*Boolean*/ disabled){
		// summary:
		//		Deprecated, use attr('disabled', ...) instead.
		// tags:
		//		deprecated
		dojo.deprecated('dijit.Editor::setDisabled is deprecated','use dijit.Editor::attr("disabled",boolean) instead', 2.0);
		this.attr('disabled',disabled);
	},
	_setValueAttr: function(/*String*/ value){
		// summary:
		//      Registers that attr("value", foo) should call setValue(foo)
		this.setValue(value);
	},
	_getDisableSpellCheckAttr: function(){
		return !dojo.attr(this.document.body, "spellcheck");
	},
	_setDisableSpellCheckAttr: function(/*Boolean*/ disabled){
		if(this.document){
			dojo.attr(this.document.body, "spellcheck", !disabled);
		}else{
			// try again after the editor is finished loading 
			this.onLoadDeferred.addCallback(dojo.hitch(this, function(){
				dojo.attr(this.document.body, "spellcheck", !disabled);
			}));
		}
	},

	onKeyPress: function(e){
		// summary:
		//		Handle the various key events
		// tags:
		//		protected

		//console.debug("keyup char:", e.keyChar, e.ctrlKey);
		var c = (e.keyChar && e.keyChar.toLowerCase()) || e.keyCode;
		var handlers = this._keyHandlers[c];
		//console.debug("handler:", handlers);
		var args = arguments;
		if(handlers){
			dojo.forEach(handlers, function(h){
				if((!!h.shift == !!e.shiftKey)&&(!!h.ctrl == !!e.ctrlKey)){
					if(!h.handler.apply(this, args)){
						e.preventDefault();
					}
					// break;
				}
			}, this);
		}

		// function call after the character has been inserted
		if(!this._onKeyHitch){
			this._onKeyHitch=dojo.hitch(this, "onKeyPressed");
		}
		setTimeout(this._onKeyHitch, 1);
		return true;
	},

	addKeyHandler: function(/*String*/ key, /*Boolean*/ ctrl, /*Boolean*/ shift, /*Function*/ handler){
		// summary:
		//		Add a handler for a keyboard shortcut
		// description:
		//		The key argument should be in lowercase if it is a letter character
		// tags:
		//		protected
		if(!dojo.isArray(this._keyHandlers[key])){
			this._keyHandlers[key] = [];
		}
		this._keyHandlers[key].push({
			shift: shift || false,
			ctrl: ctrl || false,
			handler: handler
		});
	},

	onKeyPressed: function(){
		// summary:
		//		Handler for after the user has pressed a key, and the display has been updated.
		//		(Runs on a timer so that it runs after the display is updated)
		// tags:
		//		private
		this.onDisplayChanged(/*e*/); // can't pass in e
	},

	onClick: function(/*Event*/ e){
		// summary:
		//		Handler for when the user clicks.
		// tags:
		//		private

		this.onDisplayChanged(e);
	},

	_onIEMouseDown: function(/*Event*/ e){
		// summary:
		//		IE only to prevent 2 clicks to focus
		// tags:
		//		protected

		if(!this._focused && !this.disabled){
			this.focus();
		}
	},

	_onBlur: function(e){
		// summary:
		//		Called from focus manager when focus has moved away from this editor
		// tags:
		//		protected

		this.inherited(arguments);
		var _c=this.getValue(true);
		
		if(_c!=this.savedContent){
			this.onChange(_c);
			this.savedContent=_c;
		}
		if(this.iframe){
			var titleObj = this.iframe.contentDocument || this.iframe; // NOTE: Duplication

			if (this._localizedIframeTitles) {
				titleObj.title = this._localizedIframeTitles.iframeEditTitle;
			}
		} 

	},
	_onFocus: function(/*Event*/ e){
		// summary:
		//		Called from focus manager when focus has moved into this editor
		// tags:
		//		protected

		if(!this.disabled){
			if(!this._disabledOK){
				this.attr('disabled', false);
			}
			this.inherited(arguments);
		}
	},

	// TODO: why is this needed - should we deprecate this ?
	blur: function(){
		// summary:
		//		Remove focus from this instance.
		// tags:
		//		deprecated
		if(this.window.document.documentElement && this.window.document.documentElement.focus){
			this.window.document.documentElement.focus();
		}else if(this.window.document.body.focus){
			this.window.document.body.focus();
		}
	},

	focus: function(){
		// summary:
		//		Move focus to this editor

		// NOTE: dijit.focus was screwing up the save/restore selection in IE

		this.iframe.contentWindow.focus();
		this.editNode.focus();
		
		// editNode may be hidden in display:none div, lets just punt in this case
		// this.editNode.focus(); -> causes IE to scroll always (strict and quirks mode) to the top the Iframe 
		// if we fire the event manually and let the browser handle the focusing, the latest  
		// cursor position is focused like in FF

		// NOTE: Not working (shouldn't use IFrame-based editors)

		//this.editNode.fireEvent('onfocus', document.createEventObject()); // createEventObject only in IE
	},

	// _lastUpdate: 0,
	updateInterval: 200,
	_updateTimer: null,
	onDisplayChanged: function(/*Event*/ e){
		// summary:
		//		This event will be fired everytime the display context
		//		changes and the result needs to be reflected in the UI.
		// description:
		//		If you don't want to have update too often,
		//		onNormalizedDisplayChanged should be used instead
		// tags:
		//		private

		// var _t=new Date();
		if(this._updateTimer){
			window.clearTimeout(this._updateTimer);
		}
		if(!this._updateHandler){
			this._updateHandler = dojo.hitch(this,"onNormalizedDisplayChanged");
		}
		this._updateTimer = window.setTimeout(this._updateHandler, this.updateInterval);
	},
	onNormalizedDisplayChanged: function(){
		// summary:
		//		This event is fired every updateInterval ms or more
		// description:
		//		If something needs to happen immediately after a
		//		user change, please use onDisplayChanged instead.
		// tags:
		//		private
		delete this._updateTimer;
	},
	onChange: function(newContent){
		// summary:
		//		This is fired if and only if the editor loses focus and
		//		the content is changed.
	},
	_verifiedCommands: {},
	_substituteCommand: function(command, substitute) {
		if (this._verifiedCommands[command]) {
			return this._verifiedCommands[command];
		}
		
		try {
			(this.document.queryCommandValue(command));
			substitute = command;
		} catch(e) {}

		this._verifiedCommands[command] = substitute;
		return substitute;
	},
	_normalizeCommand: function(/*String*/ cmd){

		// summary:
		//		Used as the advice function by dojo.connect to map our
		//		normalized set of commands to those supported by the target
		//		browser.
		// tags:
		//		private

		var substitute, command = cmd.toLowerCase();
		switch(command) {
		case "formatblock":
			substitute = "heading";			
		case "hilitecolor":
			substitute = "backcolor";
		}
		return substitute ? this._substituteCommand(command, substitute) : command;
	},

	_qcaCache: {},
	queryCommandAvailable: function(/*String*/ command){

		// summary:
		//		Tests whether a command is supported by the host. Clients
		//		SHOULD check whether a command is supported before attempting
		//		to use it, behaviour for unsupported commands is undefined.
		// command:
		//		The command to test for
		// tags:
		//		private

		// memoizing version. See _queryCommandAvailable for computing version

		var ca = this._qcaCache[command];
		if(ca !== undefined && ca !== null){ return ca; }
		return (this._qcaCache[command] = this._queryCommandAvailable(command));
	},
	
	_queryCommandAvailable: function(/*String*/ command){
		// summary:
		//		See queryCommandAvailable().
		// tags:
		//		private

		// NOTE: Deprecated

		return true;
	},

	execCommand: function(/*String*/ command, argument){
		// summary:
		//		Executes a command in the Rich Text area
		// command:
		//		The command to execute
		// argument:
		//		An optional argument to the command
		// tags:
		//		protected

		var returnValue;

		// focus() is required for IE to work
		// In addition, focus() makes sure after the execution of
		// the command, the editor receives the focus as expected

		this.focus();

		command = this._normalizeCommand(command);

		if (command == "formatblock") {
			try {
				returnValue = this.document.execCommand(command, false, '<' + argument + '>');
			} catch(e) {
				returnValue = this.document.execCommand(command, false, argument);
			}
		} else if (command == "inserthtml") {

			// TODO: we shall probably call _preDomFilterContent here as well

			argument = this._preFilterContent(argument);
			returnValue = true;
			if (this.document.selection) {
				var insertRange = this.document.selection.createRange();
				if(this.document.selection.type.toUpperCase() == 'CONTROL'){
					var n=insertRange.item(0);
					while(insertRange.length){
						insertRange.remove(insertRange.item(0));
					}
					n.outerHTML=argument;
				}else{
					insertRange.pasteHTML(argument);
				}
				insertRange.select();
			} else if (!argument.length) {

				// Can not inserthtml an empty html to delete current selection
				// so delete the selection instead in this case

				this._sCall("remove"); // FIXME
			} else {
				returnValue = this.document.execCommand(command, false, argument);
			}
		} else if(command == "unlink" &&
			this.queryCommandEnabled("unlink"))
		{
			// fix up unlink in Mozilla to unlink the link and not just the selection

			// select our link and unlink

			var a = this._sCall("getAncestorElement", [ "a" ]);
			this._sCall("selectElement", [ a ]);

			returnValue = this.document.execCommand("unlink", false, null);
		} else if (command == "hilitecolor") {

			// mozilla doesn't support hilitecolor properly when useCSS is
			// set to false (bugzilla #279330)

			try {
				this.document.execCommand("styleWithCSS", false, true);
			} catch(e) {}
			returnValue = this.document.execCommand(command, false, argument);
			try {
				this.document.execCommand("styleWithCSS", false, false);
			} catch(e) {}
		} else {
			argument = argument !== undefined ? argument : null;
			returnValue = this.document.execCommand(command, false, argument);
		}

		this.onDisplayChanged();
		return returnValue;
	},

	queryCommandEnabled: function(/*String*/ command){
		// summary:
		//		Check whether a command is enabled or not.
		// tags:
		//		protected
		if(this.disabled || !this._disabledOK){ return false; }
		command = this._normalizeCommand(command);

		if(command == "unlink"){ // mozilla always returns true
			return !!this._sCall("hasAncestorElement", ["a"]);
		}else if(command == "inserttable"){
			//return true;
		}

		return ((this.document.selection && dojo.isHostMethod(this.document.selection, 'createRange')) ? this.document.selection.createRange() : this.document).queryCommandEnabled(command);
	},

	queryCommandState: function(command){
		// summary:
		//		Check the state of a given command and returns true or false.
		// tags:
		//		protected

		if(this.disabled || !this._disabledOK){ return false; }
		command = this._normalizeCommand(command);
		return this.document.queryCommandState(command);
	},

	queryCommandValue: function(command){
		// summary:
		//		Check the value of a given command. This matters most for
		//		custom selections and complex values like font value setting.
		// tags:
		//		protected

		if(this.disabled || !this._disabledOK){ return false; }
		var r;
		command = this._normalizeCommand(command);
		r = this.document.queryCommandValue(command);
		if(this._native2LocalFormatNames[r]){
			r = this._native2LocalFormatNames[r];
		}
		return r;
	},

	// Misc.

	_sCall: function(name, args){
		// summary:
		//		Run the named method of dijit._editor.selection over the
		//		current editor instance's window, with the passed args.
		// tags:
		//		private
		return dojo.withGlobal(this.window, dijit._editor.selection, name, args);
	},

	// FIXME: this is a TON of code duplication. Why?

	placeCursorAtStart: function(){
		// summary:
		//		Place the cursor at the start of the editing area.
		// tags:
		//		private

		this.focus();

		//see comments in placeCursorAtEnd
		var isvalid=false;
		//if(dojo.isMoz){
			var first=this.editNode.firstChild;
			while(first){
				if(first.nodeType == 3){
					if(first.nodeValue.replace(/^\s+|\s+$/g, "").length>0){
						isvalid=true;
						this._sCall("selectElement", [ first ]);
						break;
					}
				}else if(first.nodeType == 1){
					isvalid=true;
					this._sCall("selectElementChildren", [ first ]);
					break;
				}
				first = first.nextSibling;
			}
		//}else{
		//	isvalid=true;
		//	this._sCall("selectElementChildren", [ this.editNode ]);
		//}
		if(isvalid){
			this._sCall("collapse", [ true ]);
		}
	},

	placeCursorAtEnd: function(){
		// summary:
		//		Place the cursor at the end of the editing area.
		// tags:
		//		private

		this.focus();

		//In mozilla, if last child is not a text node, we have to use
		// selectElementChildren on this.editNode.lastChild otherwise the
		// cursor would be placed at the end of the closing tag of
		//this.editNode.lastChild
		var isvalid=false;
		//if(dojo.isMoz){
			var last=this.editNode.lastChild;
			while(last){
				if(last.nodeType == 3){
					if(last.nodeValue.replace(/^\s+|\s+$/g, "").length>0){
						isvalid=true;
						this._sCall("selectElement", [ last ]);
						break;
					}
				}else if(last.nodeType == 1){
					isvalid=true;
					if(last.lastChild){
						this._sCall("selectElement", [ last.lastChild ]);
					}else{
						this._sCall("selectElement", [ last ]);
					}
					break;
				}
				last = last.previousSibling;
			}
		//}else{
		//	isvalid=true;
		//	this._sCall("selectElementChildren", [ this.editNode ]);
		//}
		if(isvalid){
			this._sCall("collapse", [ false ]);
		}
	},

	getValue: function(/*Boolean?*/ nonDestructive){
		// summary:
		//		Return the current content of the editing area (post filters
		//		are applied).  Users should call attr('value') instead.
		//	nonDestructive:
		//		defaults to false. Should the post-filtering be run over a copy
		//		of the live DOM? Most users should pass "true" here unless they
		//		*really* know that none of the installed filters are going to
		//		mess up the editing session.
		// tags:
		//		private
		if(this.textarea){
			if(this.isClosed || !this.isLoaded){
				return this.textarea.value;
			}
		}

		return this._postFilterContent(null, nonDestructive);
	},
	_getValueAttr: function(){
		// summary:
		//		Hook to make attr("value") work
		return this.getValue();
	},

	setValue: function(/*String*/ html){
		// summary:
		//		This function sets the content. No undo history is preserved.
		//		Users should use attr('value', ...) instead.
		// tags:
		//		deprecated

		// TODO: remove this and getValue() for 2.0, and move code to _setValueAttr()

		if(!this.isLoaded){ 
			// try again after the editor is finished loading 
			this.onLoadDeferred.addCallback(dojo.hitch(this, function(){ 
				this.setValue(html); 
			})); 
			return;
		} 
		if(this.textarea && (this.isClosed || !this.isLoaded)){
			this.textarea.value=html;
		}else{
			html = this._preFilterContent(html);
			var node = this.isClosed ? this.domNode : this.editNode;
			node.innerHTML = html;
			this._preDomFilterContent(node);
		}
		this.onDisplayChanged();
	},

	replaceValue: function(/*String*/ html){
		// summary:
		//		This function set the content while trying to maintain the undo stack
		//		(now only works fine with Moz, this is identical to setValue in all
		//		other browsers)
		// tags:
		//		protected

		if(this.isClosed){
			this.setValue(html);
		}else if(this.window && this.window.getSelection && !dojo.isMoz){ // Safari
			// look ma! it's a totally f'd browser!
			this.setValue(html);
		}else if(this.window && this.window.getSelection){ // Moz
			html = this._preFilterContent(html);
			this.execCommand("selectall");
			if(!html){ html = "&nbsp;"; }
			this.execCommand("inserthtml", html);
			this._preDomFilterContent(this.editNode);
		}else if(this.document && this.document.selection){//IE
			//In IE, when the first element is not a text node, say
			//an <a> tag, when replacing the content of the editing
			//area, the <a> tag will be around all the content
			//so for now, use setValue for IE too
			this.setValue(html);
		}
	},

	_preFilterContent: function(/*String*/ html){
		// summary:
		//		Filter the input before setting the content of the editing
		//		area. DOM pre-filtering may happen after this
		//		string-based filtering takes place but as of 1.2, this is not
		//		guaranteed for operations such as the inserthtml command.
		// tags:
		//		private

		var ec = html;
		dojo.forEach(this.contentPreFilters, function(ef){ if(ef){ ec = ef(ec); } });
		return ec;
	},
	_preDomFilterContent: function(/*DomNode*/ dom){
		// summary:
		//		filter the input's live DOM. All filter operations should be
		//		considered to be "live" and operating on the DOM that the user
		//		will be interacting with in their editing session.
		// tags:
		//		private
		dom = dom || this.editNode;
		dojo.forEach(this.contentDomPreFilters, function(ef){
			if(ef && dojo.isFunction(ef)){
				ef(dom);
			}
		}, this);
	},

	_postFilterContent: function(
		/*DomNode|DomNode[]|String?*/ dom,
		/*Boolean?*/ nonDestructive){
		// summary:
		//		filter the output after getting the content of the editing area
		//
		//	description:
		//		post-filtering allows plug-ins and users to specify any number
		//		of transforms over the editor's content, enabling many common
		//		use-cases such as transforming absolute to relative URLs (and
		//		vice-versa), ensuring conformance with a particular DTD, etc.
		//		The filters are registered in the contentDomPostFilters and
		//		contentPostFilters arrays. Each item in the
		//		contentDomPostFilters array is a function which takes a DOM
		//		Node or array of nodes as its only argument and returns the
		//		same. It is then passed down the chain for further filtering.
		//		The contentPostFilters array behaves the same way, except each
		//		member operates on strings. Together, the DOM and string-based
		//		filtering allow the full range of post-processing that should
		//		be necessaray to enable even the most agressive of post-editing
		//		conversions to take place.
		//
		//		If nonDestructive is set to "true", the nodes are cloned before
		//		filtering proceeds to avoid potentially destructive transforms
		//		to the content which may still needed to be edited further.
		//		Once DOM filtering has taken place, the serialized version of
		//		the DOM which is passed is run through each of the
		//		contentPostFilters functions.
		//
		//	dom:
		//		a node, set of nodes, which to filter using each of the current
		//		members of the contentDomPostFilters and contentPostFilters arrays. 
		//
		//	nonDestructive:
		//		defaults to "false". If true, ensures that filtering happens on
		//		a clone of the passed-in content and not the actual node
		//		itself.
		//
		// tags:
		//		private

		var ec;
		if(!dojo.isString(dom)){
			dom = dom || this.editNode;
			if(this.contentDomPostFilters.length){
				if(nonDestructive){
					dom = dojo.clone(dom);
				}
				dojo.forEach(this.contentDomPostFilters, function(ef){
					dom = ef(dom);
				});
			}
			ec = dijit._editor.getChildrenHtml(dom);
		}else{
			ec = dom;
		}

		if(!dojo.trim(ec.replace(/^\xA0\xA0*/, '').replace(/\xA0\xA0*$/, '')).length){
			ec = "";
		}

		//	if(dojo.isIE){
		//		//removing appended <P>&nbsp;</P> for IE
		//		ec = ec.replace(/(?:<p>&nbsp;</p>[\n\r]*)+$/i,"");
		//	}
		dojo.forEach(this.contentPostFilters, function(ef){
			ec = ef(ec);
		});

		return ec;
	},

	_saveContent: function(/*Event*/ e){
		// summary:
		//		Saves the content in an onunload event if the editor has not been closed
		// tags:
		//		private

		var saveTextarea = dojo.byId(dijit._scopeName + "._editor.RichText.savedContent");
		saveTextarea.value += this._SEPARATOR + this.name + ":" + this.getValue();
	},


	escapeXml: function(/*String*/ str, /*Boolean*/ noSingleQuotes){
		// summary:
		//		Adds escape sequences for special characters in XML: &<>"'
		//		Optionally skips escapes for single quotes
		// tags:
		//		private

		str = str.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
		if(!noSingleQuotes){
			str = str.replace(/'/gm, "&#39;");
		}
		return str; // string
	},

	getNodeHtml: function(/* DomNode */ node){
		// summary:
		//		Deprecated.   Use dijit._editor._getNodeHtml() instead.
		// tags:
		//		deprecated
		dojo.deprecated('dijit.Editor::getNodeHtml is deprecated','use dijit._editor.getNodeHtml instead', 2);
		return dijit._editor.getNodeHtml(node); // String
	},

	getNodeChildrenHtml: function(/* DomNode */ dom){
		// summary:
		//		Deprecated.   Use dijit._editor.getChildrenHtml() instead.
		// tags:
		//		deprecated
		dojo.deprecated('dijit.Editor::getNodeChildrenHtml is deprecated','use dijit._editor.getChildrenHtml instead', 2);
		return dijit._editor.getChildrenHtml(dom);
	},

	close: function(/*Boolean*/ save, /*Boolean*/ force){
		// summary:
		//		Kills the editor and optionally writes back the modified contents to the
		//		element from which it originated.
		// save:
		//		Whether or not to save the changes. If false, the changes are discarded.
		// force: Boolean
		//		Unused.  TODO: remove for 2.0
		// tags:
		//		private

		if(this.isClosed){return false; }

		if(!arguments.length){ save = true; }
		this._content = this.getValue();
		var changed = (this.savedContent != this._content);

		if(this.interval){ clearInterval(this.interval); }

		if(this.textarea){
			var s = this.textarea.style;
			s.position = "";
			s.left = s.top = "";
			if(this.__overflow){
				s.overflow = this.__overflow;
				this.__overflow = null;
			}
			this.textarea.value = save ? this._content : this.savedContent;
			dojo.destroy(this.domNode);
			this.domNode = this.textarea;
		}else{
			// if(save){
			// why we treat moz differently? comment out to fix #1061
			//		if(dojo.isMoz){
			//			var nc = dojo.doc.createElement("span");
			//			this.domNode.appendChild(nc);
			//			nc.innerHTML = this.editNode.innerHTML;
			//		}else{
			//			this.domNode.innerHTML = this._content;
			//		}
			// }
			this.domNode.innerHTML = save ? this._content : this.savedContent;
		}

		dojo.removeClass(this.domNode, "RichTextEditable");
		this.isClosed = true;
		this.isLoaded = false;
		// FIXME: is this always the right thing to do?
		delete this.editNode;

		if(this.window && this.window._frameElement){
			this.window._frameElement = null;
		}

		this.window = this.document = this.editingArea = this.editorObject = null;

		if (this.iframe) {
			this.iframe.onfocus = this.iframe._loadFunc = null;
		}

		return changed; // Boolean: whether the content has been modified
	},

	destroyRendering: function(){
		// summary: stub	
	}, 

	destroy: function(){
		//this.destroyRendering();
		if(!this.isClosed){ this.close(false); }
		this.inherited(arguments);
	},

	_removeMozBogus: function(/* String */ html){
		// summary:
		//		Post filter to remove unwanted HTML attributes generated by mozilla
		// tags:
		//		private
		return html.replace(/\stype="_moz"/gi, '').replace(/\s_moz_dirty=""/gi, ''); // String
	},
	_removeSafariBogus: function(/* String */ html){
		// summary:
		//		Post filter to remove unwanted HTML attributes generated by webkit
		// tags:
		//		private
		return html.replace(/\sclass="webkit-block-placeholder"/gi, ''); // String
	},
	_fixContentForMoz: function(/* String */ html){
		// summary:
		//		Pre-filter for mozilla.
		// description:
		//		Moz can not handle strong/em tags correctly, convert them to b/i
		// tags:
		//		private
		return html.replace(/<(\/)?strong([ \>])/gi, '<$1b$2')
			.replace(/<(\/)?em([ \>])/gi, '<$1i$2' ); // String
	},

	_preFixUrlAttributes: function(/* String */ html){
		// summary:
		//		Pre-filter to do fixing to href attributes on <a> and <img> tags
		// tags:
		//		private
		return html.replace(/(?:(<a(?=\s).*?\shref=)("|')(.*?)\2)|(?:(<a\s.*?href=)([^"'][^ >]+))/gi, 
				'$1$4$2$3$5$2 _djrealurl=$2$3$5$2')
			.replace(/(?:(<img(?=\s).*?\ssrc=)("|')(.*?)\2)|(?:(<img\s.*?src=)([^"'][^ >]+))/gi, 
				'$1$4$2$3$5$2 _djrealurl=$2$3$5$2'); // String
	}
});

dojo.provided("dijit._editor.RichText");

});