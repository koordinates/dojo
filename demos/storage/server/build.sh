#!/bin/bash
rm WEB-INF/lib/moxie.jar
rm moxie.war
cd ~/dev/dojo/offline/trunk/demos/storage/server/
javac -Xlint:unchecked -source 1.5 -target jsr14 -cp .:lib/servlet-api.jar:WEB-INF/lib/json-lib-1.0b2-jdk13.jar:WEB-INF/lib/commons-beanutils.jar:WEB-INF/lib/ezmorph-1.0.jar:WEB-INF/lib/commons-lang-2.2.jar org/dojo/moxie/*.java org/dojo/moxie/sync/*.java 
jar -cvf WEB-INF/lib/moxie.jar org/dojo/moxie/*.class org/dojo/moxie/sync/*.class 1>/dev/null
jar -cvf moxie.war WEB-INF/* 1>/dev/null
cp moxie.war /usr/local/tomcat/webapps
cp -r ~/dev/dojo/offline/trunk/demos/storage/server ~/dev/dojo/offline/trunk/release/dojo/demos/storage
rm -fr ~/usr/local/tomcat/webapps/moxie

