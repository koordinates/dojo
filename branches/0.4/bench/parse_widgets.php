<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
        "http://www.w3.org/TR/html4/strict.dtd">

<html>
	<head>
		<title>PARSE - Dojo Widget Instantiation Test</title>
		<script type="text/javascript" src="../dojo.js"></script>
		<script type="text/javascript">
			dojo.require("dojo.widget.*");
			<?
				$count  		= (array_key_exists('count', $_GET)   ? $_GET['count'] : 100);
				$className  	= (array_key_exists('class', $_GET)   ? $_GET['class'] : 'Button');
				
				echo 	"dojo.require('dojo.widget.$className');";
				echo	"var count = $count;";
				echo	"var className = '$className';";
			?>

			// start the timer right before the parser is loaded
			dojo.hostenv.modulesLoadedListeners.unshift(function(){
				// start the timer
				t0 = new Date().getTime();
			});
			// this should end the timer right AFTER the parser finishes
			dojo.addOnLoad(
				function(){
					var t1 = new Date().getTime();
					dojo.byId("results").innerHTML = "It took " + (t1 - t0) + " msec to parse (and create) " + count + " " + className + " instances.";
				}
			);
			logMessage = window.alert;
		</script>

		<style type="text/css">
			
			@import "../themes/tundra/tundra.css";

			#widgetContainer {
				border:1px solid black;
				width:100%;
			}

			#results {
				color:darkred;
			}

		</style>
	</head>
	<body class=tundra>
	<?
		echo	"<h2>Currently Parsing $count $className instances</h2>";
		echo 	"Pass <code>?count=<i><b>100</b></i></code> in the query string to change the number of widgets.<br>";
		echo 	"Pass <code>?class=<i><b>Button</b></i></code> in the query string to change the widget class.";
	?>
	<h3 id="results"></h3>
	<div id="widgetContainer" class='box'>
	<?
		for($i=1; $i <= $count; $i++){
			echo "<div dojoType='$className'>$className $i </div>";
		}
	?>
	</div><br>
	</body>
</html>
