dojo.provide("dojox.dtl.filter.strings");

dojo.require("dojox.dtl.filter.htmlstrings");
dojo.require("dojox.string.sprintf");

dojo.mixin(dojox.dtl.filter.strings, {
	addslashes: function(value){
		// summary: Adds slashes - useful for passing strings to JavaScript, for example.
		return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/'/g, "\\'");
	},
	capfirst: function(value){
		// summary: Capitalizes the first character of the value
		value = "" + value;
		return value.charAt(0).toUpperCase() + value.substring(1);
	},
	center: function(value, arg){
		// summary: Centers the value in a field of a given width
		arg = arg || value.length;
		value = value + "";
		var diff = arg - value.length;
		if(diff % 2){
			value = value + " ";
			diff -= 1;
		}
		for(var i = 0; i < diff; i += 2){
			value = " " + value + " ";
		}
		return value;
	},
	cut: function(value, arg){
		// summary: Removes all values of arg from the given string
		arg = arg + "" || "";
		value = value + "";
		return value.replace(new RegExp(arg, "g"), "");
	},
	_fix_ampersands: /&(?!(\w+|#\d+);)/g,
	fix_ampersands: function(value){
		// summary: Replaces ampersands with ``&amp;`` entities
		return value.replace(dojox.dtl.filter.strings._fix_ampersands, "&amp;");
	},
	floatformat: function(value, arg){
		// summary: Format a number according to arg
		// description:
		//		If called without an argument, displays a floating point
		//		number as 34.2 -- but only if there's a point to be displayed.
		//		With a positive numeric argument, it displays that many decimal places
		//		always.
		//		With a negative numeric argument, it will display that many decimal
		//		places -- but only if there's places to be displayed.
		arg = parseInt(arg || -1);
		value = parseFloat(value);
		var m = value - value.toFixed(0);
		if(!m && arg < 0){
			return value.toFixed();
		}
		value = value.toFixed(Math.abs(arg));
		return (arg < 0) ? parseFloat(value) + "" : value;
	},
	linenumbers: function(value){
		// summary: Displays text with line numbers
		var df = dojox.dtl.filter;
		var lines = value.split("\n");
		var output = [];
		var width = (lines.length + "").length;
		for(var i = 0, line; i < lines.length; i++){
			line = lines[i];
			output.push(df.strings.ljust(i + 1, width) + ". " + df.htmlstrings.escape(line));
		}
		return output.join("\n");
	},
	ljust: function(value, arg){
		value = value + "";
		arg = parseInt(arg);
		while(value.length < arg){
			value = value + " ";
		}
		return value;
	},
	lower: function(value){
		// summary: Converts a string into all lowercase
		return (value + "").toLowerCase();
	},
	make_list: function(value){
		// summary:
		//		Returns the value turned into a list. For an integer, it's a list of
		//		digits. For a string, it's a list of characters.
		var output = [];
		if(typeof value == "number"){
			value = value + "";
		}
		if(value.charAt){
			for(var i = 0; i < value.length; i++){
				output.push(value.charAt(i));
			}
			return output;
		}
		if(typeof value == "object"){
			for(var key in value){
				output.push(value[key]);
			}
			return output;
		}
		return [];
	},
	rjust: function(value, arg){
		value = value + "";
		arg = parseInt(arg);
		while(value.length < arg){
			value = " " + value;
		}
		return value;
	},
	slugify: function(value){
		// summary: Converts to lowercase, removes
		//		non-alpha chars and converts spaces to hyphens
		value = value.replace(/[^\w\s-]/g, "").toLowerCase();
		return value.replace(/[\-\s]+/g, "-");
	},
	_strings: {},
	stringformat: function(value, arg){
		// summary:
		//		Formats the variable according to the argument, a string formatting specifier.
		//		This specifier uses Python string formating syntax, with the exception that
		//		the leading "%" is dropped.
		arg = "" + arg;
		var strings = dojox.dtl.filter.strings._strings;
		if(!strings[arg]){
			strings[arg] = new dojox.string.sprintf.Formatter("%" + arg);
		}
		return strings[arg].format(value);
	},
	title: function(value){
		// summary: Converts a string into titlecase
		var last, title = "";
		for(var i = 0, current; i < value.length; i++){
			current = value.charAt(i);
			if(last == " " || last == "\n" || last == "\t" || !last){
				title += current.toUpperCase();
			}else{
				title += current.toLowerCase();
			}
			last = current;
		}
		return title;
	},
	_truncatewords: /[ \n\r\t]/,
	truncatewords: function(value, arg){
		// summary: Truncates a string after a certain number of words
		// arg: Integer
		//		Number of words to truncate after
		arg = parseInt(arg);
		if(!arg){
			return value;
		}

		for(var i = 0, j = value.length, count = 0, current, last; i < value.length; i++){
			current = value.charAt(i);
			if(dojox.dtl.filter.strings._truncatewords.test(last)){
				if(!dojox.dtl.filter.strings._truncatewords.test(current)){
					++count;
					if(count == arg){
						return value.substring(0, j + 1);
					}
				}
			}else if(!dojox.dtl.filter.strings._truncatewords.test(current)){
				j = i;
			}
			last = current;
		}
		return value;
	},
	upper: function(value){
		return value.toUpperCase();
	}
});