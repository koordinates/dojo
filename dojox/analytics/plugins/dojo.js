dojo.provide("dojox.analytics.plugins.dojo");

dojox.analytics.plugins.dojo = (function(){
	// summary:
	//	plugin to have analyitcs return the base info dojo collects
	this.addData = dojo.hitch(dojox.analytics, "addData", "dojo");
	dojo.addOnLoad(dojo.hitch(this, function(){
		var data = {};
		for(var i in dojo){
			if (dojo.isOwnProperty(dojo, i)) {

				// NOTE: What is allowed here?

				if ((i=="version") || ((!dojo.isObject(dojo[i]))&&(i[0]!="_"))){
					data[i]=dojo[i];
				}
			}
		}

		if (dojo.config){
			data.djConfig=dojo.config;
		}
		this.addData(data);
	}));
})();
