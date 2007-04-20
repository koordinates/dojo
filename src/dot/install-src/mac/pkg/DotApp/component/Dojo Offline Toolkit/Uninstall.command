#!/usr/bin/perl

use Foundation;
use Tie::File;

echo("Running");
	
# do we want debug messages?
$isDebug = false;
if(scalar(@ARGV) > 0){
	for($i = 0; $i < scalar(@ARGV); $i++){
		if(@ARGV[$i] eq "--debug"){
			$isDebug = true;
		}
	}
}

# is this a silent uninstall?
$beSilent = false;
if(scalar(@ARGV) > 0){
	for($i = 0; $i < scalar(@ARGV); $i++){
		if(@ARGV[$i] eq "--silent"){
			echo("Silent uninstall");
			$beSilent = true;
		}
	}
}

bootstrapUninstall();
stopDojoOffline();
promptStopFirefox();
$origProxySettings = loadOriginalProxySettings();
restoreSafariProxySettings($origProxySettings);
restoreFirefoxProxySettings($origProxySettings);

reportUninstalled();

# now delete the directory and files
deleteFiles();

exit 0;

sub bootstrapUninstall(){
	# We have a quandry: we can't delete
	# ourself or the DOT directory because
	# we are running inside of it. So, we
	# do a trick where we copy ourself to
	# the /tmp directory and call THAT version
	# of Uninstall. To differentiate running
	# the uninstaller twice we add a parameter,
	# "--douninstall", that will now actually
	# do the uninstall
	$doUninstall = false;
	if(scalar(@ARGV) > 0){
		for($i = 0; $i < scalar(@ARGV); $i++){
			if(@ARGV[$i] eq "--douninstall"){
				$doUninstall = true;
			}
		}
	}
	
	if($doUninstall eq true){
		print "Uninstalling Dojo Offline...\n";
		
		echo("--douninstall flag is present");
		echo("Continuing existing uninstall");
		return; # continue doing the uninstall
	}else{
		echo("--douninstall flag is not present");
		echo("Trying to bootstrap uninstaller...");
		# copy ourself to /tmp
		`sudo cp "/Applications/Dojo Offline Toolkit/Uninstall.command" /tmp/Uninstall.command >/dev/null 2>&1`;
		# if we can't copy, just continue -- the worst thing that could happen
		# is the DOT directory won't be deleted
		if($? ne 0){
			echo("Unable to copy ourself to /tmp/Uninstall -- continuing uninstall");
			return;
		}
		# now run our other copy of Uninstall
		echo("Running /tmp/Uninstall.command...");
		$parameters = "";
		if($isDebug eq true){
			$parameters .= " --debug";
		}
		if($beSilent eq true){
			$parameters .= " --silent";
		}
		$outputResults = system("sudo /tmp/Uninstall.command --douninstall $parameters");
		echo($outputResults);
		exit 0;
	}
}

sub stopDojoOffline{
	echo("Stopping Dojo Offline...");
	
	# set the output to /dev/null or else output from these
	# commands will show up to the user in the Terminal window
	# that appears while uninstalling, which we don't want so
	# the user doesn't get overwhelmed with technical output
	system("sudo -u `logname` launchctl stop org.dojo.dot.DojoOfflineLaunchd >/dev/null 2>&1");
	system("sudo -u `logname` launchctl unload \"$ENV{HOME}/Library/LaunchAgents/org.dojo.dot.DojoOfflineLaunchd.plist\" >/dev/null 2>&1");
	`killall -9 dot >/dev/null 2>&1`;
	`killall -9 proxy >/dev/null 2>&1`;
	`killall -9 dotlauncher.sh >/dev/null 2>&1`;
}

