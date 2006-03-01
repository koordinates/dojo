dojo.provide("dojo.flash");

dojo.require("dojo.string.*");
dojo.require("dojo.uri.*");

/** 
 		------------
		Introduction
		------------

		dojo.flash has four goals: 
			* Easily find out if Flash is installed on the system, and if so, what
				version
			* Easily embed Flash files into the page
			* Fast, reliable Flash/JavaScript communication
			* Automatically install Flash if it is not currently on the system,
				or if a higher version is needed
			
		Dojo.flash provides easy objects for interacting with the Flash plugin. 
		These object provides methods to determine the current version of the Flash
		plugin (dojo.flash.info); execute Flash instance methods 
		independent of the Flash version
		being used (dojo.flash.comm); write out the necessary markup to 
		dynamically insert a Flash object into the page (dojo.flash.Embed); and 
		do dynamic installation and upgrading of the current Flash plugin in 
		use (dojo.flash.Install).
		
		The following sections below cover each major area of functionality and
		how to use it.
		

		----------------------------------
		Flash Embedding (dojo.flash.Embed)
		----------------------------------
		
		Using dojo.flash.Embed is easy. Simply include the dojo.js Javascript file, 
		then use a small amount of Javascript on your page to embed your Flash movie. 
		Here is an example showing the minimum amount of code needed to embed a 
		Flash movie:

		<script type="text/javascript" src="dojo.js"></script>
				
		<div id="flashcontent">
		  This text is replaced by the Flash movie.
		</div>
		
		<script type="text/javascript">
			 dojo.require("dojo.flash");
			 var fo = new dojo.flash.Embed({
																			swf: "movie.swf",
			 														  	id: "mymovie",
			 																width: "200",
			 																height: "100",
			 																version: "7.0.0",
			 																bgcolor: "#336699"
			 															});
		   fo.write("flashcontent");
		</script>

		Here is a breakdown of what the code does:
		
		<div id="flashcontent">[...]</div>

		Prepare an HTML element that will hold our Flash movie. The content 
		placed in the 'holder' element will be replaced by the Flash content, 
		so users with the Flash plugin installed will never see the content 
		inside this element. This feature has the added bonus of letting 
		search engines index your alternate content.

		var fo = new dojo.flash.Embed({
																		swf: "movie.swf",
		 														  	id: "mymovie",
		 																width: "200",
		 																height: "100",
		 																version: "7.0.0",
		 																bgcolor: "#336699"
		 															});
		
		Create a new dojo.flash.Embed object and pass in the required parameters
		as an object, using any of the following named parameters:

    * swf - The file path and name to your swf file.
    * id - The ID of your object or embed tag. The embed tag will also have 
			this value set as it's name attribute for files that take advantage of 
			swliveconnect.
    * width - The width of your Flash movie.
    * height - The height of your Flash movie.
    * version - The required player version for your Flash content. This must 
			be a string in the format of 'majorVersion.minorVersion.revision'. 
			An example would be: "6.0.65".
    * background color - This is the hex value of the background color of your 
			Flash movie.

	Optional parameters are:
	
	    * useExpressInstall - If you would like to upgrade users using the 
				ExpressInstall feature, use 'true' for this value.
	    * quality - The quality you wish your Flash movie to play at. If no 
				quality is specified, the default is "high".
	    * xiRedirectUrl - If you would like to redirect users who complete the 
				ExpressInstall upgrade, you can specify an alternate URL here
	    * redirectUrl - If you wish to redirect users who don't have the correct 
				plugin version, use this parameter and they will be redirected.
			* visible - Whether the Flash object is visible. Default is true.
 
		fo.write("flashcontent");

		Tell the dojo.flash.Embed object to write the Flash content to the page 
		(if the correct version of the plugin is installed on the user's 
		system) by replacing the content inside the specified HTML element.
		
		dojo.flash.Embed can also be controlled to bypass Flash detection
		and simply write the movie to the page using the dojoDetectFlash
		djConfig variable:
				
				<script type="text/javascript">
					var djConfig = { dojoDetectFlash: false };
				</script>

		dojo.flash.Embed also provides several methods to easily interact with
		the Flash object after it is on the page:
			get() - Returns a reference to the Flash object itself, suitable for
							JavaScript scripting.
			setVisible(visible) - Makes the Flash object visible or invisible.
			center() - Centers the Flash object on the page.
			
			
		----------------------------
		Flash Info (dojo.flash.info)
		----------------------------
		
		The dojo.flash.info object provides basic information on the Flash
		plugin on this system, and exposes the following attributes:
		
		dojo.flash.info.capable - true or false on whether this platform
		is Flash capable or not.
		dojo.flash.info.major,
		dojo.flash.info.minor,
		dojo.flash.info.rev - The major, minor, and revisions of the 
			plugin. For example, if the
			plugin is 8r22, then the major version is 8, the minor version is 0,
			and the revision is 22. These are Numbers, not Strings.
		dojo.flash.info.commVersion - The major version number for how our Flash 
			and JavaScript communicate. For full details see the section 
			below on dojo.flash.comm for Flash/JavaScript communication.
			This can currently be the following values:
			6 - We use a combination of the Flash plugin methods, such as SetVariable
			and TCallLabel, along with fscommands, to do communication.
			8 - We use the ExternalInterface API. 
			-1 - For some reason neither method is supported, and no communication
			is possible. 
			
		dojo.flash.info has the following methods:
		
		dojo.flash.info.versionIsValid(reqMajorVer, reqMinorVer, reqVer) -
			Detects if we have the required major, minor, and revision Flash
			numbers or above installed on this platform. Returns true or false.
		dojo.flash.info.getVersion() - The full version string, such as "8.0r22".
			-1 is returned if this platform is not Flash enabled.


		------------------------------------------------
		Flash/JavaScript Communication (dojo.flash.comm)
		------------------------------------------------
		
		Robust, performant, reliable 
		JavaScript/Flash communication is harder than most realize when they
		delve into the topic, especially if you want it
		to work on Internet Explorer, Firefox, and Safari, and to be able to
		push around hundreds of K of information quickly. Dojo.flash makes it
		possible to support these platforms; you have to jump through a few
		hoops to get its capabilites, but if you are a library writer 
		who wants to bring Flash's storage or streaming sockets ability into
		DHTML in a fast and cross browser way, for example, then dojo.flash.comm 
		is perfect for you.
  
		To use dojo.flash.com, you must first wait until Flash is finished loading 
		and initializing before you attempt communication. 
		To know when Flash is finished use dojo.event.connect:
		
		dojo.event.connect(dojo.flash, "loaded", myInstance, "myCallback");
		
		Then, while the page is still loading provide the file name
		and the major version of Flash that will be used for Flash/JavaScript
		communication (see "Flash Communication" below for information on the 
		different kinds of Flash/JavaScript communication supported and how they 
		depend on the version of Flash installed):
		
		dojo.flash.setSwf({flash6: "src/storage/storage_flash6.swf",
											 flash8: "src/storage/storage_flash8.swf"});
		
		This will cause dojo.flash to pick the best way of communicating
		between Flash and JavaScript based on the platform.
		
		If no SWF files are specified, then Flash is not initialized.
		
		Your Flash must use DojoExternalInterface to expose Flash methods and
		to call JavaScript; see "Flash Communication" below for details.
		
		setSwf can take an optional 'visible' attribute to control whether
		the Flash object is visible or not on the page; the default is visible:
		
		dojo.flash.setSwf({flash6: "src/storage/storage_flash6.swf",
											 flash8: "src/storage/storage_flash8.swf",
											 visible: false});
		
		Once finished, you can communicate with Flash methods that were exposed:
		
		var results = dojo.flash.comm.sayHello("Some Message");
		
		Only string values are currently supported for both arguments and
		for return results. Everything will be cast to a string on both
		the JavaScript and Flash sides.
		
		dojo.flash allows Flash/JavaScript communication in 
		a way that can pass large amounts of data back and forth reliably and
		very fast. The dojo.flash
		framework encapsulates the specific way in which this communication occurs,
		presenting a common interface to JavaScript irrespective of the underlying
		Flash version.
		
		There are currently three major ways to do Flash/JavaScript communication
		in the Flash community:
		
		1) Flash 6+ - Uses Flash methods, such as SetVariable and TCallLabel,
		and the fscommand handler to do communication. Strengths: Very fast,
		mature, and can send extremely large amounts of data; can do
		synchronous method calls. Problems: Does not work on Safari; works on 
		Firefox/Mac OS X only if Flash 8 plugin is installed; cryptic to work with.
		
		2) Flash 8+ - Uses ExternalInterface, which provides a way for Flash
		methods to register themselves for callbacks from JavaScript, and a way
		for Flash to call JavaScript. Strengths: Works on Safari; elegant to
		work with; can do synchronous method calls. Problems: Extremely buggy 
		(fails if there are new lines in the data, for example); performance
		degrades drastically in O(n^2) time as data grows; locks up the browser while
		it is communicating; does not work in Internet Explorer if Flash
		object is dynamically added to page with document.writeln, DOM methods,
		or innerHTML.
		
		3) Flash 6+ - Uses two seperate Flash applets, one that we 
		create over and over, passing input data into it using the PARAM tag, 
		which then uses a Flash LocalConnection to pass the data to the main Flash
		applet; communication back to Flash is accomplished using a getURL
		call with a javascript protocol handler, such as "javascript:myMethod()".
		Strengths: the most cross browser, cross platform pre-Flash 8 method
		of Flash communication known; works on Safari. Problems: Timing issues;
		clunky and complicated; slow; can only send very small amounts of
		data (several K); all method calls are asynchronous.
		
		dojo.flash.comm uses only the first two methods. This framework
		was created primarily for dojo.storage, which needs to pass very large
		amounts of data synchronously and reliably across the Flash/JavaScript
		boundary. We use the first method, the Flash 6 method, on all platforms
		that support it, while using the Flash 8 ExternalInterface method
		only on Safari with some special code to help correct ExternalInterface's
		bugs.
		
		Since dojo.flash needs to have two versions of the Flash
		file it wants to generate, a Flash 6 and a Flash 8 version to gain
		true cross-browser compatibility, several tools are provided to ease
		development on the Flash side.
		
		In your Flash file, if you want to expose Flash methods that can be
		called, use the DojoExternalInterface class to register methods. This
		class is an exact API clone of the standard ExternalInterface class, but
		can work in Flash 6+ browsers. Under the covers it uses the best
		mechanism to do communication:
		
		class HelloWorld{
			function HelloWorld(){
				// Initialize the DojoExternalInterface class
				DojoExternalInterface.initialize();
				
				// Expose your methods
				DojoExternalInterface.addCallback("sayHello", this, this.sayHello);
				
				// Tell JavaScript that you are ready to have method calls
				DojoExternalInterface.loaded();
				
				// Call some JavaScript
				var resultsReady = function(results){
					trace("Received the following results from JavaScript: " + results);
				}
				DojoExternalInterface.call("someJavaScriptMethod", resultsReady, 
																	 someParameter);
			}
			
			function sayHello(){ ... }
			
			static main(){ ... }
		}
		
		DojoExternalInterface adds two new functions to the ExternalInterface
		API: initialize() and loaded(). initialize() must be called before
		any addCallback() or call() methods are run, and loaded() must be
		called after you are finished adding your callbacks. Calling loaded()
		will fire the dojo.flash.loaded() event, so that JavaScript can know that
		Flash has finished loading and adding its callbacks, and can begin to
		interact with the Flash file.
		
		To generate your SWF files, use the ant task
		"buildFlash". You must have the open source Motion Twin ActionScript 
		compiler (mtasc) installed and in your path to use the "buildFlash"
		ant task; download and install mtasc from http://www.mtasc.org/.
		
		
		
		buildFlash usage:
		
		ant buildFlash -Ddojo.flash.file=../tests/flash/HelloWorld.as
		
		where "dojo.flash.file" is the relative path to your Flash 
		ActionScript file.
		
		This will generate two SWF files, one ending in _flash6.swf and the other
		ending in _flash8.swf in the same directory as your ActionScript method:
		
		HelloWorld_flash6.swf
		HelloWorld_flash8.swf
		
		Initialize dojo.flash with the filename and Flash communication version to
		use during page load; see the documentation for dojo.flash for details:
		
		dojo.flash.setSwf({flash6: "tests/flash/HelloWorld_flash6.swf",
											 flash8: "tests/flash/HelloWorld_flash8.swf"});
		
		Now, your Flash methods can be called from JavaScript as if they are native
		Flash methods, mirrored exactly on the JavaScript side:
		
		dojo.flash.comm.sayHello();
		
		Only Strings are supported being passed back and forth currently.
		
		JavaScript to Flash communication is synchronous; i.e., results are returned
		directly from the method call:
		
		var results = dojo.flash.comm.sayHello();
		
		Flash to JavaScript communication is asynchronous due to limitations in
		the underlying technologies; you must use a results callback to handle
		results returned by JavaScript in your Flash AS files:
		
		var resultsReady = function(results){
			trace("Received the following results from JavaScript: " + results);
		}
		DojoExternalInterface.call("someJavaScriptMethod", resultsReady);
		
		
		
		-------------------
		Notes
		-------------------
		
		If you have both Flash 6 and Flash 8 versions of your file:
		
		dojo.flash.setSwf({flash6: "tests/flash/HelloWorld_flash6.swf",
											 flash8: "tests/flash/HelloWorld_flash8.swf"});
											 
		but want to force the browser to use a certain version of Flash for
		all platforms (for testing, for example), use the djConfig
		variable 'forceFlashComm' with the version number to force:
		
		var djConfig = { forceFlashComm: 6 };
		
		Two values are currently supported, 6 and 8, for the two styles of
		communication described above. Just because you force dojo.flash
		to use a particular communication style is no guarantee that it will
		work; for example, Flash 8 communication doesn't work in Internet
		Explorer due to bugs in Flash, and Flash 6 communication does not work
		in Safari. It is best to let dojo.flash determine the best communication
		mechanism, and to use the value above only for debugging the dojo.flash
		framework itself.
		
		Also note that dojo.flash can currently only work with one Flash object
		on the page; it and the API do not yet support multiple Flash objects on
		the same page.
		
		We use some special tricks to get decent, linear performance
		out of Flash 8's ExternalInterface on Safari; see the blog
		post 
		http://codinginparadise.org/weblog/2006/02/how-to-speed-up-flash-8s.html
		for details.
		
		Your code can detect whether the Flash player is installing or having
		its version revved in two ways. First, if dojo.flash detects that
		Flash installation needs to occur, it sets dojo.flash.info.installing
		to true. Second, you can detect if installation is necessary with the
		following callback:
		
		dojo.event.connect(dojo.flash, "installing", myInstance, "myCallback");
		
		You can use this callback to delay further actions that might need Flash;
		when installation is finished the full page will be refreshed and the
		user will be placed back on your page with Flash installed.
		
		Two utility methods exist if you want to add loading and installing
		listeners without creating dependencies on dojo.event; these are
		'addLoadingListener' and 'addInstallingListener'.
		
		Portions of this code were adopted from Geoff Stearn's 
		FlashObject v1.3c, located at http://blog.deconcept.com/flashobject/.
		
		-------------------
		Todo/Known Issues
		-------------------

		There are several tasks I was not able to do, or did not need to fix
		to get dojo.storage out:		
		
		* When using Flash 8 communication, Flash method calls to JavaScript
		are not working properly; serialization might also be broken for certain
		invalid characters when it is Flash invoking JavaScript methods.
		The Flash side needs to have more sophisticated serialization/
		deserialization mechanisms like JavaScript currently has. The
		test_flash2.html unit tests should also be updated to have much more
		sophisticated Flash to JavaScript unit tests, including large
		amounts of data.
		
		* dojo.flash.Install does not currently support the Express Install
		mechanism for easy upgrading.
		
		* On Internet Explorer, after doing a basic install, the page is
		not refreshed or does not detect that Flash is now available. The way
		to fix this is to create a custom small Flash file that is pointed to
		during installation; when it is finished loading, it does a callback
		that says that Flash installation is complete on IE, and we can proceed
		to initialize the dojo.flash subsystem.
		
		* On Safari, installing Flash for the first time involves you closing 
		the browser. When reopening the browser, you are not taken to the 
		original page; not sure if there is a way to have Safari go back to 
		your original page that was using dojo.flash before installation. Need
		to ask Safari developers.
		
		* Refactoring dojo.flash.Embed to use the code from 
		http://blog.deconcept.com/flashobject/ after getting permission from
		that author to sign a Dojo Contributors Agreement.
		
		* Add a test to the Flash unit tests, where Flash calls a JavaScript
		method, and within that method we then call back to a Flash method; make
		sure this kind of nesting works both ways.
		
		@author Brad Neuberg, bkn3@columbia.edu
		@author Geoff Stearns, http://blog.deconcept.com - Special thanks
		to Geoff for his FlashObject code and documentation!
*/

