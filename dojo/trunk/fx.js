dojo.provide("dojo.fx");
dojo.require("dojo._base.connect");
dojo.require("dojo._base.declare");
dojo.require("dojo._base.fx");

dojo.fx.chain = function(/*Array*/ anims){
	var first = anims.shift();
	return first.chain(anims);
}

dojo.fx.combine = function(/*Array*/ anims){
	var first = anims.shift();
	return first.combine(anims);
}

dojo.fx.slideIn = function(/*Object*/ args){
	// summary: Returns an animation that will show and wipe in "nodes".
	// nodes: An array of DOMNodes or one DOMNode.
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	args.node = dojo.byId(args.node);

	// get node height, either it's natural height or it's height specified via style or class attributes
	// (for FF, the node has to be (temporarily) rendered to measure height)
	var anim = dojo.animateProperty(dojo.mixin({
		properties: {
			height: {
				start: 1 // 0 causes IE to display the whole panel
			}
		},
		oprop: {}
	}, args));
	dojo.connect(anim, "beforeBegin", anim, function(){
		var node = this.node;
		var s = this.node.style;
		s.visibility="hidden";
		s.display="";

		//		var nodeHeight = dojo.html.getBorderBox(node).height;
		//FIXME: ok to use contentbox?
		var nodeHeight = dojo.contentBox(node).h;

		s.visibility="";
		s.display="none";
		this.properties.height.end = nodeHeight;

		var oprop = this.oprop;
		oprop.overflow = s.overflow;
		oprop.height = s.height;
		s.overflow = "hidden";
		s.height = "1px"; // 0 causes IE to display the whole panel
		dojo.style(this.node, 'display', '');
	});
	
	dojo.connect(anim, "onEnd", anim, function(){ 
		var s = this.node.style;
		var oprop = this.oprop;
		s.overflow = oprop.overflow;
		s.height = oprop.height;
	});

	return anim; // dojo._Animation
}

dojo.fx.slideOut = function(/*Object*/ args){
	// summary: Returns an animation that will wipe out and hide "nodes".
	// nodes: An array of DOMNodes or one DOMNode.
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	var node = args.node = dojo.byId(args.node);

	var oprop = {};	// old properties of node (before we mucked w/them)
	var anim = dojo.animateProperty(dojo.mixin({
		properties: {
			height: {
				start: function(){ return dojo.contentBox(node).h; },
				end: 1 // 0 causes IE to display the whole panel
			}
		},
		oprop: oprop
	}, args));
	dojo.connect(anim, "beforeBegin", anim, function(){
		var s=node.style;
		oprop.overflow = s.overflow;
		oprop.height = s.height;
		s.overflow = "hidden";
		dojo.style(node, 'display', '');
	});
	dojo.connect(anim, "onEnd", anim, function(){
		dojo.style(this.node, 'display', 'none');
		var s=this.node.style;
		s.overflow = oprop.overflow;
		s.height = oprop.height;
	});

	return anim; // dojo._Animation
}

dojo.fx.slideTo = function(/*Object?*/ args){
	// summary: Returns an animation that will slide "nodes" from its current position to
	//			the position defined in "coords".
	// nodes: An array of DOMNodes or one DOMNode.
	// coords: { top: Decimal?, left: Decimal? }
	var node = args.node = dojo.byId(args.node);
	var compute = dojo.getComputedStyle;
	
	var top = null;
	var left = null;
	
	var init = (function(){
		var innerNode = node;
		return function(){
			var pos = compute(innerNode).position;
			top = (pos == 'absolute' ? node.offsetTop : parseInt(compute(node).top) || 0);
			left = (pos == 'absolute' ? node.offsetLeft : parseInt(compute(node).left) || 0);

			if(pos != 'absolute' && pos != 'relative'){
				var ret = dojo.coords(innerNode, true);
				top = ret.y;
				left = ret.x;
				innerNode.style.position="absolute";
				innerNode.style.top=top+"px";
				innerNode.style.left=left+"px";
			}
		}
	})();
	init();

	var anim = dojo.animateProperty(dojo.mixin({
		properties: {
			top: { start: top, end: args.top||0 },
			left: { start: left, end: args.left||0 }
		}
	}, args));
	dojo.connect(anim, "beforeBegin", anim, init);

	return anim; // dojo._Animation
}

dojo.fx.wipeIn = function(/*Object*/ args){
	// summary: Returns an animation that will show and wipe in "nodes".
	// nodes: An array of DOMNodes or one DOMNode.
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	var node = args.node = dojo.byId(args.node);

	var oprop = {};	// old properties of node (before we mucked w/them)
	
	// get node height, either it's natural height or it's height specified via style or class attributes
	// (for FF, the node has to be (temporarily) rendered to measure height)
	dojo.style(node, "visibility", "hidden");
	dojo.style(node, "display", "");
	var nodeHeight = dojo.borderBox(node).h;
	dojo.style(node, "visibility", "");
	dojo.style(node, "display", "none");

	var anim = dojo.animateProperty(dojo.mixin({
		properties: {
			height:	{
				start: 1, // 0 causes IE to display the whole panel
				end: function(){ return nodeHeight; }
			}
		}
	}, args));

	anim.connect("beforeBegin", function(){
		oprop.overflow = dojo.style(node, "overflow");
		oprop.height = dojo.style(node, "height");
		dojo.style(node, "overflow", "hidden");
		dojo.style(node, "height", "1px");
		dojo.style(node, "display", "");
	});
	
	anim.connect("onEnd", function(){ 
		dojo.style(node, "overflow", oprop.overflow);
		dojo.style(node, "height", oprop.height);
	});
	
	return anim; // dojo._Animation
}

dojo.fx.wipeOut = function(/*Object*/ args){
	// summary: Returns an animation that will wipe out and hide "nodes".
	// nodes: An array of DOMNodes or one DOMNode.
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	var node = args.node = dojo.byId(node);
	
	var oprop = {};	// old properties of node (before we mucked w/them)
	var anim = dojo.animateProperty(dojo.mixin({
		properties: {
			height: {
				start: function(){ return dojo.contentBox(node).h; },
				end: 1 // 0 causes IE to display the whole panel
			}
		}
	}, args));
	dojo.connect(anim, "beforeBegin", null, function(){
		oprop.overflow = dojo.style(node, "overflow");
		oprop.height = dojo.style(node, "height");
		dojo.style(node, "overflow", "hidden");
		dojo.style(node, "display", "");
	});
	dojo.connect(anim, "onEnd", null, function(){
		dojo.style(node, "display", "none");
		dojo.style(node, "overflow", oprop.overflow);
		dojo.style(node, "height", oprop.height);
	});

	return anim; // dojo._Animation
}