sub promptStopFirefox{
	# We must close Firefox if it is open before 
	# continuing. If Firefox is open, and is currently
	# configured to point at our Dojo Offline PAC file,
	# if we change it through this uninstaller THAN close
	# Firefox it will clobber our new settings and keep
	# the PAC file configuration! We can't change user.js
	# now, because we don't want to touch that on uninstall.
	# The only thing to do is ensure Firefox is closed
	# at the beginning of the uninstall.
	
	# see if Firefox is open; if so, prompt user to close it
	# before continuing
	my $firefoxOpen = 1;
	while($firefoxOpen > 0){
		# filter out Parallels as well because the user could have Firefox
		# running under Windows on Parallels, which breaks this!
		$firefoxOpen = `ps -x -U \`logname\` | grep Firefox | egrep -v \"grep|Parallels\" | wc -l | tr -d ' '`;
		if($firefoxOpen > 0){
			echo("Open Firefox processes = $firefoxOpen");
			my $msg = "Please quit Firefox before continuing uninstall";
			echo($msg);
			if($beSilent eq false){
				displayDialog($msg);
			}else{
				echo("Press enter when Firefox is closed");
				`read`;
			}
		}
	}
	
	echo("Firefox now closed or was never open");
}

sub loadOriginalProxySettings{
	$proxiesXML = "$ENV{HOME}/Library/Application\ Support/Dojo/dot/proxies.xml";
	
	echo("Loading original pre-Dojo Offline proxy settings file from $proxiesXML...");
	
	$origProxySettings = NSDictionary->dictionaryWithContentsOfFile_($proxiesXML);
	
	return $origProxySettings;
}

sub restoreSafariProxySettings{
	my $origProxySettings = shift;
	
	echo("Restoring Safari's proxy settings to "
			."what they were before Dojo Offline was installed...");
	
	# enumerate over our original Safari proxy settings; these are
	# mixed with Firefox ones. The Safari ones start with the name
	# "Safari Proxy for SomeEndpoint", such as "Safari Proxy for AirPort"
	my $enumerator = $origProxySettings->keyEnumerator();
	my $key;
	while($key = $enumerator->nextObject() and $$key){
		$key = $key->description->UTF8String();
		if(index($key, "Safari Proxy") != -1){
			$key =~ m/^Safari Proxy for (.*)$/;
			my $endpoint = $1;
			
			# transform these plist values into a perl hash
			# we can work with
			my $endpointSettings = {
				"AppleProxyConfigurationSelected"=>
						getProxySetting($origProxySettings, $key, "AppleProxyConfigurationSelected"),
				"HTTPEnable"=>
						getProxySetting($origProxySettings, $key, "HTTPEnable"),
				"ProxyAutoConfigEnable"=>
						getProxySetting($origProxySettings, $key, "ProxyAutoConfigEnable"),
				"ProxyAutoConfigURLString"=>
						getProxySetting($origProxySettings, $key, "ProxyAutoConfigURLString"),
				"ProxyAutoDiscoveryEnable"=>
						getProxySetting($origProxySettings, $key, "ProxyAutoDiscoveryEnable")
			};
			
			# now use these values to set Safari's current
			# proxy settings back to their original values
			revertNetworkEndpoint($endpointSettings, $endpoint);
		}
	}
	
	# force Safari to see this change
	echo("Forcing Safari to see this change...");
	# the 'scutil' can give us our current location,
	# which we will then reselect. 'scselect' hooks right
	# into the System Preferences system, and will force
	# a refresh of the configuration info into memory.
	# Technique from the following blog post:
	# http://homepage.mac.com/gregneagle/iblog/C1833135211/E870388235/index.html
	my $location;
	my @scutil = `scutil <<- end_scutil 2> /dev/null
open
show Setup:/
close
end_scutil`;
	my @matches = map { m/UserDefinedName : (.*)/ } @scutil;
	if(@matches == 1) {
		$location = $matches[0];
		echo("Existing network endpoint: $location");
		system("sudo -u `logname` scselect $location > /dev/null 2>&1");
		echo("Results of forcing Safari to see this change: $results");
	}
}

sub getProxySetting{
	my $origProxySettings = shift;
	my $key = shift;
	my $subkey = shift;
	
	$result = getPlistObject($origProxySettings, $key, $subkey);
	
	return $result->description()->UTF8String();
}