dojo.flash = {
	flash6_version: null,
	flash8_version: null,
	_visible: true,
	_loadedListeners: new Array(),
	_installingListeners: new Array(),
	
	/** Sets the SWF files and versions we are using. */
	setSwf: function(fileInfo){
		//dojo.debug("setSwf");
		if(fileInfo == null || dojo.lang.isUndefined(fileInfo)){
			return;
		}
		
		if(fileInfo.flash6 != null && !dojo.lang.isUndefined(fileInfo.flash6)){
			this.flash6_version = fileInfo.flash6;
		}
		
		if(fileInfo.flash8 != null && !dojo.lang.isUndefined(fileInfo.flash8)){
			this.flash8_version = fileInfo.flash8;
		}
		
		if(!dojo.lang.isUndefined(fileInfo.visible)){
			this._visible = fileInfo.visible;
		}
		
		// initialize ourselves		
		this._initialize();
	},
	
	/** Returns whether we are using Flash 6 for communication on this platform. */
	useFlash6: function(){
		if(this.flash6_version == null){
			return false;
		}else if (this.flash6_version != null && dojo.flash.info.commVersion == 6){
			// if we have a flash 6 version of this SWF, and this browser supports 
			// communicating using Flash 6 features...
			return true;
		}else{
			return false;
		}
	},
	
	/** Returns whether we are using Flash 8 for communication on this platform. */
	useFlash8: function(){
		if(this.flash8_version == null){
			return false;
		}else if (this.flash8_version != null && dojo.flash.info.commVersion == 8){
			// if we have a flash 8 version of this SWF, and this browser supports
			// communicating using Flash 8 features...
			return true;
		}else{
			return false;
		}
	},
	
	/** Adds a listener to know when Flash is finished loading. 
			Useful if you don't want a dependency on dojo.event. */
	addLoadedListener: function(listener){
		this._loadedListeners.push(listener);
	},

	/** Adds a listener to know if Flash is being installed. 
			Useful if you don't want a dependency on dojo.event. */
	addInstallingListener: function(listener){
		this._installingListeners.push(listener);
	},	
	
	/** 
			A callback when the Flash subsystem is finished loading and can be
			worked with. To be notified when Flash is finished loading, connect
			your callback to this method using the following:
			
			dojo.event.connect(dojo.flash, "loaded", myInstance, "myCallback");
	*/
	loaded: function(){
		//dojo.debug("flash loaded");
		if(dojo.flash._loadedListeners.length > 0){
			for(var i = 0;i < dojo.flash._loadedListeners.length; i++){
				dojo.flash._loadedListeners[i].call(null);
			}
		}
	},
	
	/** 
			A callback to know if Flash is currently being installed or
			having its version revved. To be notified if Flash is installing, connect
			your callback to this method using the following:
			
			dojo.event.connect(dojo.flash, "installing", myInstance, "myCallback");
	*/
	installing: function(){
	 //dojo.debug("installing");
	 if(dojo.flash._installingListeners.length > 0){
			for(var i = 0;i < dojo.flash._installingListeners.length; i++){
				dojo.flash._installingListeners[i].call(null);
			}
		}
	},
	
	/** Initializes dojo.flash. */
	_initialize: function(){
		//dojo.debug("_initialize");
		// initialize the way we do Flash/JavaScript communication
		dojo.flash.comm = new dojo.flash.Communicator("dojoFlashObject", 
																									dojo.flash.info.commVersion);
		
		// write the flash object into the page
		var useSwf;
		var version;
		if(this.useFlash6){
			useSwf = this.flash6_version;
			version = "6.0.0";
			// Firefox/Flash 6 has a bug where LiveConnect is broken; must use
			// Flash 8 plugin on that combo
			if(dojo.render.os.osx == true && dojo.render.html.moz == true){
				version = "8.0.0";
			} 
		}else if(this.useFlash8){
			useSwf = this.flash8_version;
			version = "8.0.0";
		}
		
		dojo.flash.obj = new dojo.flash.Embed({
																						swf: useSwf,
																						id: "dojoFlashObject",
																						visible: this._visible,
																						version: version,
																						useExpressInstall: true
																					});
		dojo.flash.obj.addParam("swLiveConnect", "true");
		dojo.flash.obj.addParam("allowScriptAccess", "sameDomain");
		dojo.flash.obj.write();
	}
};


