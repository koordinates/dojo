dojo.hostenv.startPackage("dojo.webui.widgets.HTMLComboBox");

dojo.hostenv.loadModule("dojo.webui.widgets.ComboBox");
dojo.hostenv.loadModule("dojo.io.*");

dojo.webui.widgets.HTMLComboBox = function(){
	dojo.webui.widgets.DomComboBox.call(this);
	dojo.webui.HTMLWidget.call(this);

	this.templatePath = "src/webui/widgets/templates/HTMLComboBox.html";
	this.templateCSSPath = "src/webui/widgets/templates/HTMLComboBox.css";

	this.autoComplete = true;
	this.textInputNode = null;
	this.optionsListNode = null;
	this.downArrowNode = null;
	this.searchTimer = null;
	this.searchDelay = 100;
	this.timeoutWrapperName = null;
	this.dataUrl = "";
	var _prev_key_backspace = false;

	this.getCaretPos = function(element){
		// FIXME: we need to figure this out for Konq/Safari!
		if(dojo.render.html.moz){
			// FIXME: this is totally borked on Moz < 1.3. Any recourse?
			return element.selectionStart;
		}else if(dojo.render.html.ie){
			// in the case of a mouse click in a popup being handled,
			// then the document.selection is not the textarea, but the popup
			var r = document.selection.createRange();
			// hack to get IE 6 to play nice. What a POS browser.
			var tr = r.duplicate();
			var ntr = document.selection.createRange().duplicate();
			// FIXME: this seems to work but I'm getting some execptions on reverse-tab
			tr.move("character",0);
			ntr.move("character",0);
			ntr.moveToElementText(element);
			ntr.setEndPoint("EndToEnd", tr);
			return String(ntr.text).replace(/\r/g,"").length;
		}
	}

	this.setCaretPos = function(element, location){
		location = parseInt(location);
		this.setSelectedRange(element, location, location);
	}

	this.setSelectedRange = function(element, start, end){
		if(!end){ end = element.value.length; }
		// Mozilla
		// parts borrowed from http://www.faqts.com/knowledge_base/view.phtml/aid/13562/fid/130
		if(element.setSelectionRange){
			element.focus();
			element.setSelectionRange(start, end);
		}else if(element.createTextRange){ // IE
			var range = element.createTextRange();
			with(range){
				collapse(true);
				moveEnd('character', end);
				moveStart('character', start);
				select();
			}
		}else{ //otherwise try the event-creation hack (our own invention)
			// do we need these?
			element.value = element.value;
			element.blur();
			element.focus();
			// figure out how far back to go
			var dist = parseInt(element.value.length)-end;
			var tchar = String.fromCharCode(37);
			var tcc = tchar.charCodeAt(0);
			for(var x = 0; x < dist; x++){
				var te = document.createEvent("KeyEvents");
				te.initKeyEvent("keypress", true, true, null, false, false, false, false, tcc, tcc);
				twe.dispatchEvent(te);
			}
		}
	}

	this.killEvent = function(evt){
		evt.preventDefault();
		evt.stopPropagation();
	}

	this.onKeyDown = function(evt){
		dj_debug(evt);
	}

	this.onKeyUp = function(evt){
		// esc is 27
		if(evt.keyCode == 27){
			this.hideResultList();
			return;
		}

		// backspace is 8
		_prev_key_backspace = (evt.keyCode == 8) ? true : false;

		if(this.searchTimer){
			clearTimeout(this.searchTimer);
		}
		if(!_prev_key_backspace){
			var _this = this;
			if(!this.timeoutWrapperName){
				this.timeoutWrapperName = dojo.event.nameAnonFunc(function(){
					_this.startSearchFromInput();
				}, dj_global);
			}
			this.searchTimer = setTimeout(this.timeoutWrapperName+"()", this.searchDelay);
		}else{
			if(!this.textInputNode.value.length){
				this.hideResultList();
			}
		}
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
		this.clearResultList();
		if(!results.length){
			this.hideResultList();
		}else{
			this.showResultList();
		}
		if((this.autoComplete)&&(results.length)){
			var cpos = this.getCaretPos(this.textInputNode);
			// only try to extend if we added the last charachter at the end of the input
			if((cpos+1) >= this.textInputNode.value.length){
				this.textInputNode.value = results[0][0];
				// build a new range that has the distance from the earlier
				// caret position to the end of the first string selected
				this.setSelectedRange(this.textInputNode, cpos, this.textInputNode.value.length);
			}
		}
		while(results.length){
			var tr = results.shift();
			var td = document.createElement("div");
			td.appendChild(document.createTextNode(tr[0]));
			this.optionsListNode.appendChild(td);
		}
		dojo.event.kwConnect({
			once: true,
			srcObj: document.body,
			srcFunc: "onclick", 
			adviceObj: this, 
			adviceFunc: "hideResultList"
		});
		// dojo.event.connect(document.body, "onclick", this, "hideResultList");
	}

	this.clearResultList = function(){
		var oln = this.optionsListNode;
		while(oln.firstChild){
			oln.removeChild(oln.firstChild);
		}
	}

	this.hideResultList = function(){
		this.optionsListNode.style.display = "none";
		dojo.event.disconnect(document.body, "onclick", this, "hideResultList");
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
