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
	this.templatePath = "src/webui/widgets/templates/HTMLSlideShow.html";

	this.widgetType = "SlideShow";
	this.imgUrls = [];
	this.urlsIdx = 0;
	this.delay = 4000; // give it 8 seconds
	this.transitionInterval = 2000; // 2 seconds
	this.imgWidth = 800;
	this.imgHeight = 600;
	this.isContainer = false;
	this.background = "img2";
	this.foreground = "img1";
	this.stopped = false;
	this.zIndex = 0;

	// our DOM nodes:
	this.imagesContainer = null;
	this.startStopButton = null;
	this.controlsContainer = null;
	this.infoContainer = null;
	this.img1 = null;
	this.img2 = null;

	this.toggleStopped = function(){
		if(this.stopped){
			this.stopped = false;
			this.fadeEnded();
			this.startStopButton.value= "stop";
		}else{
			this.stopped = true;
			this.startStopButton.value= "start";
		}
	}

	this.timeoutWrapperName = null;

	this.backgroundImageLoaded = function(){
		// start the timeout
		var _this = this;
		if(!this.timeoutWrapperName){
			this.timeoutWrapperName = dojo.event.nameAnonFunc(function(){
				_this.timeoutEnded();
			}, dj_global);
		}
		setTimeout(this.timeoutWrapperName+"();", this.delay);
	}

	this.timeoutEnded = function(){
		// start fading out the foreground image
		if(this.stopped){ return; }
		var _this = this;
		dojo.graphics.htmlEffects.fadeOut(this[this.foreground], 
			this.transitionInterval, 
			function(){ 
				_this.fadeEnded(); 
			}
		);
	}

	this.fadeEnded = function(){
		// move the foreground image to the background 
		with(this[this.background].style){ zIndex = parseInt(zIndex)+1; }
		with(this[this.foreground].style){ zIndex = parseInt(zIndex)-1; }

		// now that the old fg is in teh bg, tell ourselves as much
		var tmp = this.foreground;
		this.foreground = this.background;
		this.background = tmp;

		// load a new image in that container, and make sure it informs
		// us when it finishes loading
		dojo.event.kwConnect({
			srcObj: this[this.background],
			srcFunc: "onload",
			adviceObj: this,
			adviceFunc: "backgroundImageLoaded",
			once: true // make sure we only ever hear about it once
		});
		dojo.xml.htmlUtil.setOpacity(this[this.background], 0.9999);
		this[this.background].src = this.imgUrls[this.urlsIdx++];
		if(this.urlsIdx>(this.imgUrls.length-1)){
			this.urlsIdx = 0;
		}
	}

	this.fillInTemplate = function(){
		this.imagesContainer.style.width = "px";
			this.imgWidth+"px";
			this.imgHeight+"px";
		if(this.imgUrls.length>1){
			this.img2.src = this.imgUrls[this.urlsIdx++];
			this.fadeEnded();
		}else{
			this.img1.src = this.imgUrls[this.urlsIdx++];
		}
	}

}
dj_inherits(dojo.webui.widgets.HTMLSlideShow, dojo.webui.DomWidget);
dojo.webui.widgets.tags.addParseTreeHandler("dojo:slideshow");