/** 
		A class that helps us determine whether Flash is available,
		it's major and minor versions, and what Flash version features should
		be used for Flash/JavaScript communication. Parts of this code are
		adapted from Geoff Stearn's FlashObject 1.3c, located at
		http://blog.deconcept.com/flashobject/.
		
		An instance of this class can be accessed on dojo.flash.info.
*/
	/** 
	 		@param reqVer - An optional object with three values,
	 		reqObj.major, reqObj.minor, reqObj.rev, used to test against the
	 		found Flash version; this is used to prevent IE from crashing
	 		in some conditions.
	 		@param xiInstall - An optional value whether we will be trying
			to use ExpressInstall. 
	*/
dojo.flash.Info = function(reqVer, xiInstall){
	this._detectVersion(reqVer, xiInstall);
	this._detectCommunicationVersion();
}

dojo.flash.Info.prototype = {
	/** The full version string, such as "8r22". */
	version: -1,
	
	/** 
			The major, minor, and revisions of the plugin. For example, if the
			plugin is 8r22, then the major version is 8, the minor version is 0,
			and the revision is 22. 
	*/
	major: 0,
	minor: 0,
	rev: 0,
	
	/** Whether this platform has Flash already installed. */
	capable: false,
	
	/** 
			The major version number for how our Flash and JavaScript communicate.
			This can currently be the following values:
			6 - We use a combination of the Flash plugin methods, such as SetVariable
			and TCallLabel, along with fscommands, to do communication.
			8 - We use the ExternalInterface API. 
			-1 - For some reason neither method is supported, and no communication
			is possible. 
	*/
	commVersion: 6,
	
	versionIsValid: function(major, minor, rev){
		if(this.major < major){
			return false;
		}
		
		if(this.major > major){
			return true;
		}
		
		if(this.minor < minor){
			return false;
		}
		
		if(this.minor > minor){
			return true;
		}
		
		if(this.rev < rev){
			return false;
		}
		
		return true;
	},
	
	/** Gets the version as a string, such as 8.0r22. Returns -1
	 *	if this platform does not have Flash.	*/
	getVersion: function(){
		if(this.capable == false){
			return -1;
		}else{
			var versionStr = this.major + "." + this.minor + "r" + this.rev;
			return versionStr;
		}
	},
	
	_detectVersion: function(reqVer, xiInstall){
		this._setVersion(0,0,0);
		if(navigator.plugins && navigator.mimeTypes.length){
			var x = navigator.plugins["Shockwave Flash"];
			if(x && x.description){
				var versionStr = x.description.replace(/([a-z]|[A-Z]|\s)+/, "");
				versionStr = versionStr.replace(/(\s+r|\s+b[0-9]+)/, ".".split("."));
				this._setVersion(versionStr);
				this.capable = true;
			}
		}else{
			try{
				var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
				for (var i=3; axo!=null; i++){
					axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash."+i);
					this._setVersion([i,0,0]);
				}
				this.capable = true;
			}catch(e){}
			if (reqVer && this.major > reqVer.major){
				this.capable = true;
				return; // version is ok, skip minor detection
			}
			
			// this only does the minor rev lookup if the user's major version 
			// is not 6 or we are checking for a specific minor or revision number
			// see http://blog.deconcept.com/2006/01/11/getvariable-setvariable-crash-internet-explorer-flash-6/
			if (!reqVer || ((reqVer.minor != 0 || reqVer.rev != 0) && this.major == reqVer.major) 
					|| this.major != 6 || xiInstall){
				try{
					this._setVersion(axo.GetVariable("$version").split(" ")[1].split(","));
					this.capable = true;
				}catch(e){}
			}
		}
	},
	
	/** 
			Detects the mechanisms that should be used for Flash/JavaScript 
			communication, setting 'commVersion' to either 6 or 8. If the value is
			6, we use Flash Plugin 6+ features, such as GetVariable, TCallLabel,
			and fscommand, to do Flash/JavaScript communication; if the value is
			8, we use the ExternalInterface API for communication. 
	*/
	_detectCommunicationVersion: function(){
		if(this.capable == false){
			this.commVersion = null;
			return;
		}
		
		// detect if the user has over-ridden the default flash version
		if (typeof djConfig["forceFlashComm"] != "undefined" &&
				typeof djConfig["forceFlashComm"] != null){
			this.commVersion = djConfig["forceFlashComm"];
			return;
		}
		
		// we prefer Flash 6 features over Flash 8, because they are much faster
		// and much less buggy
		
		// at this point, we don't have a flash file to detect features on,
		// so we need to instead look at the browser environment we are in
		if(dojo.render.html.safari == true || dojo.render.html.opera == true){
			this.commVersion = 8;
		}else{
			this.commVersion = 6;
		}
	},
	
	_setVersion: function(arrVersion){
		this.major = parseInt(arrVersion[0]) || 0;
		this.minor = parseInt(arrVersion[1]) || 0;
		this.rev = parseInt(arrVersion[2]) || 0;
	}
};

