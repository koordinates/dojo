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
			this.hideResultList();
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
		this.clearResultsList();
		if(!results.length){
			this.hideResultList();
		}else{
			this.showResultList();
		}
		while(results.length){
			var tr = results.shift();
			var td = document.createElement("div");
			td.appendChild(document.createTextNode(tr[0]));
			this.optionsListNode.appendChild(td);
		}
	}

	this.clearResultsList = function(){
		var oln = this.optionsListNode;
		while(oln.firstChild){
			oln.removeChild(oln.firstChild);
		}
	}

	this.hideResultList = function(){
		this.optionsListNode.style.display = "none";
		return;
	}

	this.showResultList = function(){
		with(this.optionsListNode.style){
			display = "";
			width = dojo.xml.htmlUtil.getInnerWidth(this.textInputNode)+"px";
			if(dojo.render.html.khtml){
				marginTop = dojo.xml.htmlUtil.totalOffsetTop(this.optionsListNode.parentNode)+"px";
			/*
				left = dojo.xml.htmlUtil.totalOffsetLeft(this.optionsListNode.parentNode)+3+"px";
			*/
			}
		}
		return;
	}

	this.startSearchFromInput = function(){
		this.startSearch(this.textInputNode.value);
	}

	dojo.event.connect(this, "startSearch", this.dataProvider, "startSearch");
	dojo.event.connect(this.dataProvider, "provideSearchResults", this, "openResultList");
}

dj_inherits(dojo.webui.widgets.HTMLComboBox, dojo.webui.widgets.DomComboBox);
