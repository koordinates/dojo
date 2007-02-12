#!/bin/bash

# Define variables used for rest of the script
version=0.4.2ALPHA2
xdDojoUrl=http://dojotoolkit.org/~jburke/webbuild/$version/src
versionSuffix=xdomain

#Clean up from a previous run.
#Make a temp area to do the work.
rm -rf ./webbuildtemp
mkdir ./webbuildtemp
cd ./webbuildtemp

#Get the source
svn export http://svn.dojotoolkit.org/dojo/branches/0.4
cd ./0.4/buildscripts

#Do xdajax build.
#Mark the dojo.js has an xdomain build, complete with xdomain path for Dojo.
ant -Dprofile=ajax -DreleaseName=$version -DdojoLoader=xdomain -Dversion=$version$versionSuffix -DxdDojoUrl=$xdDojoUrl clean release intern-strings xd-dojo-config

#src folders/buildscripts for the webbuild stuff.
mkdir ../release

cd ../release
mkdir web
cd web
cp -r ../../src .
cp -r ../../buildscripts .
cp -r ../../dojo.js .
cp -r ../../iframe_history.html .
cp -r ../../flash6_gateway.swf .
cp -r ../../DojoFileStorageProvider.jar .
cp -r ../../storage_dialog.swf .
cp -r ../../Storage_version6.swf .
cp -r ../../Storage_version8.swf .

#Stamp the web build with the xd Dojo URL and version.
cd buildscripts/webbuild
cat index.html | sed "s/@VERSION@/$version/g" | sed "s|@XD_DOJO_URL@|$xdDojoUrl|g" > index.out.html
mv index.out.html index.html

#Generate the list of modules for the web build process.
java -jar ../lib/custom_rhino.jar makeWebBuildModuleList.js ../../src treeData.js
cd ../../..

#Now in release folder. Bundle it all up.
mv web/ $version/
zip -r dojo-$version.zip $version/*
mv dojo-$version.zip ../..

#Return to start directory.
cd ../../..