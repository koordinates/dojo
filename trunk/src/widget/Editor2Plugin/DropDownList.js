dojo.provide("dojo.widget.Editor2Plugin.DropDownList");

dojo.require("dojo.widget.Editor2");
dojo.require("dojo.widget.PopupContainer");

dojo.declare("dojo.widget.Editor2ToolbarDropDownButton", dojo.widget.Editor2ToolbarButton, {
	// summary: dojo.widget.Editor2ToolbarDropDownButton extends the basic button with a dropdown list

	onClick: function(){
		if(this._domNode && !this._domNode.disabled && this._parentToolbar.checkAvailability()){
			if(!this._dropdown){
				this._dropdown = dojo.widget.createWidget("PopupContainer", {});
				this._domNode.appendChild(this._dropdown.domNode);
			}
			if(this._dropdown.isShowingNow){
				this._dropdown.close();
			}else{
				this.onDropDownShown();
				this._dropdown.open(this._domNode, null, this._domNode);
			}
		}
	},
	destroy: function(){
		this.onDropDownDestroy();
		if(this._dropdown){
			this._dropdown.destroy();
		}
		dojo.widget.Editor2ToolbarDropDownButton.superclass.destroy.call(this);
	},
	enableToolbarItem: function(){
		this._domNode.disabled = false;
		dojo.html.removeClass(this._domNode, 'dojoE2TB_SCFieldDisabled');
	},

	disableToolbarItem: function(){
		this._domNode.disabled = true;
		dojo.html.addClass(this._domNode, 'dojoE2TB_SCFieldDisabled');
	},
	onDropDownShown: function(){},
	onDropDownDestroy: function(){}
});

dojo.declare("dojo.widget.Editor2ToolbarComboItem", dojo.widget.Editor2ToolbarDropDownButton,{
	// summary: dojo.widget.Editor2ToolbarComboItem provides an external loaded dropdown list

	onMouseOver: function(e){
		if(this._lastState != dojo.widget.Editor2Manager.commandState.Disabled){
			dojo.html.addClass(e.currentTarget, 'ToolbarSelectHighlighted');
		}
	},
	onMouseOut:function(e){
		dojo.html.removeClass(e.currentTarget, 'ToolbarSelectHighlighted');
	},

	onDropDownShown: function(){
		if(this.contentHtml){
			this._dropdown.domNode.innerHTML=this.contentHtml;
			this.contentHtml='';
			this.setup();
		}
	},

	setup: function(){
		// summary: overload this to connect event
	},

	onChange: function(e){
		if(this._parentToolbar.checkAvailability()){
			var name = e.currentTarget.getAttribute("dropDownItemName");
			var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
			if(curInst){
				var _command = curInst.getCommand(this._name);
				if(_command){
					_command.execute(name);
				}
			}
		}
		this._dropdown.close();
	},

	onMouseOverItem: function(e){
		dojo.html.addClass(e.currentTarget, 'ToolbarSelectHighlightedItem');
	},

	onMouseOutItem: function(e){
		dojo.html.removeClass(e.currentTarget, 'ToolbarSelectHighlightedItem');
	}
});

dojo.declare("dojo.widget.Editor2ToolbarFormatBlockSelect", dojo.widget.Editor2ToolbarComboItem, {
	// summary: dojo.widget.Editor2ToolbarFormatBlockSelect is an improved format block setting item
	// description: 
	//		to customize the items in this dropdown, set blockFormats in toolbarConfig on Editor2, 
	//		such as: toolbarConfig={blockFormats:'p,pre,h1,h2,h3'};
	//		or specify attribute dojoETItemItems in the toolbar template in the node with 
	//		dojoETItemName="formatblock", such as: dojoETItemItems="p,pre,h1,h2,h3"

	create: function(node, toolbar){
		dojo.widget.Editor2ToolbarFormatBlockSelect.superclass.create.apply(this, arguments);
		var formatNames = dojo.i18n.getLocalization("dojo.widget", "Editor2", toolbar.lang);
		var items=(toolbar.config['blockFormats']||node.getAttribute('dojoETItemItems')||'p,div,pre,address,h1,h2,h3,h4,h5,h6').split(',');

		var item,i=0;
		var innerhtml='<div class="SC_Panel" style="width:190px;height:150px;">';
		this._blockDisplayNames = {};
		while(item=items[i++]){
			innerhtml+='<div class="SC_Item" dropDownItemName="'+item+'"><div class="BaseFont"><'+item+'>'+formatNames['block'+item.toUpperCase()]+'</'+item+'></div></div>';
			this._blockDisplayNames[item.toLowerCase()]=formatNames['block'+item.toUpperCase()];
		}
		this.contentHtml = innerhtml+"</div>";
	},

	setup: function(){
		dojo.widget.Editor2ToolbarFormatBlockSelect.superclass.setup.call(this);

		var nodes = this._dropdown.domNode.all || this._dropdown.domNode.getElementsByTagName("*");
		this._blockNames = {};
		for(var x=0; x<nodes.length; x++){
			var node = nodes[x];
			dojo.html.disableSelection(node);
			var name=node.getAttribute("dropDownItemName")
			if(name){
				this._blockNames[name] = node;
			}
		}
		for(var name in this._blockNames){
			dojo.event.connect(this._blockNames[name], "onclick", this, "onChange");
			dojo.event.connect(this._blockNames[name], "onmouseover", this, "onMouseOverItem");
			dojo.event.connect(this._blockNames[name], "onmouseout", this, "onMouseOutItem");
		}
	},

	onDropDownDestroy: function(){
		if(this._blockNames){
			for(var name in this._blockNames){
				delete this._blockNames[name];
				delete this._blockDisplayNames[name];
			}
		}
	},

	refreshState: function(){
		dojo.widget.Editor2ToolbarFormatBlockSelect.superclass.refreshState.call(this);
		if(this._lastState != dojo.widget.Editor2Manager.commandState.Disabled){
			var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
			if(curInst){
				var _command = curInst.getCommand(this._name);
				if(_command){
					var format = _command.getValue();
					if(format == this._lastSelectedFormat && this._blockDisplayNames){
						return this._lastState;
					}
					this._lastSelectedFormat = format;
					var label = this._domNode.getElementsByTagName("label")[0];
					var text = this._blockDisplayNames[format.toLowerCase()];
					if(text){
						label.innerHTML = text;
					}else{
						label.innerHTML = "&nbsp;";
					}
				}
			}
		}

		return this._lastState;
	}
});

