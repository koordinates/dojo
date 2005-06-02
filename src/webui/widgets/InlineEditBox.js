/* TODO:
 */
dojo.hostenv.startPackage("dojo.webui.widgets.InlineEditBox");
dojo.hostenv.startPackage("dojo.webui.widgets.HTMLInlineEditBox");

dojo.hostenv.loadModule("dojo.event.*");
dojo.hostenv.loadModule("dojo.xml.*");
dojo.hostenv.loadModule("dojo.webui.widgets.Parse");
dojo.hostenv.loadModule("dojo.webui.Widget");
dojo.hostenv.loadModule("dojo.webui.DomWidget");
dojo.hostenv.loadModule("dojo.webui.WidgetManager");
dojo.hostenv.loadModule("dojo.graphics.*");
dojo.hostenv.loadModule("dojo.graphics.htmlEffects");


dojo.webui.widgets.HTMLInlineEditBox = function() {
	dojo.webui.Widget.call(this);
	dojo.webui.DomWidget.call(this, true);
	dojo.webui.HTMLWidget.call(this);

	this.templatePath = "src/webui/widgets/templates/HTMLInlineEditBox.html";
	this.templateCSSPath = "src/webui/widgets/templates/HTMLInlineEditBox.css";
	this.widgetType = "InlineEditBox";

	this.form = null;
	this.editBox = null;
	this.edit = null;
	this.text = null;
	this.storage = document.createElement("span");

	this.onSave = function(){};

	this.minWidth = 100; //px. minimum width of edit box

	var editing = false;
	var textValue = "";
	var doFade = false;

	// overwrite buildRendering so we don't clobber our list
	this.buildRendering = function(args, frag) {
		this.nodeRef = frag["dojo:inlineeditbox"]["nodeRef"];
		var node = this.nodeRef;
		if(node.normalize) { node.normalize(); }

		this.editable = document.createElement("span");
		this.editable.appendChild(node.firstChild);
		textValue = this.editable.firstChild.nodeValue;
		if(node.hasChildNodes()) {
			node.insertBefore(this.editable, node.firstChild);
		} else {
			node.appendChild(this.editable);
		}
		dojo.webui.buildAndAttachTemplate(this);

		this.editable.appendChild(this.edit);

		dojo.event.connect(this.editable, "onmouseover", this, "mouseover");
		dojo.event.connect(this.editable, "onmouseout", this, "mouseout");
		dojo.event.connect(this.editable, "onclick", this, "beginEdit");

		this.fillInTemplate(args, frag);
	}

	this.mouseover = function(e) {
		if(!editing) {
			dojo.xml.htmlUtil.addClass(this.editable, "editableRegion");
		}
	}

	this.mouseout = function(e) {
		if(!editing) {
			dojo.xml.htmlUtil.removeClass(this.editable, "editableRegion");
		}
	}

	this.beginEdit = function(e) {
		if(editing) { return; }
		this.mouseout();
		editing = true;

		this.text.value = textValue;
		this.text.style.fontSize = dojo.xml.domUtil.getStyle(this.editable, "font-size");
		this.text.style.fontWeight = dojo.xml.domUtil.getStyle(this.editable, "font-weight");
		this.text.style.fontStyle = dojo.xml.domUtil.getStyle(this.editable, "font-style");
		//this.text.style.fontFamily = dojo.xml.domUtil.getStyle(this.editable, "font-family");

		this.text.style.width = Math.max(dojo.xml.htmlUtil.getInnerWidth(this.editable), this.minWidth) + "px";

		this.editable.style.display = "none";
		this.nodeRef.appendChild(this.form);
		this.text.focus();
		this.text.select();
	}

	this.saveEdit = function(e) {
		e = dojo.event.browser.fixEvent(e);
		dojo.event.browser.stopEvent(e);
		if(textValue != this.text.value) {
			doFade = true;
			this.onSave(this.text.value, textValue);
			textValue = this.text.value;
			this.editable.firstChild.nodeValue = textValue;
		} else {
			doFade = false;
			dj_debug('no');
		}
		this.finishEdit(e);
	}

	this.finishEdit = function(e) {
		if(!editing) { return; }
		editing = false;
		this.nodeRef.removeChild(this.form);
		this.editable.style.display = "";
		if(doFade) {
			dojo.graphics.htmlEffects.highlight(this.editable, dojo.xml.domUtil.hex2rgb("#ffc"), 700, 300);
		}
		doFade = false;
	}
}
dj_inherits(dojo.webui.widgets.HTMLInlineEditBox, dojo.webui.DomWidget);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:inlineeditbox");
