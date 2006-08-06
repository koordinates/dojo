dojo.require("dojo.widget.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.RichText");

dojo.provide("dojo.widget.TreeEditor");

dojo.widget.defineWidget(
	"dojo.widget.TreeEditor",
	dojo.widget.HtmlWidget,
{
		
		
	singleLineMode: true, // enter saves
	saveOnBlur: true, // blur or new edit saves current
	
	controller: null,
		
	node: null,
	
	initialize: function(args) {
		if (args.controller) {
			this.controller = dojo.widget.byId(args.controller);
		}
	},
	
	makeEditor: function() {
		this.editor = dojo.widget.createWidget( "RichText") ;	
		
		dojo.event.connect( "around", this.editor, "onKeyDown", this, "editor_keyDownHandler" );
		dojo.event.connect( this.editor, "onBlur", this, "editor_finish" );		
	},
	
	editLabelStart: function(node) {
		if (!this.editor) {
			this.makeEditor();
		}
		
		this.editor_close(false);
		
		
		this.node = node;
		
	},
	
	isClosed: function() {
		return this.editor.isClosed;
	},
	
	editor_keyDownHandler: function(invocation) {
		var e = invocation.args[0];
		if((!e)&&(this.object)) {
			e = dojo.event.browser.fixEvent( this.editor.window.event );
		}
		
		switch (e.keyCode) {
			case e.KEY_ESCAPE:
				this.editor_close(false);
				break;
			case e.KEY_ENTER:
				if( e.ctrlKey && !this.singleLineMode ) {
					this.editor.execCommand( "inserthtml", "<br/>" );
				}
				else {
					this.editor_close( true );
				}
				break;
			default:
				return invocation.proceed();
		}
	},
	
	editor_close: function(save) {
		if( !this.editor ) {
			return;
		}
		
		if (!save) {
			this.node = null;
			this.editor.close(false);
			return;
		}
		
		return this.controller.	
			// now call save method of controller and close editor on its success
			dojo.debug(this.editor.getEditorContent());
			this.editor.close(true);
			dojo.debug(this.node.labelNode.innerHTML);
			
			
		}
	},
	
	editor_closeHandler: function() {
		dojo.event.disconnect( "around", this.editor, "onKeyDown", this, "editor_keyDownHandler" );
		dojo.event.disconnect( this.editor, "onBlur", this, "editor_close" );
		dojo.event.disconnect( "before", this.editor, "close", this, "editor_closeHandler" );
	}
});
