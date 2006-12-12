#!/bin/bash

# Folder names
DOJO=dojo-`date +%F`
OUT_DIR=../release/


doBuild(){
	profile=`echo $1 | sed 's/.profile.js//g'`
	version=$2
	loader=$3
	proName=dojo-$version-$profile
	extraAntTasks=""
	if [ "$loader" == "xdomain" ]; then
		proName=dojo-$version-xdomain-$profile
		version=$version"xdomain"
		extraAntTasks="intern-strings"
	fi

	echo Building profile: $profile
	CLASSPATH="/home/alex/.ant/lib/js.jar:/home/alex/.ant/lib/jython.jar" ant -q -Dversion=$version -Ddocless=true -Dprofile=$profile -DdojoLoader=$loader release $extraAntTasks
	# the release task now includes tests by default
	# cp -r ../tests/* ../release/dojo/tests/

	cd ../release
	mv dojo $proName
	tar -zcf $proName.tar.gz $proName/
	zip -rq $proName.zip $proName/
	rm -rf $proName
	cd ../buildscripts
}

# Build profiles
echo Build profiles...
ant # get it setup

for pfile in $(cd profiles; ls *.profile.js; cd ..)
do
	doBuild $pfile $1 "default"
done

# Make one xdomain build, for ajax.
doBuild "ajax.profile.js" $1 "xdomain"
