dojo.provide("dojo.doc");
dojo.require("dojo.io.*");

dojo.doc._cache = {}

dojo.doc.functionNames = function(){
	if(!dojo.doc._cache['function_names']){
		dojo.io.bind({
			url: "json/function_names",
			mimetype: "text/json",
			sync: true,
			load: function(type, data, evt){
				for(var key in data){
					// Packages starting with _ have a parent of "dojo"
					if(key.charAt(0) == "_"){
						var new_key = "dojo" + key.substring(1, key.length);
						data[new_key] = data[key];
						delete data[key];
						key = new_key;
					}
					// Function names starting with _ have a parent of their package name
					for(var pkg_key in data[key]){
						if(data[key][pkg_key].charAt(0) == "_"){
							var new_value = key + data[key][pkg_key].substring(1, data[key][pkg_key].length);
							data[key][pkg_key] = new_value;
						}
					}
					// Save data to the cache
					dojo.doc._cache['function_names'] = data;
				}
			}
		});
	}

	var data = dojo.doc._cache['function_names'];
	var searchData = [];
	for(var key in data){
		// Add the package if it doesn't exist in its children
		if(!dojo.lang.inArray(data[key], key)){
			searchData.push([key, key]);
		}
		// Add the functions
		for(var pkg_key in data[key]){
			searchData.push([data[key][pkg_key], data[key][pkg_key]]);
		}
	}

	return searchData.sort(dojo.doc._sort);
}

dojo.doc._sort = function(a, b){
	if(a[0] < b[0]){
		return -1;
	}
	if(a[0] > b[0]){
		return 1;
	}
  return 0
}