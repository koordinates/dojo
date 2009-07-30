dojo.provide("dojo.robotx-face");
dojo.required("dojo.robotx");

// Loads an external app into an iframe and points dojo.doc to the iframe document, allowing the robot to control it
// To use: set robotURL in djConfig to the URL you want to load
// dojo.require this file

(function(){

	// Have to wait for test page to load before testing

	doh.robot._runsemaphore.lock.push("dojo.robotx.lock");

	var iframe = dojo._getWin().document.getElementById('robotapplication');

	var groupStarted=dojo.connect(doh, '_groupStarted', function(){
		var doc = window.document;
		dojo.disconnect(groupStarted);
		if (!doc.getElementById('robotconsole').childNodes.length) {
			doc.getElementById('robotconsole').parentNode.removeChild(doc.getElementById('robotconsole'));
			iframe.style.height="100%";
		}
		iframe.style.visibility="visible";
	});

	var onIframeLoad=function(){
		doh.robot._updateDocument();
		onIframeLoad = null;
		doh.run();
	};

	doh.robot.iframeLoad=function(){
		if(onIframeLoad){
			onIframeLoad();
		}
		var unloadConnect = dojo.connect(dojo.body(), 'onunload', function(){
			dojo.global = window;
			dojo.doc = window.document;
			dojo.disconnect(unloadConnect);
		});
	};

	dojo.config.debugContainerId = "robotconsole";

	// write the firebug console to a place it will fit
	// plus the iframe

	window.document.write('<div id="robotconsole" style="position:absolute;left:0px;top:75%;width:100%;height:25%;"></div><iframe id="robotapplication" style="visibility:hidden; border:0px none; padding:0px; margin:0px; position:absolute; left:0px; top:0px; width:100%; height:100%; z-index: 1;" src="'+dojo.config.robotURL+'" onload="doh.robot.iframeLoad();" ></iframe>');

	dojo.mixin(doh.robot,{
		_updateDocument: function(){
			dojo.setContext(iframe.contentWindow, iframe.contentWindow.document);
			var win = dojo.global;
			if(win.dojo){
				// allow the tests to subscribe to topics published by the iframe
				dojo._topics = win.dojo._topics;
			} 
		},

		initRobot: function(/*String*/ url){
			// summary:
			//		Opens the application at the specified URL for testing, redirecting dojo to point to the application environment instead of the test environment.
			//
			// url:
			//		URL to open. Any of the test's dojo.doc calls (e.g. dojo.byId()), and any dijit.registry calls (e.g. dijit.byId()) will point to elements and widgets inside this application.
			//

			iframe = dojo._getWin().document.getElementById('robotapplication');
			iframe.src = url;
			dojo.addOnLoad(function(){
				dojo.style(window.document.body,{
					width: '100%',
					height: '100%'
				});
				window.document.body.appendChild(iframe);
				var base=window.document.createElement('base');
				base.href=url;
				window.document.getElementsByTagName("head")[0].appendChild(base);
			});
		},

		waitForPageToLoad: function(/*Function*/ submitActions){
			// summary:
			// 		Notifies DOH that the doh.robot is about to make a page change in the application it is driving,
			//		returning a doh.Deferred object the user should return in their runTest function as part of a DOH test.
			//
			// description:
			// 		Notifies DOH that the doh.robot is about to make a page change in the application it is driving,
			//		returning a doh.Deferred object the user should return in their runTest function as part of a DOH test.
			//		Example:
			//			runTest:function(){
			//				return waitForPageLoad(function(){ doh.robot.keyPress(dojo.keys.ENTER, 500); });
			//			}
			//
			// submitActions:
			//		The doh.robot will execute the actions the test passes into the submitActions argument (like clicking the submit button),
			//		expecting these actions to create a page change (like a form submit).
			//		After these actions execute and the resulting page loads, the next test will start.
			//

			var d = new doh.Deferred();
			// create iframe event handler to track submit progress
			onIframeLoad = function(){
				onIframeLoad = null;

				// set dojo.doc on every page change to point to the iframe doc so the robot works

				doh.robot._updateDocument();
				d.callback(true);
			};
			submitActions();
			return d;
		}
	});
})();
