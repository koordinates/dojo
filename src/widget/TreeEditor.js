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
	sync: false,  // finish editing in sync/async mode
	
	controller: null,
		
	node: null,
	
	richTextParams: {},
	
	
	
	getContents: function() {
		return this.richText.getEditorContent();
	},
	
	open: function(node) {
		
		if (!this.richText) {
			this.richText = dojo.widget.createWidget("RichText", this.richTextParams, node.labelNode);
		
			dojo.event.connect("around", this.richText, "onKeyDown", this, "richText_onKeyDown" );
			dojo.event.connect(this.richText, "onBlur", this, "richText_onBlur" );
		} else {
			this.richText.open(node.labelNode);
		}
		
		this.node = node;		
	},
	
	close: function(save) {
		if (save) {
			var title = this.getContents();
		}
		
		this.richText.close(save);
		
		if (save) {
			this.node.setTitle(title); // to make sure everything updated and event sent			
		}
		
		this.node = null;	
	},
	
	isClosed: function() {
		return !this.richText || this.richText.isClosed;
	},
	
	richText_onKeyDown: function(invocation) {
		var e = invocation.args[0];
		if((!e)&&(this.object)) {
			e = dojo.event.browser.fixEvent(this.editor.window.event);
		}
		
		switch (e.keyCode) {
			case e.KEY_ESCAPE:
				this.finish(false);
				dojo.event.browser.stopEvent(e);		
				break;
			case e.KEY_ENTER:
				if( e.ctrlKey && !this.singleLineMode ) {
					this.editor.execCommand( "inserthtml", "<br/>" );
					dojo.event.browser.stopEvent(e);		
				}
				else {
					this.finish(true);
					dojo.event.browser.stopEvent(e);		
					//dojo.debug("finish");
				}
				break;
			default:
				return invocation.proceed();
		}
	},
	
	richText_onBlur: function() {
		this.finish(this.saveOnBlur);
	},
	
	
	finish: function(save) {
		return this.controller.editLabelFinish(this.node, save, this.sync);
	}
		
		
	
});
