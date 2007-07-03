dojo.provide("dijit.form.Button");

dojo.require("dijit.form._FormWidget");
dojo.require("dijit.util.popup");

dojo.declare(
	"dijit.form.Button",
	dijit.form._FormWidget,
	{
/*
 * usage
 *	<button dojoType="button" onClick="...">Hello world</button>
 *
 *  var button1 = new dijit.form.Button({label: "hello world", onClick: foo});
 *	dojo.body().appendChild(button1.domNode);
 */
		// summary
		//	Basically the same thing as a normal HTML button, but with special styling.

		// label: String
		//	text to display in button
		label: "",

		// iconClass: String
		//	class to apply to div in button to make it display an icon
		iconClass: "",

		type: "button",
		baseClass: "dijitButton",
		templatePath: dojo.moduleUrl("dijit.form", "templates/Button.html"),

		// TODO: set button's title to this.containerNode.innerText

		onClick: function(/*Event*/ e){
			// summary: callback for when button is clicked; user can override this function
		},

		setLabel: function(/*String*/ content){
			// summary: reset the label (text) of the button; takes an HTML string
			this.containerNode.innerHTML = this.label = content;
			if(dojo.isMozilla){ // Firefox has re-render issues with tables
				var oldDisplay = dojo.getComputedStyle(this.domNode).display;
				this.domNode.style.display="none";
				var _this = this;
				setTimeout(function(){_this.domNode.style.display=oldDisplay;},1);
			}
			// TODO: set button's title to this.containerNode.innerText
		}		
	}
);

/*
 * usage
 *	<button dojoType="DropDownButton" label="Hello world"><div dojotype=dijit.Menu>...</div></button>
 *
 *  var button1 = new dijit.form.DropDownButton({ label: "hi", dropDown: new dijit.Menu(...) });
 *	dojo.body().appendChild(button1);
 */
dojo.declare(
	"dijit.form.DropDownButton",
	[dijit.form.Button, dijit._Container],
	{
		// summary
		//		push the button and a menu shows up

		baseClass : "dijitDropDownButton",

		templatePath: dojo.moduleUrl("dijit.form" , "templates/DropDownButton.html"),

		_fillContent: function(){
			// my inner HTML contains both the button contents and a drop down widget, like
			// <DropDownButton>  <span>push me</span>  <Menu> ... </Menu> </DropDownButton>
			// The first node is assumed to be the button content. The widget is the popup.
//			if(this.srcNodeRef){ //FIXME: how is it possible for srcNodeRef to be undefined?
				//FIXME: figure out how to filter out the widget and use all remaining nodes as button
				//	content, not just nodes[0]
				var nodes = dojo.query("*", this.srcNodeRef);
				dijit.form.DropDownButton.superclass._fillContent.call(this, nodes[0]);

				// save pointer to srcNode so we can grab the drop down widget after it's instantiated
				this.dropDownContainer = this.srcNodeRef;
//			}
		},

		startup: function(){
			// the child widget from srcNodeRef is the dropdown widget.  Insert it in the page DOM,
			// make it invisible, and store a reference to pass to the popup code.
			if(!this.dropDown){
				var dropDownNode = dojo.query("[widgetId]", this.dropDownContainer)[0];
				this.dropDown = dijit.util.manager.byNode(dropDownNode);
				delete this.dropDownContainer;
			}
			dojo.body().appendChild(this.dropDown.domNode);
			this.dropDown.domNode.style.display="none";
		},

		_onArrowClick: function(/*Event*/ e){
			// summary: callback when the user mouse clicks on menu popup node
			if(this.disabled){ return; }
			this._toggleDropDown();
		},

		_onKey: function(/*Event*/ e){
			// summary: callback when the user presses a key on menu popup node
			if(this.disabled){ return; }
			if(e.keyCode == dojo.keys.DOWN_ARROW){
				if(!this.dropDown || this.dropDown.domNode.style.display=="none"){
					dojo.stopEvent(e);
					return this._toggleDropDown();
				}
			}
		},

		_toggleDropDown: function(){
			// summary: toggle the drop-down widget; if it is up, close it, if not, open it
			if(this.disabled){ return; }
			this.popupStateNode.focus();
			var dropDown = this.dropDown;
			if(!dropDown){ return false; }
			if(!dropDown.isShowingNow){
				var oldWidth=dropDown.domNode.style.width;
				var self = this;
				dijit.util.popup.open({
					popup: dropDown,
					around: this.domNode,
					onClose: function(){
						dropDown.domNode.style.width = oldWidth;
						self.popupStateNode.removeAttribute("popupActive");
					}
				});
				if(this.domNode.offsetWidth > dropDown.domNode.offsetWidth){
					// make menu at least as wide as the button
					dojo.marginBox(dropDown.domNode, {w:this.domNode.offsetWidth});
				}
				this.popupStateNode.setAttribute("popupActive", "true");
				this._opened=true;
			}else{
				dijit.util.popup.closeAll();
				this._opened = false;
			}
			// TODO: set this.selected and call setStateClass(), to affect button look while drop down is shown
			return false;
		}
	});

/*
 * usage
 *	<button dojoType="ComboButton" onClick="..."><span>Hello world</span><div dojoType=dijit.Menu>...</div></button>
 *
 *  var button1 = new dijit.form.ComboButton({label: "hello world", onClick: foo, dropDown: "myMenu"});
 *	dojo.body().appendChild(button1.domNode);
 */
dojo.declare(
	"dijit.form.ComboButton",
	dijit.form.DropDownButton,
	{
		// summary
		//		left side is normal button, right side displays menu
		templatePath: dojo.moduleUrl("dijit.form", "templates/ComboButton.html"),

		// optionsTitle: String
		//  text that describes the options menu (accessibility)
		optionsTitle: "",

		baseClass: "dijitComboButton",

		_onButtonClick: function(/*Event*/ e){
			// summary: callback when the user mouse clicks the button portion
			dojo.stopEvent(e);
			if(this.disabled){ return; }
			this.focusNode.focus();
			return this.onClick(e);
		}
	});

dojo.declare(
	"dijit.form.ToggleButton",
	dijit.form.Button,
{
	// summary
	//	A button that can be in two states (selected or not).
	//	Can be base class for things like tabs or checkbox or radio buttons

	baseClass: "dijitToggleButton",

	// selected: Boolean
	//		True if the button is depressed, or the checkbox is checked,
	//		or the radio button is selected, etc.
	selected: false,

	onChange: function(/*Boolean*/ selected){
		// summary: callback for when state changes
	},

	onClick: function(/*Event*/ evt){
		this.setSelected(!this.selected);
	},

	setSelected: function(/*Boolean*/ selected){
		// summary
		//	Programatically deselect the button
		this.selected = selected;
		this._setStateClass();
		this.onChange(selected);
	}
});
