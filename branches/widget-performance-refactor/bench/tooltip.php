<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
        "http://www.w3.org/TR/html4/strict.dtd">

<title>tooltip test</title>

<style>
	th { background: #ccccff; }
	td { align: left; }
</style>

<script type="text/javascript"> djConfig = { isDebug: true }; </script>
<script type="text/javascript" src="../dojo.js"></script>
<script>
	dojo.require("dojo.event.*");
	dojo.require("dojo.widget.Tooltip");
	dojo.require("dojo.widget.Button");
</script>

<script type="text/javascript">

		oldTime = new Date();
		dojo.addOnLoad(function(){
			var time = new Date().getTime() - oldTime;
			var p = document.createElement("p");
			p.appendChild(document.createTextNode("Widgets loaded in " + time + "ms"));
			document.getElementById("results").appendChild(p);
		});

</script>

<h1>Test of instantiating many tooltips</h1>

<p>
<strong style="color:red">Warning:</strong> these benchmarks will take a number of seconds to run. Other system activity will cause these benchmarks to skew.
</p>

<p>
The results should not be compared between browsers for they are run on different systems,
however results for the same browser are relative to each other.
</p>

<? for($i=0;$i<100;$i++){ ?>
		<span id="span<?=$i?>" class="tt"><?=$i?></span>
		<span dojoType="tooltip" connectId="span<?=$i?>">
			<h3>Tooltip for "<?=$i?>" text</h3>
			<b>
				<span style="color: blue;">rich formatting</span>
				<span style="color: red; font-size: x-large;"><i>!</i></span>
			</b>
			<button dojoType="Button">Hello</button>
		</span>
<? } ?>


<h2>Result</h2>
<div id="results"></div>

<h2>Typical results</h2>
<table border=1>
<thead>
	<tr>
		<th>IE
		<th>Safari
		<th>Gecko (on PC)
		<th>Gecko (on intel mac)
	</tr>
</thead>
<tbody>
	<tr>
		<td>4890
		<td>3242
		<td>3094
		<td>3782
	</tr>
</tbody>
</table>
