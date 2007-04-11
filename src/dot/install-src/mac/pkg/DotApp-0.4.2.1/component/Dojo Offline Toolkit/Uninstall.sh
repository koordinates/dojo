#!/usr/bin/perl

use Foundation;

echo("Running");

# we can't delete ourselves -- copy the
# uninstall script to a location outside 
# of the Dojo Offline directory, then re-call
# ourself
echo("0 = $0");

stopDojoOffline();
restoreSafariProxySettings();
restoreFirefoxProxySettings();
removeDefaults();
deleteFiles();

echo("Dojo Offline is now uninstalled.");

exit 0;

sub stopDojoOffline{
	echo("Stopping Dojo Offline...");
}

sub restoreSafariProxySettings{
	echo("Restoring Safari's proxy settings to "
			."what they were before Dojo Offline was installed...");
}

sub restoreFirefoxProxySettings{
	echo("Restoring Firefox's proxy settings to "
			."what they were before Dojo Offline was installed...");
}

sub removeDefaults{
	echo("Removing Dojo Offline's default settings...");
}

sub deleteFiles{
	echo("Removing Dojo Offline files...");
}

sub echo{
	my $msg = shift;
	$msg = "Uninstall: " . $msg;
	`echo "$msg" >> /tmp/dot_install.log 2>&1`;
	print "$msg\n";
}
