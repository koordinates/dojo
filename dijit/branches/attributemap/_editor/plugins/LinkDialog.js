dojo.provide("dijit._editor.plugins.LinkDialog");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._editor._Plugin");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.ValidationTextBox");

dojo.declare("dijit._editor.plugins.DualStateDropDownButton",
	dijit.form.DropDownButton,
	{
		// summary: a DropDownButton but button can be displayed in two states (checked or unchecked)
		setChecked: dijit.form.ToggleButton.prototype.setChecked
	}
);

dojo.declare("dijit._editor.plugins.UrlTextBox",
	dijit.form.ValidationTextBox,
	{
		// summary: the URL input box we use in our dialog

		// regular expression for URLs, generated from dojo.regexp.url()
		regExp: "((https?|ftps?)\\://|)(([0-9a-zA-Z]([-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?\\.)+(arpa|aero|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|xxx|jobs|mobi|post|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|eu|es|et|fi|fj|fk|fm|fo|fr|ga|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sk|sl|sm|sn|sr|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tm|tn|to|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)|(((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])|(0[xX]0*[\\da-fA-F]?[\\da-fA-F]\\.){3}0[xX]0*[\\da-fA-F]?[\\da-fA-F]|(0+[0-3][0-7][0-7]\\.){3}0+[0-3][0-7][0-7]|(0|[1-9]\\d{0,8}|[1-3]\\d{9}|4[01]\\d{8}|42[0-8]\\d{7}|429[0-3]\\d{6}|4294[0-8]\\d{5}|42949[0-5]\\d{4}|429496[0-6]\\d{3}|4294967[01]\\d{2}|42949672[0-8]\\d|429496729[0-5])|0[xX]0*[\\da-fA-F]{1,8}|([\\da-fA-F]{1,4}\\:){7}[\\da-fA-F]{1,4}|([\\da-fA-F]{1,4}\\:){6}((\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d\\d|2[0-4]\\d|25[0-5])))(\\:(0|[1-9]\\d*))?(/([^?#\\s/]+/)*)?([^?#\\s/]+(\\?[^?#\\s/]*)?(#[A-Za-z][\\w.:-]*)?)?",

		required: true,

		invalidMessage: "Invalid URL.  Enter a full URL like 'http://www.dojotoolkit.org'", // FixME: i18n
		
		getValue: function(){
			if(!/^(https?|ftps?)/.test(this.textbox.value)){
				this.textbox.value="http://"+this.textbox.value;
			}
			return this.textbox.value;
		}
	}
);

dojo.declare("dijit._editor.plugins.LinkDialog", 
	dijit._editor._Plugin,  
	function(){
		var _this = this;
		this.dropDown = new dijit.TooltipDialog({
			title: "link url", // FIxmE: i18n
			execute: dojo.hitch(this, "setValue"),
			onOpen: function(){
				dijit.TooltipDialog.prototype.onOpen.apply(this, arguments);
				_this._onOpenDialog();
			},
			onCancel: function(){
				setTimeout(dojo.hitch(_this, "_onCloseDialog"),0);
			},
			onClose: dojo.hitch(this, "_onCloseDialog")
		});
		this.dropDown.setContent(this.linkDialogTemplate);
		this.dropDown.startup();
	},
	{
		buttonClass: dijit._editor.plugins.DualStateDropDownButton,

		linkDialogTemplate: [
			"<label for='urlInput'>Url:&nbsp;</label>",
			"<input dojoType=dijit._editor.plugins.UrlTextBox name='urlInput'><br>",
			"<label for='textInput'>Text:&nbsp;</label>",
			"<input dojoType=dijit.form.TextBox name='textInput'>",
			"<br>",
			"<button dojoType=dijit.form.Button type='submit'>Set</button>"
		].join(""),

		useDefaultCommand: false,

		command: "createLink",

		dropDown: null,

		setValue: function(args){
			// summary: callback from the dialog when user hits "set" button
			//TODO: prevent closing popup if the text is empty
			this._onCloseDialog();
			var attstr='href="'+args.urlInput+'" _djrealurl="'+args.urlInput+'"';
//			console.log(args,this.editor,'<a '+attstr+'>'+args.textInput+'</a>');
			this.editor.execCommand('inserthtml', '<a '+attstr+'>'+args.textInput+'</a>');
//			this.editor.execCommand(this.command, args.urlInput);
 		},

		_savedSelection: null,
		_onCloseDialog: function(){
			this.editor.focus();
			// FIXME: IE is really messed up here!!
			if(dojo.isIE && this._savedSelection){
//				this.editor.focus();
				var range = this.editor.document.selection.createRange();
				range.moveToBookmark(this._savedSelection);
				range.select();
				this._savedSelection = null;
			}
		},
		_onOpenDialog: function(){
			var a = dojo.withGlobal(this.editor.window, "getAncestorElement",dijit._editor.selection, ['a']);
			var url='',text='';
			if(a){
				url=a.getAttribute('_djrealurl');
				text=a.textContent||a.innerText;
				dojo.withGlobal(this.editor.window, "selectElement",dijit._editor.selection, [a]);
			}else{
				text=dojo.withGlobal(this.editor.window, dijit._editor.selection.getSelectedText);
			}
			// FIXME: IE is *really* b0rken
			if(dojo.isIE){
				var range = this.editor.document.selection.createRange();
				this._savedSelection = range.getBookmark();
			}
			this.dropDown.setValues({'urlInput':url,'textInput':text});
			//dijit.focus(this.urlInput);
			// TODO: if there's an existing link when we click this, should suck the
			// information about that link and prepopulate the dialog
		},

		updateState: function(){
			// summary: change shading on button if we are over a link (or not)

			var _e = this.editor;
			if(!_e){ return; }
			if(!_e.isLoaded){ return; }
			if(this.button){
				try{
					// display button differently if there is an existing link associated with the current selection
					var hasA = dojo.withGlobal(this.editor.window, "hasAncestorElement",dijit._editor.selection, ['a']);
					this.button.setChecked(hasA);
				}catch(e){
					console.debug(e);
				}
			}
		}
	}
);
