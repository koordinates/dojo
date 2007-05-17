<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
        "http://www.w3.org/TR/html4/strict.dtd">

<html>
	<head>
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
				// turn of page parsing from the widget system to keep nodes "cold"
				parseWidgets: false,
				allowQueryConfig: true,
				isDebug: true
			};
		</script>
<?
	$leadingChaff = 50;
	$trailingChaff = 50;
	$maxIter = 50; // 150;
	$minIter = 10; // 10;
?>
		<!-- yui prereq -->
		<!-- why does Jack have to make it such a PITA to get his code? -->
		<script type="text/javascript" src="query_lib/jquery.js"></script>
		<script type="text/javascript" src="query_lib/yui.js"></script>
		<script type="text/javascript" src="query_lib/yui-ext.js"></script>
		<script type="text/javascript" src="../dojo.js"></script>
		<!--
		<script type="text/javascript" src="query.js"></script>
		-->
		<script>
			dojo.require("dojo.query");
			dojo.require("dojo.lang.array");
			dojo.require("dojo.lang.func");
			dojo.require("dojo.Deferred");
			dojo.require("dojo.widget.FilteringTable");
			dojo.require("dojo.widget.ProgressBar");
			dojo.require("dojo.lfx.extras");
			dojo.require("dojo.debug.console");
		</script>
		<script type="text/javascript">
			dojo.addOnLoad(function(){
				dojo.debug("wildcard dojo-* is rational: ",
					dojo.query('.dojo-*').length == 
					<?= ($leadingChaff+$trailingChaff) ?>);

				// from Jack Slockum's DomQuery test suite
				var tests = [
					{ selector: 'div span span',
						correct: 55, iter: <?=$maxIter?>, step: 25 },

					{ selector: 'span span div',
						correct: 6, iter: <?=$maxIter?>, step: 25 },

					{ selector: '#test-data2 span span div',
						correct: 6, iter: <?=$maxIter?>, step: 25 },

					{ selector: 'h4',
						correct: <?= ($leadingChaff+$trailingChaff)*3 ?>, 
						iter: <?=$minIter?>, step: 25 },

					{ selector: 'h4.thinger',
						correct: <?= ($leadingChaff+$trailingChaff) ?>, 
						iter: <?=$minIter?>, step: 25 },

					{ selector: '.thinger',
						correct: <?= ($leadingChaff+$trailingChaff) ?>, 
						iter: <?=$minIter?>, step: 25 },

					{ selector: '.thinger2',
						correct: <?= ($leadingChaff+$trailingChaff) ?>, 
						iter: <?=$minIter?>, step: 25 },

					{ selector: '#test-data',
						correct: 1, iter: <?=$maxIter?>, step: 25 },

					{ selector: 'div#test-data',
						correct: 1, iter: <?=$maxIter?>, step: 25 },

					{ selector: 'span#test-data',
						correct: 0, iter: <?=$maxIter?>, step: 25 },

					{ selector: '#test-data span',
					 	correct: 149, iter: <?=$maxIter?>, step: 10 },

					{ selector: '#test-data pre code',
						correct: 2, iter: <?=$maxIter?>, step: 25 },

					{ selector: '#test-data pre > code',
						correct: 1, iter: <?=$minIter?>, step: 25 },

					{ selector: '#test-data pre code span',
						correct: 148, iter: <?=$minIter?>, step: 10 },

					{ selector: '#test-data pre > code > span',
						correct: 98, iter: <?=$minIter?>, step: 5 },

					{ selector: '#test-data span.hl-code',
						correct: 46, iter: <?=$maxIter?>, step: 5 },

					{ selector: '#test-data pre.highlighted > code',
						correct: 1, iter: <?=$maxIter?>, step: 10 },

					{ selector: '#test-data span:first-child',
						correct: 3, iter: <?=$maxIter?>, step: 3 },

					{ selector: '#test-data span:last-child',
						correct: 3, iter: <?=$maxIter?>, step: 3 },

					{ selector: '#test-data span:empty',
						correct: 1, iter: <?=$maxIter?>, step: 3 },

					{ selector: '#test-data span:first',
						correct: 1, iter: <?=$maxIter?>, step: 25 },

					{ selector: '#test-data span:last',
						correct: 1, iter: <?=$maxIter?>, step: 25 },

					{ selector: '#test-data span.hl-code, #test-data span.hl-brackets',
						correct: 61, iter: <?=$maxIter?>, step: 3 },

					{ selector: '#test-data span:nth-child(2)',
						correct:2, iter: <?=$maxIter?>, step: 2 },

					{ selector: '#test-data span:nth-child(3)',
						correct:2, iter: <?=$maxIter?>, step: 10 },

					{ selector: '#test-data span:nth-child(0n+3)',
						correct:2, iter: <?=$maxIter?>, step: 10 },

					{ selector: '#test-data span:nth-child(even)',
						correct: 74, iter: <?=$minIter?>, step: 10 },

					{ selector: '#test-data span:nth-child(2n)',
						correct:74, iter: <?=$minIter?>, step: 1 } ,

					{ selector: '#test-data span:nth-child(odd)',
						correct: 75, iter: <?=$minIter?>, step: 10 },

					{ selector: '#test-data span:nth-child(2n+1)',
						correct:75, iter: <?=$minIter?>, step: 2 },

					{ selector: '#test-data span:contains(new)',
						correct: 3, iter: <?=$maxIter?>, step: 3 },

					{ selector: '#test-data span:not(span.hl-code)',
						correct: 103, iter: <?=$minIter?>, step: 2 },

					{ selector: '#test-data :first-child',
						correct: 6, iter: <?=$maxIter?>, step: 3 },

					{ selector: '#test-data span.hl-default',
						correct: 13, iter: <?=$maxIter?>, step: 3 },

					{ selector: '#test-data span:not(:first-child)',
						correct: 146, iter: <?=$maxIter?>, step: 3 },


					{ selector: "#test-data2 div:last-child",
						correct: 3, iter: <?=$maxIter?>, step: 3 },

					{ selector: "#test-data2 code#inner1 code#inner2",
						correct: 1, iter: <?=$maxIter?>, step: 3 },

					{ selector: '#test-data span.hl-default:not(:first-child)',
						correct: 13, iter: <?=$maxIter?>, step: 3 } ,

					{ selector: '#test-data span[title]',
						correct: 11, iter: <?=$maxIter?>, step: 3 },

					{ selector: '#test-data span[title=east]',
						correct: 4, iter: <?=$maxIter?>, step: 3 },

					{ selector: '#test-data span[title="east"]',
						correct: 4, iter: <?=$maxIter?>, step: 3 },

					// both other systems support the @ syntax
					{ selector: '#test-data span[@title="east"]',
						correct: 4, iter: <?=$maxIter?>, step: 3 },

					{ selector: '#test-data span[title!=east]',
						correct: 145, iter: <?=$maxIter?>, step: 3 },

					{ selector: '#test-data span[title^=min]',
						correct:2, iter: <?=$maxIter?>, step: 3 },

					{ selector: '#test-data span[title$=er]',
						correct:2, iter: <?=$maxIter?>, step: 3 },

					{ selector: '#test-data span[title*=in]',
						correct:2, iter: <?=$maxIter?>, step: 3 } //,

					/*
					{ selector: '#test-data/pre/code/span',
						correct: 147, iter: <?=$maxIter?>, step: 3 },

					{ selector: '#test-data/pre[@class=highlighted]/code',
						correct:2, iter: <?=$maxIter?>, step: 3 }
					*/
				];

				var table = dojo.widget.createWidget("FilteringTable", 
													{
														widgetId: "profileOutputTable",
														multiple: false,
														maxSortable: 1,
														maxSelect: 0
													}, 
													dojo.byId("profileOutputTable"));

				var progress = dojo.widget.createWidget("ProgressBar", {}, 
													dojo.byId("progress"));
				var testFuncArr = [];
				var rowSet = {};

				var check = function(name, test, matches, dname){
					if(matches.length != test.correct){
						var row = rowSet[test.selector];
						row[dname] = "<i style='color: red; text-decoration: line-through;'>"+row[dname]+"</i>";
						dojo.debug("BROKEN:", name, ":", test.selector),
						dojo.debug("expected:", test.correct, "got:", matches.length);
						/*
						*/
					}
				};

				/*
				var showWinners = function(){
					// highlight the winners, giving folks a "draw"
					for(var x in rowSet){
						test = rowSet[x];
						dojo.debug(test.dojo, test.yui_ext, test.jquery);
						// rowSet[test.selector];
					}
				}
				*/

				var runners = [
					[ "jQuery", "jquery", jQuery, "find" ],
					[ "YUI.ext", "yui_ext", Ext.DomQuery, "select" ],
					[ "Dojo", "dojo", dojo, "query" ]
				];

				var idx = 0;

				var runIter = 0;
				var nextTick = function(){
					progress.setProgressValue(runIter++);
				}

				dojo.lang.forEach(tests, function(test){
					var s = new String(test.selector);
					var tdata = {
						selector: s,
						iter: test.iter,
						dojo: 0,
						yui_ext: 0,
						jquery: 0,
						idx: ++idx
					};
					rowSet[s] = tdata;
					table.store.addData(tdata, s);

					testFuncArr.push(function(){					
						dojo.lang.forEach(runners, function(r){
							table.store.update(tdata, r[1], "...");
							tdata[r[1]] = 0;
						});
					});
				});

				dojo.lang.forEach(runners, function(r){
					dojo.lang.forEach(tests, function(test){
						// the final "toString()" here is to pacify jQuery.
						// It's got some b0rken type detection code in its
						// find() method.
						var s = new String(test.selector).toString();
						var tdata = rowSet[s];
						var major = parseInt(test.iter/test.step);
						var minor = test.iter % test.step;

						for(var i=0; i<major; i++){
							testFuncArr.push(function(){					
								for(var x=0; x<test.step; x++){
									var tic = new Date();
									r[2][r[3]](s);
									tdata[r[1]] += (new Date())-tic;
								}
							});
						}
						if(0 < minor){
							testFuncArr.push(function(){					
								for(var x=0; x<minor; x++){
									var tic = new Date();
									r[2][r[3]](s);
									tdata[r[1]] += (new Date())-tic;
								}
							});
						}
						testFuncArr.push(function(){					
							check(r[0], test, r[2][r[3]](s), r[1]);
							table.store.update(tdata, r[1], tdata[r[1]]);
						});
					});
				});
				progress.setMaxProgressValue(testFuncArr.length-1);

				var onEnd = function(){
					dojo.lfx.fadeWipeOut(progress.domNode).play(100);
				}
				dojo.lang.delayThese(testFuncArr, nextTick, 10, onEnd);
			});
		</script>
	</head>
	<body>
		<div id="progress"></div>
		<h5>
			<!-- span is to test selector correctness -->
			<span>
				Note: times are aggregate across test runs for at toolkit and
				listed in milliseconds.
			</span>
		</h5>
		<button onclick="dojo.debug(dojo.widget.byId('profileOutputTable').domNode.parentNode.innerHTML);">dump results</button>
		<div>
			<table id="profileOutputTable" widgetId="profileOutputTable"
				cellpadding="2" cellspacing="0" border="0" style="margin-bottom:24px;">
				<thead>
					<tr>
						<th field="idx" dataType="Number" sort="asc" align="right">#</th>
						<th field="selector" dataType="String" style="text-align: left;">Test</th>
						<th field="iter" dataType="Number" align="right">Iterations</th>
						<th field="dojo" dataType="html" align="right">Dojo</th>
						<th field="yui_ext" dataType="html" align="right">YUI.ext</th>
						<th field="jquery" dataType="html" align="right">JQuery 1.1</th>
					</tr>
				</thead>
				<tbody>
					
				</tbody>
			</table>
		</div>
		<div id="dojoDebug"></div>
