dojo.provide("dojo.svg");
dojo.require("dojo.dom");

dojo.lang.mixin(dojo.svg, dojo.dom);

/**
 *	The Graphics object.  Hopefully gives the user a way into
 *	XPlatform rendering functions supported correctly and incorrectly.
**/
dojo.svg.graphics = dojo.svg.g = new function(d){
	this.suspend = function(){
		try { d.documentElement.suspendRedraw(0); } catch(e){ }
	};
	this.resume = function(){
		try { d.documentElement.unsuspendRedraw(0); } catch(e){ }
	};
	this.force = function(){
		try { d.documentElement.forceRedraw(); } catch(e){ }
	};
}(document);

/**
 *	The Animations control object.  Hopefully gives the user a way into
 *	XPlatform animation functions supported correctly and incorrectly.
**/
dojo.svg.animations = dojo.svg.anim = new function(d){
	this.arePaused = function(){
		try {
			return d.documentElement.animationsPaused();
		} catch(e){
			return false;
		}
	} ;
	this.pause = function(){
		try { d.documentElement.pauseAnimations(); } catch(e){ }
	};
	this.resume = function(){
		try { d.documentElement.unpauseAnimations(); } catch(e){ }
	};
}(document);
// vim:ts=4:noet:tw=0:
