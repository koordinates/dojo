dojo.provide("dijit.form.AutoCompleter");

dojo.require("dijit.util.scroll");
dojo.require("dijit.util.wai");
dojo.require("dojo.data.JsonItemStore");
dojo.require("dijit.form._DropDownTextBox");
dojo.require("dijit.form.ValidationTextbox");
dojo.require("dijit.base.TemplatedWidget");

dojo.declare(
	"dijit.form.AutoCompleterMixin",
	dijit.form._DropDownTextBox,
	{
		// summary:
		//		Auto-completing text box, and base class for Select widget.
		//
		//		The drop down box's values are populated from an class called
		//		a data provider, which returns a list of values based on the characters
		//		that the user has typed into the input box.
		//
		//		Some of the options to the AutoCompleter are actually arguments to the data
		//		provider.
		
		// searchLimit: Integer
		//		Argument to data provider.
		//		Specifies cap on maximum number of search results.
		//		Default is Infinity.
		searchLimit: Infinity,
	
		// store: Object
		//		Reference to data provider object created for this AutoCompleter
		//		according to "dataProviderClass" argument.
		store: null,
	
		// autoComplete: Boolean
		//		If you type in a partial string, and then tab out of the <input> box,
		//		automatically copy the first entry displayed in the drop down list to
		//		the <input> field
		autoComplete: true,
	
		// searchDelay: Integer
		//		Delay in milliseconds between when user types something and we start
		//		searching based on that value
		searchDelay: 100,
	
		// url: String
		//		URL argument passed to data provider object (class name specified in "dataProviderClass")
		//		An example of the URL format for the default data provider is
		//		"autoCompleterData.js"
		url: "",
	
// Bill: not sure we want to support url parameter; if we do then we have to support it for
// all dojo.data widgets (grid, tree)

		// dataProviderClass: String
		//		Name of data provider class (code that maps a search string to a list of values)
		//		The class must match the interface demonstrated by dojo.data.JsonItemStore
		dataProviderClass: "dojo.data.JsonItemStore",
	
// Bill: not sure we want to support this; if we do then we have to support it for
// all dojo.data widgets (grid, tree)

		// data: Object
		//		Inline data to put in store
		//		Data must match data type of dataProviderClass
		//		For example, data would contain JSON data if dataProviderClass is a JsonItemStore
		data:null,

		// searchAttr: String
		//		Searches pattern match against this field
		searchAttr: "name",
		
		// ignoreCase: Boolean
		//		Does the AutoCompleter menu ignore case?
		ignoreCase: true,
			
		// value: String
		//		The initial value of the AutoCompleter.
		//		This is the value that actually appears in the text area.
		value:"",
	
		templatePath: dojo.moduleUrl("dijit.form", "templates/AutoCompleter.html"),
		
		_popupName:"dijit.form.AutoCompleter.MasterPopup",
		
		_popupClass:"dijit.form._AutoCompleterMenu",
		
		_setTextFieldValue:function(/*String*/ value){
			// summary: Select wants to call AutoCompleter's setValue to reach FormElement's setValue
			// But Select does not want to display the "value" in the text field!
			// this function fixes that problem by separating the code from Select's setTextValue
			this.textbox.value=value;
		},
	
		setValue:function(/*String*/ value){
			// summary: Sets the value of the AutoCompleter
			this._setTextFieldValue(value);

			// reuse dijit setValue code
			this.settingValue=true;
			this.parentClass.setValue.apply(this, arguments);
			this.settingValue=false;
		},
	
// Bill: there's got to be a better way to do this than settingValue attribute
// But this is all tied in w/Autocompleter being defined as a SerializableTextbox
// when it really isn't

		setTextValue:function(/*String*/ value){
			// summary: keeps value of AutoCompleter in sync with its text value
	
			// prevent Textbox recursion
			if(!this.settingValue){
				this.setValue(value);
			}else{
				this.parentClass.setTextValue.apply(this, arguments);
			}
		},

		_getCaretPos: function(/*DomNode*/ element){
			// khtml 3.5.2 has selection* methods as does webkit nightlies from 2005-06-22
			if(typeof(element.selectionStart)=="number"){
				// FIXME: this is totally borked on Moz < 1.3. Any recourse?
				return element.selectionStart;
			}else if(dojo.isIE){
				// in the case of a mouse click in a popup being handled,
				// then the document.selection is not the textarea, but the popup
				// var r = document.selection.createRange();
				// hack to get IE 6 to play nice. What a POS browser.
				var tr = document.selection.createRange().duplicate();
				var ntr = element.createTextRange();
				tr.move("character",0);
				ntr.move("character",0);
				try{
					// If control doesnt have focus, you get an exception.
					// Seems to happen on reverse-tab, but can also happen on tab (seems to be a race condition - only happens sometimes).
					// There appears to be no workaround for this - googled for quite a while.
					ntr.setEndPoint("EndToEnd", tr);
					return String(ntr.text).replace(/\r/g,"").length;
				}
				catch(e){
					return 0; // If focus has shifted, 0 is fine for caret pos.
				}
			}
		},
	
		_setCaretPos: function(/*DomNode*/ element, /*Number*/ location){
			location = parseInt(location);
			this._setSelectedRange(element, location, location);
		},
	
		_setSelectedRange: function(/*DomNode*/ element, /*Number*/ start, /*Number*/ end){
			if(!end){
				end = element.value.length;
			}  // NOTE: Strange - should be able to put caret at start of text?
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
					element.dispatchEvent(te);
				}
			}
		},
	
		onkeyup:function(){
			// Textbox uses onkeyup, but not AutoCompleter
			// this placeholder prevents errors
		},
	
		onkeypress: function(/*Event*/ evt){
			// summary: handles keyboard events
			if(evt.ctrlKey || evt.altKey){
				return;
			}
			var k = dojo.keys;
			var doSearch = true;
			switch(evt.keyCode){
				case dojo.keys.DOWN_ARROW:
					if(!this.isShowingNow()||this._prev_key_esc){
						this._arrowPressed();
						this._startSearchFromInput();
					}else{
						this._popupWidget._highlightNextOption();
					}
					dojo.stopEvent(evt);
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					return;

				case dojo.keys.UP_ARROW:
					if(this.isShowingNow()){this._popupWidget._highlightPrevOption();}
					dojo.stopEvent(evt);
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					return;
	
				case dojo.keys.PAGE_DOWN:
					if(this.isShowingNow()){this._popupWidget.pageDown();}
					dojo.stopEvent(evt);
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					return;
	
				case dojo.keys.PAGE_UP:
					this._popupWidget.pageUp();
					dojo.stopEvent(evt);
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					return;
	
				case dojo.keys.ENTER:
					// prevent submitting form if user presses enter
					dojo.stopEvent(evt);
	
				case dojo.keys.TAB:
					if(this.isShowingNow()){
						
						this._prev_key_backspace = false;
						this._prev_key_esc = false;
						if(this._popupWidget.getHighlightedOption()){
							this._popupWidget.setValue({target:this._popupWidget.getHighlightedOption()});
						}else{
							this.setTextValue(this.getTextValue());
						}
						this._hideResultList();
					}else{
						// also allow arbitrary user input
						this.setTextValue(this.getTextValue());
					}
					doSearch=false;
					break;
	
				case dojo.keys.SPACE:
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					if(this.isShowingNow() && this._highlighted_option){
						dojo.stopEvent(evt);
						this._selectOption();
						this._hideResultList();
						return;
					}
					break;
	
				case dojo.keys.ESCAPE:
					this._prev_key_backspace = false;
					this._hideResultList();
					this._prev_key_esc = true;
					return;
	
				case dojo.keys.BACKSPACE:
					this._prev_key_esc = false;
					this._prev_key_backspace = true;
					if(!this.textbox.value.length){
						this.setValue("");
					}
					break;
	
				case dojo.keys.RIGHT_ARROW: // fall through
	
				case dojo.keys.LEFT_ARROW: // fall through
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					doSearch = false;
					break;
	
				default:// non char keys (F1-F12 etc..)  shouldn't open list
					this._prev_key_backspace = false;
					this._prev_key_esc = false;
					if(evt.charCode==0){
						doSearch = false;
					}
			}
			if(this.searchTimer){
				clearTimeout(this.searchTimer);
			}
			if(doSearch){
				// need to wait a tad before start search so that the event bubbles through DOM and we have value visible
				this.searchTimer = setTimeout(dojo.hitch(this, this._startSearchFromInput), this.searchDelay);
			}
		},
	
		compositionEnd: function(/*Event*/ evt){
			// summary: When inputting characters using an input method, such as Asian
			// languages, it will generate this event instead of onKeyDown event
			evt.key = evt.charCode = -1;
			this.onkeypress(evt);
		},
	
		_openResultList: function(/*Object*/ results){
			if(this.disabled){
				return;
			}
			this._popupWidget.clearResultList();
			if(!results.length){
				this._hideResultList();
				return;
			}


			// Fill in the textbox with the first item from the drop down list, and
			// highlight the characters that were auto-completed.   For example, if user
			// typed "CA" and the drop down list appeared, the textbox would be changed to
			// "California" and "ifornia" would be highlighted.

			var zerothvalue=new String(this.store.getValue(results[0], this.searchAttr));
			if(zerothvalue&&(this.autoComplete)&&
			(!this._prev_key_backspace)&&
			(this.textbox.value.length > 0)&&
			(new RegExp("^"+this.textbox.value, this.ignoreCase ? "i" : "").test(zerothvalue))){
				var cpos = this._getCaretPos(this.textbox);
				// only try to extend if we added the last character at the end of the input
				if((cpos+1) > this.textbox.value.length){
					// only add to input node as we would overwrite Capitalisation of chars
					// actually, that is ok
					this.textbox.value = zerothvalue;//.substr(cpos);
					// visually highlight the autocompleted characters
					this._setSelectedRange(this.textbox, cpos, this.textbox.value.length);
				}
			}
			// #2309: iterate over cache nondestructively
			for(var i=0; i<results.length; i++){
				var tr=results[i];
				if(tr){
					var td=this._createOption(tr);
					td.className = "dijitMenuItem";
					this._popupWidget.addItem(td);
				}
	
			}
// Bill: above loop could be done w/ "dojo.forEach(results, function(tr){" or better yet map()
//
// But actually the interface between AutoCompleterMenu and Autocompleter is strange to me.
// AutoCompleterMenu should be in charge of the
// DOM manipulation (creating text nodes, etc).   autocompleter should just pass in a list of
// items
				
			// show our list (only if we have content, else nothing)
			this._showResultList();
		},
	
		_createOption:function(/*Object*/ tr){
			// summary: creates an option to appear on the popup menu
			// subclassed by Select
			var td = document.createElement("div");
			td.appendChild(document.createTextNode(this.store.getValue(tr, this.searchAttr)));
			td.item=tr;
			return td;
		},

		onfocus:function(){
			this.parentClass.onfocus.apply(this, arguments);
		},
	
		onblur:function(){
			dijit.form._DropDownTextBox.prototype.onblur.apply(this, arguments);
			this.parentClass.onblur.apply(this, arguments);
		},

		_selectOption: function(/*Event*/ evt){
			var tgt = null;
			if(!evt){
				// what if nothing is highlighted yet?
				evt ={ target: this._highlighted_option };
			}
			if(!evt.target){
				// handle autocompletion where the the user has hit ENTER or TAB
				this.setTextValue(this.getTextValue());
				return;
			// otherwise the user has accepted the autocompleted value
			}else{
				tgt = evt.target;
			}
			while((tgt.nodeType!=1)||(!this.store.getValue(tgt.item, this.searchAttr))){
				tgt = tgt.parentNode;
				if(tgt == dojo.body()){
					return false;
				}
			}
			this._doSelect(tgt);
			if(!evt.noHide){
				this._hideResultList();
				this._setSelectedRange(this.textbox, 0, null);
			}
			this.focus();
			if(this._popupWidget.domNode.style.display!="none"){
				dijit.util.PopupManager.close(this._popupWidget);
			}
		},
	
		_doSelect: function(tgt){
			this.setValue(this.store.getValue(tgt.item, this.searchAttr));
		},
	
		arrowClicked: function(){
// Bill: should rename to _onArrowClicked() for consistency
			// summary: callback when arrow is clicked
			if(this.disabled){
				return;
			}
			this.focus();
			this.makePopup();
			if(this.isShowingNow()){
				this._hideResultList();
			}else{
				// forces full population of results, if they click
				// on the arrow it means they want to see more options
				this._startSearch("");
			}
		},
		
		isShowingNow:function(){
			// summary
			//	test if the popup is visible
			return this._popupWidget&&this._popupWidget.isShowingNow();
		},
		
		_startSearchFromInput: function(){
			this._startSearch(this.textbox.value);
		},
	
		_startSearch: function(/*String*/ key){
			this.makePopup();
			// create a new query to prevent accidentally querying for a hidden value from Select's keyField
			var query={};
			query[this.searchAttr]=key+"*";
			// no need to page; no point in caching the return object
			this.store.fetch({queryIgnoreCase:this.ignoreCase, query: query, onComplete:dojo.hitch(this, "_openResultList"), count:this.searchLimit});
		},

		_assignHiddenValue:function(/*Object*/ keyValArr, /*DomNode*/ option){
			// sets the hidden value of an item created from an <option value="CA">
			// AutoCompleter does not care about the value; Select does though
			// Select overrides this method
		},

		postCreate: function(){
			this.parentClass=dojo.getObject(this.declaredClass, false).superclass;
			this.parentClass.postCreate.apply(this, arguments);
			this.setupLabels();

			var dpClass=dojo.getObject(this.dataProviderClass, false);
			
			// new dojo.data code
			// is the store not specified?  If so, use inline read
			if(this.store==null){
				if(this.url==""&&this.data==null){
					dpClass=dojo.getObject("dojo.data.JsonItemStore", false);
					var opts = this.domNode.getElementsByTagName("option");
					var ol = opts.length;
					var data=[];
					// go backwards to create the options list
					// have to go backwards because we are removing the option nodes
					// the option nodes are visible once the AutoCompleter initializes
					for(var x=ol-1; x>=0; x--){
						var text = opts[x].innerHTML;
						var keyValArr ={};
						keyValArr[this.searchAttr]=String(text);
						// Select: assign the value attribute to the hidden value
						this._assignHiddenValue(keyValArr, opts[x]);
						data.unshift(keyValArr);
						// remove the unnecessary node
						// if you keep the node, it is visible on the page!
						this.domNode.removeChild(opts[x]);
					}	
					// pass store inline data
					this.data={items:data};
				}
				this.store=new dpClass(this);
			}
			if(this.disabled){
				this.disable();
			}
			this._setTextFieldValue(this.value);
			// convert the arrow image from using style.background-image to the .src property (a11y)
//			dijit.util.wai.imageBgToSrc(this.arrowImage);
		}
	}
);

