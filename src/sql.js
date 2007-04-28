dojo.provide("dojo.sql");

dojo.require("dojo.off");
dojo.require("dojo.io.*");

dojo.lang.mixin(dojo.sql, {
	_DB_URL: "/__polipo/__offline",
	
	exec: function(sql /* string */, 
					callback /* function(resultSet, sql, errMessage) */ ){ /* void */
		var sync = false;
		if(typeof callback == "undefined" || callback == null){
			sync = true;
		}
		
		var results = {hasError: false, errorMsg: null, returnMe: null};
		
		var requestArgs = {
			sql: sql
		};
		
		var bindArgs = {
			url:	 	this._DB_URL + "?execSQL",
			method: 	"post",
			sync:		sync,
			content: 	requestArgs, 
			mimetype:	"text/javascript",
			error:		function(type, errObj){
				var msg = "Unable to execute SQL: "
						+ sql + ": " + errObj.message;
				if(sync == false){
					callback(null, sql, msg);
				}else{
					results.hasError = true;
					results.errorMsg = msg;
				}
			},
			load:		function(type, data, evt){
				if(sync == false){
					callback(data, sql, null);
				}else{
					results.returnMe = data;
				}	
			}
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);
		
		if(results.hasError){
			throw results.errorMsg;
		}
		
		return results.returnMe;
	}
});