#!/usr/bin/perl

use Foundation;

echo("Running");

bootstrapUninstall();
stopDojoOffline();
$origProxySettings = loadOriginalProxySettings();
restoreSafariProxySettings($origProxySettings);
restoreFirefoxProxySettings($origProxySettings);
removeDefaults();

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
		`sudo cp "/Applications/Dojo Offline Toolkit/Uninstall.command" /tmp/Uninstall >/dev/null 2>&1`;
		# if we can't copy, just continue -- the worst thing that could happen
		# is the DOT directory won't be deleted
		if($? ne 0){
			echo("Unable to copy ourself to /tmp/Uninstall -- continuing uninstall");
			return;
		}
		# now run our other copy of Uninstall
		echo("Running /tmp/Uninstall...");
		$outputResults = system("/tmp/Uninstall --douninstall");
		echo($outputResults);
		exit 0;
	}
}

sub stopDojoOffline{
	echo("Stopping Dojo Offline...");
	
	`killall -9 dot >/dev/null 2>&1`;
	`killall -9 proxy >/dev/null 2>&1`;
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
}

sub getProxySetting{
	my $origProxySettings = shift;
	my $key = shift;
	my $subkey = shift;
	
	$result = getPlistObject($origProxySettings, $key, $subkey);
	
	return $result->description->UTF8String();
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
		echo("currentGUID=.$currentGUID");
		my $userDefinedName = getPlistObject($plist, 
										"NetworkServices", 
										$currentGUID,
										"Interface",
										"UserDefinedName");
		if($userDefinedName and $$userDefinedName){
			$userDefinedName = $userDefinedName->description()->UTF8String();
			echo("userDefinedName=$userDefinedName");
			if($userDefinedName eq $endpointName){
				$guid = $currentGUID;
				echo("Found the guid we want, guid=$guid");
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
			$proxyElem->setObject_forKey_($origPrefs->{"ProxyAutoConfigEnable"}, 
											"ProxyAutoConfigEnable");
		}else{
			$proxyElem->setObject_forKey_("0", "ProxyAutoConfigEnable");
		}
	}else{
		$proxyElem->removeObjectForKey_("ProxyAutoConfigURLString");
		$proxyElem->removeObjectForKey_("ProxyAutoConfigEnable");
	}
	
	# For a manual proxy, was HTTP enabled for a proxy setting?
	if($origPrefs->{"HTTPEnable"} eq 1){
		$proxyElem->setObject_forKey_($origPrefs->{"HTTPEnable"}, 
										"HTTPEnable");
	}
	
	# reset whether proxies are enabled in general or not
	$proxyElem->setObject_forKey_($origPrefs->{"AppleProxyConfigurationSelected"}, 
									"AppleProxyConfigurationSelected");
									
	# renable PAC autodiscovery on the network (WPAD) if that was on before
	$proxyElem->setObject_forKey_($origPrefs->{"ProxyAutoDiscoveryEnable"}, 
									"ProxyAutoDiscoveryEnable");
	
	# write out our changed plist file
	echo("Writing out reverted Safari proxy prefs file at $ENV{HOME}/preferences.plist...");
	$saveResults = $plist->writeToFile_atomically_("$ENV{HOME}/preferences.plist", "0");
	if($saveResults ne 1){ # 1 = success, 0 = failure
		echo("Unable to save reverted Safari proxy settings");
		return;
	}
	
	# prompt the user using sudo now so we can move this prefs file over
	$copyResults = system("sudo cp \"$ENV{HOME}/preferences.plist\" \"$PREFS_PATH\"");
	if($copyResults ne 0){
		echo("Unable to copy reverted Safari proxy settings over");
		`rm -f $ENV{HOME}/preferences.plist >/dev/null 2>&1`;
		return;
	}
	
	#clean up
	`rm -f $ENV{HOME}/preferences.plist >/dev/null 2>&1`;
	
	echo("Safari proxy prefs file saved.");
}

sub printDebugValues{
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
			
	# get the old values from the defaults system
	
}

sub removeDefaults{
	echo("Removing Dojo Offline's default settings...");
}

sub deleteFiles{
	echo("Removing Dojo Offline files...");
	
	`rm -fr "/Applications/Dojo Offline Toolkit" >/dev/null 2>&1`;
	
	# TODO: Remove application support directory for DOT as well
}

sub reportUninstalled{
	$beSilent = false;
	
	# is this a silent uninstall?
	if(scalar(@ARGV) > 0){
		for($i = 0; $i < scalar(@ARGV); $i++){
			if(@ARGV[$i] eq "--silent"){
				echo("Silent uninstall");
				$beSilent = true;
			}
		}
	}
	
	$msg = "Dojo Offline uninstalled.\n" .
			"Please restart Firefox and Safari for changes to take effect.";
	print $msg."\n";	
	echo($msg);
	
	if($beSilent eq false){
		# Use a little bit of AppleScript magic to display a dialog telling the user
		# that uninstallation is done -- 'osascript' is a command line utility to execute
		# AppleScript. Here's the AppleScript without all the extraneous command line stuff:
		#
		# tell application "Finder"
		#	activate
		#	display dialog "$msg" buttons ["OK"]
		# end tell
		#
		$runMe = "osascript " .
					"-e 'tell application \"Finder\"' " . 
		 				"-e 'activate' " .
						"-e 'display dialog \"$msg\" buttons [\"OK\"]' " .
					"-e 'end tell' " .
					">/dev/null 2>&1";
		system($runMe);
	}
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

sub echo{
	my $msg = shift;
	$msg = "Uninstall: " . $msg;
	`echo "$msg" >> ~/dot_install.log 2>&1`;
	#print "$msg\n";
}
