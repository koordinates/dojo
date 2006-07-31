var reqFile = arguments[0];
var destDir = arguments[1];
var localeList = arguments[2].split(',');

djConfig={
	locale: 'xx',
	extraLocale: localeList
};

load('dojo.js');

dojo.require("dojo.i18n.common");
dojo.require("dojo.json");

var djLoadedBundles = [];

//TODO: register plain function handler (output source) in jsonRegistry?
var drl = dojo.requireLocalization;
dojo.requireLocalization = function(modulename, bundlename, locale){
	drl(modulename, bundlename, locale);
	djLoadedBundles.push({modulename: modulename, bundlename: bundlename});
};

load(reqFile);

//print("loaded bundles: "+djLoadedBundles.length);

var djBundlesByLocale = {};
var locale, entry, bundle;

for (var i = 0; i < djLoadedBundles.length; i++) {
	entry = djLoadedBundles[i];
	bundle = dojo.hostenv.findModule(entry.modulename)._nls[entry.bundlename];
	for (locale in bundle) {
		if (!djBundlesByLocale[locale]){djBundlesByLocale[locale]=[];}
		djBundlesByLocale[locale].push(entry);
	}
}

localeList = [];

for (locale in djBundlesByLocale) {
	for (var j = 0; j < djLoadedBundles.length; j++) {
		entry = djLoadedBundles[j];
		var pkg = [entry.modulename,"_nls",entry.bundlename,locale].join(".");
		print("dojo.hostenv.startPackage(\""+pkg+"\");");
//		print("dojo.hostenv.loaded_modules_[bundlepackage] = bundle;");
		bundle = dojo.hostenv.findModule(entry.modulename)._nls[entry.bundlename];
		print(pkg+"="+dojo.json.serialize(bundle[locale]));
	}
	localeList.push(locale);
}

print(dojo.json.serialize(localeList));
