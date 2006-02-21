var cache = {};
dojo.require("dojo.event");
dojo.require("dojo.io.*");
dojo.require("dojo.widget.ComboBox");

function docToolInit(){
	dojo.io.bind({
		url:			"json/function_names",
		mimetype:	"text/json",
		load:			function(type, data, evt){
			var searchData = [];

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
				// Add the package if it doesn't exist in its children
				if(!dojo.lang.inArray(data[key], key)){
					searchData.push([key, key]);
				}
				// Add the functions
				for(var pkg_key in data[key]){
					searchData.push([data[key][pkg_key], data[key][pkg_key]]);
				}
			}
			dojo.widget.byId("search").dataProvider.setData(searchData.sort(docToolSort));
		}
	});
}

function docToolSort(a, b){
	if(a[0] < b[0]){
		return -1;
	}
	if(a[0] > b[0]){
		return 1;
	}
  return 0
}

dojo.event.connect(window, "onload", docToolInit);