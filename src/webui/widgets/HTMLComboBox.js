dojo.hostenv.startPackage("dojo.webui.widgets.HTMLComboBox");

dojo.hostenv.loadModule("dojo.webui.widgets.ComboBox");

dojo.webui.widgets.HTMLComboBox = function(){
	dojo.webui.widgets.DomComboBox.call(this);
	dojo.webui.HTMLWidget.call(this);

	this.templatePath = "src/webui/widgets/templates/HTMLComboBox.html";
	this.templateCSSPath = "src/webui/widgets/templates/HTMLComboBox.css";

	this.textInputNode = null;
	this.optionsListNode = null;
	this.downArrowNode = null;

	this,onKeyDown = function(evt){
		dj_debug(evt);
	}

	this.onKeyUp = function(evt){
		dj_debug(evt);
	}

	this.fillInTemplate = function(){
		// FIXME: add logic
	}
}

dj_inherits(dojo.webui.widgets.HTMLComboBox, dojo.webui.widgets.DomComboBox);
