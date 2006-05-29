dojo.provide("dojo.widget.html.ShowSlide");

dojo.require("dojo.widget.*");
dojo.require("dojo.lang.common");
dojo.require("dojo.widget.ShowSlide");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.fx.*");
dojo.require("dojo.animation.Animation");
dojo.require("dojo.graphics.color");

dojo.widget.defineWidget(
	"dojo.widget.html.ShowSlide",
	dojo.widget.HtmlWidget,
	null,
	"html",
	function(){
		dojo.widget.ShowSlide.call(this);
	}
);
dojo.lang.extend(dojo.widget.html.ShowSlide, dojo.widget.ShowSlide.prototype);
dojo.lang.extend(dojo.widget.html.ShowSlide, {
	htmlTitle: null,
	templatePath: dojo.uri.dojoUri("src/widget/templates/HtmlShowSlide.html"),
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlShowSlide.css"),
	fillInTemplate: function(){
		this.htmlTitle.innerHTML = this.title;

		var nodes = this.containerNode.all ? this.containerNode.all : this.containerNode.getElementsByTagName('*');
		for(var i = 0, node; node = nodes[i]; i++){
			var as = node.getAttribute("as");
			if(as){
				if(!this._components[as]){
					this._components[as] = [];
				}
				this._components[as].push(node);
			}
		}
	},
	postCreate: function(){
		this._actions = [];
		for(var i = 0, child; child = this.children[i]; i++){
			if(child.widgetType == "ShowAction"){
				this._actions.push(child);
				var components = this._components[child.on];
				for(var j = 0, component; component = components[j]; j++){
					if(child.action){
						this.hideComponent(component);
					}
				}
			}
		}
	},
	previousAction: function(/*Event?*/ event){
		this.stopEvent(event);

		var action = this._actions[this._action];
		if(!action){
			return false;
		}

		var on = action.on;
		while(action.on == on){
			var components = this._components[on];
			for(var i = 0, component; component = components[i]; i++){
				if(action.action){
					this.hideComponent(component);
				}
			}
		
			--this._action;
			if(this._action == -1){
				return false;
			}
			
			action = this._actions[this._action];
			if(!action){
				return false;
			}
		}
		return true;
	},
	hideComponent: function(/*Node*/ component){
		component.style.visibility = "hidden";
		component.style.backgroundColor = "transparent";
		var parent = component.parentNode;
		if(parent.tagName == "LI"){
			parent.oldType = parent.style.listStyleType;
			parent.style.listStyleType = "none";
		}
	},
	nextAction: function(/*Event?*/ event){
		this.stopEvent(event);

		if(!dojo.widget.ShowSlide.prototype.nextAction.call(this, event)){
			return false;
		}

		var action = this._actions[this._action];
		if(!action){
			return false;
		}
		
		var components = this._components[action.on];
		for(var i = 0, component; component = components[i]; i++){
			if(action.action){
				var duration = action.duration || 1000;
				if(action.action == "fade"){
					dojo.style.setOpacity(component, 0);
					dojo.fx.html.fadeIn(component, duration);
				}else if(action.action == "fly"){
					var width = dojo.style.getMarginBoxWidth(component);
					var position = dojo.style.getAbsolutePosition(component);
					dojo.fx.html.slide(component, duration, [-(width + position.x), 0], [0, 0], this.callWith);
				}else if(action.action == "wipe"){
					dojo.fx.html.wipeIn(component, duration);
				}else if(action.action == "color"){
					var from = new dojo.graphics.color.Color(action.from).toRgb();
					var to = new dojo.graphics.color.Color(action.to).toRgb();
					var anim = new dojo.animation.Animation(new dojo.math.curves.Line(from, to), duration, 0);
					node = component;
					dojo.event.connect(anim, "onAnimate", function(e) {
						node.style.color = "rgb(" + e.coordsAsInts().join(",") + ")";
					});
					anim.play(true);
				}else if(action.action == "bgcolor"){
					dojo.fx.html.colorFade(component, duration, action.from, action.to);
				}
				component.style.visibility = "visible";
			}
		}

		return true;
	},
	callWith: function(/*Node*/ node){
		var parent = node.parentNode;
		if(parent.tagName == "LI"){
			parent.style.listStyleType = parent.oldType;
		}
	},
	stopEvent: function(/*Event*/ ev){
		if(!ev){
			return;
		}
		if(window.event){
			ev.returnValue = false;
			ev.cancelBubble = true;
		}else{
			ev.preventDefault();
			ev.stopPropagation();
		}
	}
});