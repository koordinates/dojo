dojo.provide("dojo.rpc.DeferredRequest");
dojo.require("dojo.lang");

dojo.rpc.DeferredRequest = function() {
	this.Callbacks = [];
	this.Errbacks = [];
	this.results = null;
	this.error = null;
};

dojo.lang.extend(dojo.rpc.DeferredRequest, {

	addCallback: function(cb) {

		if (dojo.lang.isFunction(cb)) {
			if (this.results != null) {
				cb(this.results);
			}

			this.Callbacks.push(cb);

		} else {
			dojo.raise("DeferredRequest: object supplied to addCallback is not a function");
		}
        },

	addErrback: function(eb) {
		if (dojo.lang.isFunction(eb)) {

			if (this.error!=null) {
				eb(this.error);
			}	

                	this.Errbacks.push(eb);
		} else {
			dojo.raise("DeferredRequest: object supplied to addErrback is not a function");
		}
        },

	addBoth: function(cb, eb) {
		this.addCallback(cb);
		this.addErrback(eb);
	}

	callback: function(results) {
		this.results = results;
		
		if (this.Callbacks.length > 0) {
			for (var x=0; x<this.Callbacks.length;x++) {
				this.Callbacks[x](results);
			}
		}
	},

	errback: function(error) {
		this.error = error;
		
		if (this.Errbacks.length > 0) {
			for (var x=0; x<this.Errbacks.length;x++) {
				this.Errbacks[x](results);
			}
		}
	}

});
