#!/bin/bash
# Override value of TOMCAT_HOME below before running this script
export TOMCAT_HOME=/usr/local/tomcat
rm -f WEB-INF/lib/moxie.jar
rm -f moxie.war
rm org/dojo/moxie/*.class
javac -Xlint:unchecked -source 1.5 -target jsr14 -cp .:lib/servlet-api.jar:WEB-INF/lib/json-lib-1.0b2-jdk13.jar:WEB-INF/lib/commons-beanutils.jar:WEB-INF/lib/ezmorph-1.0.jar:WEB-INF/lib/commons-lang-2.2.jar org/dojo/moxie/*.java 
jar -cvf WEB-INF/lib/moxie.jar org/dojo/moxie/*.class 1>/dev/null
jar -cvf moxie.war WEB-INF/* 1>/dev/null
cp moxie.war $TOMCAT_HOME/webapps
cp -r ../server ../../../../release/dojo/demos/storage
rm -fr $TOMCAT_HOME/webapps/moxie

