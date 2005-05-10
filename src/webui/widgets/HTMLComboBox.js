dojo.hostenv.startPackage("dojo.webui.widgets.HTMLComboBox");

dojo.hostenv.loadModule("dojo.webui.widgets.ComboBox");
dojo.hostenv.loadModule("dojo.io.*");

dojo.webui.widgets.HTMLComboBox = function(){
	dojo.webui.widgets.DomComboBox.call(this);
	dojo.webui.HTMLWidget.call(this);

	this.templatePath = "src/webui/widgets/templates/HTMLComboBox.html";
	this.templateCSSPath = "src/webui/widgets/templates/HTMLComboBox.css";

	this.textInputNode = null;
	this.optionsListNode = null;
	this.downArrowNode = null;
	this.searchTimer = null;
	this.searchDelay = 100;
	this.timeoutWrapperName = null;
	this.dataUrl = "";

	this,onKeyDown = function(evt){
		dj_debug(evt);
	}

	this.onKeyUp = function(evt){
		// esc is 27
		if(evt.keyCode == 27){
			this.closeResultList();
			return;
		}
		if(this.searchTimer){
			clearTimeout(this.searchTimer);
		}
		var _this = this;
		if(!this.timeoutWrapperName){
			this.timeoutWrapperName = dojo.event.nameAnonFunc(function(){
				_this.startSearchFromInput();
			}, dj_global);
		}
		this.searchTimer = setTimeout(this.timeoutWrapperName+"()", this.searchDelay);
	}

	this.fillInTemplate = function(){
		// FIXME: add logic
		if(this.dataUrl!=""){
			var _this = this;
			dojo.io.bind({
				url: this.dataUrl,
				load: function(type, data, evt){ 
					if(type=="load"){
						_this.dataProvider.setData(data);
					}
				},
				mimetype: "text/javascript"
			});
		}
	}

	this.openResultList = function(results){
		while(this.optionsListNode.firstChild){
			this.optionsListNode.removeChild(this.optionsListNode.firstChild);
		}
		if(!results.length){
			this.closeResultList();
		}else{
			this.optionsListNode.style.display = "";
		}
		while(results.length){
			var tr = results.shift();
			var td = document.createElement("div");
			td.appendChild(document.createTextNode(tr[0]));
			this.optionsListNode.appendChild(td);
		}
	}

	this.closeResultList = function(){
		this.optionsListNode.style.display = "none";
		return;
	}

	this.startSearchFromInput = function(){
		this.startSearch(this.textInputNode.value);
	}

	dojo.event.connect(this, "startSearch", this.dataProvider, "startSearch");
	dojo.event.connect(this.dataProvider, "provideSearchResults", this, "openResultList");
}

dj_inherits(dojo.webui.widgets.HTMLComboBox, dojo.webui.widgets.DomComboBox);
