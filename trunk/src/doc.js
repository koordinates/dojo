dojo.provide("dojo.doc");
dojo.require("dojo.io.*");
dojo.require("dojo.event.topic");

/*
 * This is only BASIC functionality. It doesn't yet provide support for multiple host
 * environments nor does it call functions by ID yet.
 *
 * Also, dojo.widget is special, since it's going to check through hostenv stuff
 * to see if dojo.widget.html.whatever exists
 *
 * Basically, if the package meta contains require statments, we need to follow them.
 *
 * And the package NEEDS to be passed when calling a function since more than one
 * file might declare the function (the latest require winning, of course)
 */

dojo.doc._cache = {} // Saves the JSON objects in cache
dojo.doc._docFN = dojo.event.topic.getTopic("docFN"); // The topic event for function names

dojo.doc.functionNames = function(/*bool*/ async){
	// summary: Returns an ordered list of package and function names.
	if(!dojo.doc._cache['function_names']){
		dojo.io.bind({
			url: "json/function_names",
			mimetype: "text/json",
			sync: !async,
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
				}
				dojo.doc._cache['function_names'] = data;
				if(async){
					var searchData = dojo.doc._expandFN();
					dojo.doc._docFN.sendMessage(searchData);
				}
			}
		});
	}

	if(!async){
		var searchData = dojo.doc._expandFN();
	  return searchData;
	}
}

dojo.doc.function = function(/*String*/ name, /*String?*/ id){
	
}

dojo.doc.getMeta = function(/*String*/ name, /*String?*/ id){
	// summary: Gets information about a function in regards to its meta data
	return dojo.doc._localData("meta", name, id);
}

dojo.doc.getSrc = function(/*String*/ name, /*String?*/ id){
	return dojo.doc._localData("src", name, id);
}

dojo.doc._localData = function(/*String*/ file, /*String*/ name, /*String?*/ id){
	dojo.doc.functionNames();
	var pkg = '';

	var data = dojo.doc._cache['function_names'];
	for(var key in data){
		if(dojo.lang.inArray(data[key], name)){
			pkg = key;
			break;
		}
	}
	
	if(!pkg){
		return {}; // Object
	}

  var oldName = name;
	name = name.replace(new RegExp('^' + pkg.replace(/\./g, "\\.")), "_");
	var oldPkg = pkg;
	pkg = pkg.replace(/^(dojo|\*)/g, "_");
	
	var mimetype = "text/json";
	if(file == "src"){
		mimetype = "text/plain"
	}
	
	var url;
	if(id){
		url = "json/" + pkg + "/" + name + "/" + id + "/" + file;
	}else{
		url = "json/" + pkg + "/" + name + "/" + file;		
	}

	dojo.io.bind({
		url: url,
		attach: {pkg: oldPkg, name: oldName, file: file},
		mimetype: mimetype,
		sync: true,
		load: function(type, data, evt){
			if(!dojo.doc._cache[evt.attach.pkg]){
				dojo.doc._cache[evt.attach.pkg] = {};
			}
			if(!dojo.doc._cache[evt.attach.pkg][evt.attach.name]){
				dojo.doc._cache[evt.attach.pkg][evt.attach.name] = {};
			}
			dojo.doc._cache[evt.attach.pkg][evt.attach.name][evt.attach.file] = data;
		}
	});

	return dojo.doc._cache[oldPkg][oldName][file];
}

dojo.doc._expandFN = function(){
	// summary: Expands the function names as returned from the cache
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