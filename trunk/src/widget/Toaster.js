dojo.provide("dojo.widget.Toaster");

dojo.require("dojo.widget.*");
dojo.require("dojo.lfx.*");

// This is mostly taken from Jesse Kuhnert's MessageNotifier.
// Modified by Bryan Forbes to support topics and a variable delay.

dojo.widget.defineWidget(
	"dojo.widget.Toaster",
	dojo.widget.HtmlWidget,
	{
		templateString: '<div dojoAttachPoint="domNode" dojoAttachEvent="onClick:onSelect"><div dojoAttachPoint="messageNode"></div></div>',
		templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlToaster.css"),
		
		messageTopic: "",
		messageNode: null,
		
		// possible message types
		messageTypes: {
			MESSAGE: "MESSAGE",
			WARNING: "WARNING",
			ERROR: "ERROR",
			FATAL: "FATAL"
		},

		// css classes
		nodeCssClass: "toasterBlock",
		contentCssClass: "toasterContent",
		messageCssClass: "toasterMessage",
		warningCssClass: "toasterWarning",
		errorCssClass: "toasterError",
		fatalCssClass: "toasterFatal",
		overflowCssClass: "toasterBodyOverflow",

		position: "bottom", // can be "bottom", "top", "left", or "right"
		showDelay: 2000,

		slideAnim: null,
		fadeAnim: null,

		postCreate: function(){
			this.hide();
			dojo.html.addClass(this.domNode, this.nodeCssClass);
			this.domNode.style.position = "absolute";
			dojo.html.setClass(this.messageNode, this.contentCssClass);
			if(this.messageTopic){
				dojo.event.topic.subscribe(this.messageTopic, this, "setContent");
			}
		},

		setContent: function(msg, messageType){
			// sync animations so there are no ghosted fades and such
			if(this.slideAnim && this.slideAnim.status() == "playing"){
				dojo.lang.setTimeout(50, dojo.lang.hitch(this, function(){
					this.setContent(msg, messageType);
				}));
				return;
			}else if(this.slideAnim){
				this.slideAnim.stop();
				if(this.fadeAnim) this.fadeAnim.stop();
			}
			if(!msg){
				dojo.debug("Toaster.setContent() incoming content was null, ignoring.");
				return;
			}

			// determine type of content and apply appropriately
			dojo.html.removeClass(this.domNode, this.messageCssClass);
			dojo.html.removeClass(this.domNode, this.warningCssClass);
			dojo.html.removeClass(this.domNode, this.errorCssClass);
			dojo.html.removeClass(this.domNode, this.fatalCssClass);
			
			if(msg instanceof String || typeof msg == "string"){
				this.messageNode.innerHTML = msg;
			}else if(dojo.html.isNode(msg)){
				this.messageNode.innerHTML = dojo.html.getContentAsString(msg);
			}else{
				dojo.raise("Toaster.setContent(): msg is of unknown type:" + msg);
			}

			switch(messageType){
				case this.messageTypes.WARNING:
					dojo.html.addClass(this.domNode, this.warningCssClass);
					break;
				case this.messageTypes.ERROR:
					dojo.html.addClass(this.domNode, this.errorCssClass);
					break
				case this.messageTypes.FATAL:
					dojo.html.addClass(this.domNode, this.fatalCssClass);
					break;
				case this.messageTypes.MESSAGE:
				default:
					dojo.html.addClass(this.domNode, this.messageCssClass);
					break;
			}

			// now do funky animation of widget appearing from
			// bottom right of page and up
			var view = dojo.html.getViewport();
			var scroll = dojo.html.getScroll();

			this.show();

			var nodeSize = dojo.html.getMarginBox(this.domNode);

			// sets node below bottom right hand corner so it can animate "up"
			// TODO: set up different position and slide-out directions
			this.domNode.style.left=(view.width - nodeSize.width - 1 - scroll.left)+"px";
			this.domNode.style.top=(view.height + nodeSize.height + 10 + scroll.top)+"px";

			// TODO: Add scroll change event lisener similar to Dialog.js widget so
			// that notify window stays with bottom of screen when it is moved

			// disable scrolling so node being below screen doesn't create scrollbars
			if(!(dojo.body().offsetHeight > view.height) // only if not already scrolling
			   && !dojo.html.hasClass(dojo.body(), this.overflowCssClass)){
				dojo.html.addClass(dojo.body(), this.overflowCssClass);
			}
			
			var endCoords = {
				top: view.height - nodeSize.height - 2 + scroll.top,
				left: view.width - nodeSize.width - 1 - scroll.left
			};

			this.slideAnim = dojo.lfx.html.slideTo(
				this.domNode,
				endCoords,
				450,
				null,
				dojo.lang.hitch(this, function(nodes, anim){
					dojo.html.removeClass(dojo.body(), this.overflowCssClass);
					dojo.lang.setTimeout(dojo.lang.hitch(this, function(evt){
						this.fadeAnim = dojo.lfx.html.fadeHide(
							this.domNode,
							1000,
							null,
							dojo.lang.hitch(this, function(evt){
								dojo.html.setOpacity(this.domNode, 1.0);
							})).play();
					}), this.showDelay);
				})).play();
		},

		onSelect: function(e) { }
	},
	"html"
);
