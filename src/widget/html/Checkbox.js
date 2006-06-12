dojo.provide("dojo.widget.html.Checkbox");

dojo.require("dojo.widget.*");
dojo.require("dojo.event");
dojo.require("dojo.html");

// FIXME: the input doesn't get taken out of the tab list (i think)
// FIXME: the image doesn't get into the tab list (needs to steal the tabindex value from the input)

dojo.widget.defineWidget(
	"dojo.widget.html.Checkbox",
	dojo.widget.HtmlWidget,
	{
		widgetType: "Checkbox",
	
		_testImg: null,
	
		_events: [
			"onclick",
			"onfocus",
			"onblur",
			"onselect",
			"onchange",
			"ondblclick",
			"onmousedown",
			"onmouseup",
			"onmouseover",
			"onmousemove",
			"onmouseout",
			"onkeypress",
			"onkeydown",
			"onkeyup"
		],
	
		srcOn: dojo.uri.dojoUri('src/widget/templates/check_on.gif'),
		srcOff: dojo.uri.dojoUri('src/widget/templates/check_off.gif'),
		disabled: "enabled",
	
		fillInTemplate: function(){
	
			// FIXME: if images are disabled, we DON'T want to swap out the element
			// we can use the usual 'load image to check' trick
			// i don't know what image we can check yet, so we'll skip this for now...
	
			// this._testImg = document.createElement("img");
			// document.body.appendChild(this._testImg);
			// this._testImg.src = "spacer.gif?cachebust=" + new Date().valueOf();
			// dojo.connect(this._testImg, 'onload', this, 'onImagesLoaded');
	
			this.onImagesLoaded();
		},
	
		onImagesLoaded: function(){
	
			// FIXME: if we actually check for loading images, remove the thing here
			// document.body.removeChild(this._testImg);
	
			// 'hide' the checkbox
			this.domNode.style.position = "absolute";
			this.domNode.style.left = "-9000px";
	
			// create a replacement image
			this.imgNode = document.createElement("img");
			dojo.html.addClass(this.imgNode, "dojoHtmlCheckbox");
			this.updateImgSrc();
			dojo.event.connect(this.imgNode, ((dojo.render.html.ie) ? 'onmouseup' : 'onclick'), this, 'onClick');
			dojo.event.connect(this.domNode, 'onchange', this, 'onChange');
			this.domNode.parentNode.insertBefore(this.imgNode, this.domNode.nextSibling)
	
			// real ugly - make sure the image has all the events that the checkbox did
			for(var i=0; i<this._events.length; i++){
				if(this.domNode[this._events[i]]){
					dojo.event.connect(	this.imgNode, this._events[i], 
										this.domNode[this._events[i]]);
				}
			}
		},
	
		onClick: function(){
			if(this.disabled == "enabled"){
				this.domNode.checked = !this.domNode.checked ? true : false;
				this.updateImgSrc();
			}
		},
	
		onChange: function(){
			if(this.disabled == "enabled"){
				this.updateImgSrc();
			}
		},
	
		updateImgSrc: function(){
	
			this.imgNode.src = this.domNode.checked ? this.srcOn : this.srcOff;
		}
	}
);