sub revertNetworkEndpoint{
	my $origPrefs = shift;
	my $endpointName = shift;
		
	echo("Reverting Safari network endpoint for $endpointName...");
	echo("Pre-Dojo Offline values:");
	echo("\tAppleProxyConfigurationSelected="	.$origPrefs->{"AppleProxyConfigurationSelected"});
	echo("\tHTTPEnable="						.$origPrefs->{"HTTPEnable"});
	echo("\tProxyAutoConfigEnable="				.$origPrefs->{"ProxyAutoConfigEnable"});
	echo("\tProxyAutoConfigURLString="			.$origPrefs->{"ProxyAutoConfigURLString"});
	echo("\tProxyAutoDiscoveryEnable="			.$origPrefs->{"ProxyAutoDiscoveryEnable"});
	
	# open our plist file that has our network preference configuration
	$PREFS_PATH = "/Library/Preferences/SystemConfiguration/preferences.plist";
	
	echo("Loading Safari proxy settings file from $PREFS_PATH...");
	my $plist = NSMutableDictionary->dictionaryWithContentsOfFile_($PREFS_PATH);
	
	# make sure an error didn't occur or we couldn't find the file
	if (! $plist or ! $$plist){
		echo("Unable to find Safari network preferences plist file");
		echo("WARNING: Unable to restore pre-Dojo Offline Safari proxy settings");
		echo("Original Safari settings are available in $PREFS_PATH.orig");
		return;
	}
	
	# loop through each network endpoint, looking for the
	# one with the user defined name we need
	my $networkServices = getPlistObject($plist, "NetworkServices");
	my $enumerator = $networkServices->keyEnumerator();
	my $currentGUID;
	while($currentGUID = $enumerator->nextObject() and $$currentGUID){
		$currentGUID = $currentGUID->description->UTF8String();
		my $userDefinedName = getPlistObject($plist, 
										"NetworkServices", 
										$currentGUID,
										"Interface",
										"UserDefinedName");
		if($userDefinedName and $$userDefinedName){
			$userDefinedName = $userDefinedName->description()->UTF8String();
			if($userDefinedName eq $endpointName){
				$guid = $currentGUID;
				break;
			}
		}
	}
	
	if($guid eq null){
		echo("Unable to find GUID for $endpointName");
		return;
	}
									
	# see the file 'preinstall' and the 
	# method 'handleNetworkEndpoint' for details
	# on how Safari works with it's proxy settings
	
	# now revert these values
	echo("Reverting PAC settings for '$endpointName'...");
	my $proxyElem = getPlistObject($plist, 
								"NetworkServices", 
								"$guid",
								"Proxies");
										
	# was there a PAC file?
	if($origPrefs->{"ProxyAutoConfigURLString"} ne null){ # we have a PAC setting
		$proxyElem->setObject_forKey_($origPrefs->{"ProxyAutoConfigURLString"}, 
										"ProxyAutoConfigURLString");
		# was the PAC file switched on?
		if($origPrefs->{"ProxyAutoConfigEnable"} ne -1){ # PAC file was switched on
			# make sure we have an int type and not a string, or
			# this will be serialized into the wrong plist type
			my $value = $origPrefs->{"ProxyAutoConfigEnable"};
			$value = ($value eq "1" or $value eq 1) ? 1 : 0;
			$proxyElem->setObject_forKey_(cocoaInt($value), "ProxyAutoConfigEnable");
		}else{
			$proxyElem->setObject_forKey_(cocoaInt(0), "ProxyAutoConfigEnable");
		}
	}else{
		$proxyElem->removeObjectForKey_("ProxyAutoConfigURLString");
		$proxyElem->removeObjectForKey_("ProxyAutoConfigEnable");
	}
	
	# For a manual proxy, was HTTP enabled for a proxy setting?
	if($origPrefs->{"HTTPEnable"} eq 1 or $origPrefs->{"HTTPEnable"} eq "1"){
		$proxyElem->setObject_forKey_(cocoaInt(1), "HTTPEnable");
	}
	
	# reset whether proxies are enabled in general or not
	my $value = $origPrefs->{"AppleProxyConfigurationSelected"};
	if($value eq "0"){
		$value = 0;
	}elsif($value eq "1"){
		$value = 1;
	}elsif($value eq "2"){
		$value = 2;
	}elsif($value eq "3"){
		$value = 3;
	}
	$proxyElem->setObject_forKey_(cocoaInt($value), "AppleProxyConfigurationSelected");
									
	# renable PAC autodiscovery on the network (WPAD) if that was on before
	$value = $origPrefs->{"ProxyAutoDiscoveryEnable"};
	if($value eq "1"){
		$value = 1;
	}elsif($value eq "0"){
		$value = 0;
	}
	$proxyElem->setObject_forKey_(cocoaInt($value), "ProxyAutoDiscoveryEnable");

	# write out our changed plist file
	echo("Writing out reverted Safari proxy prefs file to $ENV{HOME}/preferences.plist...");
	$saveResults = $plist->writeToFile_atomically_("$ENV{HOME}/preferences.plist", "0");
	if($saveResults ne 1){ # 1 = success, 0 = failure
		echo("Unable to save reverted Safari proxy settings");
		return;
	}
	
	# move the prefs file over
	echo("Copying reverted prefs to \"$PREFS_PATH\"...");
	$copyResults = system("sudo cp -f \"$ENV{HOME}/preferences.plist\" \"$PREFS_PATH\"");
	if($copyResults ne 0){
		echo("Unable to copy reverted Safari proxy settings over");
		`sudo rm -f $ENV{HOME}/preferences.plist >/dev/null 2>&1`;
		return;
	}
	
	# clean up
	`sudo rm -f $ENV{HOME}/preferences.plist >/dev/null 2>&1`;
	
	echo("Safari proxy prefs file saved.");
}

