load("buildUtil.js");

var startDir = arguments[0];

var suppressDojoCopyright =  arguments[1];
if(suppressDojoCopyright == "true"){
	suppressDojoCopyright = true;
}else{
	suppressDojoCopyright = false;
}

var doCompress =  arguments[2];
if(doCompress == "true"){
	doCompress = true;
}else{
	doCompress = false;
}

print(suppressDojoCopyright + ", " + doCompress);

buildUtil.stripComments(startDir, suppressDojoCopyright, doCompress);