/** 
 		A class that is used to write out the Flash object into the page;
		get a reference to the Flash object in a cross-browser way;
		make the Flash object visible or invisible; and center the
		Flash object on the page.
*/
dojo.flash.Embed = function(parameters){
	if(!document.createElement || !document.getElementById){
		return;
	}
	
	// make sure we have required attributes
	if(dojo.lang.isUndefined(parameters.swf)
		 || dojo.lang.isUndefined(parameters.id)
		 || dojo.lang.isUndefined(parameters.version)){
		dojo.raise("dojo.flash.Embed requires an SWF file, an ID, and a version string");
		return;
	}
	
	this.skipDetect = false;
	if(!dojo.lang.isUndefined(djConfig["dojoDetectFlash"]) &&
			djConfig["dojoDetectFlash"] != null){
		this.skipDetect = djConfig["dojoDetectFlash"];	 
	}
	this.params = new Object();
	this.variables = new Object();
	this.attributes = new Array();
	this.useExpressInstall = parameters.useExpressInstall;

	if(!dojo.lang.isUndefined(parameters.swf)){
		// tell Flash where we are located, useful for Flash files that 
		// want to load Dojo resources or their own relative to the Dojo
		// package
		var dojoPath = djConfig.baseRelativePath;
		dojoPath = "?baseRelativePath=" + escape(dojoPath);
		this.setAttribute('swf', parameters.swf + dojoPath);
	}
	this.visible = true;
	if(!dojo.lang.isUndefined(parameters.visible)){
		this.visible = parameters.visible;
	}
	if(!dojo.lang.isUndefined(parameters.id)){
		this.id = parameters.id;
		this.setAttribute('id', parameters.id);
	}
	if(!dojo.lang.isUndefined(parameters.width)){
		this.setAttribute('width', parameters.width);
	}else{
		// default width needed for Flash system messages
		this.setAttribute('width', 215);
	}
	if(!dojo.lang.isUndefined(parameters.height)){
		this.setAttribute('height', parameters.height);
	}else{
		// default height needed for Flash system messages
		this.setAttribute('height', 138);
	}
	if(!dojo.lang.isUndefined(parameters.version)){
		this.setAttribute('version', parameters.version.split("."));
	}
	dojo.flash.info = new dojo.flash.Info(this.getAttribute('version'), 
																				parameters.useExpressInstall);
	if(!dojo.lang.isUndefined(parameters.bgcolor)){
		this.addParam('bgcolor', parameters.bgcolor);
	}else{
		// IE requires a bgcolor attribute on the OBJECT tag or it does not work
		this.addParam('bgcolor', "#FFFFFF");
	}
	
	var q = parameters.quality ? parameters.quality : 'high';
	this.addParam('quality', q);
  
	var xir = (parameters.xiRedirectUrl) ? parameters.xiRedirectUrl : window.location;
	this.setAttribute('xiRedirectUrl', xir);
	this.setAttribute('redirectUrl', '');
  
	if(!dojo.lang.isUndefined(parameters.redirectUrl)){
		this.setAttribute('redirectUrl', parameters.redirectUrl);
	}
}

