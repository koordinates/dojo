dojo.provide("dojo.sql");

dojo.require("dojo.off");
dojo.require("dojo.io.*");

dojo.lang.mixin(dojo.sql, {
	_EXEC_SQL_URL: "/__polipo/__offline?execSQL",
	
	exec: function(sql){
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
				alert("Unable to execute SQL: "
						+ sql + ": " + errObj.message);
			},
			load:		function(type, data, evt){
				alert("data loaded, data="+data);
			}
		};
		
		// dispatch the request
		dojo.io.bind(bindArgs);
	}
});