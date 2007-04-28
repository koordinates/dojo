dojo.provide("dojo.sql");

dojo.require("dojo.off");
dojo.require("dojo.io.*");

dojo.lang.mixin(dojo.sql, {
	_DB_URL: "/__polipo/__offline",
	
	open: function(){ /* boolean */
		var bindArgs = {
			url:	 	this._DB_URL + "?open",
			sync:		true,
			mimetype:	"text/javascript",
			error:		function(type, errObj){
				var msg = "Unable to open database: "
						+ errObj.message;
				throw msg;
			},
			load:		function(type, data, evt){
				if(data == true){
					return true;
				}else{
					return false;
				}
			}
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);
	},
	
	close: function(){ /* boolean */
		var bindArgs = {
			url:	 	this._DB_URL + "?close",
			sync:		true,
			mimetype:	"text/javascript",
			error:		function(type, errObj){
				var msg = "Unable to open database: "
						+ errObj.message;
				throw msg;
			},
			load:		function(type, data, evt){
				if(data == true){
					return true;
				}else{
					return false;
				}
			}
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);
	},
	
	exec: function(sql /* string */, 
					callback /* function(resultSet, sql, errMessage) */ ){ /* void */
		dojo.debug("dojo.sql.exec, sql="+sql);
		
		var requestArgs = {
			sql: sql
		};
		var bindArgs = {
			url:	 	this._DB_URL + "?execSQL",
			method: 	"post",
			sync:		false,
			content: 	requestArgs, 
			mimetype:	"text/javascript",
			error:		function(type, errObj){
				var msg = "Unable to execute SQL: "
						+ sql + ": " + errObj.message;
				callback(null, sql, msg);
			},
			load:		function(type, data, evt){
				callback(data, sql, null);
			}
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);
	}
});