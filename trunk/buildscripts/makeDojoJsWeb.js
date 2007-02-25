//START of the "main" part of the script.
//This is the entry point for this script file.
load("buildUtil.js");
load("buildUtilXd.js");

var depList = new String(arguments[0]);
var provideList = new String(arguments[1]);
var version = new String(arguments[2]);
var xdDojoUrl = new String(arguments[3]);
var doCompression = new String(arguments[4]);

if(typeof(doCompression) != "undefined" && doCompression == "true"){
	doCompression = true;
}else{
	doCompression = false;
}

depList = depList.split(",");

//Check if there were no provideList (the caller can send string "null"
//to indicate that the command line parameter is empty. We need some string
//to make sure all the arguments are in the right spot.
if(provideList == "null"){
	provideList = "[]";
}else{
	provideList = provideList.split(",");
	provideList = '["' + provideList.join('","') + '"]';
}

var dependencyResult;
eval('dependencyResult = {depList: ["' + depList.join('","') + '"], provideList: ' + provideList + '};');

//Make sure we are dealing with JS files and that the paths are not outside
//of the working area. Do this to discourage fetching arbitrary files from
//the server.
var deps = dependencyResult.depList;
var isInputOk = true;
for(var i = 0; i < deps.length; i++){
	var matches = deps[i].match(/\.\./g);
	if((matches && matches.length > 1) || !deps[i].match(/\.js$/) || deps[i].indexOf(0) == '/'){
		print("Error: Invalid file set.");
		isInputOk = false;
		break;
	}
}

if(isInputOk){
	//Load dojo (needed for string interning)
	djConfig={
		baseRelativePath: "../"
	};
	load('../dojo.js');
	dojo.require("dojo.string.extras");
	
	var contents = "";
	try{
		contents = buildUtil.makeDojoJs(dependencyResult, version).dojoContents;
		var prefixes = [["dojo", "src"]];
	
		//Make sure any dojo.requireLocalization calls are modified
		//so that they inform the loader of valid locales that can be loaded.
		contents = buildUtil.modifyRequireLocalization(contents, djConfig.baseRelativePath, prefixes);
		
		//Convert requireLocalization calls into xdRequireLocalization calls.
		contents = contents.replace(/dojo\.requireLocalization\s*\(/g, "dojo.xdRequireLocalization(");
		
		//Intern strings.
		contents = buildUtil.interningRegexpMagic("xdomain", contents, djConfig.baseRelativePath, prefixes, [], true);
		
		//Set the xdomain dojo url
		if(xdDojoUrl){
			contents = buildUtilXd.setXdDojoConfig(contents, xdDojoUrl);
		}

		//Compress code, if desired.
		if(doCompression){
			contents = buildUtil.optimizeJs("dojo.js", contents, "", doCompression);
		}

		//Add copyright
		contents = new String(buildUtil.readFile("copyright.txt"))
			+ new String(buildUtil.readFile("build_notice.txt"))
			+ contents;
	}catch(e){
		contents = "dojo.js build error: " + e;	
	}

	print(contents);
}
