
//FIXME: Need to get this to work for external modules (non-dojo modules).
//There is a general problem of getting xd builds to process non-dojo modules.
function flattenBundleForXd(srcFile, destFile){
	//Make sure we are dealing with JS strings.
	srcFile = new String(srcFile);
	destFile = new String(destFile);
	
	//May be dealing with windows paths normalize.
	if (srcFile.indexOf("/") == -1){
		srcFile = srcFile.replace(/\\/g, "/");
	}

	print("Flattening bundle: " + srcFile);

	//Strip off the src/ stuff.
	srcFile = srcFile.replace(/^.*?\/src\//, "");
	//var srcIndex = srcFile.indexOf("src/");
	//srcFile = srcFile.substring(srcIndex + 4, srcFile.length);
	var parts = srcFile.split("/");

	//Split up the srcFile into arguments that can be used for dojo.requireLocalization()
	var moduleParts = [];
	for(var i = 0; parts[i] != "nls"; i++){
		moduleParts.push(parts[i]);
	}
	var moduleName = "dojo." + moduleParts.join(".");
	if(parts[i+1].match(/\.js$/)){
		var localeName = "ROOT";
		var bundleName = parts[i+1];
	}else{
		var localeName = parts[i+1];
		var bundleName = parts[i+2];	
	}

	if(!bundleName || bundleName.indexOf(".js") == -1){
		//Not a valid bundle. Could be something like a README file.
		return;
	}else{
		bundleName = bundleName.replace(/\.js/, "");
	}
	
	dojo.requireLocalization(moduleName, bundleName, localeName);
	
	
	//Get the generated, flattened bundle.
	var module = dojo.evalObjPath(moduleName);
	var flattenedBundle = module.nls[bundleName][localeName.replace(/-/g, "_")];
	if(!flattenedBundle){
		throw "Cannot create flattened bundle for src file: " + srcFile;
	}
	
	//Write out the flattened bundle with the appropriate xd boilerplate.
	var outFile = new java.io.File(destFile.replace(/\.js$/, ".xd.js"));
	var os = new java.io.BufferedWriter(
			new java.io.OutputStreamWriter(new java.io.FileOutputStream(outFile), "utf-8"));
	try{
		if(localeName == "ROOT"){
			localeName = "";
		}
		os.write('dojo.provide("' + moduleName + '.nls.' + (localeName ? localeName + '.' : '') + bundleName + '");');
		os.write('dojo.hostenv.xdLoadFlattenedBundle("' + moduleName + '", "' + bundleName 
			+ '", "' + localeName + '", ' + dojo.json.serialize(flattenedBundle) + ');');
	}finally{
		os.close();
	}
}


var srcDir = arguments[0];
var destDir = arguments[1];

//Load Dojo so we can use dojo.requireLocalization()
djConfig={
	baseRelativePath: "../"
};
load('../dojo.js');
dojo.require("dojo.i18n.common");
dojo.require("dojo.json");

//Find the bundles that need to be flattened.
load("buildUtil.js");

//Clean up input.
srcDir = buildUtil.ensureEndSlash(srcDir);
destDir = buildUtil.ensureEndSlash(destDir);
print("topSrcDir: " + srcDir + ", topDestDir: " + destDir);


var nlsFiles = buildUtil.getFilteredFileList(srcDir, /\/nls\//);

//Flatten the bundles
for(var i = 0; i < nlsFiles.length; i++){
	flattenBundleForXd(nlsFiles[i], nlsFiles[i].replace(srcDir, destDir + "src/"));
}

