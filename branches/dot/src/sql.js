dojo.provide("dojo.sql");

dojo.require("dojo.off");

dojo.lang.mixin(dojo.sql, {
	exec: function(sql){
		dojo.debug("dojo.sql.exec, sql="+sql);
		
		//dojo.off._talkToOfflineCache("execSQL", dojo.lang.hitch(this, this._execResults));
	},
	
	_execResults: function(name, results){
		dojo.debug("execResults, name="+name+", results="+results);
	}
});