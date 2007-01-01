<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
        "http://www.w3.org/TR/html4/strict.dtd">

<html>
	<head>
		<!--
			The Problem:

				Generating a parse tree for the Dojo widget creation system is
				too time consuming. The system today visits every node looking
				for a particular attribute (and potentially uses other methods
				as well to determine if the node is "of interest"). From there,
				it builds a data structure, potentially visiting every
				attribute. We need a faster, lighter-weight way to handle this
				part of the lifecycle.

			Goals:
				
				1.) benchmark todays first-pass parser on a complex node structure
				2.) 
			
			Requirements:

				1.) query system SHOULD be synchronous
				2.) 
		-->
		<title>test of various synchronous page searching methods</title>
		<style type="text/css">
			body {
				font-family: Lucida Grande, Verdana, Helvetica, Arial, sans-serif;
				font-size:	12px; 
				letter-spacing:	0.045em;
				line-height:	1.55em;
			}
		</style>
		<script type="text/javascript">
			djConfig = {
				// turn of page parsing from the widget system so we can
				// isolate first-pass parser performance
				parseWidgets: false,
				isDebug: true
			};
		</script>
		<script type="text/javascript" src="../dojo.js"></script>
		<script>
			dojo.require("dojo.event.*");
			dojo.require("dojo.html.*");
			dojo.require("dojo.xml.Parse");
			dojo.require("dojo.profile");
		</script>
		<script type="text/javascript">
			dojo.addOnLoad(function(){
				dojo.profile.start("dojo.html.getElementsByClass");
				dojo.html.getElementsByClass("dojo-item");
				dojo.profile.end("dojo.html.getElementsByClass");

				var parser = new dojo.xml.Parse();
				dojo.profile.start("dojo.xml.Parse");
				var frag = parser.parseElement(dojo.body(), null, true);
				dojo.profile.end("dojo.xml.Parse");

				dojo.profile.start("dojo.xml.Parse (warm caches, does not generate data structure)");
				var frag = parser.parseElement(dojo.body(), null, true, null, true);
				dojo.profile.end("dojo.xml.Parse (warm caches, does not generate data structure)");

				dojo.profile.dump(true);
			});
		</script>
	</head>
	<body>
		<h1 style="font-size: 40px; line-height: 50px;">This page contains a huge number of nodes, most of which are "chaff".</h1>
		<h3>Here's the relative timings for this page</h3>
		<div id="profileOutputTable"></div>
		<!--
		<h3>And some comparison data</h3>
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
		-->


<?
	$containerDepth = 30;
	$leadingChaff = 100;
	$trailingChaff = 100;
	$items = 100;
?>
<? 
	function generateChaff($iters){
		for($i=0;$i<$iters;$i++){ ?>
			<h4>The standard Lorem Ipsum passage, used since the 1500s</h4>


			<p>
			"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
			eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
			ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
			aliquip ex ea commodo consequat. Duis aute irure dolor in
			reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
			pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
			culpa qui officia deserunt mollit anim id est laborum."
			</p>

			<h4>Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC</h4>

			<p>
			"Sed ut perspiciatis unde omnis iste natus error sit voluptatem
			accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
			quae ab illo inventore veritatis et quasi architecto beatae vitae
			dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
			aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
			eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam
			est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci
			velit, sed quia non numquam eius modi tempora incidunt ut labore et
			dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam,
			quis nostrum exercitationem ullam corporis suscipit laboriosam,
			nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure
			reprehenderit qui in ea voluptate velit esse quam nihil molestiae
			consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla
			pariatur?"
			</p>

			<h4>1914 translation by H. Rackham</h4>

			<p>
			"But I must explain to you how all this mistaken idea of denouncing
			pleasure and praising pain was born and I will give you a complete
			account of the system, and expound the actual teachings of the
			great explorer of the truth, the master-builder of human happiness.
			No one rejects, dislikes, or avoids pleasure itself, because it is
			pleasure, but because those who do not know how to pursue pleasure
			rationally encounter consequences that are extremely painful. Nor
			again is there anyone who loves or pursues or desires to obtain
			pain of itself, because it is pain, but because occasionally
			circumstances occur in which toil and pain can procure him some
			great pleasure. To take a trivial example, which of us ever
			undertakes laborious physical exercise, except to obtain some
			advantage from it? But who has any right to find fault with a man
			who chooses to enjoy a pleasure that has no annoying consequences,
			or one who avoids a pain that produces no resultant pleasure?" 
			</p>
		<? } 
	} // end generateChaff
?>
<? generateChaff($leadingChaff); ?>
<hr>
<? for($i=0;$i<$containerDepth;$i++){ ?>
	<table border="1" cellpadding="0" cellspacing="0" width="100%">
	<!--
	<table>
	-->
		<tr>
			<td>
			<br>
			chaff!
			<br>
<? } ?>
<? for($i=0;$i<$items;$i++){ ?>
			<div class="dojo-item">
				<br>
				<span>item <?= $i ?></span>
			</div>
			<br>
<? } ?>
<? for($i=0;$i<$containerDepth;$i++){ ?>
			</td>
		</tr>
	</table>
<? } ?>
<? generateChaff($trailingChaff);  ?>
<? for($i=0;$i<$items;$i++){ ?>
	<div class="dojo-item"><span>item <?= $i ?></span></div>
<? } ?>
	</body>
</html>
