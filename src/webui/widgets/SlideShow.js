dojo.hostenv.startPackage("dojo.webui.widgets.SlideShow");
dojo.hostenv.startPackage("dojo.webui.widgets.HTMLSlideShow");

dojo.hostenv.loadModule("dojo.event.*");
dojo.hostenv.loadModule("dojo.xml.*");
dojo.hostenv.loadModule("dojo.webui.widgets.Parse");
dojo.hostenv.loadModule("dojo.webui.Widget");
dojo.hostenv.loadModule("dojo.webui.DomWidget");
dojo.hostenv.loadModule("dojo.webui.WidgetManager");
dojo.hostenv.loadModule("dojo.webui.DragAndDrop");
dojo.hostenv.loadModule("dojo.graphics.*");
dojo.hostenv.loadModule("dojo.graphics.htmlEffects");

dojo.webui.widgets.HTMLSlideShow = function(){
	dojo.webui.Widget.call(this);
	dojo.webui.DomWidget.call(this, true);
	dojo.webui.HTMLWidget.call(this);
	this.templatePath = dojo.uri.dojoUri("src/webui/widgets/templates/HTMLSlideShow.html");
	this.templateCssPath = dojo.uri.dojoUri("src/webui/widgets/templates/HTMLSlideShow.css");

	// over-ride some defaults
	this.isContainer = false;
	this.widgetType = "SlideShow";

	// useful properties
	this.imgUrls = [];		// the images we'll go through
	this.imgUrlBase = "";
	this.urlsIdx = 0;		// where in the images we are
	this.delay = 4000; 		// give it 4 seconds
	this.transitionInterval = 2000; // 2 seconds
	this.imgWidth = 800;	// img width
	this.imgHeight = 600;	// img height
	this.background = "img2"; // what's in the bg
	this.foreground = "img1"; // what's in the fg
	this.stopped = false;	// should I stay or should I go?

	// our DOM nodes:
	this.imagesContainer = null;
	this.startStopButton = null;
	this.controlsContainer = null;
	this.img1 = null;
	this.img2 = null;

	this.fillInTemplate = function(){
		dojo.xml.htmlUtil.setOpacity(this.img1, 0.9999);
		dojo.xml.htmlUtil.setOpacity(this.img2, 0.9999);
		with(this.imagesContainer.style){
			width = this.imgWidth+"px";
			height = this.imgHeight+"px";
		}
		with(this.img1.style){
			width = this.imgWidth+"px";
			height = this.imgHeight+"px";
		}
		with(this.img2.style){
			width = this.imgWidth+"px";
			height = this.imgHeight+"px";
		}
		if(this.imgUrls.length>1){
			this.img2.src = this.imgUrlBase+this.imgUrls[this.urlsIdx++];
			this.endTransition();
		}else{
			this.img1.src = this.imgUrlBase+this.imgUrls[this.urlsIdx++];
		}
	}

	this.togglePaused = function(){
		if(this.stopped){
			this.stopped = false;
			this.endTransition();
			this.startStopButton.value= "pause";
		}else{
			this.stopped = true;
			this.startStopButton.value= "play";
		}
	}

	this.backgroundImageLoaded = function(){
		// start fading out the foreground image
		if(this.stopped){ return; }
		// closure magic for callback
		var _this = this; 
		var callback = function(){ _this.endTransition(); };

		// actually start the fadeOut effect
		// NOTE: if we wanted to use other transition types, we'd set them up
		// 		 here as well
		dojo.graphics.htmlEffects.fadeOut(this[this.foreground], 
			this.transitionInterval, callback);
	}

	this.endTransition = function(){
		// move the foreground image to the background 
		with(this[this.background].style){ zIndex = parseInt(zIndex)+1; }
		with(this[this.foreground].style){ zIndex = parseInt(zIndex)-1; }

		// fg/bg book-keeping
		var tmp = this.foreground;
		this.foreground = this.background;
		this.background = tmp;

		// keep on truckin
		this.loadNextImage();
	}

	this.loadNextImage = function(){
		// load a new image in that container, and make sure it informs
		// us when it finishes loading
		dojo.event.kwConnect({
			srcObj: this[this.background],
			srcFunc: "onload",
			adviceObj: this,
			adviceFunc: "backgroundImageLoaded",
			once: true, // make sure we only ever hear about it once
			delay: this.delay
		});
		dojo.xml.htmlUtil.setOpacity(this[this.background], 1.0);
		this[this.background].src = this.imgUrlBase+this.imgUrls[this.urlsIdx++];
		if(this.urlsIdx>(this.imgUrls.length-1)){
			this.urlsIdx = 0;
		}
	}
}
dj_inherits(dojo.webui.widgets.HTMLSlideShow, dojo.webui.DomWidget);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:slideshow");
