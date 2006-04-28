dojo.provide("dojo.lfx.toggle");
dojo.require("dojo.lfx.*");

dojo.lfx.toggle={}

dojo.lfx.toggle.plain = {
	show: function(node, duration, easing, callback){
		dojo.style.show(node);
		if(dojo.lang.isFunction(callback)){ callback(); }
	},
	
	hide: function(node, duration, easing, callback){
		dojo.style.hide(node);
		if(dojo.lang.isFunction(callback)){ callback(); }
	}
}

dojo.lfx.toggle.fade = {
	show: function(node, duration, easing, callback){
		dojo.lfx.fadeIn(node, duration, easing, callback).play();
	},

	hide: function(node, duration, easing, callback){
		dojo.lfx.fadeOut(node, duration, easing, callback).play();
	}
}

dojo.lfx.toggle.wipe = {
	show: function(node, duration, easing, callback){
		dojo.lfx.wipeIn(node, duration, easing, callback).play();
	},

	hide: function(node, duration, easing, callback){
		dojo.lfx.wipeOut(node, duration, easing, callback).play();
	}
}

if(dj_undef("dojo.fx")){dojo.fx = {};}
if(dj_undef("dojo.fx.html")){dojo.fx.html = {};}
if(dj_undef("dojo.fx.toggle")){dojo.fx.html.toggle = {};}
dojo.mixin(dojo.fx.html.toggle, dojo.lfx.toggle);