sub printDebugValues{
	# a debugging method to print all of our proxy values
	# for a Safari proxy settings file
	
	my $plist = shift;
	my $guid = shift;
	
	$keyName = "ProxyAutoConfigURLString";
	$objValue = getPlistObject($plist, 
								"NetworkServices", 
								$guid,
								"Proxies",
								$keyName);
	if($objValue and $$objValue){
		echo("\t$keyName=" . $objValue->description()->UTF8String());
	}
	
	$keyName = "ProxyAutoConfigEnable";
	$objValue = getPlistObject($plist, 
								"NetworkServices", 
								$guid,
								"Proxies",
								$keyName);
	if($objValue and $$objValue){
		echo("\t$keyName=" . $objValue->description()->UTF8String());
	}
	
	$keyName = "HTTPEnable";
	$objValue = getPlistObject($plist, 
								"NetworkServices", 
								$guid,
								"Proxies",
								$keyName);
	if($objValue and $$objValue){
		echo("\t$keyName=" . $objValue->description()->UTF8String());
	}
	
	$keyName = "AppleProxyConfigurationSelected";
	$objValue = getPlistObject($plist, 
								"NetworkServices", 
								$guid,
								"Proxies",
								$keyName);
	if($objValue and $$objValue){
		echo("\t$keyName=" . $objValue->description()->UTF8String());
	}
	
	$keyName = "ProxyAutoDiscoveryEnable";
	$objValue = getPlistObject($plist, 
								"NetworkServices", 
								$guid,
								"Proxies",
								$keyName);
	if($objValue and $$objValue){
		echo("\t$keyName=" . $objValue->description()->UTF8String());
	}
}