dojo.flash.Embed.prototype = {
	setAttribute: function(name, value){
		this.attributes[name] = value;
	},
	
	getAttribute: function(name){
		return this.attributes[name];
	},
	
	addParam: function(name, value){
		this.params[name] = value;
	},
	
	getParams: function(){
		return this.params;
	},
	
	addVariable: function(name, value){
		this.variables[name] = value;
	},
	
	getVariable: function(name){
		return this.variables[name];
	},
	
	getVariables: function(){
		return this.variables;
	},
	
	createParamTag: function(n, v){
		var p = document.createElement('param');
		p.setAttribute('name', n);
		p.setAttribute('value', v);
		return p;
	},
	
	getVariablePairs: function(){
		var variablePairs = new Array();
		var key;
		var variables = this.getVariables();
		for(key in variables){
			variablePairs.push(key +"="+ variables[key]);
		}
		return variablePairs;
	},
	
	getFlashHTML: function() {
		var flashNode = "";
		
		// determine our container div's styling
		var containerStyle = new dojo.string.Builder();
		containerStyle.append("width: " + this.getAttribute('width') + "px; ");
		containerStyle.append("height: " + this.getAttribute('height') + "px; ");
		if(this.visible == false){
			containerStyle.append("position: absolute; ");
			containerStyle.append("z-index: 100; ");
			containerStyle.append("top: -1000px; ");
			containerStyle.append("left: -1000px; ");
		}
		containerStyle = containerStyle.toString();
		
		// write out our container div
		flashNode += '<div id="' + this.getAttribute('id') + 'Container" style="' 
									+ containerStyle + '">';
		
		// build up our Flash object or embed tag
		//if (navigator.plugins && navigator.mimeTypes 
		//		&& navigator.mimeTypes.length){ // netscape plugin architecture
			if (this.getAttribute("doExpressInstall")){
				this.addVariable("MMplayerType", "PlugIn");
			}
			flashNode += '<embed type="application/x-shockwave-flash"'
									+ 'src="' + this.getAttribute('swf') 
									+ '" width="' + this.getAttribute('width') 
									+ '" height="'+ this.getAttribute('height') + '"';
			flashNode += ' id="' + this.getAttribute('id') 
									+ '" name="' + this.getAttribute('id') + '" ';
			var params = this.getParams();
			for(var key in params){ 
				flashNode += [key] +'="'+ params[key] +'" '; 
			}
			var pairs = this.getVariablePairs().join("&");
			if(pairs.length > 0){ 
				flashNode += 'flashvars="'+ pairs +'"'; 
			}
			flashNode += '/>';
			
		// Internet Explorer has bugs doing Flash/JavaScript communication if
		// we write out an OBJECT tag to the DOM or using document.write; have to
		// write out EMBED tag above. -- Brad Neuberg, bkn3@columbia.edu
		/*}else{ // PC IE
			if(this.getAttribute("doExpressInstall")){
				this.addVariable("MMplayerType", "ActiveX");
			}
			flashNode += '<object id="' + this.getAttribute('id') + '"'
									+ ' classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"'
									+ ' width="' + this.getAttribute('width')  + '"'
									+ ' height="' + this.getAttribute('height') +'">';
			flashNode += '<param name="movie" value="' 
									 + this.getAttribute('swf') + '" />';
			var params = this.getParams();
			for(var key in params){
				flashNode += '<param name="'+ key +'" value="'+ params[key] +'" />';
			}
			var pairs = this.getVariablePairs().join("&");
			if(pairs.length > 0){
				flashNode += '<param name="flashvars" value="'+ pairs +'" />';
			}
			flashNode += "</object>";
		}*/
		
		// close the container div
		flashNode += '</div>';
		
		return flashNode;
	},
  
	write: function(elementId){
		if(this.useExpressInstall) {
			// check to see if we need to do an express install
			if (dojo.flash.info.versionIsValid(6, 0, 65) 
					&& !dojo.flash.info.versionIsValid(this.getAttribute('version'))){
				this.setAttribute('doExpressInstall', true);
				this.addVariable("MMredirectURL", escape(this.getAttribute('xiRedirectUrl')));
				document.title = document.title.slice(0, 47) + " - Flash Player Installation";
				this.addVariable("MMdoctitle", document.title);
			}
		}else{
			this.setAttribute('doExpressInstall', false);
		}
		if(this.skipDetect || this.getAttribute('doExpressInstall') 
			 || dojo.flash.info.versionIsValid(this.getAttribute('version'))){
			// figure out how to write out the Flash object; if a container
			// element was passed into write(), use that; otherwise, just create
			// a div and add it to the document
			if(dojo.lang.isUndefined(elementId)){
				// do we even have a document.body yet?
				if(!dojo.lang.isUndefined(document.body) && document.body != null){
					var n = document.createElement("div");
					n.innerHTML = this.getFlashHTML();
					document.body.appendChild(n);
				}else{
					// otherwise just write it out the document as it is loading
					document.writeln(this.getFlashHTML());
				}
			}else{
				var n = (typeof elementId == 'string') ? document.getElementById(elementId) : elementId;
				n.innerHTML = this.getFlashHTML();
			}
			
		}else{
			if(this.getAttribute('redirectUrl') != ""){
				document.location.replace(this.getAttribute('redirectUrl'));
			}
		}
	},
	
	/** Gets the Flash object DOM node. */
	get: function(){
		return (dojo.render.html.ie) ? window[this.id] : document[this.id];
	},
	
	/** Sets the visibility of this Flash object. */
	setVisible: function(visible){
		var container = dojo.byId(this.id + "Container");
		if(visible == true){
			container.style.visibility = "visible";
		}else{
			container.style.visibility = "hidden";
		}
	},
	
	/** Centers the flash applet on the page. */
	center: function(){
		// FIXME: replace this with Dojo's centering code rather than our own
		// We want to center the applet vertically and horizontally
		var elementWidth = this.getAttribute('width');
		var elementHeight = this.getAttribute('height');
    
		// get the browser width and height; the code below
		// works in IE and Firefox in compatibility, non-strict
		// mode
		var browserWidth = document.body.clientWidth;
		var browserHeight = document.body.clientHeight;
    
		// in Firefox if we are in standards compliant mode
		// (with a strict doctype), then the browser width
		// and height have to be computed from the root level
		// HTML element not the BODY element
		if(!dojo.render.html.ie && document.compatMode == "CSS1Compat"){
			browserWidth = document.body.parentNode.clientWidth;
			browserHeight = document.body.parentNode.clientHeight;
		}else if(dojo.render.html.ie && document.compatMode == "CSS1Compat"){
			// IE 6 in standards compliant mode has to be calculated
			// differently
			browserWidth = document.documentElement.clientWidth;
			browserHeight = document.documentElement.clientHeight;
		}
    
		// get where we are scrolled to in the document
		// the code below works in FireFox
		var scrolledByWidth = window.scrollX;
		var scrolledByHeight = window.scrollY;
		// compute these values differently for IE;
		// IE has two possibilities; it is either in standards
		// compatibility mode or it is not
		if(typeof scrolledByWidth == "undefined"){
			if(document.compatMode == "CSS1Compat"){ // standards mode
				scrolledByWidth = document.documentElement.scrollLeft;
				scrolledByHeight = document.documentElement.scrollTop;
			}else{ // Pre IE6 non-standards mode
				scrolledByWidth = document.body.scrollLeft;
				scrolledByHeight = document.body.scrollTop;
			}
		}

		// compute the centered position    
		var x = scrolledByWidth + (browserWidth - elementWidth) / 2;
		var y = scrolledByHeight + (browserHeight - elementHeight) / 2; 
    
		// set the centered position
		var container = dojo.byId(this.id + "Container");
		container.style.top = y + "px";
		container.style.left = x + "px";
	}
};


