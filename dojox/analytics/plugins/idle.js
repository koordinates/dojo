dojo.provide("dojox.analytics.plugins.idle");

// window startup data
dojox.analytics.plugins.idle = (function(){
	this.addData = dojo.hitch(dojox.analytics, "addData", "idle");
	this.idleTime=dojo.config.idleTime || 60000;
	this.idle=true;

	this.setIdle = function(){
		this.addData("isIdle");
		this.idle=true;

	};
	
	dojo.addOnLoad(dojo.hitch(this, function(){
		var idleResets=["onmousemove","onkeydown","onclick","onscroll"];
		var fn = function(e){
			if (this.idle){
				this.idle=false;
				this.addData("isActive");
				this.idleTimer=window.setTimeout(dojo.hitch(this,"setIdle"), this.idleTime);
			}else{
				window.clearTimeout(this.idleTimer);
				this.idleTimer=window.setTimeout(dojo.hitch(this,"setIdle"), this.idleTime);
			}
		};
		for (var i=0;i<idleResets.length;i++){
			dojo.connect(dojo.doc,idleResets[i],this, fn);
		}
	}));
})();
