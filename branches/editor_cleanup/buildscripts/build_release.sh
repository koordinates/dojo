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
	CLASSPATH="/home/alex/.ant/lib/js.jar:/home/alex/.ant/lib/jython.jar" ant -q -Dversion=$1 -Ddocless=true -Dprofile=$profile release
	# the release task now includes tests by default
	# cp -r ../tests/* ../release/dojo/tests/
	proName=dojo-$1-$profile
	cd ../release
	rm -f dojo/src/widget/templates/images/hue.png dojo/tests/widget/test_HslColorPicker.xhtml dojo/tests/widget/test_HslColorPicker.xml dojo/src/widget/svg/HslColorPicker.js dojo/src/widget/HslColorPicker.js dojo/src/widget/templates/HslColorPicker.svg
	mv dojo $proName
	tar -zcf $proName.tar.gz $proName/
	zip -rq $proName.zip $proName/
	rm -rf $proName
	cd ../buildscripts
done
