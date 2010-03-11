dojo.provide("dojox.drawing.tools.TextBlock");
dojo.require("dojox.drawing.stencil.Text");

(function(){
	
	var conEdit;
	dojo.addOnLoad(function(){
		//		In order to use VML in IE, it's necessary to remove the
		//		DOCTYPE. But this has the side effect that causes a bug
		//		where contenteditable divs cannot be made dynamically.
		//		The solution is to include one in the main document
		//		that can be appended and removed as necessary:
		//		<div id="conEdit" contenteditable="true"></div>
		//
		conEdit = dojo.byId("conEdit");
		if(!conEdit){
			console.error("A contenteditable div is missing from the main document. See 'dojox.drawing.tools.TextBlock'")
		}else{
			conEdit.parentNode.removeChild(conEdit);
		}
	});
	
	dojox.drawing.tools.TextBlock = dojox.drawing.util.oo.declare(
		// summary:
		//		A tool to create text fields on a canvas.
		// description:
		//		Extends stencil.Text by adding an HTML layer that
		//		can be dragged out to a certain size, and accept
		//		a text entry. Will wrap text to the width of the
		//		html field.
		//		When created programmtically, use 'auto' to shrink
		//		the width to the size of the text. Use line breaks
		//		( \n ) to create new lines.
		//
		// TODO - disable zoom while showing?
		//
		// FIXME:
		//		Handles width: auto, align:middle, etc. but for
		//		display only, edit is out of whack
		//
		dojox.drawing.stencil.Text,
		function(options){
			// summary: constructor
			//
			if(options.data){
				var d = options.data;
				var w = !d.width ? this.style.text.minWidth : d.width=="auto" ? "auto" : Math.max(d.width, this.style.text.minWidth)
				var h = this._lineHeight;
				
				if(d.text && w=="auto"){
					var o = this.measureText(this.cleanText(d.text, false), w);
					w = o.w;
					h = o.h;
				}else{
					//	w = this.style.text.minWidth;
					this._text = "";
				}
				
				this.points = [
					{x:d.x, y:d.y},
					{x:d.x+w, y:d.y},
					{x:d.x+w, y:d.y+h},
					{x:d.x, y:d.y+h}
				];
				
				if(d.showEmpty || d.text){
					this.editMode = true;
					
				
					dojo.disconnect(this._postRenderCon);
					this._postRenderCon = null;
					this.connect(this, "render", this, "onRender", true);
					
					if(d.showEmpty){
						this._text = d.text || "";
						this.edit();
					}else if(d.text && d.editMode){
						this._text = "";
						this.edit();
					}else if(d.text){
						this.render(d.text);
					}
					setTimeout(dojo.hitch(this, function(){
						this.editMode = false;	
					}),100)
					
				}
				
			}else{
				this.connectMouse();
				this._postRenderCon = dojo.connect(this, "render", this, "_onPostRender");
			}
			//console.log("TextBlock:", this.id)
		},
		{
			draws:true,
			baseRender:false,
			type:"dojox.drawing.tools.TextBlock",
			
/*=====
StencilData: {
	// summary:
	//		The data used to create the dojox.gfx Text
	// 	x: Number
	//		Left point x
	// 	y: Number
	//		Top point y
	// 	width: ? Number|String
	//		Optional width of Text. Not required but reccommended.
	//		for auto-sizing, use 'auto'
	// 	height: ? Number
	//		Optional height of Text. If not provided, _lineHeight is used.
	// 	text: String
	//		The string content. If not provided, may auto-delete depending on defaults.
},
=====*/
			
			// selectOnExec: Boolean
			//		Whether the Stencil is selected when the text field
			//		is executed or not	
			selectOnExec:true,
			//
			// showEmpty: Boolean
			//		If true and there is no text in the data, the TextBlock
			//		Is displayed and focused and awaits input.
			showEmpty: false,
			
			onDrag: function(/*EventObject*/obj){
				// summary: See stencil._Base.onDrag
				//
				if(!this.parentNode){
					this.showParent(obj);
				}
				var s = this._startdrag, e = obj.page;
				this._box.left = (s.x < e.x ? s.x : e.x);
				this._box.top = s.y;
				this._box.width = (s.x < e.x ? e.x-s.x : s.x-e.x) + this.style.text.pad;
				
				dojo.style(this.parentNode, this._box.toPx());
			},
			
			onUp: function(/*EventObject*/obj){
				// summary: See stencil._Base.onUp
				//

				if(!this._downOnCanvas){ return; }
				this._downOnCanvas = false;
				
				var c = dojo.connect(this, "render", this, function(){
					dojo.disconnect(c);
					this.onRender(this);	
					
				});
				this.editMode = true;
				this.showParent(obj);
				this.created = true;
				this.createTextField();
				this.connectTextField();
			},
			
			showParent: function(/*EventObject*/obj){
				// summary:
				//		Internal. Builds the parent node for the
				//		contenteditable HTML node.
				//
				if(this.parentNode){ return; }
				var x = obj.pageX || 10;
				var y = obj.pageY || 10;
				this.parentNode = dojo.doc.createElement("div");
				this.parentNode.id = this.id;
				var d = this.style.textMode.create;
				this._box = {
					left:x,
					top:y,
					width:obj.width || 1,
					height:obj.height && obj.height>8 ? obj.height : this._lineHeight,
					border:d.width+"px "+d.style+" "+d.color,
					position:"absolute",
					zIndex:500,
					toPx: function(){
						var o = {};
						for(var nm in this){
							o[nm] = typeof(this[nm])=="number" && nm!="zIndex" ? this[nm] + "px" : this[nm];
						}
						return o;
					}
				};
				
				dojo.style(this.parentNode, this._box);
				
				document.body.appendChild(this.parentNode);
			},
			createTextField: function(/*String*/txt){
				// summary:
				//		Internal. Inserts the contenteditable HTML node
				//		into its parent node, and styles it.
				//
				// style parent
				var d = this.style.textMode.edit;
				this._box.border = d.width+"px "+d.style+" "+d.color;
				this._box.height = "auto";
				this._box.width = Math.max(this._box.width, this.style.text.minWidth*this.mouse.zoom);
				dojo.style(this.parentNode, this._box.toPx());
				// style input
				this.parentNode.appendChild(conEdit);
				dojo.style(conEdit, {
					height: txt ? "auto" : this._lineHeight+"px",
					fontSize:(this.textSize/this.mouse.zoom)+"px",
					fontFamily:this.style.text.family
				});
				// FIXME:
				// In Safari, if the txt ends with '&' it gets stripped
				conEdit.innerHTML = txt || "";
				
				return conEdit; //HTMLNade
			},
			connectTextField: function(){
				// summary:
				//		Internal. Creates the connections to the
				//		contenteditable HTML node.
				//
				if(this._textConnected){ return; } // good ol' IE and its double events
				this._textConnected = true;
				this.mouse.setEventMode("TEXT");
				this.keys.editMode(true);
				var kc1, kc2, kc3, kc4, self = this, _autoSet = false,
					exec = function(){
						dojo.forEach([kc1,kc2,kc3,kc4], function(c){
							dojo.disconnect(c)
						});
						self._textConnected = false;
						self.keys.editMode(false);
						self.mouse.setEventMode();
						self.execText();
					};
					
				kc1 = dojo.connect(conEdit, "keyup", this, function(evt){
					// 	if text is empty, we need a height so the field's height
					//	doesn't collapse
					if(dojo.trim(conEdit.innerHTML) && !_autoSet){
						dojo.style(conEdit, "height", "auto"); _autoSet = true;
					}else if(dojo.trim(conEdit.innerHTML).length<2 && _autoSet){
						dojo.style(conEdit, "height", this._lineHeight+"px"); _autoSet = false;
					}
					
					
					if(evt.keyCode==13 || evt.keyCode==27){
						dojo.stopEvent(evt);
						exec();
					}
				});
				kc2 = dojo.connect(conEdit, "keydown", this, function(evt){
					if(evt.keyCode==13 || evt.keyCode==27){ // TODO: make escape an option
						dojo.stopEvent(evt);
					}
				});
				
				kc3 = dojo.connect(document, "mouseup", this, function(evt){
					// note: _onAnchor means an anchor has been clicked upon
					
					if(!this._onAnchor && evt.target.id != "conEdit"){
						dojo.stopEvent(evt);
						exec();
					}else{
						// wonky stuff happens when you click on the 
						// field when its empty.
						conEdit.blur();
						setTimeout(function(){
							conEdit.focus();
						},200)
					}
				});
				
				this.createAnchors();
				
				kc4 = dojo.connect(this.mouse, "setZoom", this, function(evt){
					exec();
				});
				
				
				conEdit.focus();
				
				this.onDown = function(){};
				this.onDrag = function(){};
				
				setTimeout(dojo.hitch(this, function(){
					// once again for Silverlight:
					conEdit.focus();
					
					// this is a pretty odd chunk of code here.
					// specifcally need to overwrite old onUp
					// however, this still gets called. its
					// not disconnecting.
					this.onUp = function(){
						if(!self._onAnchor && this.parentNode){
							self.disconnectMouse();
							exec();
							self.onUp = function(){}
						}
					}	
				}), 500);
			},
			
			execText: function(){
				// summary:
				//		Internal. Method fired when text is executed,
				//		via mouse-click-off, ESC key or Enter key.
				//
				var d = dojo.marginBox(this.parentNode);
				var w = Math.max(d.w, this.style.text.minWidth);
				
				var txt = this.cleanText(conEdit.innerHTML, true);
				conEdit.innerHTML = "";
				conEdit.blur();
				this.destroyAnchors();
				
				var o = this.measureText(txt, w);
				var sc = this.mouse.scrollOffset();
				var org = this.mouse.origin;
				
				var x = this._box.left + sc.left - org.x;
				var y = this._box.top + sc.top - org.y;
				
				x *= this.mouse.zoom;
				y *= this.mouse.zoom;
				w *= this.mouse.zoom;
				o.h *= this.mouse.zoom;
				
				
				this.points = [
					{x:x, y:y},
					{x:x+w, y:y},
					{x:x+w, y:y+o.h},
					{x:x, y:y+o.h}
				];
				this.editMode = false;
				
				
				console.log("EXEC TEXT::::", this._postRenderCon);
				
				if(!o.text){
					this._text = "";
					this._textArray = [];
				}
				this.render(o.text);
				this.onChangeText(txt);
			},
			
			edit: function(){
				// summary:
				//		Internal?
				//		Method used to instanciate the contenteditable HTML node.
				//
				this.editMode = true;
				console.log("EDIT TEXT:", this._text, " ", this._text.replace("/n", " "));
				// NOTE: no mouse obj
				if(this.parentNode || !this.points){ return; }
				var d = this.pointsToData();
				
				var sc = this.mouse.scrollOffset();
				var org = this.mouse.origin;
				
				var obj = {
					pageX: (d.x  ) / this.mouse.zoom - sc.left + org.x,
					pageY: (d.y  ) / this.mouse.zoom- sc.top + org.y,
					width:d.width / this.mouse.zoom,
					height:d.height / this.mouse.zoom
				};
				
				this.remove(this.shape, this.hit);
				this.showParent(obj);
				this.createTextField(this._text.replace("/n", " "));
				this.connectTextField();
				if(this._text){
					//setTimeout(dojo.hitch(this, function(){
					this.setSelection(conEdit, "end");
					//}), 500)
				}
			},
			cleanText: function(/*String*/txt, /*Boolean*/removeBreaks){
				// summary:
				//		Cleans text. Strings HTML chars and double spaces
				//  	and optionally removes line breaks.
				var replaceHtmlCodes = function(str){
					var chars = {
						"&lt;":"<",
						"&gt;":">",
						"&amp;":"&"
					};
					for(var nm in chars){
						str = str.replace(new RegExp(nm, "gi"), chars[nm])
					}
					return str
				};

				if(removeBreaks){
					dojo.forEach(['<br>', '<br/>', '<br />', '\\n', '\\r'], function(br){
						txt = txt.replace(new RegExp(br, 'gi'), " ");
					});
				}
				txt = txt.replace(/&nbsp;/g, " ");
				txt = replaceHtmlCodes(txt);
				txt = dojo.trim(txt);
				// remove double spaces, since SVG doesn't show them anyway
				txt = txt.replace(/\s{2,}/g, " ");
				return txt; //String
			},
			
			measureText: function(/* String */ str, /* ? Number */width){
				// summary:
				//		Mechanism for measuring text.
				//		SVG nor VML have a way of determining the width or
				//		height of a block of text. This method creates an
				//		HTML text block and those measurements are used for
				//		displaying the SVG/VML text.
				// arguments:
				//		str: String
				//			The text to display and measure.
				//		width: [optional] Number 
				//			If the width is not provided, it will be assumed
				//			that the text is one line and the width will be
				//			measured and the _lineHeight used for th height.
				//			If width is provided, word-wrap is assumed, and
				//			line breaks will be inserted into the text at each
				//			point where a word wraps in the HTML. The height is
				//			then measured.
				//
				var r = "(<br\\s*/*>)|(\\n)|(\\r)";
				this.showParent({width:width || "auto", height:"auto"});
				this.createTextField(str);
				var txt = "";
				var el = conEdit;
				el.innerHTML = "X";
				var h = dojo.marginBox(el).h;
				
				el.innerHTML = str;
				
				if(!width || new RegExp(r, "gi").test(str)){
					// has line breaks in text
					txt = str.replace(new RegExp(r, "gi"), "\n");
					el.innerHTML = str.replace(new RegExp(r, "gi"), "<br/>");
				
				}else if(dojo.marginBox(el).h == h){
					// one line
					txt = str;
					
				}else{
					// text wraps
					var ar = str.split(" ");
					var strAr = [[]];
					var line = 0;
					el.innerHTML = "";
					while(ar.length){
						var word = ar.shift();
						el.innerHTML += word+" "; //urk, always an extra space
						if(dojo.marginBox(el).h > h){
							line++;
							strAr[line] = [];
							el.innerHTML = word+" ";
						}
						strAr[line].push(word)
					}
					
					dojo.forEach(strAr, function(ar, i){
						strAr[i] = ar.join(" ");
					});	
					txt = strAr.join("\n");
					
					// get the resultant height
					el.innerHTML = txt.replace("\n", "<br/>");
					
				}
				
				var dim = dojo.marginBox(el);
				
				conEdit.parentNode.removeChild(conEdit);
				dojo.destroy(this.parentNode);
				this.parentNode = null;
				
				return {h:dim.h, w:dim.w, text:txt}; //Object
			},
			
			_downOnCanvas:false,
			onDown: function(/*EventObject*/obj){
				// summary: See stencil._Base.onDown
				//
				this._startdrag = {
					x: obj.pageX,
					y: obj.pageY
				};
				dojo.disconnect(this._postRenderCon);
				this._postRenderCon = null;
				this._downOnCanvas = true;
			},
			
			createAnchors: function(){
				// summary:
				//		Internal. Creates HTML nodes at each corner
				//		of the contenteditable div. These nodes are
				//		draggable and will resize the div horizontally.
				//
				this._anchors = {};
				var self = this;
				var d = this.style.anchors,
					b = d.width,
					w = d.size-b*2,
					h = d.size-b*2,
					p = (d.size)/2*-1 + "px";
				
				var s = {
					position:"absolute",
					width:w+"px",
					height:h+"px",
					backgroundColor:d.fill,
					border:b+"px " + d.style + " "+d.color
				};
				if(dojo.isIE){
					s.paddingLeft = w + "px";
					s.fontSize = w + "px"
				}
				var ss = [
					{top: p, left:p},
					{top:p, right:p},
					{bottom:p, right:p},
					{bottom:p,left:p}
				];
				for(var i=0;i<4;i++){
					var isLeft = (i==0) || (i==3);
					var id = this.util.uid(isLeft ? "left_anchor" : "right_anchor");
					
					var a = dojo.create("div", {id:id}, this.parentNode);
					dojo.style(a, dojo.mixin(dojo.clone(s), ss[i]));
					
					var md, mm, mu;
					var md = dojo.connect(a, "mousedown", this, function(evt){
						isLeft = evt.target.id.indexOf("left")>-1;
						self._onAnchor = true;
						var orgX = evt.pageX;
						var orgW = this._box.width;
						dojo.stopEvent(evt);
						
							
						mm = dojo.connect(document, "mousemove", this, function(evt){
							var x = evt.pageX;
							if(isLeft){
								this._box.left = x;
								this._box.width = orgW + orgX - x;
							}else{
								this._box.width = x + orgW - orgX;
							}
							dojo.style(this.parentNode, this._box.toPx());
						});
						
						mu = dojo.connect(document, "mouseup", this, function(evt){
							orgX = this._box.left;
							orgW = this._box.width;
							dojo.disconnect(mm);
							dojo.disconnect(mu);
							self._onAnchor = false;
							conEdit.focus();
							dojo.stopEvent(evt);
						});
					});
					
					this._anchors[id] = {
						a:a,
						cons:[md]
					}
				}
			},
			
			destroyAnchors: function(){
				// summary:
				//		Internal. Destroys HTML anchors.
				for(var n in this._anchors){
					dojo.forEach(this._anchors[n].con, dojo.disconnect, dojo);
					dojo.destroy(this._anchors[n].a);
				}
			},
			setSelection: function(node, what){
				// summary:
				//		Used for placing teh cursor at the end of the
				//		text on edit.
				//
				console.warn("setSelection:");
				if (dojo.doc.selection) { // IE
					var r = dojo.body().createTextRange();
					r.moveToElementText(node);
					r.collapse(false);
					r.select();
					
				} else {
					var getAllChildren = function(node, children){
						children = children || [];
						for(var i=0;i<node.childNodes.length; i++){
							var n = node.childNodes[i];
							if(n.nodeType==3){
								children.push(n);
							}else if(n.tagName && n.tagName.toLowerCase()=="img"){
								children.push(n);
							}
							
							if(n.childNodes && n.childNodes.length){
								getAllChildren(n, children);
							}
						}
						return children;
					};
					console.log("ff node:", node)
					node.focus();
					var selection = dojo.global.getSelection();
					selection.removeAllRanges();
					console.log(1)
					r = dojo.doc.createRange();
					r.selectNodeContents(node);
					console.log(2)
					var nodes = getAllChildren(node);
					console.log(3)
					if (what == "end") {
						console.log("len:", nodes[nodes.length - 1].textContent.length)
						r.setStart(nodes[nodes.length - 1], nodes[nodes.length - 1].textContent.length);
						r.setEnd(nodes[nodes.length - 1], nodes[nodes.length - 1].textContent.length);
					}else if(what=="beg" || what == "start"){
						r.setStart(nodes[0], 0);
						r.setEnd(nodes[0], 0);
					}else if(what=="all"){
						r.setStart(nodes[0], 0);
						r.setEnd(nodes[nodes.length - 1], nodes[nodes.length - 1].textContent.length);
					}
					
					selection.addRange(r);
					
					console.log("sel ", what, " on ", node)
				}
			}
		}
	);
	
	dojox.drawing.tools.TextBlock.setup = {
		// summary: See stencil._Base ToolsSetup
		//
		name:"dojox.drawing.tools.TextBlock",
		tooltip:"Text Tool",
		iconClass:"iconText"
	};
	dojox.drawing.register(dojox.drawing.tools.TextBlock.setup, "tool");
	
})();