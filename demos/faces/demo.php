<?php

	require_once "resources/lib.php";

	// get a list of faces, they are forced to be something.jpg (not .jpeg):
	$dh = opendir('./images/');
	while (false !== ($filename = readdir($dh))) {
		if($filename{0} !== "."){
	    	$files[] = substr($filename, 0, strlen($filename) - 4);
		}
	}
	
?><!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
	"http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>

	<!-- demo styles, and dynamic styles inline: -->
	<link rel="stylesheet" href="demo.css">

	<style type="text/css"><?php 
		foreach($files as $file){
			// print out each file as a background image with a match className
			print "\n\t\t." . $file . " div { background-image:url(images/". $file .".jpg); }";
		}
	?></style>
	
	<!-- load dojo, and requirements: -->
	<script type="text/javascript">
		// use PHP to create a JavaScript Array of people:
		var people = [<?php 
				$out = "";
				foreach($files as $file){
					$out .= '"' . $file . '",';
				}
				echo substr($out, 0, -1); // trailing comma
			?>];
	</script>
</head>
<body>
	<div id="header">
		<div id="nav" class="content">
			<ul id="menu">
				<li><a href="../">Back to Demos</a></li>
			</ul>
		</div>
	</div>

	<div id="subheader">
		<div class="content">
			<h1 id="intro">Create O' Dev</h1>
			<p>Make your own <em>custom</em> JavaScript developer! Just Click, and Flip, and Save!</p>
		</div>
	</div>

	<div id="container">
		<div class="content">
			
			<div id="userinfo">
				<div id="savedName"><p>Pick a face and save it!</p>
					<h2 id="currentName">Unknown</h2>
				</div>
			</div>
	
			<div id="faceContainer">
				<div class="container">
					<div id="flipper">
						<div><div id="hair"></div></div>
						<div><div id="eyes"></div></div>
						<div><div id="mouth"></div></div>
					</div>
					<div id="photoShot"></div>
				</div>
			</div>

			<!-- the list of thumbnails, generated by PHP -->
			<div id="thumbnails"><?php thumbnails(); ?></div>

			<div id="controls">
				<button class="invisible" id="setupSwf">Setup SWF</button>
				<button class="invisible" id="addPic">Add your picture</button>

				<button id="saveAs">Save to Hall of Shame</button><br>
				
				<p>
				<span class="cb"><input type="checkbox" id="random" name="random"> <label for="random">Rotate randomly</label></span>
				</p>
			</div>

		</div>
	</div>
	
	<div id="footer">
		<div class="content">
			&copy <a href="http://dojofoundation.org">The Dojo Foundation</a>, 2004-2009	
		</div>

		<script src="../../dojo/dojo.js"></script>
		<script src="src.js"></script>

	</div>	
</body>
</html><?php

	function thumbnails(){
		
		$files = array();
		$str = "";
		$dir = opendir('./cache/');
		
		while (false !== ($filename = readdir($dir))) {
			if($filename{0} !== "."){
		    	$files[] = substr($filename, 0, strlen($filename) - 4);
			}
		}

		// generate a list of "last names" from the images
		$clans = array();
		foreach($files as $file){
			$clan = getClanName($file);
			if(empty($clans[$clan])){ $clans[$clan] = array(); }
			$clans[$clan][] = $file;
		}
		
		// put each thumbnail into an UL by clan name
		foreach($clans as $clan => $data){
			print "<div id='" . $clan . "' class='clan'>";
			print "<h2><a href='#" . $clan . "'>" . $clan ."</a></h2>";
			print "<ul class='" . $clan ."'>";
			foreach($data as $file){
				print "\n\t\t<li class='thumbnail'><a href='cache/" . 
					$file . ".jpg' title='". $file . "' class='imageThumb'>" .
					"<img src='cache/." . $file . "_thumb.jpg'>" .
					"</a></li>";
			}
			print "</ul>";
			print "</div>";
			
		}
		
	}
