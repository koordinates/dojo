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
	// summary: dojo.widget.Editor2ToolbarComboItem provides a realonly combobox in the toolbar

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
			var curInst = this.getMainComponent();
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
			var curInst = this.getMainComponent();
			if(curInst){
				var _command = curInst.getCommand(this._name);
				if(_command){
					var format = _command.getValue();
					if(format == this._lastSelectedFormat && this._blockDisplayNames){
						return this._lastState;
					}
					var label = this._domNode.getElementsByTagName("label")[0];
					this._lastSelectedFormat = format;
					var text = format?this._blockDisplayNames[format.toLowerCase()]:false;
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
		dojo.widget.Editor2ToolbarFontSizeSelect.superclass.refreshState.call(this);
		if(this._lastState != dojo.widget.Editor2Manager.commandState.Disabled){
			var curInst = this.getMainComponent();
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

dojo.widget.Editor2ToolbarItemManager.registerHandler(function(name){
	switch(name){
		case 'formatblock':
			return new dojo.widget.Editor2ToolbarFormatBlockSelect("formatblock");
		case 'fontsize':
			return new dojo.widget.Editor2ToolbarFontSizeSelect("fontsize");
		case 'fontname':
			return new dojo.widget.Editor2ToolbarFontNameSelect("fontname");
		case 'specialchar':
			return new dojo.widget.Editor2ToolbarSpecialCharSelect('specialchar');
	}
});

dojo.lang.declare("dojo.widget.Editor2Plugin.specialCharCommand", dojo.widget.Editor2Command,
{
	getText: function(){
		return 'Insert Special Characters';
//		var browserCommandNames = dojo.i18n.getLocalization("dojo.widget", "Editor2BrowserCommand", this._editor.lang);
//		return browserCommandNames['specialchar'];
	}
});

dojo.widget.Editor2Plugin.DropDown = {
	getCommand: function(editor, name){
//		var browserCommandNames = dojo.i18n.getLocalization("dojo.widget", "Editor2BrowserCommand", editor.lang);
		switch(name){
			case 'specialchar':
				return new dojo.widget.Editor2Plugin.specialCharCommand(editor, name);
		}
	}
}

dojo.widget.Editor2Manager.registerHandler(dojo.widget.Editor2Plugin.DropDown.getCommand);

dojo.declare("dojo.widget.Editor2ToolbarSpecialCharSelect", dojo.widget.Editor2ToolbarComboItem, {
	// summary: dojo.widget.Editor2ToolbarSpecialCharSelect is a dropdown which have a table of special chars
	// description: 
	//		to customize the items in this dropdown, set specialChars in toolbarConfig on Editor2, 
	//		or specify attribute dojoETItemItems in the toolbar template in the node with 
	//		dojoETItemName="specialchar", see dojo.widget.Editor2ToolbarFontSizeSelect doc for samples

	create: function(node, toolbar){
		dojo.widget.Editor2ToolbarSpecialCharSelect.superclass.create.apply(this, arguments);
		var items=(toolbar.config['specialChars']||node.getAttribute('dojoETItemItems')||"&euro;,&lsquo;,&rsquo;,&rsquo;,&ldquo;,&rdquo;,&ndash;,&mdash;,&iexcl;,&cent;,&pound;,&curren;,&yen;,&brvbar;,&sect;,&uml;,&copy;,&ordf;,&laquo;,&not;,&reg;,&macr;,&deg;,&plusmn;,&sup2;,&sup3;,&acute;,&micro;,&para;,&middot;,&cedil;,&sup1;,&ordm;,&raquo;,&frac14;,&frac12;,&frac34;,&iquest;,&Agrave;,&Aacute;,&Acirc;,&Atilde;,&Auml;,&Aring;,&AElig;,&Ccedil;,&Egrave;,&Eacute;,&Ecirc;,&Euml;,&Igrave;,&Iacute;,&Icirc;,&Iuml;,&ETH;,&Ntilde;,&Ograve;,&Oacute;,&Ocirc;,&Otilde;,&Ouml;,&times;,&Oslash;,&Ugrave;,&Uacute;,&Ucirc;,&Uuml;,&Yacute;,&THORN;,&szlig;,&agrave;,&aacute;,&acirc;,&atilde;,&auml;,&aring;,&aelig;,&ccedil;,&egrave;,&eacute;,&ecirc;,&euml;,&igrave;,&iacute;,&icirc;,&iuml;,&eth;,&ntilde;,&ograve;,&oacute;,&ocirc;,&otilde;,&ouml;,&divide;,&oslash;,&ugrave;,&uacute;,&ucirc;,&uuml;,&uuml;,&yacute;,&thorn;,&yuml;,&OElig;,&oelig;,&sbquo;,&#8219;,&bdquo;,&hellip;,&trade;,&#9658;,&bull;,&rarr;,&rArr;,&hArr;,&diams;,&asymp;").split(',');

		var item,i=0;
		var cols = 20;
		var innerhtml='<table style="font-size:11px;border:1px solid #8F8F73;background-color:#FFFFFF;" cellpadding="0" cellspacing="0"><tr><td width="*"><table cellpadding="1" cellspacing="1" align="center" border="0">';
		while(item=items[i++]){
			if((i-1)%20 == 0){
				innerhtml+='<tr>';
			}
			innerhtml+='<td class="dojoDropDownItem" dojoETDropDownItem="'+item+'">'+item+'</td>';
			if(i%20 == 0){
				innerhtml+='</tr>';
			}
		}
		this.contentHtml = innerhtml+'</table></td><td nowrap>&nbsp;&nbsp;&nbsp;&nbsp;</td><td valign="top" ><div style="font-weight:bold;width:35px;height:35px;font-size:25px;text-align:center" class="ToolbarSelectHighlightedItem">&nbsp;</div></td></tr></table>';
	},

	//use those functions defined in Editor2ToolbarButton, as this is a normal icon in the toolbar, not a combo
	enableToolbarItem: dojo.widget.Editor2ToolbarButton.prototype.enableToolbarItem,
	disableToolbarItem: dojo.widget.Editor2ToolbarButton.prototype.disableToolbarItem,

	setup: function(){
		dojo.widget.Editor2ToolbarSpecialCharSelect.superclass.setup.call(this);

		var nodes = this._dropdown.domNode.getElementsByTagName("td");
		var i=0,node;
		while(node=nodes[i++]){
			dojo.html.disableSelection(node);
			if(node.getAttribute('dojoETDropDownItem')){
				dojo.event.connect(node, "onclick", this, "onChange");
				dojo.event.connect(node, "onmouseover", this, "onMouseOverItem");
				dojo.event.connect(node, "onmouseout", this, "onMouseOutItem");
			}
		}
		this.sampleNode = this._dropdown.domNode.getElementsByTagName("div")[0];
	},
	onChange: function(e){
		if(this._parentToolbar.checkAvailability()){
			var curInst = this.getMainComponent();
			curInst.execCommand('inserthtml',e.target.getAttribute('dojoETDropDownItem'),'inserthtml');//'specialchar'
		}
		this._dropdown.close();
	},

	onMouseOverItem: function(e){
		dojo.html.addClass(e.target, 'ToolbarSelectHighlightedItem');
		this.sampleNode.innerHTML=e.target.getAttribute('dojoETDropDownItem');
	},

	onMouseOutItem: function(e){
		dojo.html.removeClass(e.target, 'ToolbarSelectHighlightedItem');
		this.sampleNode.innerHTML="&nbsp;";
	}
});