sub restoreFirefoxProxySettings{
	my $origProxySettings = shift;
	
	echo("Restoring Firefox's proxy settings to "
			."what they were before Dojo Offline was installed...");
			
	# enumerate through each original pre-Dojo Offline proxy setting, 
	# getting the ones that have to do with Firefox profiles
	my $enumerator = $origProxySettings->keyEnumerator();
	my $key;
	while($key = $enumerator->nextObject() and $$key){
		$key = $key->description->UTF8String();
		if(index($key, "Firefox Proxy") != -1){
			$key =~ m/^Firefox Proxy for (.*)$/;
			my $profileName = $1;
			
			# transform these plist values into a perl hash
			# we can work with
			my $profileSettings = {
				"NetworkProxyAutoconfigURL"=>
						getProxySetting($origProxySettings, $key, "NetworkProxyAutoconfigURL"),
				"NetworkProxyType"=>
						getProxySetting($origProxySettings, $key, "NetworkProxyType")
			};
			
			# now use these values to set Firefox's current
			# proxy settings back to their original values
			revertFirefoxProfile($profileSettings, $profileName);
		}
	}
}

sub revertFirefoxProfile{
	my $profileSettings = shift;
	my $profileName = shift;
	
	my $FIREFOX_PROFILE_PATH = "$ENV{HOME}/Library/Application\ Support/Firefox/Profiles";
	
	echo("Handling Firefox profile $profileName...");
	echo("Original values:");
	echo("\tNetworkProxyAutoconfigURL: ".$profileSettings->{"NetworkProxyAutoconfigURL"});
	echo("\tNetworkProxyType: ".$profileSettings->{"NetworkProxyType"});
	
	# user.js does not get recreated when Firefox is started or stopped;
	# so, first remove all of our Dojo Offline network settings from user.js
	# then, add our reverted proxy settings to prefs.js
	
	# remove any of our Dojo Offline pref settings
	echo("Removing old Dojo Offline settings from $FIREFOX_PROFILE_PATH/$profileName/user.js...");
	my $userJSPath = "$FIREFOX_PROFILE_PATH/$profileName/user.js";
	eval{
		my @contents;
		tie @contents, 'Tie::File', $userJSPath or die("Cannot open $userJSPath");
		
		for(@contents){
			# simply delete our Dojo Offline lines, which start with the 
			# JavaScript comment /* dot */
			s/^\/\* dot \*\/.*$//g;
		}

		untie @contents;
	};
	
	# was there an error?
	if($@){
		echo($@);
		return;
	}
	
	# add our reverted proxy settings to prefs.js
	echo("Adding reverted original proxy prefs to $FIREFOX_PROFILE_PATH/$profileName/prefs.js...");
	eval{
		$prefsJSPath = "$FIREFOX_PROFILE_PATH/$profileName/prefs.js";
		open(DAT,">>$prefsJSPath") || die("Cannot open $prefsJSPath: $!");
		
		$proxyPAC = null;
		if($profileSettings->{"NetworkProxyAutoconfigURL"} ne null){
			$proxyPAC = "\"" . $profileSettings->{"NetworkProxyAutoconfigURL"} . "\"";
		}else{
			$proxyPAC = "undefined";
		}
		
		$proxyType = null;
		if($profileSettings->{"NetworkProxyType"} ne null){
			$proxyType = "\"" . $profileSettings->{"NetworkProxyType"} . "\"";
		}else{
			$proxyType = 0;
		}
		
		print DAT "user_pref(\"network.proxy.type\", $proxyType);\n";
		print DAT "user_pref(\"network.proxy.autoconfig_url\", $proxyPAC);\n";
		close(DAT) || die("Cannot close $prefsJSPath: $!");
	};
	
	# was there an error?
	if($@){
		echo($@);
		return;
	}
	
	echo("Original Firefox proxy settings were written out for $profileName");
}

