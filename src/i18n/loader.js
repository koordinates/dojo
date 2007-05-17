dojo.provide("dojo.i18n.loader");

dojo.i18n._requireLocalization = function(/*String*/moduleName, /*String*/bundleName, /*String?*/locale, /*String?*/availableFlatLocales){
	// summary:
	//	See dojo.requireLocalization()

	dojo.hostenv.preloadLocalizations();
	var targetLocale = dojo.hostenv.normalizeLocale(locale);
 	var bundlePackage = [moduleName, "nls", bundleName].join(".");
	// NOTE: 
	//		When loading these resources, the packaging does not match what is
	//		on disk.  This is an implementation detail, as this is just a
	//		private data structure to hold the loaded resources.  e.g.
	//		tests/hello/nls/en-us/salutations.js is loaded as the object
	//		tests.hello.nls.salutations.en_us={...} The structure on disk is
	//		intended to be most convenient for developers and translators, but
	//		in memory it is more logical and efficient to store in a different
	//		order.  Locales cannot use dashes, since the resulting path will
	//		not evaluate as valid JS, so we translate them to underscores.
	
	//Find the best-match locale to load if we have available flat locales.
	var bestLocale = "";
	if(availableFlatLocales){
		var flatLocales = availableFlatLocales.split(",");
		for(var i = 0; i < flatLocales.length; i++){
			//Locale must match from start of string.
			if(targetLocale.indexOf(flatLocales[i]) == 0){
				if(flatLocales[i].length > bestLocale.length){
					bestLocale = flatLocales[i];
				}
			}
		}
		if(!bestLocale){
			bestLocale = "ROOT";
		}		
	}

	//See if the desired locale is already loaded.
	var tempLocale = availableFlatLocales ? bestLocale : targetLocale;
	var bundle = dojo.hostenv.findModule(bundlePackage);
	var localizedBundle = null;
	if(bundle){
		if(djConfig.localizationComplete && bundle._built){return;}
		var jsLoc = tempLocale.replace('-', '_', 'g');
		var translationPackage = bundlePackage+"."+jsLoc;
		localizedBundle = dojo.hostenv.findModule(translationPackage);
	}

	if(!localizedBundle){
		bundle = dojo.hostenv.startPackage(bundlePackage);
		var syms = dojo.hostenv.getModuleSymbols(moduleName);
		var modpath = syms.concat("nls").join("/");
		var parent;

		dojo.i18n._searchLocalePath(tempLocale, availableFlatLocales, function(loc){
			var jsLoc = loc.replace('-', '_', 'g');
			var translationPackage = bundlePackage + "." + jsLoc;
			var loaded = false;
			if(!dojo.hostenv.findModule(translationPackage)){
				// Mark loaded whether it's found or not, so that further load attempts will not be made
				dojo.hostenv.startPackage(translationPackage);
				var module = [modpath];
				if(loc != "ROOT"){module.push(loc);}
				module.push(bundleName);
				var filespec = module.join("/") + '.js';
				loaded = dojo.hostenv.loadPath(filespec, null, function(hash){
					// Use singleton with prototype to point to parent bundle, then mix-in result from loadPath
					var clazz = function(){};
					clazz.prototype = parent;
					bundle[jsLoc] = new clazz();
					for(var j in hash){ bundle[jsLoc][j] = hash[j]; }
				});
			}else{
				loaded = true;
			}
			if(loaded && bundle[jsLoc]){
				parent = bundle[jsLoc];
			}else{
				bundle[jsLoc] = parent;
			}
			
			if(availableFlatLocales){
				//Stop the locale path searching if we know the availableFlatLocales, since
				//the first call to this function will load the only bundle that is needed.
				return true;
			}
		});
	}

	//Save the best locale bundle as the target locale bundle when we know the
	//the available bundles.
	if(availableFlatLocales && targetLocale != bestLocale){
		bundle[targetLocale.replace('-', '_', 'g')] = bundle[bestLocale.replace('-', '_', 'g')];
	}
};

(function(){
	// If other locales are used, dojo.requireLocalization should load them as
	// well, by default. 
	// 
	// Override dojo.requireLocalization to do load the default bundle, then
	// iterate through the extraLocale list and load those translations as
	// well, unless a particular locale was requested.

	var extra = djConfig.extraLocale;
	if(extra){
		if(!extra instanceof Array){
			extra = [extra];
		}

		var req = dojo.i18n._requireLocalization;
		dojo.i18n._requireLocalization = function(m, b, locale, availableFlatLocales){
			req(m,b,locale, availableFlatLocales);
			if(locale){return;}
			for(var i=0; i<extra.length; i++){
				req(m,b,extra[i], availableFlatLocales);
			}
		};
	}
})();

dojo.hostenv.normalizeLocale = function(/*String?*/locale){
	//	summary:
	//		Returns canonical form of locale, as used by Dojo.  All variants
	//		are case-insensitive and are separated by '-' as specified in RFC
	//		3066. If no locale is specified, the user agent's default is
	//		returned.

	var result = locale ? locale.toLowerCase() : dojo.locale;
	if(result == "root"){
		result = "ROOT";
	}
	return result;// String
};

dojo.i18n._searchLocalePath = function(/*String*/locale, /*Boolean*/down, /*Function*/searchFunc){
	//	summary:
	//		A helper method to assist in searching for locale-based resources.
	//		Will iterate through the variants of a particular locale, either up
	//		or down, executing a callback function.  For example, "en-us" and
	//		true will try "en-us" followed by "en" and finally "ROOT".

	locale = dojo.hostenv.normalizeLocale(locale);

	var elements = locale.split('-');
	var searchlist = [];
	for(var i = elements.length; i > 0; i--){
		searchlist.push(elements.slice(0, i).join('-'));
	}
	searchlist.push(false);
	if(down){searchlist.reverse();}

	for(var j = searchlist.length - 1; j >= 0; j--){
		var loc = searchlist[j] || "ROOT";
		var stop = searchFunc(loc);
		if(stop){ break; }
	}
};

//These two functions are placed outside of preloadLocalizations
//So that the xd loading can use/override them.
dojo.hostenv.localesGenerated /***BUILD:localesGenerated***/; // value will be inserted here at build time, if necessary

dojo.hostenv.preloadLocalizations = function(){
	// summary:
	//		Load built, flattened resource bundles, if available for all
	//		locales used in the page. Execute only once. Note that this is a
	//		no-op unless there is a build.

	if(dojo.hostenv.localesGenerated){
		dojo.registerModulePath("nls","nls");	

		function preload(locale){
			locale = dojo.hostenv.normalizeLocale(locale);
			dojo.i18n._searchLocalePath(locale, true, function(loc){
				for(var i=0; i<dojo.hostenv.localesGenerated.length;i++){
					if(dojo.hostenv.localesGenerated[i] == loc){
						dojo["require"]("nls.dojo_"+loc);
						return true; // Boolean
					}
				}
				return false; // Boolean
			});
		}
		preload();
		var extra = djConfig.extraLocale||[];
		for(var i=0; i<extra.length; i++){
			preload(extra[i]);
		}
	}
	dojo.hostenv.preloadLocalizations = function(){};
};
