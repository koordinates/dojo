#!/bin/bash

# Folder names
DOJO=dojo-`date +%F`
OUT_DIR=../release/

# Build profiles
echo Build profiles...
ant # get it setup
for pfile in $(cd profiles; ls *.profile.js; cd ..)
do
	profile=`echo $pfile | sed 's/.profile.js//g'`
	echo Building profile: $profile
	CLASSPATH="/home/alex/.ant/lib/js.jar:/home/alex/.ant/lib/jython.jar" ant -q -Dversion=0.3.0 -Ddocless=true -Dprofile=$profile release
	proName=dojo-0.3.0-$profile
	cd ../release
	mv dojo $proName
	tar -zcf $proName.tar.gz $proName/
	zip -rq $proName.zip $proName/
	rm -rf $proName
	cd ../buildscripts
done
