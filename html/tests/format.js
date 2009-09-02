dojo.provide("dojox.html.tests.format");
dojo.require("dojox.html.format");


doh.register("dojox.html.tests.format", 
	[
		{
			name: "Format:  Basic HTML Format test",
			runTest: function(t) {
				// summary: 
				//		Simple test of basic HTML formatting.
				// description:
				//		Simple test of basic HTML formatting.
				var txt = "<div><b>hello</b>this is some text.</div>";
				var expected = 	"<div>\n" +
								"\t<b>\n" +
								"\t\thello\n" +
								"\t</b>\n"+
								"\tthis is some text.\n" +
								"</div>\n";
				var formattedTxt = dojox.html.format.prettyPrint(txt);
				doh.assertEqual(expected, formattedTxt);
			}
		},
		{
			name: "Format:  Basic HTML Format test with three space indent",
			runTest: function(t) {
				// summary: 
				//		Simple test of basic HTML formatting with spaced indenting instead of tab
				// description:
				//		Simple test of basic HTML formatting with spaced indenting instead of tab
				var txt = "<div><b>hello</b>this is some text.</div>";
				var expected = 	"<div>\n" +
								"   <b>\n" +
								"      hello\n" +
								"   </b>\n"+
								"   this is some text.\n" +
								"</div>\n";
				var formattedTxt = dojox.html.format.prettyPrint(txt, 3);
				doh.assertEqual(expected, formattedTxt);
			}
		},
		{
			name: "Format:  Basic HTML Format test with id",
			runTest: function(t) {
				// summary: 
				//		Simple test of basic HTML formatting with an id attr set.
				// description:
				//		Simple test of basic HTML formatting with an id attr set.
				var txt = "<div id=\"myID\"><b>hello</b>this is some text.</div>";
				var expected = 	"<div id=\"myID\">\n" +
								"\t<b>\n" +
								"\t\thello\n" +
								"\t</b>\n"+
								"\tthis is some text.\n" +
								"</div>\n";
				var formattedTxt = dojox.html.format.prettyPrint(txt);
				doh.assertEqual(expected, formattedTxt);
			}
		},
		{
			name: "Format:  Basic HTML Format test with style",
			runTest: function(t) {
				// summary: 
				//		Simple test of basic HTML formatting with an id attr set.
				// description:
				//		Simple test of basic HTML formatting with an id attr set.
				var txt = "<div style=\"font-weight: bold;\"><b>hello</b>this is some text.</div>";
				var expected = 	"<div style=\"font-weight: bold;\">\n" +
								"\t<b>\n" +
								"\t\thello\n" +
								"\t</b>\n"+
								"\tthis is some text.\n" +
								"</div>\n";
				var formattedTxt = dojox.html.format.prettyPrint(txt);
				doh.assertEqual(expected, formattedTxt);
			}
		},
		{
			name: "Format:  Basic HTML Format with script test",
			runTest: function(t) {
				// summary: 
				//		Simple test of basic HTML formatting with an embedded script tag.
				// description:
				//		Simple test of basic HTML formatting with an embedded script tag.
				var txt = "<div><b>hello</b>this is some text.<script>var foo=\"bar\";\nif(foo !== \"bar\"){\n alert(\"Should not be here!\");\n}</script></div>";
				var expected = 	"<div>\n" +
								"\t<b>\n" +
								"\t\thello\n" +
								"\t</b>\n"+
								"\tthis is some text.\n" +
								"\t<script>\n"+
								"\t\tvar foo=\"bar\";\n" +
								"\t\tif(foo !== \"bar\"){\n" +
								"\t\t\talert(\"Should not be here!\");\n" +
								"\t\t}\n" +
								"\t</script>\n" +
								"</div>\n";
				var formattedTxt = dojox.html.format.prettyPrint(txt);
				doh.assertEqual(dojo.trim(expected), dojo.trim(formattedTxt));
			}
		},
		{
			name: "Format:  Basic HTML Format with script test and three space indent",
			runTest: function(t) {
				// summary: 
				//		Simple test of basic HTML formatting with an embedded script tag.
				// description:
				//		Simple test of basic HTML formatting with an embedded script tag.
				var txt = "<div><b>hello</b>this is some text.<script>var foo=\"bar\";\nif(foo !== \"bar\"){\n alert(\"Should not be here!\");\n}</script></div>";
				var expected = 	"<div>\n" +
								"   <b>\n" +
								"      hello\n" +
								"   </b>\n"+
								"   this is some text.\n" +
								"   <script>\n"+
								"      var foo=\"bar\";\n" +
								"      if(foo !== \"bar\"){\n" +
								"         alert(\"Should not be here!\");\n" +
								"      }\n" +
								"   </script>\n" +
								"</div>\n";
				var formattedTxt = dojox.html.format.prettyPrint(txt, 3);
				doh.assertEqual(expected, formattedTxt);
			}
		},
		{
			name: "Format:  Basic HTML Format with &lt;pre&gt; tag",
			runTest: function(t) {
				// summary: 
				//		Simple test of basic HTML formatting with an embedded pre tag.
				// description:
				//		Simple test of basic HTML formatting with an embedded pre tag.

				if(!dojo.isIE){
					// IE generates good pre tags, but I think the endline chars differ
					// so direct comparison fails.  When I figure that out, I can enable
					// this test.
					var txt = "<div><pre>hello\nthis is    spaced\nWhee!\n</pre></div>";
					var expected = 	"<div>\n" +
									"\t<pre>\n" +
									"hello\n" +
									"this is    spaced\n" +
									"Whee!\n" +
									"\t</pre>\n"+
									"</div>\n";
					var formattedTxt = dojox.html.format.prettyPrint(txt);
					doh.assertEqual(expected, formattedTxt);
				}
			}
		},
		{
			name: "Format:  Basic HTML Format with &lt;pre&gt; tag and three space indent",
			runTest: function(t) {
				// summary: 
				//		Simple test of basic HTML formatting with an embedded pre tag.
				// description:
				//		Simple test of basic HTML formatting with an embedded pre tag.
				if(!dojo.isIE){
					// IE generates good pre tags, but I think the endline chars differ
					// so direct comparison fails.  When I figure that out, I can enable
					// this test.
					var txt = "<div><pre>hello\nthis is    spaced\nWhee!\n</pre></div>";
					var expected = 	"<div>\n" +
									"   <pre>\n" +
									"hello\n" +
									"this is    spaced\n" +
									"Whee!\n" +
									"   </pre>\n"+
									"</div>\n";
					var formattedTxt = dojox.html.format.prettyPrint(txt, 3);
					doh.assertEqual(expected, formattedTxt);
				}
			}
		},
		{
			name: "Format:  Semi-complex HTML format",
			timeout: 10000,
			runTest: function(t) {
				// summary: 
				//		Simple test of somewhat complex HTML in an external file getting formatted.
				// description:
				//		Simple test of basic HTML formatting with an embedded pre tag.
				if(!dojo.isIE){
					// Still working out minor comparison issues on IE.  Sigh.
					// the output is pretty accurate, just need to fix a few things.
					// Like I think the newlines differ or somesuch.  
					var deferred = new doh.Deferred();

					var args = {
						url: dojo.moduleUrl("dojox.html.tests", "unformatted.html").toString(),
						handleAs: "text",
						preventCache: true
					}
					var ufd = dojo.xhrGet(args);
					ufd.addCallback(function(html){
						html = dojox.html.format.prettyPrint(html, 3);
						var fArgs = {
							url: dojo.moduleUrl("dojox.html.tests", "formatted.html").toString(),
							preventCache: true,
							handleAs: "text"
						}
						var fd = dojo.xhrGet(fArgs);
						fd.addCallback(function(fHtml){
							try{
								doh.assertEqual(fHtml, html);
								deferred.callback(true);
							}catch(e){
								deferred.errback(e);
							}

						});
						fd.addErrback(function(error){
							deferred.errback(error);
						});
					});
					ufd.addErrback(function(err){
						console.log("Boom!");
						deferred.errback(err);
					});
					return deferred;
				}
				return null;
			}
		}
	]
);
