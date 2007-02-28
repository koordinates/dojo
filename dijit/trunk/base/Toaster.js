dojo.provide("dijit.base.Toaster");

dojo.require("dojo.event.common");
dojo.require("dojo.event.topic");
dojo.require("dojo.lfx.html");
dojo.require("dojo.html.iframe");

dojo.require("dijit.base.Widget");
dojo.require("dijit.base.TemplatedWidget");

// This is mostly taken from Jesse Kuhnert's MessageNotifier.
// Modified by Bryan Forbes to support topics and a variable delay.
// Modified by Karl Tiedt to support 0 duration messages that require user interaction and message stacking

dojo.declare(
	"dijit.base.Toaster",
	[dijit.base.Widget, dijit.base.TemplatedWidget],
	null,
	{
		// summary
		//		Message that slides in from the corner of the screen, used for notifications
		//		like "new email".
		templateString: '<div dojoAttachPoint="clipNode"><div dojoAttachPoint="containerNode" dojoAttachEvent="onClick:onSelect"><div dojoAttachPoint="contentNode"></div></div></div>',

		// messageTopic: String
		//		Name of topic; anything published to this topic will be displayed as a message.
		//		Message format is either String or an object like
		//		{message: "hello word", type: "ERROR", duration: 500}
		messageTopic: "",
		
		// messageTypes: Enumeration
		//		Possible message types.
		messageTypes: {
			MESSAGE: "MESSAGE",
			WARNING: "WARNING",
			ERROR: "ERROR",
			FATAL: "FATAL"
		},
		
		// defaultType: String
		//		If message type isn't specified (see "messageTopic" parameter),
		//		then display message as this type.
		//		Possible values in messageTypes enumeration ("MESSAGE", "WARNING", "ERROR", "FATAL")
		defaultType: "MESSAGE",

		// css classes
		clipCssClass: "dojoToasterClip",
		containerCssClass: "dojoToasterContainer",
		contentCssClass: "dojoToasterContent",
		messageCssClass: "dojoToasterMessage",
		warningCssClass: "dojoToasterWarning",
		errorCssClass: "dojoToasterError",
		fatalCssClass: "dojoToasterFatal",

		// positionDirection: String
		//		Position from which message slides into screen, one of
		//		["br-up", "br-left", "bl-up", "bl-right", "tr-down", "tr-left", "tl-down", "tl-right"]
		positionDirection: "br-up",
		
		// positionDirectionTypes: Enumeration
		//		Possible values for positionDirection parameter
		positionDirectionTypes: ["br-up", "br-left", "bl-up", "bl-right", "tr-down", "tr-left", "tl-down", "tl-right"],

		// duration: Integer
		//		Number of milliseconds to show message
		duration: "2000",

		// showDelay: Integer
		//		Deprecated and replaced by Duration -- Number of milliseconds to show message
		showDelay: "",

		//separator: String
		//		String used to separate messages if consecutive calls are made to setContent before previous messages go away
		separator: "<hr>",

		postCreate: function(){
			dijit.base.Toaster.superclass.postCreate.apply(this);
			if(this.showDelay!=''){
				dojo.deprecated("dijit.base.Toaster", "use 'duration' instead of 'showDelay'", "0.6");
				this.duration = this.showDelay;
			}
			this.hide();
			dojo.html.setClass(this.clipNode, this.clipCssClass);
			dojo.html.addClass(this.containerNode, this.containerCssClass);
			dojo.html.setClass(this.contentNode, this.contentCssClass);
			if(this.messageTopic){
				dojo.event.topic.subscribe(this.messageTopic, this, "_handleMessage");
			}
			if(!this.positionDirection || !dojo.lang.inArray(this.positionDirectionTypes, this.positionDirection)){
				this.positionDirection = this.positionDirectionTypes.BRU;//FIXME
			}
		},

		_handleMessage: function(msg){
			if(dojo.lang.isString(msg)){
				this.setContent(msg);
			}else{
				this.setContent(msg["message"], msg["type"], msg["duration"]);
			}
		},

		setContent: function(msg, messageType, duration){
			// summary
			//		sets and displays the given message and show duration
			// msg: String
			//		the message
			// messageType: Enumeration
			//		type of message; possible values in messageTypes array ("MESSAGE", "WARNING", "ERROR", "FATAL")
			// duration: Integer
			//		duration in milliseconds to display message before removing it
			duration = duration||this.duration;
			// sync animations so there are no ghosted fades and such
			if(this.slideAnim && this.slideAnim.status() == "playing"){
				dojo.lang.setTimeout(50, dojo.lang.hitch(this, function(){
					this.setContent(msg, messageType);
				}));
				return;
			}else if(this.slideAnim){
				this.slideAnim.stop();
				if(this.fadeAnim && this.fadeAnim.status() == "playing"){
					dojo.lang.setTimeout(50, dojo.lang.hitch(this, function(){
						this.setContent(msg, messageType);
					}));
					return;
				}
			}

			if(!msg){
				dojo.debug(this.widgetId + ".setContent() incoming content was null, ignoring.");
				return;
			}
			if(!this.positionDirection || !dojo.lang.inArray(this.positionDirectionTypes, this.positionDirection)){
				dojo.raise(this.widgetId + ".positionDirection is an invalid value: " + this.positionDirection);
			}

			// determine type of content and apply appropriately
			dojo.html.removeClass(this.containerNode, this.messageCssClass);
			dojo.html.removeClass(this.containerNode, this.warningCssClass);
			dojo.html.removeClass(this.containerNode, this.errorCssClass);
			dojo.html.removeClass(this.containerNode, this.fatalCssClass);

			dojo.html.clearOpacity(this.containerNode);

			var tmpMsg;
			if(msg instanceof String || typeof msg == "string"){
				tmpMsg = msg;
			}else if(dojo.html.isNode(msg)){
				tmpMsg = dojo.html.getContentAsString(msg);
			}else{
				dojo.raise("Toaster.setContent(): msg is of unknown type:" + msg);
			}
			var curMsg = this.contentNode.innerHTML;
			if(tmpMsg&&this.isVisible){
				this.contentNode.innerHTML = curMsg + "<br>" + this.separator + "<br>" + tmpMsg;
			}else{
				this.contentNode.innerHTML = tmpMsg;
			}
			switch(messageType){
				case this.messageTypes.WARNING:
					dojo.html.addClass(this.containerNode, this.warningCssClass);
					break;
				case this.messageTypes.ERROR:
					dojo.html.addClass(this.containerNode, this.errorCssClass);
					break;
				case this.messageTypes.FATAL:
					dojo.html.addClass(this.containerNode, this.fatalCssClass);
					break;
				case this.messageTypes.MESSAGE:
				default:
					dojo.html.addClass(this.containerNode, this.messageCssClass);
					break;
			}

			// now do funky animation of widget appearing from
			// bottom right of page and up
			this.show();
			var nodeSize = dojo.html.getMarginBox(this.containerNode);
			
			if(this.isVisible){
				this._placeClip();
			}else{
				// sets up initial position of container node and slide-out direction
				if(this.positionDirection.indexOf("-up") >= 0){
					this.containerNode.style.left=0+"px";
					this.containerNode.style.top=nodeSize.height + 10 + "px";
				}else if(this.positionDirection.indexOf("-left") >= 0){
					this.containerNode.style.left=nodeSize.width + 10 +"px";
					this.containerNode.style.top=0+"px";
				}else if(this.positionDirection.indexOf("-right") >= 0){
					this.containerNode.style.left = 0 - nodeSize.width - 10 + "px";
					this.containerNode.style.top = 0+"px";
				}else if(this.positionDirection.indexOf("-down") >= 0){
					this.containerNode.style.left = 0+"px";
					this.containerNode.style.top = 0 - nodeSize.height - 10 + "px";
				}else{
					dojo.raise(this.widgetId + ".positionDirection is an invalid value: " + this.positionDirection);
				}

				this.slideAnim = dojo.lfx.html.slideTo(
					this.containerNode,
					{ top: 0, left: 0 },
					450,
					null,
					dojo.lang.hitch(this, function(nodes, anim){
						//we build the fadeAnim here so we dont have to duplicate it later
						// can't do a fadeHide because we're fading the
						// inner node rather than the clipping node
						this.fadeAnim = dojo.lfx.html.fadeOut(
							this.containerNode,
							1000,
							null,
							dojo.lang.hitch(this, function(evt){
								this.isVisible = false;
								this.hide();
							}));
						//if duration == 0 we keep the message displayed until clicked
						//TODO: fix so that if a duration > 0 is displayed when a duration==0 is appended to it, the fadeOut is canceled
						if(duration>0){
							dojo.lang.setTimeout(dojo.lang.hitch(this, function(evt){
								// we must hide the iframe in order to fade
								// TODO: figure out how to fade with a BackgroundIframe
								if(this.bgIframe){
									this.bgIframe.hide();
								}
								this.fadeAnim.play();
							}), duration);
						}else{
							dojo.event.connect(
								this,
								'onSelect',
								dojo.lang.hitch(this, function(evt){
									this.fadeAnim.play();
								}));
						}
						this.isVisible = true;
					})).play();
				}
		},

		_placeClip: function(){
			var scroll = dojo.html.getScroll();
			var view = dojo.html.getViewport();

			var nodeSize = dojo.html.getMarginBox(this.containerNode);

			// sets up the size of the clipping node
			this.clipNode.style.height = nodeSize.height+"px";
			this.clipNode.style.width = nodeSize.width+"px";

			// sets up the position of the clipping node
			if(this.positionDirection.match(/^t/)){
				this.clipNode.style.top = scroll.top+"px";
			}else if(this.positionDirection.match(/^b/)){
				this.clipNode.style.top = (view.height - nodeSize.height - 2 + scroll.top)+"px";
			}
			if(this.positionDirection.match(/^[tb]r-/)){
				this.clipNode.style.left = (view.width - nodeSize.width - 1 - scroll.left)+"px";
			}else if(this.positionDirection.match(/^[tb]l-/)){
				this.clipNode.style.left = 0 + "px";
			}

			this.clipNode.style.clip = "rect(0px, " + nodeSize.width + "px, " + nodeSize.height + "px, 0px)";
			if(dojo.render.html.ie){
				if(!this.bgIframe){
					this.bgIframe = new dojo.html.BackgroundIframe(this.clipNode);
					this.bgIframe.setZIndex(this.clipNode);
				}
				this.bgIframe.onResized();
				this.bgIframe.show();
			}
		},

		onSelect: function(e){
			// summary: callback for when user clicks the message
		},

		show: function(){
			dojo.html.show(this.containerNode);

			this._placeClip();

			if(!this._scrollConnected){
				this._scrollConnected = true;
				dojo.event.connect(window, "onscroll", this, "_placeClip");
			}
		},

		hide: function(){
			//Q: ALP: I didn't port all the toggler stuff from d.w.HtmlWidget.  Is it needed? Ditto for show.
			dojo.html.hide(this.containerNode);

			if(this._scrollConnected){
				this._scrollConnected = false;
				dojo.event.disconnect(window, "onscroll", this, "_placeClip");
			}

			dojo.html.setOpacity(this.containerNode, 1.0);
		}
	}
);