<? 
	function generateChaff($iters){
		for($i=0;$i<$iters;$i++){ ?>
			<h4 class="thinger dojo-Thinger">The standard Lorem Ipsum passage, used since the 1500s</h4>
			<p>
			"Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
			eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
			ad minim veniam, ..
			</p>

			<h4>Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC</h4>

			<p class="blah thinger2 blahblah">
			"Sed ut perspiciatis unde omnis iste natus error sit voluptatem
			accusantium doloremque laudantium,...
			</p>

			<h4>1914 translation by H. Rackham</h4>

			<!-- <pre></pre> -->
			<p>
			"But I must explain to you how all this mistaken idea of denouncing
			pleasure and praising pain was born and I will give you a complete
			account of the system, ...
			<p>
		<? } 
	} // end generateChaff
	// $widgetName = "dojo-TundraButton";
?>
	<div id="test-data" style="position: absolute; width: 1px; height: 1px; top: 0px; left: 0px; overflow: hidden;">
<? generateChaff($leadingChaff); ?>
			<pre class=" highlighted"><code><span><!-- it's empty! --></span><span class="hl-reserved">var </span><span class="hl-identifier">dlg</span><span class="hl-default"> = </span><span class="hl-reserved">new </span><span class="hl-identifier">blah</span><span class="hl-default">.</span><span class="hl-identifier">ext</span><span class="hl-default">.</span><span class="hl-identifier">LayoutDialog</span><span class="hl-brackets">(</span><span class="hl-identifier">config</span><span class="hl-code">.</span><span class="hl-identifier">id</span><span class="hl-code"> || </span><span class="hl-identifier">blah</span><span class="hl-code">.</span><span class="hl-identifier">util</span><span class="hl-code">.</span><span class="hl-identifier">Dom</span><span class="hl-code">.</span><span class="hl-identifier">generateId</span><span class="hl-brackets">()</span><span class="hl-code">, </span><span class="hl-brackets">{
				</span><span title="autoCreate" class="hl-identifier">autoCreate</span><span class="hl-code"> : </span><span class="hl-reserved">true</span><span class="hl-code">,
				</span><span title="minWidth" class="hl-identifier">minWidth</span><span class="hl-code">:</span><span class="hl-number">400</span><span class="hl-code">,
				</span><span title="minHeight" class="hl-identifier">minHeight</span><span class="hl-code">:</span><span class="hl-number">300</span><span class="hl-code">,
				</span>
				<span title="syncHeightBeforeShow" class="hl-identifier">syncHeightBeforeShow</span><span class="hl-code">: </span><span class="hl-reserved">true</span><span class="hl-code">,
				</span><span title="shadow" class="hl-identifier">shadow</span><span class="hl-code">:</span><span class="hl-reserved">true</span><span class="hl-code">,
				</span><span title="fixedcenter" class="hl-identifier">fixedcenter</span><span class="hl-code">: </span><span class="hl-reserved">true</span><span class="hl-code">,
				</span><span title="center" class="hl-identifier">center</span><span class="hl-code">:</span><span class="hl-brackets">{</span><span class="hl-identifier">autoScroll</span><span class="hl-code">:</span><span class="hl-reserved">false</span><span class="hl-brackets">}</span><span class="hl-code">,
				</span><span title="east"  class="hl-identifier">east</span><span class="hl-code">:</span><span class="hl-brackets">{</span><span class="hl-identifier">split</span><span class="hl-code">:</span><span class="hl-reserved">true</span><span class="hl-code">,</span><span class="hl-identifier">initialSize</span><span class="hl-code">:</span><span class="hl-number">150</span><span class="hl-code">,</span><span class="hl-identifier">minSize</span><span class="hl-code">:</span><span class="hl-number">150</span><span class="hl-code">,</span><span class="hl-identifier">maxSize</span><span class="hl-code">:</span><span class="hl-number">250</span><span class="hl-brackets">}
			})</span><span class="hl-default">;
			</span><span class="hl-identifier">dlg</span><span class="hl-default">.</span><span class="hl-identifier">setTitle</span><span class="hl-brackets">(</span><span class="hl-quotes">'</span><span class="hl-string">Choose an Image</span><span class="hl-quotes">'</span><span class="hl-brackets">)</span><span class="hl-default">;
			</span><span class="hl-identifier">dlg</span><span class="hl-default">.</span><span class="hl-identifier">getEl</span><span class="hl-brackets">()</span><span class="hl-default" id="fooblah">.</span><span class="hl-identifier">addClass</span><span class="hl-brackets">(</span><span class="hl-quotes">'</span><span class="hl-string">ychooser-dlg</span><span class="hl-quotes">'</span><span class="hl-brackets">)</span><span class="hl-default">;</span></code></pre><br />
			<pre class="highlighted"><span><code><span class="hl-reserved">var </span><span class="hl-identifier">animated</span><span class="hl-default"> = </span><span class="hl-reserved">new </span><span class="hl-identifier">blah</span><span class="hl-default">.</span><span class="hl-identifier">ext</span><span class="hl-default">.</span><span class="hl-identifier">Resizable</span><span class="hl-brackets">(</span><span class="hl-quotes">'</span><span class="hl-string">animated</span><span class="hl-quotes">'</span><span class="hl-code">, </span><span class="hl-brackets">{
			    </span><span title="east" class="hl-identifier">width</span><span class="hl-code">: </span><span class="hl-number">200</span><span class="hl-code">,
			    </span><span title="east" class="hl-identifier">height</span><span class="hl-code">: </span><span class="hl-number">100</span><span class="hl-code">,
			    </span><span title="east" class="hl-identifier">minWidth</span><span class="hl-code">:</span><span class="hl-number">100</span><span class="hl-code">,
			    </span><span class="hl-identifier">minHeight</span><span class="hl-code">:</span><span class="hl-number">50</span><span class="hl-code">,
			    </span><span class="hl-identifier">animate</span><span class="hl-code">:</span><span class="hl-reserved">true</span><span class="hl-code">,
			    </span><span class="hl-identifier">easing</span><span class="hl-code">: </span><span class="hl-identifier">YAHOO</span><span class="hl-code">.</span><span class="hl-identifier">util</span><span class="hl-code">.</span><span class="hl-identifier">Easing</span><span class="hl-code">.</span><span class="hl-identifier">backIn</span><span class="hl-code">,
			    </span><span class="hl-identifier">duration</span><span class="hl-code">:</span><span class="hl-number">.6
			</span><span class="hl-brackets">})</span><span class="hl-default">;</span></code></span></pre>
<? generateChaff($trailingChaff);  ?>
	</div>
	<div id="test-data2">
		<span>
			<span>
				<div></div>
				<div></div>
				<div>
					<span>
						<span>
							<div></div>
							<div>
							<span>
								<span>
									<code id="inner1"><code id="inner2"></code></code>
									<div></div>
								</span>
							</span>
						</span>
					</span>
				</div>
			</span>
		</span>
	</div>
	<!-- from jQuery's test page -->
	<!--
	<div class="dialog scene" id="scene1">
		<h3>ACT I, SCENE III. A room in the palace.</h3>
		<div class="dialog">
			<div class="direction">Enter CELIA and ROSALIND</div>
		</div>

		<div id="speech1" class="character">CELIA</div>

		<div class="dialog">
			<div id="scene1.3.1">Why, cousin! why, Rosalind! Cupid have mercy! not a word?</div>
		</div>

		<div id="speech2" class="character">ROSALIND</div>

		<div class="dialog">
			<div id="scene1.3.2">Not one to throw at a dog.</div>
		</div>

		<div id="speech3" class="character">CELIA</div>
		<div class="dialog">
			<div id="scene1.3.3">No, thy words are too precious to be cast away upon</div>
		</div>
	</div>
	-->
	</body>
</html>
