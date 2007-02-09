<?
	$buildScriptsDir = "/Users/jrbsilver/svn/dojo/branches/0.4/buildscripts";
	$depList = isset($_POST['depList']) ? $_POST['depList'] : null;
	$provideList = isset($_POST['provideList']) ? $_POST['provideList'] : '';
	$version = isset($_POST['version']) ? $_POST['version'] : '0.0.0dev';
	$xdDojoUrl = isset($_POST['xdDojoUrl']) ? $_POST['xdDojoUrl'] : '';

	if(!isset($depList)){
?>
		<html>
			Please specify a comma-separated list of files.
		</html>
<?
	}else{
		header("Content-Type: application/x-javascript");
		header("Content-disposition: attachment; filename=dojo.js");
		
		$dojoContents = `/usr/bin/java -jar $buildScriptsDir/lib/custom_rhino.jar $buildScriptsDir/makeDojoJsWeb.js $depList $provideList $version $xdDojoUrl`;

		print($dojoContents);
	}
?>
