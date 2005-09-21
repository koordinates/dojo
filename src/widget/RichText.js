dojo.provide("dojo.widget.RichText");
dojo.provide("dojo.widget.HtmlRichText");

dojo.require("dojo.widget.*");
dojo.require("dojo.dom");
dojo.require("dojo.html");
dojo.require("dojo.event.*");
dojo.require("dojo.style");

// used to save content
document.write('<textarea id="dojo.widget.RichText.savedContent" style="display:none;position:absolute;top:-100px;left:-100px;"></textarea>');

dojo.widget.tags.addParseTreeHandler("dojo:richtext");

dojo.widget.HtmlRichText = function () {
	dojo.widget.HtmlWidget.call(this);
}

dojo.inherits(dojo.widget.HtmlRichText, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.HtmlRichText, {

	widgetType: "richtext",

	/** whether to inherit the parent's width or simply use 100% */
	inheritWidth: false,
	
	/**
	 * If a save name is specified the content is saved and restored if the
	 * editor is not properly closed after editing has started.
	 */
	saveName: "",
	
	/** The minimum height that the editor should have */
	minHeight: "1em",
	
	isClosed: true,
	
	_SEPARATOR: "@@**%%__RICHTEXTBOUNDRY__%%**@@",

/* Init
 *******/

	fillInTemplate: function () {
		this.open();

		// add the formatting functions
		var funcs = ["queryCommandEnabled", "queryCommandState",
			"queryCommandValue", "execCommand"];
		for (var i = 0; i < funcs.length; i++) {
			dojo.event.connect("around", this, funcs[i], this, "_normalizeCommand");
		}
	},

	/**
	 * Transforms the node referenced in this.domNode into a rich text editing
	 * node. This can result in the creation and replacement with an <iframe> if
	 * designMode is used, an <object> and active-x component if inside of IE or
	 * a reguler element if contentEditable is available.
	 */
	open: function (element) {
		if (!this.isClosed) { this.close(); }
		if (arguments.length == 1) { this.domNode = element; } // else unchanged
		
		var html = this.domNode[this.domNode.nodeName == "TEXTAREA" ? "value" : "innerHTML"];
		
		this.savedContent = document.createElement("div");
		while (this.domNode.hasChildNodes()) {
			this.savedContent.appendChild(this.domNode.firstChild);
		}
		
		// If we're a list item we have to put in a blank line to force the
		// bullet to nicely align at the top of text
		if (this.domNode.nodeName == "LI") { this.domNode.innerHTML = " <br>"; }
				
		if (this.saveName != "") {
			var saveTextarea = document.getElementById("dojo.widget.RichText.savedContent");
			if (saveTextarea.value != "") {
				var datas = saveTextarea.value.split(this._SEPARATOR);
				for (var i = 0; i < datas.length; i++) {
					var data = datas[i].split(":");
					if (data[0] == this.saveName) {
						html = data[1];
						datas.splice(i, 1);
						break;
					}
				}				
			}
			this.connect(window, "onunload", "_saveContent");
		}

		// Safari's selections go all out of whack if we do it inline,
		// so for now IE is our only hero
		//if (typeof document.body.contentEditable != "undefined") {
		if (false && dojo.render.html.ie) { // active-x
			this._drawObject(html);
		} else if (dojo.render.html.ie) { // contentEditable, easy
			this.editNode = document.createElement("div");
			with (this.editNode) {
				contentEditable = true;
				innerHTML = html;
				style.height = this.minHeight;
			}
			this.domNode.appendChild(this.editNode);
			
			var events = ["onBlur", "onFocus", "keyPress",
				"keyDown", "keyUp", "onClick"];
			for (var i = 0; i < events.length; i++) {
				this.connect(this.editNode, events[i].toLowerCase(), events[i]);
			}
		
			this.window = window;
			this.document = document;
		} else { // designMode in iframe
			this._drawIframe(html);
		}

		// TODO: this is a guess at the default line-height, kinda works
		if (this.domNode.nodeName == "LI") { this.domNode.lastChild.style.marginTop = "-1.2em"; }
		dojo.html.addClass(this.domNode, "RichTextEditable");
		
		this.focus();
		this.isClosed = false;
		dojo.event.topic.publish("dojo.widget.RichText::open", this);
	},
	
	/** Draws an iFrame using the existing one if one exists. Used by Mozilla and Safari */
	_drawIframe: function (html) {
		var oldHeight = dojo.style.getContentHeight(this.domNode);
		var oldWidth = dojo.style.getContentWidth(this.domNode);

		if (!this.iframe) {
			this.iframe = document.createElement("iframe");
			with (this.iframe) {
				width = this.inheritWidth ? oldWidth : "100%";
				height = oldHeight;
				scrolling = "no";
				style.border = "none";
				style.lineHeight = "0"; // squash line height
				style.verticalAlign = "bottom";
			}
		} else {
			with (this.iframe) {
				width = this.inheritWidth ? oldWidth : "100%";
				height = oldHeight;
			}
		}
		
		this.domNode.appendChild(this.iframe);

		if (!this.editNode) {
			this.window = this.iframe.contentWindow;
			this.document = this.iframe.contentDocument;
	
			// curry the getStyle function
			var getStyle = (function (domNode) { return function (style) {
				return dojo.style.getStyle(domNode, style);
			}; })(this.domNode);
			var font = getStyle('font-size') + " " + getStyle('font-family');
	
			var contentEditable = Boolean(document.body.contentEditable);
			with (this.document) {
				if (!contentEditable) { designMode = "on"; }
				open();
				write(
					//'<!doctype HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">' +
					'<title></title>\n' +
					'<style type="text/css">\n' +
					'    body,html { padding: 0; margin: 0; font: ' + font + '; }\n' +
					// TODO: left positioning will case contents to disappear out of view
					//       if it gets too wide for the visible area
					'    body { position: fixed; top: 0; left: 0; right: 0;' +
					'        min-height: ' + this.minHeight + '; }\n' +
					'    p { margin: 1em 0 !important; }\n' +
					'    body > *:first-child { padding-top: 0 !important; margin-top: 0 !important; }\n' +
					'    body > *:last-child { padding-bottom: 0 !important; margin-bottom: 0 !important; }\n' +
					'    li > ul:-moz-first-node, li > ol:-moz-first-node { padding-top: 1.2em; }\n' +
					'    li { min-height: 1.2em; }\n' +
					//'    p,ul,li { padding-top: 0; padding-bottom: 0; margin-top:0; margin-bottom: 0; }\n' +
					'</style>\n' +
					//'<base href="' + window.location + '">' +
					'<body' + (contentEditable ? ' contentEditable="true"' : '') + '>' +
					html + '</body>');
				close();
			}
			this.editNode = this.document.body;
	
			try { // sanity check for Mozilla
				this.document.execCommand("useCSS", false, true); // old moz call
				this.document.execCommand("styleWithCSS", false, false); // new moz call
				//this.document.execCommand("insertBrOnReturn", false, false); // new moz call
			} catch (e) { }
			
			// FIXME: when scrollbars appear/disappear this needs to be fired
			if (!dojo.render.html.safari) {
				this.connect(this, "afterKeyPress", "_updateHeight");
				this.connect(this, "onClick", "_updateHeight");
				this.connect(this, "execCommand", "_updateHeight");
			} else {
				var editor = this;
				this.interval = setInterval(function () {
					editor.onDisplayChanged();
					editor._updateHeight();
				}, 500);
			}
			
			// I need hitch, dammit!!
			function hitch (obj, meth) {
				return function () { return obj[meth].apply(obj, arguments); }
			}
			
			var onBlur = hitch(this, "onBlur");
			var doc = this.document;
			var blurfp = dojo.event.browser.addListener(this.document, "blur", onBlur);
			var unBlur = { 
				unBlur: function(e){
					dojo.event.browser.removeListener(doc, "blur", blurfp);
				}
			};
			dojo.event.connect("before", this, "close", unBlur, "unBlur");
			dojo.event.browser.addListener(this.document, "focus", hitch(this, "onFocus"));

			if (dojo.render.html.mozilla) {
				// safari can't handle key listeners, it kills the speed
				var addListener = dojo.event.browser.addListener;
				addListener(this.document, "keypress", hitch(this, "keyPress"));
				addListener(this.document, "keydown", hitch(this, "keyDown"));
				addListener(this.document, "keyup", hitch(this, "keyUp"));
				addListener(this.document, "click", hitch(this, "onClick"));
			}


		} else {
			this.editNode.innerHTML = html;
		}
		
		this._updateHeight();
	},

	/** Draws an active x object, used by IE */
	_drawObject: function (html) {
		var oldHeight = dojo.style.getContentHeight(this.domNode);
		var oldWidth = dojo.style.getContentWidth(this.domNode);

		this.object = document.createElement("object");
		with (this.object) {
			classid = "clsid:2D360201-FFF5-11D1-8D03-00A0C959BC0A";
			width = this.inheritWidth ? oldWidth : "100%";
			height = oldHeight;
			Scrollbars = false;
			Appearance = this._activeX.appearance.flat;
		}
		this.domNode.appendChild(this.object);

		var editor = this;
		this.object.attachEvent("DocumentComplete", function () {
			editor.document = editor.object.DOM;
			editor.editNode = editor.document.body.firstChild;
		});
		
		this.object.attachEvent("DisplayChanged", hitch(this, "_updateHeight"));

		this.object.DocumentHTML = '<!doctype HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">' +
			'<title></title>' +
			'<style type="text/css">' +
			'    body,html { padding: 0; margin: 0; }' + //font: ' + font + '; }' +
			'    body { overflow: hidden; }' +
			//'    #bodywrapper {  }' +
			'</style>' +
			//'<base href="' + window.location + '">' +
			'<body><div id="bodywrapper">' + html + '</div></body>';
	},

/* Event handlers
 *****************/

	/** Fired on keydown */
	keyDown: function (e) {
		// we need this event at the moment to get the events from control keys
		// such as the backspace. It might be possible to add this to Dojo, so that
		// keyPress events can be emulated by the keyDown and keyUp detection.
	},
	
	/** Fired on keyup */
	keyUp: function (e) {
	},
	
	/** Fired on keypress. */
	keyPress: function (e) {
		// handle the various key events

		var character = e.charCode > 0 ? String.fromCharCode(e.charCode) : null;
		var code = e.keyCode;
				
		var preventDefault = true; // by default assume we cancel;

		// define some key combos
		if (e.ctrlKey || e.metaKey) { // modifier pressed
			switch (character) {
				case "b": this.execCommand("bold"); break;
				case "i": this.execCommand("italic"); break;
				case "u": this.execCommand("underline"); break;
				//case "a": this.execCommand("selectall"); break;
				//case "k": this.execCommand("createlink", ""); break;
				case "Z": this.execCommand("redo"); break;
				case "s": this.close(true); break; // saves
				default: switch (code) {
					case e.KEY_LEFT_ARROW:
					case e.KEY_RIGHT_ARROW:
						//break; // preventDefault stops the browser
						       // going through its history
					default:
						preventDefault = false; break; // didn't handle here
				}
			}
		} else {
			switch (code) {
				case e.KEY_TAB:
					this.execCommand(e.shiftKey ? "unindent" : "indent");
					break;
				default:
					preventDefault = false; break; // didn't handle here
			}
		}
		
		if (preventDefault) { e.preventDefault(); }

		// function call after the character has been inserted
		dojo.lang.setTimeout(this, this.afterKeyPress, 1, e);
	},
	
	/**
	 * Fired after a keypress event has occured and it's action taken. This
	 * is useful if action needs to be taken after text operations have
	 * finished
	 */
	afterKeyPress: function (e) {
		// Mozilla adds a single <p> with an embedded <br> when you hit enter once:
		//   <p><br>\n</p>
		// when you hit enter again it adds another <br> inside your enter
		//   <p><br>\n<br>\n</p>
		// and if you hit enter again it splits the <br>s over 2 <p>s
		//   <p><br>\n</p>\n<p><br>\n</p>
		// now this assumes that <p>s have double the line-height of <br>s to work
		// and so we need to remove the <p>s to ensure the position of the cursor
		// changes from the users perspective when they hit enter, as the second two
		// html snippets render the same when margins are set to 0.
		
		// TODO: doesn't really work; is this really needed?
		//if (dojo.render.html.moz) {
		//	for (var i = 0; i < this.document.getElementsByTagName("p").length; i++) {
		//		var p = this.document.getElementsByTagName("p")[i];
		//		if (p.innerHTML.match(/^<br>\s$/m)) {
		//			while (p.hasChildNodes()) { p.parentNode.insertBefore(p.firstChild, p); }
		//			p.parentNode.removeChild(p);
		//		}
		//	}
		//}
		this.onDisplayChanged(/*e*/); // can't pass in e
	},
	
	onClick: function (e) { this.onDisplayChanged(e); },
	
	onBlur: function (e) {},
	onFocus: function (e) {},

	blur: function () {
		if (this.iframe) { this.window.blur(); } else { this.editNode.blur(); }
	},
	
	focus: function () {
		if (this.iframe) { this.window.focus(); } else { this.editNode.focus(); }
	},
	
	/** this event will be fired everytime the display context changes and the
	 result needs to be reflected in the UI */
	onDisplayChanged: function (e) {},
	

/* Formatting commands
 **********************/
	
	/** IE's Active X codes */
	_activeX: {
		command: {
			bold: 5000,
			italic: 5023,
			underline: 5048,

			justifycenter: 5024,
			justifyleft: 5025,
			justifyright: 5026,

			cut: 5003,
			copy: 5002,
			paste: 5032,
			"delete": 5004,

			undo: 5049,
			redo: 5033,

			removeformat: 5034,
			selectall: 5035,
			unlink: 5050,

			indent: 5018,
			outdent: 5031,

			insertorderedlist: 5030,
			insertunorderedlist: 5051,

			// table commands
			inserttable: 5022,
			insertcell: 5019,
			insertcol: 5020,
			insertrow: 5021,
			deletecells: 5005,
			deletecols: 5006,
			deleterows: 5007,
			mergecells: 5029,
			splitcell: 5047,
			
			// the command need mapping, they don't translate directly
			// to the contentEditable commands
			setblockformat: 5043,
			getblockformat: 5011,
			getblockformatnames: 5012,
			setfontname: 5044,
			getfontname: 5013,
			setfontsize: 5045,
			getfontsize: 5014,
			setbackcolor: 5042,
			getbackcolor: 5010,
			setforecolor: 5046,
			getforecolor: 5015,
			
			findtext: 5008,
			font: 5009,
			hyperlink: 5016,
			image: 5017,
			
			lockelement: 5027,
			makeabsolute: 5028,
			sendbackward: 5036,
			bringforward: 5037,
			sendbelowtext: 5038,
			bringabovetext: 5039,
			sendtoback: 5040,
			bringtofront: 5041,
			
			properties: 5052
		},
		
		ui: {
			"default": 0,
			prompt: 1,
			noprompt: 2
		},
		
		status: {
			notsupported: 0,
			disabled: 1,
			enabled: 3,
			latched: 7,
			ninched: 11
		},
		
		appearance: {
			flat: 0,
			inset: 1
		},
		
		state: {
			unchecked: 0,
			checked: 1,
			gray: 2
		}
	},
	
	/**
	 * Used as the advice function by dojo.event.connect to map our
	 * normalized set of commands to those supported by the target
	 * browser
	 *
	 * @param arugments The arguments Array, containing at least one
	 *                  item, the command and an optional second item,
	 *                  an argument.
	 */
	_normalizeCommand: function (joinObject){
		var safari = dojo.render.html.safari, mozilla = dojo.render.html.mozilla;
		
		var command = joinObject.args[0].toLowerCase();
		if (command == "formatblock" && safari) { command = "heading"; }
		if (command == "hilitecolor" && !mozilla) { command = "backcolor"; }
		joinObject.args[0] = command;
		
		if (joinObject.args.length > 1) { // a command was specified
			var argument = joinObject.args[1];
			if (command == "heading") { throw new Error("unimplemented"); }
			joinObject.args[1] = argument;
		}
		
		return joinObject.proceed();
	},
	
	/**
	 * Tests whether a command is supported by the host. Clients SHOULD check
	 * whether a command is supported before attempting to use it, behaviour
	 * for unsupported commands is undefined.
	 *
	 * @param command The command to test for
	 * @return true if the command is supported, false otherwise
	 */
	queryCommandAvailable: function (command) {
		var ie = 1, mozilla = 1 << 1, safari = 1 << 2;
		function isSupportedBy (browsers) {
			return {
				ie: Boolean(browsers & ie),
				mozilla: Boolean(browsers & mozilla),
				safari: Boolean(browsers & safari)
			}
		}
		
		switch (command.toLowerCase()) {
			case "bold": case "italic": case "underline":
			case "strikethrough": case "subscript": case "superscript":
			case "fontname": case "fontsize":
			case "forecolor": case "hilitecolor":
			case "justifycenter": case "justifyfull": case "justifyleft": case "justifyright":
			case "cut": case "copy": case "paste": case "delete":
			case "undo": case "redo": case "formatblock":
				var supportedBy = isSupportedBy(mozilla | ie | safari);
				break;
				
			case "createlink": case "unlink": case "removeformat":
			case "inserthorizontalrule": case "insertimage":
			case "insertorderedlist": case "insertunorderedlist":
			case "indent": case "outdent":
				var supportedBy = isSupportedBy(mozilla | ie);
				break;
				
			case "blockdirltr": case "blockdirrtl":
			case "dirltr": case "dirrtl":
			case "inlinedirltr": case "inlinedirrtl":
				var supportedBy = isSupportedBy(ie);
				break;
			
			case "inserttable":
				var supportedBy = isSupportedBy(mozilla | (this.object ? ie : 0));
				break;
			
			case "insertcell": case "insertcol": case "insertrow":
			case "deletecells": case "deletecols": case "deleterows":
			case "mergecells": case "splitcell":
				var supportedBy = isSupportedBy(this.object ? ie : 0);
				break;
			
			default: return false;
		}
		
		return (dojo.render.html.ie && supportedBy.ie) ||
			(dojo.render.html.mozilla && supportedBy.mozilla) ||
			(dojo.render.html.safari && supportedBy.safari);
	},
	
	/**
	 * Executes a command in the Rich Text area
	 *
	 * @param command The command to execute
	 * @param argument An optional argument to the command
	 */
	execCommand: function (command, argument) {
		if (this.object) {
			if (command == "forecolor") { command = "setforecolor"; }
			else if (command == "backcolor") { command = "setbackcolor"; }
		
			if (typeof this._activeX.command[command] == "undefined") { return null; }
		
			if (arguments.length == 1) {
				return this.object.ExecCommand(this._activeX.command[command],
					this._activeX.ui.noprompt);
			} else {
				return this.object.ExecCommand(this._activeX.command[command],
					this._activeX.ui.noprompt, argument);
			}
	
		// fix up unlink in Mozilla to unlink the link and not just the selection
		} else if (command == "unlink" &&
			this.queryCommandEnabled("unlink") && dojo.render.html.mozilla) {
			// grab selection
			// Mozilla gets upset if we just store the range so we have to
			// get the basic properties and recreate to save the selection
			var selection = this.window.getSelection();
			var selectionRange = selection.getRangeAt(0);
			var selectionStartContainer = selectionRange.startContainer;
			var selectionStartOffset = selectionRange.startOffset;
			var selectionEndContainer = selectionRange.endContainer;
			var selectionEndOffset = selectionRange.endOffset;
			
			// select our link and unlink
			var range = document.createRange();
			var a = this.getSelectedNode();
			while (a.nodeName != "A") { a = a.parentNode; }
			range.selectNode(a);
			selection.removeAllRanges();
			selection.addRange(range);
			
			var returnValue = this.document.execCommand("unlink", false, null);
			
			// restore original selection
			var selectionRange = document.createRange();
			selectionRange.setStart(selectionStartContainer, selectionStartOffset);
			selectionRange.setEnd(selectionEndContainer, selectionEndOffset);
			selection.removeAllRanges();
			selection.addRange(selectionRange);
			
			return returnValue;
		} else if (command == "inserttable" && dojo.render.html.mozilla) {

			var cols = "<tr>";
			for (var i = 0; i < argument.cols; i++) { cols += "<td></td>"; }
			cols += "</tr>";
		
			var table = "<table><tbody>";
			for (var i = 0; i < argument.rows; i++) { table += cols; }
			table += "</tbody></table>";
			return this.document.execCommand("inserthtml", false, table);
		
		} else {
			argument = arguments.length > 1 ? argument : null;
			return this.document.execCommand(command, false, argument);
		}
	},

	queryCommandEnabled: function (command, argument) {
		if (this.object) {
			if (command == "forecolor") { command = "setforecolor"; }
			else if (command == "backcolor") { command = "setbackcolor"; }

			if (typeof this._activeX.command[command] == "undefined") { return false; }
			var status = this.object.QueryStatus(this._activeX.command[command]);
			return (status != this.activeX.status.notsupported && 
				status != this.activeX.status.diabled);
		} else {
			// mozilla returns true always
			if (command == "unlink" && dojo.render.html.mozilla) {
				var node = this.getSelectedNode();
				while (node.parentNode && node.nodeName != "A") { node = node.parentNode; }
				return node.nodeName == "A";
			} else if (command == "inserttable" && dojo.render.html.mozilla) {
				return true;
			}
			return this.document.queryCommandEnabled(command);
		}
	},

	queryCommandState: function (command, argument) {
		if (this.object) {
			if (command == "forecolor") { command = "setforecolor"; }
			else if (command == "backcolor") { command = "setbackcolor"; }

			if (typeof this._activeX.command[command] == "undefined") { return null; }
			var status = this.object.QueryStatus(this._activeX.command[command]);
			return (status == this._activeX.status.enabled ||
				status == this._activeX.status.ninched);
		} else {
			return this.document.queryCommandState(command);
		}
	},

	queryCommandValue: function (command, argument) {
		if (this.object) {
			//var status = this.object.QueryStatus(this._activeX.command[command]);
		} else {
			return this.document.queryCommandValue(command);
		}
	},
	
	
/* Misc.
 ********/

	getSelectedNode: function () {
		if (this.document.selection) {
			return this.document.selection.createRange().parentElement();
		} else if (dojo.render.html.mozilla) {
			return this.window.getSelection().getRangeAt(0).commonAncestorContainer;
		}
		return this.editNode;
	},
	
	placeCursorAtStart: function () {
		if (this.window.getSelection &&
			dojo.lang.isString(this.window.getSelection())) { return; } // safari
		if (this.iframe) {
			var range = this.document.createRange();
			range.selectNode(this.editNode.firstChild);
			range.collapse(true);
			var selection = this.window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
		} else if (this.document.selection) { // IE
			var range = this.document.body.createTextRange();
			range.moveToElementText(this.editNode);
			range.collapse(true);
			range.select();
		}
	},
	
	placeCursorAtEnd: function () {
		if (this.window.getSelection &&
			dojo.lang.isString(this.window.getSelection())) { return; } // safari
		if (this.iframe) {
			var range = this.document.createRange();
			range.selectNode(this.editNode.lastChild);
			range.collapse(false);
			var selection = this.window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
		} else if (this.document.selection) { // IE
			var range = this.document.body.createTextRange();
			range.moveToElementText(this.editNode);
			range.collapse(true);
			range.select();
		}
	},

	/** Updates the height of the iframe to fit the contents. */
	_updateHeight: function () {
		if (this.iframe) {
			// The height includes the padding, borders and margins so these
			// need to be added on
			var heights = ["margin-top", "margin-bottom",
				"padding-bottom", "padding-top",
				"border-width-bottom", "border-width-top"];
			for (var i = 0, chromeheight = 0; i < heights.length; i++) {
				var height = dojo.style.getStyle(this.iframe, heights[i]);
				// Safari doesn't have all the heights so we have to test
				if (height) {
					chromeheight += Number(height.replace(/[^0-9]/g, ""));
				}
			}
			this.iframe.height = this.document.body.offsetHeight + chromeheight + "px";
			this.window.scrollTo(0, 0);
		} else if (this.object) {
			this.object.height = dojo.style.getInnerHeight(this.editNode);
		}
	},
	
	/**
	 * Saves the content in an onunload event if the editor has not been closed
	 */
	_saveContent: function (e) {
		var saveTextarea = document.getElementById("dojo.widget.RichText.savedContent");
		saveTextarea.value += this._SEPARATOR + this.saveName + ":" + this.editNode.innerHTML;
	},
	
	/**
	 * Kills the editor and optionally writes back the modified contents to the 
	 * element from which it originated.
	 *
	 * @param save Whether or not to save the changes. If false, the changes are
	 *             discarded.
	 * @return true if the contents has been modified, false otherwise
	 */
	close: function (save) {
		this.isClosed = true;
		if (arguments.length == 0) { save = true; }
		var changed = (this.savedContent.innerHTML != this.editNode.innerHTML);
		
		// line height is squashed for iframes
		if (this.iframe) { this.domNode.style.lineHeight = null; }
		
		if (dojo.render.html.ie && !this.object) {
			dojo.event.browser.clean(this.editNode);
		}
//		document.body.appendChild(this.iframe);
//		this.iframe.contentWindow = this.window;
//		alert(this.iframe.contentWindow.document.documentElement.innerHTML);
//		alert(this.window === this.iframe.contentWindow);
		dojo.dom.removeChildren(this.domNode);
		if (save) {
			this.domNode.innerHTML = this.editNode.innerHTML;
			// kill listeners on the saved content
			dojo.event.browser.clean(this.savedContent);
		} else {
			while (this.savedContent.hasChildNodes()) {
				this.domNode.appendChild(this.savedContent.firstChild);
			}
		}
		
		dojo.html.removeClass(this.domNode, "RichTextEditable");
		return changed;
	},
	
	destroy: function () {
		if (this.interval) { clearInterval(this.interval); }
	
		// disconnect those listeners.
		while (this._connected.length) {
			this.disconnect(this._connected[0],
				this._connected[1], this._connected[2]);
		}
	},
	
	_connected: [],
	connect: function (targetObj, targetFunc, thisFunc) {
		dojo.event.connect(targetObj, targetFunc, this, thisFunc);
		this._connected.push([targetObj, targetFunc, thisFunc]);	
	},
	
	disconnect: function (targetObj, targetFunc, thisFunc) {
		for (var i = 0; i < this._connected.length; i++) {
			if (this._connected[0] == targetObj &&
				this._connected[1] == targetFunc &&
				this._connected[2] == thisFunc) {
				dojo.event.disconnect(targetObj, targetFunc, this, thisFunc);
				this._connected.splice(i, 1);
				break;
			}
		}
	},
	
	disconnectAllWithRoot: function (targetObj) {
		for (var i = 0; i < this._connected.length; i++) {
			if (this._connected[0] == targetObj) {
				dojo.event.disconnect(targetObj,
					this._connected[1], this, this._connected[2]);
				this._connected.splice(i, 1);
			}
		}	
	}
	
});
