//START of the "main" part of the script.
//This is the entry point for this script file.
load("buildUtil.js");
load("buildUtilXd.js");

var depList = new String(arguments[0]);
var provideList = new String(arguments[1]);
var version = new String(arguments[2]);
var xdDojoUrl = new String(arguments[3]);

depList = depList.split(",");
provideList = provideList.split(",");

var dependencyResult;
eval('dependencyResult = {depList: ["' + depList.join('","') + '"], provideList: ["' + provideList.join('","') + '"]};');

var contents = buildUtil.makeDojoJs(dependencyResult, version).dojoContents;

if(xdDojoUrl){
	contents = buildUtilXd.setXdDojoConfig(contents, xdDojoUrl);
}

print(contents);
