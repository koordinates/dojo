dojo.provide("dojo.sql");

dojo.require("dojo.off");
dojo.require("dojo.io.*");

dojo.lang.mixin(dojo.sql, {
	_EXEC_SQL_URL: "/__polipo/__offline?execSQL",
	
	exec: function(sql /* string */, callback /* function(resultSet, sql, errMessage) */){
		dojo.debug("dojo.sql.exec, sql="+sql);
		
		var requestArgs = {
			sql: sql
		};
		var bindArgs = {
			url:	 	this._EXEC_SQL_URL,
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