#!/bin/bash

case $1 in
	start) 
		echo "Starting Dojo Offline...";
		"/Applications/Dojo Offline Toolkit/dot" "/Applications/Dojo\ Offline\ Toolkit/";
		;;  
	stop)
		echo "Stopping Dojo Offline...";
		launchctl stop org.dojo.dot.DojoOfflineLaunchd;
		launchctl unload ~/Library/LaunchAgents/org.dojo.dot.DojoOfflineLaunchd.plist;
		killall -9 dot;
		killall -9 proxy;
		killall -9 dotlauncher.sh;
		;;
	status)
		p=`ps -ax | egrep -e "dot|proxy|dotlauncher.sh" | egrep -v -e "\.\/dotlauncher.sh" | egrep -v -e "egrep" | wc -l`;
		if test $p -eq 0; then
			echo "Not Running";
		else
			echo "Running";
		fi
		;;
	*)
		echo "Usage:";
		echo "launcher start|stop";
		exit 1;
		;;
esac
