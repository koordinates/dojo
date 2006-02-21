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
				if(key.charAt(0) == "_"){
					var new_key = "dojo" + key.substring(1, key.length);
					data[new_key] = data[key];
					delete data[key];
					key = new_key;
				}
				if(!dojo.lang.inArray(data[key], key)){
					searchData.push([key, key]);
				}
				for(var pkg_key in data[key]){
					if(data[key][pkg_key].charAt(0) == "_"){
						var new_value = key + data[key][pkg_key].substring(1, data[key][pkg_key].length);
						data[key][pkg_key] = new_value;
					}
					searchData.push([data[key][pkg_key], data[key][pkg_key]]);
				}
			}
			dojo.widget.byId("search").dataProvider.setData(searchData);
		}
	});
}

dojo.event.connect(window, "onload", docToolInit);