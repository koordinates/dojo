dojo.provide("dojo.rpc.RpcService");
dojo.require("dojo.io.*");
dojo.require("dojo.json");
dojo.require("dojo.lang");
dojo.require("dojo.rpc.Deferred");

dojo.rpc.RpcService = function(url){
	if(url){
		this.connect(url);
	}
}

dojo.lang.extend(dojo.rpc.RpcService, {

	strictArgChecks: true,
	serviceUrl: "",

	parseResults: function(obj){
		return obj;
	},

	errorCallback: function(deferredRequestHandler){
		return function(type, obj, e){
			deferredRequestHandler.errback(e);
		}
	},

	resultCallback: function(deferredRequestHandler){
		return dojo.lang.hitch(this, 
			function(type, obj, e){
				var results = this.parseResults(obj);
				deferredRequestHandler.callback(results); 
			}
		);
	},


	generateMethod: function(method, parameters){
		return function(){
			var deferredRequestHandler = new dojo.rpc.Deferred();

			// if params weren't specified, then we can assume it's varargs
			if(
				(!this.strictArgChecks)||
				(
					(parameters != null)&&
					(arguments.length != parameters.length)
				)
			){
				dojo.raise("Invalid number of parameters for remote method.");
				// put error stuff here, no enough params
			} else {
				this.bind(method, arguments, deferredRequestHandler);
			}

			return deferredRequestHandler;
		};
	},

	processSmd: function(object){
		dojo.debug("RpcService: Processing returned SMD.");
		for(var n = 0; n < object.methods.length; n++){
			dojo.debug("RpcService: Creating Method: this.", object.methods[n].name, "()");
  			this[object.methods[n].name] = this.generateMethod(object.methods[n].name,object.methods[n].parameters);
			if (dojo.lang.isFunction(this[object.methods[n].name])) {
				dojo.debug("RpcService: Successfully created", object.methods[n].name, "()");
			} else {
				dojo.debug("RpcService: Failed to create", object.methods[n].name, "()");
			}
		}

		this.serviceUrl = object.serviceUrl;
		dojo.debug("RpcService: Dojo RpcService is ready for use.");
	},

	connect: function(smdUrl){
		dojo.debug("RpcService: Attempting to load SMD document from:", smdUrl);
		dojo.io.bind({
			url: smdUrl,
			mimetype: "text/json",
			load: dojo.lang.hitch(this, function(type, object, e){ return this.processSmd(object); }),
			sync: true
		});		
	}
});