sub deleteFiles{
	# application directory
	echo("Removing Dojo Offline application directory...");
	`sudo rm -fr "/Applications/Dojo Offline Toolkit" >/dev/null 2>&1`;
	
	# application support directory
	echo("Removing Dojo Offline application support directory...");
	`sudo rm -fr "$ENV{HOME}/Library/Application Support/Dojo/dot"`;
	$numberFiles = `ls "$ENV{HOME}/Library/Application Support/Dojo" | wc -l`;
	if($numberFiles eq 0){
		`sudo rm -fr "$ENV{HOME}/Library/Application Support/Dojo"`;
	}
	
	# per-user settings files
	echo("Removing Dojo Offline setting for this user...");
	`sudo rm -fr $ENV{HOME}/.offline-cache`;
	`sudo rm -fr $ENV{HOME}/.offline-list`;
	`sudo rm -fr $ENV{HOME}/.offline-pac`;
	
	# startup agent
	echo("Removing Dojo Offline launch agent...");
	`sudo rm -f "$ENV{HOME}/Library/LaunchAgents/org.dojo.dot.DojoOfflineLaunchd.plist"`;
	
	# install receipt
	echo("Removing Dojo Offline install receipt...");
	# TODO: WARNING: It is potentially dangerous to be removing all
	# of the receipts for any version of Dojo Offline. We don't have
	# a version string here to work off of, but it would be good to pass
	# one in in the future
	`sudo rm -fr /Library/Receipts/DojoOffline-*.pkg`;
}

sub reportUninstalled{
	$msg = "Dojo Offline uninstalled.\n" .
			"Please restart Firefox and Safari for changes to take effect.";
	print $msg."\n";	
	echo($msg);
	
	if($beSilent eq false){
		displayDialog($msg);
	}
}

sub displayDialog{
	my $msg = shift;
	
	# Use a little bit of AppleScript magic to display a dialog telling the user
	# a given message -- 'osascript' is a command line utility to execute
	# AppleScript. Here's the AppleScript without all the extraneous command line stuff:
	#
	# tell application "Finder"
	#	activate
	#	display dialog "$msg" buttons ["OK"]
	# end tell
	#
	my $runMe = "osascript " .
				"-e 'tell application \"Finder\"' " . 
	 				"-e 'activate' " .
					"-e 'display dialog \"$msg\" buttons [\"OK\"]' " .
				"-e 'end tell' " .
				">/dev/null 2>&1";
	system($runMe);
}

sub getPlistObject{
	my ($object, @keysIndexes) = (@_);
	if(@keysIndexes){
		foreach my $keyIndex(@keysIndexes){
			if($object and $$object){
				if($object->isKindOfClass_(NSArray->class)){
					$object = $object->objectAtIndex_($keyIndex);
				}elsif($object->isKindOfClass_(NSDictionary->class)){
					$object = $object->objectForKey_($keyIndex);
				}else{
					echo("Unknown type (not an array or a dictionary)");
					return;
				}
			}else{
					echo("Got nil or other error for $keyIndex.");
					return;
			}
		}
	}
	return $object;
}

sub setPlistObject {
	my ($plistContainer, @keyesIndexesValue) = (@_);
	my $objectToSet = pop(@keyesIndexesValue);
	my $keyIndex = pop(@keyesIndexesValue);
	my $parentContainer = getPlistObject($plistContainer, 
                                         @keyesIndexesValue);
	if($parentContainer and $$parentContainer){
		if($parentContainer->isKindOfClass_(NSArray->class)){
			if( $keyIndex > $parentContainer->count -1 ){
				$parentContainer->addObject_($objectToSet);
			}else {
				$parentContainer->replaceObjectAtIndex_withObject_($keyIndex, 
																	$objectToSet);
			}
		}elsif($parentContainer->isKindOfClass_(NSDictionary->class)){
			$parentContainer->setObject_forKey_($objectToSet, $keyIndex);
		}else{
			print STDERR "Unknown parent container type.\n";
		}
	}else{
		print STDERR "Could not get value specified by @keyesIndexesValue.\n";
	}
}

sub cocoaInt{
	return NSNumber->numberWithLong_($_[0]);
}

sub echo{
	my $msg = shift;
	$msg = "Uninstall: " . $msg;
	`echo "$msg" >> ~/dot_install.log 2>&1`;
	if($isDebug eq true){
		print "$msg\n";
	}
}
