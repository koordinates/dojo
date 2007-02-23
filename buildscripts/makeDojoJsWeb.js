//START of the "main" part of the script.
//This is the entry point for this script file.
load("buildUtil.js");
load("buildUtilXd.js");

var depList = new String(arguments[0]);
var provideList = new String(arguments[1]);
var version = new String(arguments[2]);
var xdDojoUrl = new String(arguments[3]);

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
	
	var contents = buildUtil.makeDojoJs(dependencyResult, version).dojoContents;
	
	//Add copyright, and intern strings.
	contents = new String(buildUtil.readFile("copyright.txt")) + buildUtil.interningRegexpMagic("xdomain", contents, djConfig.baseRelativePath, [["dojo", "src"]], [], true);
	
	if(xdDojoUrl){
		contents = buildUtilXd.setXdDojoConfig(contents, xdDojoUrl);
	}
	
	print(contents);
}