dojo.declare(
	"dijit.form._AutoCompleterMenu",
	[dijit.base.FormElement, dijit.base.TemplatedWidget, dijit.form._DropDownTextBox.Popup],

// Bill: 
// I'd like the interface to AutoCompleterMenu to be higher level,
// taking a list of items to initialize it, and returns the selected item
//
//                new _AutoCompleterMenu({
//                                 items: /*dojo.data.Item[]*/ items,
//                                 labelFunc: dojo.hitc(this, "_makeLabel"),
//                                 onSelectItem: dojo.hitch(this, "_itemSelected")
//               });
//
// (This is dependent on NOT having a global widget for this, but rather
// creating it on the fly, as per discussion with Bill, Adam, and Mark)
// 
// It could also have a method like handleKey(evt) that takes a keystroke
// the <input> received and handles it.
//
// Also, doesn't seem like this should inherit from FormElement, and again I'm not
// sure of the utility of dijit.form._DropDownTextBox.Popup;
// all the popup functionality is supposed to be in PopupManager
//


	{
		// summary:
		//	Focus-less div based menu for internal use in AutoCompleter

		templateString:"<div class='dijitMenu' dojoAttachEvent='onclick; onmouseover; onmouseout;' tabIndex='-1' style='display:none; position:absolute; overflow:\"auto\";'></div>",
		postCreate:function(){
			// summary:
			//	call all postCreates
			dijit.form._DropDownTextBox.Popup.prototype.postCreate.apply(this, arguments);
			dijit.base.FormElement.prototype.postCreate.apply(this, arguments);
		},
	
		open:function(/*Widget*/ widget){
			this.maxListLength=widget.maxListLength;
			this.onValueChanged=dojo.hitch(widget, widget._selectOption);
			dijit.form._DropDownTextBox.Popup.prototype.open.apply(this, arguments);
		},
	
		close:function(){
			dijit.form._DropDownTextBox.Popup.prototype.close.apply(this, arguments);
			this._blurOptionNode();
		},
	
		addItem:function(/*Node*/ item){
			this.domNode.appendChild(item);
		},
// Bill: see comments above; this call is too low level for the interface
// between Autocompleter and AutocompleterMenu
	
		clearResultList:function(){
			this.domNode.innerHTML="";
		},
	
		getItems:function(){
			return this.domNode.childNodes;
		},
	
		getListLength:function(){
			return this.domNode.childNodes.length;
		},
// Bill: above two functions are never called
	
		onclick:function(/*Event*/ evt){
			if(evt.target === this.domNode){ return; }
			var tgt=evt.target;
			// while the clicked node is inside the div
			while(!tgt.item){
				// recurse to the top
				tgt=tgt.parentNode;
			}
			this.setValue({target:tgt});
		},
	
		onmouseover:function(/*Event*/ evt){
			if(evt.target === this.domNode){ return; }
			this._focusOptionNode(evt.target);
		},
	
		onmouseout:function(/*Event*/ evt){
			if(evt.target === this.domNode){ return; }
			this._blurOptionNode();
		},
	
		_focusOptionNode:function(/*DomNode*/ node){
			// summary:
			//	does the actual highlight
			if(this._highlighted_option != node){
				this._blurOptionNode();
				this._highlighted_option = node;
				dojo.addClass(this._highlighted_option, "dijitMenuItemHover");
			}
		},
	
		_blurOptionNode:function(){
			// summary:
			//	removes highlight on highlighted option
			if(this._highlighted_option){
				dojo.removeClass(this._highlighted_option, "dijitMenuItemHover");
				this._highlighted_option = null;
			}
		},
	
		_highlightNextOption:function(){
			// because each press of a button clears the menu,
			// the highlighted option sometimes becomes detached from the menu!
			// test to see if the option has a parent to see if this is the case.
			if(!this._highlighted_option||!this._highlighted_option.parentNode){
				this._focusOptionNode(this.domNode.firstChild);
			}else if(this._highlighted_option.nextSibling){
				this._focusOptionNode(this._highlighted_option.nextSibling);
			}
			dijit.util.scroll.scrollIntoView(this._highlighted_option);
		},

		pageUp:function(){
			for(var i=0; i<this.maxListLength; i++){
				this._highlightPrevOption();
			}
		},

		pageDown:function(){
			for(var i=0; i<this.maxListLength; i++){
				this._highlightNextOption();
			}
		},

		_highlightPrevOption:function(){
			if(this._highlighted_option && this._highlighted_option.previousSibling){
				this._focusOptionNode(this._highlighted_option.previousSibling);
			}else{
				this._highlighted_option = null;
				dijit.util.PopupManager.close(true);
				return;
			}
			dijit.util.scroll.scrollIntoView(this._highlighted_option);
		},
	
		getHighlightedOption:function(){
			// summary:
			//	Returns the highlighted option.
			return this._highlighted_option&&this._highlighted_option.parentNode ? this._highlighted_option : null;
		}
	}

);

dojo.declare(
	"dijit.form.AutoCompleter",
	[dijit.form.ValidationTextbox, dijit.form.AutoCompleterMixin],
	{}
);