dojo.declare("dojo.widget.Editor2ToolbarFontSizeSelect", dojo.widget.Editor2ToolbarComboItem,{
	// summary: dojo.widget.Editor2ToolbarFontSizeSelect provides a dropdown list for setting fontsize
	// description: 
	//		to customize the items in this dropdown, set fontSizes in toolbarConfig on Editor2
	//		such as: toolbarConfig={fontSizes:'3,4,5'};
	//		or specify attribute dojoETItemItems in the toolbar template in the node with 
	//		dojoETItemName="fontsize", such as: dojoETItemItems="3,4,5"
	create: function(node, toolbar){
		dojo.widget.Editor2ToolbarFontSizeSelect.superclass.create.apply(this, arguments);
		var sizeNames = dojo.i18n.getLocalization("dojo.widget", "Editor2", toolbar.lang);
		var items=(toolbar.config['fontSizes'] || node.getAttribute('dojoETItemItems') || '1,2,3,4,5,6,7').split(',');
		var item,i=0;
		this._fontSizeDisplayNames = {};
		var innerhtml='<div class="SC_Panel" style="width: 150px; height: 150px;"><table width="100%" cellspacing="0" cellpadding="0" style="table-layout: fixed;"><tbody><tr><td nowrap="">';
		while(item=items[i++]){
			innerhtml+='<div class="SC_Item" dropDownItemName="'+item+'"><font size="'+item+'">'+sizeNames['fontSize'+item]+'</font></div>';
			this._fontSizeDisplayNames[item] = sizeNames['fontSize'+item];
		}
		this.contentHtml = innerhtml+"</td></tr></tbody></table></div>";
	},
	setup: function(){
		dojo.widget.Editor2ToolbarFontSizeSelect.superclass.setup.call(this);

		var nodes = this._dropdown.domNode.all || this._dropdown.domNode.getElementsByTagName("*");
		var fontsizes = {};
		
		for(var x=0; x<nodes.length; x++){
			var node = nodes[x];
			dojo.html.disableSelection(node);
			var name=node.getAttribute("dropDownItemName")
			if(name){
				fontsizes[name] = node;
			}
		}
		for(var name in fontsizes){
			dojo.event.connect(fontsizes[name], "onclick", this, "onChange");
			dojo.event.connect(fontsizes[name], "onmouseover", this, "onMouseOverItem");
			dojo.event.connect(fontsizes[name], "onmouseout", this, "onMouseOutItem");
		}
	},

	onDropDownDestroy: function(){},

	refreshState: function(){
		dojo.widget.Editor2ToolbarFormatBlockSelect.superclass.refreshState.call(this);
		if(this._lastState != dojo.widget.Editor2Manager.commandState.Disabled){
			var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
			if(curInst){
				var _command = curInst.getCommand(this._name);
				if(_command){
					var size = _command.getValue();
					if(size == this._lastSelectedSize && this._fontSizeDisplayNames){
						return this._lastState;
					}
					this._lastSelectedSize = size;
					var label = this._domNode.getElementsByTagName("label")[0];
					var sizename = this._fontSizeDisplayNames[size];
					if(sizename){
						label.innerHTML = sizename;
					}else{
						label.innerHTML = "&nbsp;";
					}
				}
			}
		}
		return this._lastState;
	}
});

dojo.declare("dojo.widget.Editor2ToolbarFontNameSelect", dojo.widget.Editor2ToolbarFontSizeSelect, {
	// summary: dojo.widget.Editor2ToolbarFontNameSelect provides a dropdown list for setting fontname
	// description: 
	//		to customize the items in this dropdown, set fontNames in toolbarConfig on Editor2
	//		or specify attribute dojoETItemItems in the toolbar template in the node with 
	//		dojoETItemName="fontname", see dojo.widget.Editor2ToolbarFontSizeSelect doc for samples
	create: function(node, toolbar){
		//do not call Editor2ToolbarFontSizeSelect::create, we shall call its superclass::create
		dojo.widget.Editor2ToolbarFontSizeSelect.superclass.create.apply(this, arguments);
		var items=(toolbar.config['fontNames'] || node.getAttribute('dojoETItemItems') || 'Arial,Comic Sans MS,Courier New,Tahoma,Times New Roman,Verdana').split(',');
		var item,i=0;
		this._fontSizeDisplayNames = {};
		var innerhtml='<div class="SC_Panel" style="width: 150px; height: 150px;">';
		while(item=items[i++]){
			innerhtml+='<div class="SC_Item" dropDownItemName="'+item+'"><font face="'+item+'">'+item+'</font></div>';
			this._fontSizeDisplayNames[item] = item;
		}
		this.contentHtml = innerhtml+"</div>";
	}
});
