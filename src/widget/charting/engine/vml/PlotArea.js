dojo.provide("dojo.widget.charting.engine.vml.PlotArea");
dojo.require("dojo.lang.common");

dojo.mixin(dojo.widget.engine.PlotArea, {
	initialize:function(){
		this.destroy();	//	kill everything first.
		
		//	start with the background
		this.nodes.area = document.createElement("div");
		this.nodes.area.style.width=this.size.width+"px";
		this.nodes.area.style.height=this.size.height+"px";
		this.nodes.area.style.position="absolute";
	
		this.nodes.background = document.createElement("div");
		this.nodes.background.style.width=this.size.width+"px";
		this.nodes.background.style.height=this.size.height+"px";
		this.nodes.background.style.position="absolute";
		this.nodes.background.style.top="0px";
		this.nodes.background.style.left="0px";
		this.nodes.area.appendChild(this.nodes.background);

		//	the plot group
		this.nodes.plots = document.createElement("div");
		this.nodes.plots.style.width=this.size.width+"px";
		this.nodes.plots.style.height=this.size.height+"px";
		this.nodes.plots.style.position="absolute";
		this.nodes.plots.style.top="0px";
		this.nodes.plots.style.left="0px";
		this.nodes.area.appendChild(this.nodes.plots);
		for(var i=0; i<this.plots.length; i++){
			this.nodes.plots.appendChild(this.plots[i].initialize());
		}

		this.nodes.axes = document.createElement("div");
		this.nodes.area.appendChild(this.nodes.axes);
		var axes = this.getAxes();
		for(var p in axes){
			this.nodes.axes.appendChild(axes[p].initialize());
		}

		return this.nodes.area;
	}
});