/** 
		A class that is used to communicate between Flash and JavaScript in 
		a way that can pass large amounts of data back and forth reliably,
		very fast, and with synchronous method calls. This class encapsulates the 
		specific way in which this communication occurs,
		presenting a common interface to JavaScript irrespective of the underlying
		Flash version.
*/
dojo.flash.Communicator = function(id, commVersion){
	this.id = id;
	
	if(commVersion == 6){
		this._writeFlash6();
	}else if(commVersion == 8){
		this._writeFlash8();
	}
}

dojo.flash.Communicator.prototype = {
	_writeFlash6: function(){
		// global function needed for Flash 6 callback;
		// we write it out as a script tag because the VBScript hook for IE
		// callbacks does not work properly if this function is evalled() from
		// within the Dojo system
		document.writeln('<script language="JavaScript">');
		document.writeln('  function ' + this.id + '_DoFSCommand(command, args){ ');
		document.writeln('    dojo.flash.comm._handleFSCommand(command, args); ');
		document.writeln('}');
		document.writeln('</script>');
		
		// hook for Internet Explorer to receive FSCommands from Flash
		if(dojo.render.html.ie){
			document.writeln('<SCRIPT LANGUAGE=VBScript\> ');
			document.writeln('on error resume next ');
			document.writeln('Sub ' + this.id + '_FSCommand(ByVal command, ByVal args)');
			document.writeln(' call ' + this.id + '_DoFSCommand(command, args)');
			document.writeln('end sub');
			document.writeln('</SCRIPT\> ');
		}
	},
	
	_writeFlash8: function(){
		// nothing needs to be written out for Flash 8 communication; 
		// happens automatically
	},
	
	/** Flash 6 communication. */
	
	/** Handles fscommand's from Flash to JavaScript. Flash 6 communication. */
	_handleFSCommand: function(command, args){
		//dojo.debug("_handleFSCommand, command="+command+", args="+args);
		if(command == "addCallback"){ // add Flash method for JavaScript callback
			this._fscommandAddCallback(command, args);
		}else if (command == "call"){ // Flash to JavaScript method call
			this._fscommandCall(command, args);
		}
	},
	
	/** Handles registering a callable Flash function. Flash 6 communication. */
	_fscommandAddCallback: function(command, args){
		var functionName = args;
			
		// do a trick, where we link this function name to our wrapper
		// function, _call, that does the actual JavaScript to Flash call
		var callFunc = function(){
			return dojo.flash.comm._call(functionName, arguments);
		};			
		dojo.flash.comm[functionName] = callFunc;
		
		// indicate that the call was successful
		dojo.flash.obj.get().SetVariable("_succeeded", true);
	},
	
	/** Handles Flash calling a JavaScript function. Flash 6 communication. */
	_fscommandCall: function(command, args){
		var plugin = dojo.flash.obj.get();
		var functionName = args;
		
		// get the number of arguments to this method call and build them up
		var numArgs = parseInt(plugin.GetVariable("_numArgs"));
		var flashArgs = new Array();
		for(var i = 0; i < numArgs; i++){
			var currentArg = plugin.GetVariable("_" + i);
			flashArgs.push(currentArg);
		}
		
		// get the function instance; we technically support more capabilities
		// than ExternalInterface, which can only call global functions; if
		// the method name has a dot in it, such as "dojo.flash.loaded", we
		// eval it so that the method gets run against an instance
		var runMe;
		if(functionName.indexOf(".") == -1){ // global function
			runMe = window[functionName];
		}else{
			// instance function
			runMe = eval(functionName);
		}
		
		// make the call and get the results
		var results = null;
		if(!dojo.lang.isUndefined(runMe) && runMe != null){
			results = runMe.apply(null, flashArgs);
		}
		
		// return the results to flash
		plugin.SetVariable("_returnResult", results);
	},
	
	/** 
			The actual function that will execute a JavaScript to Flash call; used
			by the Flash 6 communication method. 
	*/
	_call: function(functionName, args){
		// we do JavaScript to Flash method calls by setting a Flash variable
		// "_functionName" with the function name; "_numArgs" with the number
		// of arguments; and "_0", "_1", etc for each numbered argument. Flash
		// reads these, executes the function call, and returns the result
		// in "_returnResult"
		var plugin = dojo.flash.obj.get();
		plugin.SetVariable("_functionName", functionName);
		plugin.SetVariable("_numArgs", args.length);
		for(var i = 0; i < args.length; i++){
			// unlike Flash 8's ExternalInterface, Flash 6 has no problem with
			// any special characters _except_ for the null character \0; double
			// encode this so the Flash side never sees it, but we can get it 
			// back if the value comes back to JavaScript
			var value = args[i];
			value = value.replace(/\0/g, "\\0");
			
			plugin.SetVariable("_" + i, value);
		}
		
		// now tell Flash to execute this method using the Flash Runner
		plugin.TCallLabel("/_flashRunner", "execute");
		
		// get the results
		var results = plugin.GetVariable("_returnResult");
		
		// we double encoded all null characters as //0 because Flash breaks
		// if they are present; turn the //0 back into /0
		results = results.replace(/\\0/g, "\0");
		
		return results;
	},
	
	/** Flash 8 communication. */
	
	/** 
			Registers the existence of a Flash method that we can call with
			JavaScript, using Flash 8's ExternalInterface. 
	*/
	_addExternalInterfaceCallback: function(methodName){
		var wrapperCall = function(){
			// some browsers don't like us changing values in the 'arguments' array, so
			// make a fresh copy of it
			var methodArgs = new Array(arguments.length);
			for(var i = 0; i < arguments.length; i++){
				methodArgs[i] = arguments[i];
			}
			return dojo.flash.comm._execFlash(methodName, methodArgs);
		};
		
		dojo.flash.comm[methodName] = wrapperCall;
	},
	
	/** 
			Encodes our data to get around ExternalInterface bugs.
			Flash 8 communication.
	*/
	_encodeData: function(data){
		// double encode all entity values, or they will be mis-decoded
		// by Flash when returned
		var entityRE = /\&([^;]*)\;/g;
		data = data.replace(entityRE, "&amp;$1;");
		
		// entity encode XML-ish characters, or Flash's broken XML serializer
		// breaks
		data = data.replace(/</g, "&lt;");
		data = data.replace(/>/g, "&gt;");
		
		// transforming \ into \\ doesn't work; just use a custom encoding
		data = data.replace("\\", "&custom_backslash;&custom_backslash;");
		
		data = data.replace(/\n/g, "\\n");
		data = data.replace(/\r/g, "\\r");
		data = data.replace(/\f/g, "\\f");
		data = data.replace(/\0/g, "\\0"); // null character
		data = data.replace(/\'/g, "\\\'");
		data = data.replace(/\"/g, '\\\"');
		
		return data;
	},
	
	/** 
			Decodes our data to get around ExternalInterface bugs.
			Flash 8 communication.
	*/
	_decodeData: function(data){
		if(data == null || typeof data == "undefined"){
			return data;
		}
		
		// certain XMLish characters break Flash's wire serialization for
		// ExternalInterface; these are encoded on the 
		// DojoExternalInterface side into a custom encoding, rather than
		// the standard entity encoding, because otherwise we won't be able to
		// differentiate between our own encoding and any entity characters
		// that are being used in the string itself
		data = data.replace(/\&custom_lt\;/g, "<");
		data = data.replace(/\&custom_gt\;/g, ">");
		
		// Unfortunately, Flash returns us our String with special characters
		// like newlines broken into seperate characters. So if \n represents
		// a new line, Flash returns it as "\" and "n". This means the character
		// is _not_ a newline. This forces us to eval() the string to cause
		// escaped characters to turn into their real special character values.
		data = eval('"' + data + '"');
		
		return data;
	},
	
	/** 
			Sends our method arguments over to Flash in chunks in order to
			have ExternalInterface's performance not be O(n^2).
			Flash 8 communication.
	*/
	_chunkArgumentData: function(value, argIndex){
		var plugin = dojo.flash.obj.get();
		
		// cut up the string into pieces, and push over each piece one
		// at a time
		var numSegments = Math.ceil(value.length / 1024);
		for(var i = 0; i < numSegments; i++){
			var startCut = i * 1024;
			var endCut = i * 1024 + 1024;
			if(i == (numSegments - 1)){
				endCut = i * 1024 + value.length;
			}
			
			var piece = value.substring(startCut, endCut);
			
			// encode each piece seperately, rather than the entire
			// argument data, because ocassionally a special 
			// character, such as an entity like &foobar;, will fall between
			// piece boundaries, and we _don't_ want to encode that value if
			// it falls between boundaries, or else we will end up with incorrect
			// data when we patch the pieces back together on the other side
			piece = this._encodeData(piece);
			
			// directly use the underlying CallFunction method used by
			// ExternalInterface, which is vastly faster for large strings
			// and lets us bypass some Flash serialization bugs
			plugin.CallFunction('<invoke name="chunkArgumentData" '
														+ 'returntype="javascript">'
														+ '<arguments>'
														+ '<string>' + piece + '</string>'
														+ '<number>' + argIndex + '</number>'
														+ '</arguments>'
														+ '</invoke>');
		}
	},
	
	/** 
			Gets our method return data in chunks for better performance.
			Flash 8 communication.
	*/
	_chunkReturnData: function(){
		var plugin = dojo.flash.obj.get();
		
		var numSegments = plugin.getReturnLength();
		var resultsArray = new Array();
		for(var i = 0; i < numSegments; i++){
			// directly use the underlying CallFunction method used by
			// ExternalInterface, which is vastly faster for large strings
			var piece = 
					plugin.CallFunction('<invoke name="chunkReturnData" '
															+ 'returntype="javascript">'
															+ '<arguments>'
															+ '<number>' + i + '</number>'
															+ '</arguments>'
															+ '</invoke>');
															
			// remove any leading or trailing JavaScript delimiters, which surround
			// our String when it comes back from Flash since we bypass Flash's
			// deserialization routines by directly calling CallFunction on the
			// plugin
			if(piece == '""' || piece == "''"){
				piece = "";
			}else{
				piece = piece.substring(1, piece.length-1);
			}
		
			resultsArray.push(piece);
		}
		var results = resultsArray.join("");
		
		return results;
	},
	
	/** 
			Executes a Flash method; called from the JavaScript wrapper proxy we
			create on dojo.flash.comm.
			Flash 8 communication.
	*/
	_execFlash: function(methodName, methodArgs){
		var plugin = dojo.flash.obj.get();
				
		// begin Flash method execution
		plugin.startExec();
		
		// set the number of arguments
		plugin.setNumberArguments(methodArgs.length);
		
		// chunk and send over each argument
		for(var i = 0; i < methodArgs.length; i++){
			this._chunkArgumentData(methodArgs[i], i);
		}
		
		// execute the method
		plugin.exec(methodName);
														
		// get the return result
		var results = this._chunkReturnData();
		
		// decode the results
		results = this._decodeData(results);
		
		// reset everything
		plugin.endExec();
		
		return results;

	}
}

// find out if Flash is installed
dojo.flash.info = new dojo.flash.Info();

// vim:ts=4:noet:tw=0:
