dojo.provide("dojox.rpc.JsonRPC");
dojo.require("dojox.rpc.Service");

(function(){
	function jsonRpcEnvelope(version){
		return {
			serialize: function(smd, method, data, options){
	
				var d = {
					id: this._requestId++,
					method: method.name,
					params: data
				};
				if(version){
					d.jsonrpc = version;
				}
				return {
					data: dojo.toJson(d),
					handleAs:'json',
					contentType: 'application/json',
					transport:"POST"
				};
			},
	
			deserialize: function(obj){
				if ('Error' == obj.name){
					obj = dojo.fromJson(obj.responseText);
				}
				if(obj.error) {
					var e = new Error(obj.error.message || obj.error);
					e._rpcErrorObject = obj.error;
					return e;
				}
				return obj.result;
			}
		};
	}
	dojox.rpc.envelopeRegistry.register(
		"JSON-RPC-1.0",
		function(str){
			return str == "JSON-RPC-1.0";
		},
		dojo.mixin({namedParams:false},jsonRpcEnvelope()) // 1.0 will only work with ordered params
	);

	dojox.rpc.envelopeRegistry.register(
		"JSON-RPC-2.0",
		function(str){
			return str == "JSON-RPC-2.0";
		},
		jsonRpcEnvelope("2.0")
	);
	dojox.rpc.JsonRPC = function(){
		return new dojox.rpc.Service({});
	}
})();
