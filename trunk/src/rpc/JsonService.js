dojo.provide("dojo.rpc.JsonService");
dojo.require("dojo.rpc.RpcService");
dojo.require("dojo.io.*");
dojo.require("dojo.json");
dojo.require("dojo.lang");

dojo.rpc.JsonService = function(args){
	// passing just the URL isn't terribly useful. It's expected that at
	// various times folks will want to specify:
	//	- just the serviceUrl (for use w/ remoteCall())
	//	- the text of the SMD to evaluate
	// 	- a raw SMD object
	//	- the SMD URL
	if((args)&&(dojo.lang.isString(args))){
		// we assume it's an SMD file to be processed, since this was the
		// earlier function signature

		// FIXME: also accept dojo.uri.Uri objects?
		this.connect(args);
	}else{
		// otherwise we assume it's an arguments object with the following
		// (optional) properties:
		//	- serviceUrl
		//	- strictArgChecks
		//	- smdUrl
		//	- smdStr
		//	- smdObj
		if(args["smdUrl"]){
			this.connect(args.smdUrl);
		}
		if(args["smdStr"]){
			this.processSmd(dj_eval("("+args.smdStr+")"));
		}
		if(args["smdObj"]){
			this.processSmd(args.smdObj);
		}
		if(args["serviceUrl"]){
			this.serviceUrl = args.serviceUrl;
		}
		if(args["strictArgChecks"]){
			this.strictArgChecks = args.strictArgChecks;
		}
	}
}

dojo.inherits(dojo.rpc.JsonService, dojo.rpc.RpcService);

dojo.lang.extend(dojo.rpc.JsonService, {

	lastSubmissionId: 0,

	callRemote: function(method, params){
		var deferred = new dojo.rpc.Deferred();
		this.bind(method, params, deferred);
		return deferred;
	},

	bind: function(method, parameters, deferredRequestHandler){
		dojo.io.bind({
			url: this.serviceUrl,
			postContent: this.createRequest(method, parameters),
			method: "POST",
			mimetype: "text/json",
			load: this.resultCallback(deferredRequestHandler) 
		});
	},

	createRequest: function(method, params){
		var req = { "params": params, "method": method, "id": this.lastSubmissionId++ };
		data = dojo.json.serialize(req);
		dojo.debug("JsonService: JSON-RPC Request: " + data);
		return data;
	},

	parseResults: function(obj){
		if(obj["result"]){
			return obj["result"];
		}else{
			return obj;
		}
	}
});
