dojo.provide("dojo.rpc.YahooService");
dojo.require("dojo.rpc.RpcService");
dojo.require("dojo.rpc.JsonService");
dojo.require("dojo.json");
dojo.require("dojo.uri.*");
dojo.require("dojo.io.ScriptSrcIO");

dojo.rpc.YahooService = function(appId){
	this.scrictArgChecks = false;
	this.appId = appId;
	if(!appId){
		this.appId = "dojotoolkit";
		dojo.debug(	"please initializae the YahooService class with your own",
					"application ID. Using the default may cause problems during",
					"deployment of your application");
	}
	this.connect(dojo.uri.dojoUri("src/rpc/yahoo.smd"));
}

dojo.inherits(dojo.rpc.YahooService, dojo.rpc.JsonService);

dojo.lang.extend(dojo.rpc.YahooService, {
	bind: function(method, parameters, deferredRequestHandler, url){
		parameters.output = "json";
		parameters.appid= this.appId;
		dojo.io.bind({
			url: url||this.serviceUrl,
			transport: "ScriptSrcTransport",
			// FIXME: need to get content interpolation fixed
			content: parameters,
			jsonParamName: "callback",
			mimetype: "text/json",
			load: this.resultCallback(deferredRequestHandler),
			error: this.errorCallback(deferredRequestHandler),
			preventCache: true
		});
	}
});
