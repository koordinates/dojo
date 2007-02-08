#!/bin/bash
rm WEB-INF/lib/moxie.jar
rm moxie.war
cd ~/dev/dojo/offline/trunk/demos/storage/server/
javac -source 1.5 -target jsr14 -cp lib/servlet-api.jar org/dojo/moxie/*.java org/dojo/moxie/sync/*.java org/dojo/moxie/util/*.java
jar -cvf WEB-INF/lib/moxie.jar org/dojo/moxie/*.class org/dojo/moxie/sync/*.class org/dojo/moxie/util/*.class
jar -cvf moxie.war WEB-INF/*
cp moxie.war /usr/local/tomcat/webapps
cp -r ~/dev/dojo/offline/trunk/demos/storage/server ~/dev/dojo/offline/trunk/release/dojo/demos/storage

