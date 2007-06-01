dojo.provide("dojo.storage.Gears");

dojo.require("dojo.storage");
dojo.require("dojo.json");
dojo.require("dojo.sql");

dojo.storage.GearsStorageProvider = function(){
	// summary:
	//		Storage provider that uses the features of Google Gears
	//		to store data (it is saved into the local SQL database
	//		provided by Gears, using dojo.sql)
	// description: 
	//		
	//
	//		You can disable this storage provider with the following djConfig
	//		variable:
	//		var djConfig = { disableGearsStorage: true };
	//		
	//		Authors of this storage provider-	
	//			Brad Neuberg, bkn3@columbia.edu 
}

dojo.inherits(dojo.storage.GearsStorageProvider, dojo.storage);

// instance methods and properties
dojo.lang.extend(dojo.storage.GearsStorageProvider, {
	TABLE_NAME: "__DOJO_STORAGE",
	initialized: false,
	
	_available: null,
	
	initialize: function(){
		if(djConfig["disableGearsStorage"] == true){
			return;
		}
		
		// create the table that holds our data
		dojo.sql.open();
		dojo.sql("CREATE TABLE IF NOT EXISTS " + this.TABLE_NAME + "( "
					+ " namespace TEXT, "
					+ " key TEXT UNIQUE, "
					+ " value TEXT "
					+ ")"
				);
		dojo.sql("CREATE UNIQUE INDEX IF NOT EXISTS namespace_key_index" 
					+ " ON " + this.TABLE_NAME
					+ " (namespace, key)");
		dojo.sql.close();
		
		// indicate that this storage provider is now loaded
		this.initialized = true;
		dojo.storage.manager.loaded();	
	},
	
	isAvailable: function(){
		// is Google Gears available and defined?
		if(typeof google == "undefined"){
			this._available = false;
		}else{
			this._available = true;
		}
		
		return this._available;
	},

	put: function(key, value, resultsHandler, namespace){
		if(this.isValidKey(key) == false){
			dojo.raise("Invalid key given: " + key);
		}
		
		if(typeof namespace == "undefined" || namespace == null){
			namespace = dojo.storage.DEFAULT_NAMESPACE;
		}
		
		// serialize the value;
		// handle strings differently so they have better performance
		if(dojo.lang.isString(value)){
			value = "string:" + value;
		}else{
			value = dojo.json.serialize(value);
		}
		
		// try to store the value	
		try{
			dojo.sql.open();
			dojo.sql("DELETE FROM " + this.TABLE_NAME
						+ " WHERE namespace = ? AND key = ?",
						namespace, key);
			dojo.sql("INSERT INTO " + this.TABLE_NAME
						+ " VALUES (?, ?, ?)",
						namespace, key, value);
			dojo.sql.close();
		}catch(e){
			// indicate we failed
			resultsHandler(dojo.storage.FAILED, 
							key, e.toString());
			return;
		}
		
		resultsHandler(dojo.storage.SUCCESS, key, null);
	},

	get: function(key, namespace){
		if(this.isValidKey(key) == false){
			dojo.raise("Invalid key given: " + key);
		}
		
		if(typeof namespace == "undefined" || namespace == null){
			namespace = dojo.storage.DEFAULT_NAMESPACE;
		}
		
		// try to find this key in the database
		dojo.sql.open();
		var results = dojo.sql("SELECT * FROM " + this.TABLE_NAME
									+ " WHERE namespace = ? AND "
									+ " key = ?",
									namespace, key);
		dojo.sql.close();
		if(results.length == 0){
			return null;
		}else{
			results = results[0].value;
		}
		
		// destringify the content back into a 
		// real JavaScript object;
		// handle strings differently so they have better performance
		if(!dojo.lang.isUndefined(results) && results != null 
			 && /^string:/.test(results)){
			results = results.substring("string:".length);
		}else{
			results = dojo.json.evalJson(results);
		}
		
		return results;
	},
	
	getNamespaces: function(){
		var results = new Array();
		results.push(dojo.storage.DEFAULT_NAMESPACE);
		
		dojo.sql.open();
		var rs = dojo.sql("SELECT namespace FROM " + this.TABLE_NAME
							+ " DESC GROUP BY namespace");
		dojo.sql.close();
		for(var i = 0; i < rs.length; i++){
			if(rs[i].namespace != dojo.storage.DEFAULT_NAMESPACE){
				results.push(rs[i].namespace);
			}
		}
		
		return results;
	},

	getKeys: function(namespace){
		dojo.debug("getKeys, namespace="+namespace);
		if(namespace == null || typeof namespace == "undefined"){
			namespace = dojo.storage.DEFAULT_NAMESPACE;
		}
		
		if(this.isValidKey(namespace) == false){
			dojo.raise("Invalid namespace given: " + namespace);
		}
		
		dojo.sql.open();
		var rs = dojo.sql("SELECT key FROM " + this.TABLE_NAME
							+ " WHERE namespace = ?",
							namespace);
		dojo.sql.close();
		
		var keysArray = new Array();
		for(var i = 0; i < rs.length; i++){
			keysArray.push(rs[i].key);
		}
		
		return keysArray;
	},

	clear: function(namespace){
		if(namespace == null || typeof namespace == "undefined"){
			namespace = dojo.storage.DEFAULT_NAMESPACE;
		}
		
		if(this.isValidKey(namespace) == false){
			dojo.raise("Invalid namespace given: " + namespace);
		}
		
		dojo.sql.open();
		dojo.sql("DELETE FROM " + this.TABLE_NAME 
					+ " WHERE namespace = ?",
					namespace);
		dojo.sql.close();
	},
	
	remove: function(key, namespace){
		if(namespace == null || typeof namespace == "undefined"){
			namespace = dojo.storage.DEFAULT_NAMESPACE;
		}
		
		dojo.sql.open();
		dojo.sql("DELETE FROM " + this.TABLE_NAME 
					+ " WHERE namespace = ? AND"
					+ " key = ?",
					namespace,
					key);
		dojo.sql.close();
	},
	
	isPermanent: function(){
		return true;
	},

	getMaximumSize: function(){
		return dojo.storage.SIZE_NO_LIMIT;
	},

	hasSettingsUI: function(){
		return false;
	},
	
	showSettingsUI: function(){
		dojo.raise(this.getType() + " does not support a storage settings user-interface");
	},
	
	hideSettingsUI: function(){
		dojo.raise(this.getType() + " does not support a storage settings user-interface");
	},
	
	getType: function(){
		return "dojo.storage.GearsStorageProvider";
	}
});

// register the existence of our storage providers
dojo.storage.manager.register("dojo.storage.GearsStorageProvider",
								new dojo.storage.GearsStorageProvider());

// now that we are loaded and registered tell the storage manager to initialize
// itself
dojo.storage.manager.initialize();

