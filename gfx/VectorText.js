dojo.provide("dojox.gfx.VectorText");
dojo.require("dojox.gfx");
dojo.require("dojox.xml.DomParser");
dojo.require("dojox.html.metrics");

(function(){
	/*
		dojox.gfx.VectorText
		An implementation of the SVG Font 1.1 spec, using dojox.gfx.

		Basic interface:
		var f = new dojox.gfx.Font(url|string);
		surface||group.createVectorText(text)
			.setFill(fill)
			.setStroke(stroke)
			.setFont(fontStyleObject);

		The arguments passed to createVectorText are the same as you would
		pass to surface||group.createText; the difference is that this
		is entirely renderer-agnostic, and the return value is a subclass
		of dojox.gfx.Group.

		Note also that the "defaultText" object is slightly different:
		{ type:"vectortext", x:0, y:0, width:null, height: null, 
			text: "", align: "start", decoration: "none" }

		...as well as the "defaultVectorFont" object:
		{ type:"vectorfont", size:"10pt" }

		The reason for this should be obvious: most of the style for the font is defined
		by the font object itself. 

		Note that this will only render IF and WHEN you set the font.
	 */
	dojo.mixin(dojox.gfx, {
		vectorFontFitting: {
			NONE: 0,	//	render text according to passed size.
			FLOW: 1,		//	render text based on the passed width and size
			FIT: 2			//	render text based on a passed viewbox.
		},
		defaultVectorText: {
			type:"vectortext", x:0, y:0, width: null, height: null,
			text: "", align: "start", decoration: "none", fitting: 0,	//	vectorFontFitting.NONE
			leading: 1.5	//	in ems.
		},
		defaultVectorFont: {
			type:"vectorfont", size: "10pt", family: null
		},
		_vectorFontCache: {},
		_svgFontCache: {}
	});

	dojo.declare("dojox.gfx.VectorFont", null, {
		_entityRe: /&(quot|apos|lt|gt|amp|#x[^;]+|#\d+);/g,
		_decodeEntitySequence: function(str){
			//	unescape the unicode sequences
			if(!str.match(this._entityRe)){ return; }	//	nothing to decode.

			//	we have at least one encoded entity.
			var r, tmp="";
			while((r=this._entityRe.exec(str))!=null){
				if(r[1].charAt(1)=="x"){
					tmp+=String.fromCharCode(r[1].slice(2), 16);
				}
				else if(!isNaN(parseInt(r[1].slice(1)))){
					tmp+=String.fromCharCode(r[1].slice(1));
				}
				else {
					tmp+=xmlEntityMap(r[1]);
				}
			}
			return tmp;	//	String
		},
		_parse: function(/* String */svg, /* String */url){
			//	summary:
			//		Take the loaded SVG Font definition file and convert the info
			//		into things we can use. The SVG Font definition must follow
			//		the SVG 1.1 Font specification.
			var doc = dojox.gfx._svgFontCache[url]||dojox.xml.DomParser.parse(svg), 
				xmlEntityMap={
					amp:"&", apos:"'", quot:'"', lt:"<", gt:">"
				};

			//	font information
			var f = doc.documentElement.byName("font")[0], face = doc.documentElement.byName("font-face")[0];
			var unitsPerEm = parseFloat(face.getAttribute("units-per-em")||1000, 10);
			var advance = {
				x: parseFloat(f.getAttribute("horiz-adv-x"), 10),
				y: parseFloat(f.getAttribute("vert-adv-y")||0, 10)
			};
			if(!advance.y){
				advance.y = unitsPerEm;
			}

			var origin = {
				horiz: {
					x: parseFloat(f.getAttribute("horiz-origin-x")||0, 10),
					y: parseFloat(f.getAttribute("horiz-origin-y")||0, 10)
				},
				vert: {
					x: parseFloat(f.getAttribute("vert-origin-x")||0, 10),
					y: parseFloat(f.getAttribute("vert-origin-y")||0, 10)
				}
			};

			//	face information
			var family = face.getAttribute("font-family"),
				style = face.getAttribute("font-style")||"all",
				variant = face.getAttribute("font-variant")||"normal",
				weight = face.getAttribute("font-weight")||"all",
				stretch = face.getAttribute("font-stretch")||"normal",

				//	additional info, may not be needed
				range = face.getAttribute("unicode-range")||"U+0-10FFFF",
				panose = face.getAttribute("panose-1") || "0 0 0 0 0 0 0 0 0 0",
				capHeight = face.getAttribute("cap-height"),
				ascent = parseFloat(face.getAttribute("ascent")||(unitsPerEm-origin.vert.y), 10),
				descent = parseFloat(face.getAttribute("descent")||origin.vert.y, 10),
				baseline = {};

			//	check for font-face-src/font-face-name
			var name = family;
			if(face.byName("font-face-name")[0]){
				name = face.byName("font-face-name")[0].getAttribute("name");
			}

			//	see if this is cached already, and if so, forget the rest of the parsing.
			if(dojox.gfx._vectorFontCache[name]){ return; }

			//	get any provided baseline alignment offsets.
			dojo.forEach(["alphabetic", "ideographic", "mathematical", "hanging" ], function(attr){
				var a = face.getAttribute(attr);
				if(a != null /* be explicit, might be 0 */){
					baseline[attr] = parseFloat(a, 10);
				}
			});

		/*
			//	TODO: decoration hinting.
			var decoration = { };
			dojo.forEach(["underline", "strikethrough", "overline"], function(type){
				if(face.getAttribute(type+"-position")!=null){
					decoration[type]={ };
				}
			});
		*/
	
			//	missing glyph info
			var missing = parseFloat(doc.documentElement.byName("missing-glyph")[0].getAttribute("horiz-adv-x")||advance.x, 10);

			//	glyph information
			var glyphs = {}, glyphsByName={}, g=doc.documentElement.byName("glyph");
			dojo.forEach(g, function(node){
				//	we are going to assume the following:
				//		1) we have the unicode attribute
				//		2) we have the name attribute
				//		3) we have the horiz-adv-x and d attributes.
				var code = node.getAttribute("unicode"),
					name = node.getAttribute("glyph-name"),
					xAdv = parseFloat(node.getAttribute("horiz-adv-x")||advance.x, 10),
					path = node.getAttribute("d");

				//	unescape the unicode sequences
				if(code.match(this._entityRe)){
					code = this._decodeEntitySequence(code);
				}
				
				// build our glyph objects
				var o = { code: code, name: name, xAdvance: xAdv, path: path };
				glyphs[code]=o;
				glyphsByName[name]=o;
			}, this);

			//	now the fun part: look for kerning pairs.
			var hkern=doc.documentElement.byName("hkern");
			dojo.forEach(hkern, function(node, i){
				var k = -(parseInt(node.getAttribute("k")));
				//	look for either a code or a name
				var u1=node.getAttribute("u1"),
					g1=node.getAttribute("g1"),
					u2=node.getAttribute("u2"),
					g2=node.getAttribute("g2"),
					gl;

				if(u1){
					//	the first of the pair is a sequence of unicode characters.
					//	TODO: deal with unicode ranges and mulitple characters.
					u1 = this._decodeEntitySequence(u1);
					if(glyphs[u1]){
						gl = glyphs[u1];
					}
				} else {
					//	we are referring to a name.
					//	TODO: deal with multiple names
					if(glyphsByName[g1]){
						gl = glyphsByName[g1];
					}
				}

				if(gl){
					if(!gl.kern){ gl.kern = {}; }
					if(u2){
						//	see the notes above.
						u2 = this._decodeEntitySequence(u2);
						gl.kern[u2] = { x: k };
					} else {
						if(glyphsByName[g2]){
							gl.kern[glyphsByName[g2].code] = { x: k };
						}
					}
				}
			}, this);

			//	pop the final definition in the font cache.
			dojo.mixin(this, {
				family: family,
				name: name,
				style: style,
				variant: variant,
				weight: weight,
				stretch: stretch,
				range: range,
				viewbox: { width: unitsPerEm, height: unitsPerEm },
				origin: origin,
				advance: dojo.mixin(advance, {
					missing:{ x: missing, y: missing }
				}),
				ascent: ascent,
				descent: descent,
				baseline: baseline,
				glyphs: glyphs
			});

			//	cache the parsed font
			dojox.gfx._vectorFontCache[name] = this;
			if(name!=family && !dojox.gfx._vectorFontCache[family]){
				dojox.gfx._vectorFontCache[family] = this;
			}

			//	cache the doc
			if(!dojox.gfx._svgFontCache[url]){
				dojox.gfx._svgFontCache[url]=doc;
			}
		},
		_clean: function(){
			//	summary
			//		Clean off all of the given mixin parameters.
			var name = this.name, family = this.family;
			dojo.forEach(["family","name","style","variant",
				"weight","stretch","range","viewbox",
				"origin","advance","ascent","descent",
				"baseline","glyphs"], function(prop){
					try{ delete this[prop]; } catch(e) { }
			}, this);

			//	try to pull out of the font cache.
			if(dojox.gfx._vectorFontCache[name]){
				delete dojox.gfx._vectorFontCache[name];
			}
			if(dojox.gfx._vectorFontCache[family]){
				delete dojox.gfx._vectorFontCache[family];
			}
			return this;
		},

		constructor: function(/* String|dojo._Url */url){
			//	summary:
			//		Create this font object based on the SVG Font definition at url.
			this._defaultLeading = 1.5;
			if(url!==undefined){
				this.load(url);
			}
		},
		load: function(/* String|dojo._Url */url){
			//	summary:
			//		Load the passed SVG and send it to the parser for parsing.
			this.onLoadBegin(url.toString());
			this._parse(
				dojox.gfx._svgFontCache[url.toString()]||dojo._getText(url.toString()),
				url.toString()
			);
			this.onLoad(this);
			return this;	//	dojox.gfx.VectorFont
		},
		initialized: function(){
			//	summary:
			//		Return if we've loaded a font def, and the parsing was successful.
			return (this.glyphs!=null);	//	Boolean
		},

		//	preset round to 3 places.
		_round: function(n){ return Math.round(1000*n)/1000; },
		_leading: function(unit){ return this.viewbox.height * (unit||this._defaultLeading); },
		_normalize: function(str){
			return str.replace(/\s+/g, String.fromCharCode(0x20));
		},

		_getWidth: function(glyphs){
			var w=0, last=0, lastGlyph=null;
			dojo.forEach(glyphs, function(glyph, i){
				last=glyph.xAdvance;
				if(glyphs[i] && glyph.kern && glyph.kern[glyphs[i].code]){
					last += glyph.kern[glyphs[i].code].x;
				}
				w += last;
				lastGlyph = glyph;
			});

			//	if the last glyph was a space, pull it off.
			if(lastGlyph && lastGlyph.code == " "){
				w -= lastGlyph.xAdvance;
			}

			return this._round(w/*-last*/);
		},

		_getLongestLine: function(lines){
			var maxw=0, idx=0;
			dojo.forEach(lines, function(line, i){
				var max = Math.max(maxw, this._getWidth(line));
				if(max > maxw){
					maxw = max;
					idx=i;
				}
			}, this);
			return { width: maxw, index: idx, line: lines[idx] };
		},

		_trim: function(lines){
			var fn = function(arr){
				//	check if the first or last character is a space and if so, remove it.
				if(arr[arr.length-1].code == " "){ arr.splice(arr.length-1, 1); }
				if(arr[0].code == " "){ arr.splice(0, 1); }
			};
			if(dojo.isArray(lines[0])){
				//	more than one line.
				dojo.forEach(lines, fn);
			} else {
				fn(lines);
			}
			return lines;
		},

		_split: function(chars, nLines){
			//	summary
			//		split passed chars into nLines by finding the closest whitespace.
			var w = this._getWidth(chars),
				limit = Math.floor(w/nLines),
				lines = [],
				cw = 0,
				c = [],
				found = false;

			for(var i=0, l=chars.length; i<l; i++){
				if(chars[i].code == " "){ found = true; }
				cw += chars[i].xAdvance;
				if(i+1<l && chars[i].kern && chars[i].kern[chars[i+1].code]){
					cw += chars[i].kern[chars[i+1].code].x;
				}

				if(cw>=limit){
					var char=chars[i];
					while(found && char.code != " " && i>=0){
						char = c.pop(); i--;
					}
					lines.push(c), c=[], cw=0, found=false;
				}
				c.push(chars[i]);
			}
			if(c.length){ lines.push(c); }
			//	"trim" it
			return this._trim(lines);
		},

		_getSizeFactor: function(size){
			//	given the size, return a scaling factor based on the height of the
			//	font as defined in the font definition file.
			size += "";	//	force the string cast.
			var metrics = dojox.html.metrics.getCachedFontMeasurements(),
				height=this.viewbox.height,
				f=metrics["1em"], 
				unit=parseFloat(size, 10);	//	the default.
console.log(metrics);
			if(size.indexOf("em")>-1){
				return this._round((metrics["1em"]*unit)/height);
			}
			else if(size.indexOf("ex")>-1){
				return this._round((metrics["1ex"]*unit)/height);
			}
			else if(size.indexOf("pt")>-1){
				return this._round(((metrics["12pt"] / 12)*unit) / height);
			}
			else if(size.indexOf("px")>-1){
				return this._round(((metrics["16px"] / 16)*unit) / height);
			}
			else if(size.indexOf("%")>-1){
				return this._round((metrics["1em"]*(unit / 100)) / height);
			}
			else {
				f=metrics[size]||metrics["medium"];
				return this._round(f/height);
			}
		},

		_getFitFactor: function(lines, w, h, l){
			//	summary
			//		Find the scaling factor for the given phrase set.
			if(!h){
				//	if no height was passed, we assume an array of glyphs instead of lines.
				return this._round(w/this._getWidth(lines));
			} else {
				var maxw = this._getLongestLine(lines).width,
					maxh = (lines.length*(this.viewbox.height*l))-((this.viewbox.height*l)-this.viewbox.height);
				return this._round(Math.min(w/maxw, h/maxh));
			}
		},
		_getBestFit: function(chars, w, h, ldng){
			//	summary
			//		Get the best number of lines to return given w and h.
			var limit=32,
				factor=0,
				lines=limit;
			while(limit>0){
				var f=this._getFitFactor(this._split(chars, limit), w, h, ldng);
				if(f>factor){
					factor = f, lines=limit;
				}
				limit--;
			}
			return { scale: factor, lines: this._split(chars, lines) };
		},

		_getBestFlow: function(chars, w, scale){
			//	summary
			//		Based on the given scale, do the best line splitting possible.
			var lines = [],
				cw = 0,
				c = [],
				found = false;
			for(var i=0, l=chars.length; i<l; i++){
				if(chars[i].code == " "){ found = true; }
				var tw = chars[i].xAdvance;
				if(i+1<l && chars[i].kern && chars[i].kern[chars[i+1].code]){
					tw += chars[i].kern[chars[i+1].code].x;
				}
				cw += scale*tw;

				if(cw>=w){
					var char=chars[i];
					while(found && char.code != " " && i>=0){
						char = c.pop(); i--;
					}
					lines.push(c), c=[], cw=0, found=false;
				}
				c.push(chars[i]);
			}
			if(c.length){ lines.push(c); }
			return this._trim(lines);
		},

		draw: function(
			/* dojox.gfx.Container */group, 
			/* dojox.gfx.__TextArgs */textArgs,
			/* dojox.gfx.__FontArgs */fontArgs,
			/* dojox.gfx.__FillArgs */fillArgs,
			/* dojox.gfx.__StrokeArgs? */strokeArgs
		){
			//	summary
			//		based on the passed parameters, draw the given text.

			if(!this.initialized()){
				throw new Error("dojox.gfx.VectorFont.draw(): we have not been initialized yet.");
			}

			//	ok, let's figure out some stuff.  We have three options in terms of layout:
			//		1) layout by size only (no fit).  We do one line, at the passed size.
			//		2) layout with flow.  Render at the expected size but fit to the passed width,
			//			adding line breaks as necessary.
			//		3) best fit.  Calculate how many lines will fit in a passed box with the
			//			largest font size possible.  Size is ignored in this case.
			
			//	TODO: BIDI handling.  Deal with layout/alignments based on font parameters.

			//	start by creating the overall group.  This is the INNER group (the caller
			//	should be the outer).
			var g = group.createGroup();

			//	go get the glyph array.
			var text = dojo.map(this._normalize(textArgs.text).split(""), function(char){
				return this.glyphs[char] || { path:null, xAdvance: this.advance.missing.x };
			}, this);

			//	determine the font style info, ignore decoration.
			var size = fontArgs.size,
				fitting = textArgs.fitting,
				width = textArgs.width,
				height = textArgs.height,
				align = textArgs.align,
				leading = textArgs.leading||this._defaultLeading;

			//	figure out if we have to do fitting at all.
			if(fitting){
				//	more than zero.
				if(
					(fitting==dojox.gfx.vectorFontFitting.FLOW && !width)
					|| (fitting==dojox.gfx.vectorFontFitting.FIT && (!width || !height))
				){
					//	reset the fitting if we don't have everything we need.
					fitting = dojox.gfx.vectorFontFitting.NONE;
				}
			}

			//	set up the lines array and the scaling factor.
			var lines, scale;
			switch(fitting){
				case dojox.gfx.vectorFontFitting.FIT: {
					var o=this._getBestFit(text, width, height, leading);
					scale = o.scale, lines = o.lines;
					break;
				}
				case dojox.gfx.vectorFontFitting.FLOW: {
					scale = this._getSizeFactor(size),
					lines = this._getBestFlow(text, width, scale);
					break;
				}
				default: {
					scale = this._getSizeFactor(size), lines = [ text ];
				}
			}


			//	let's start drawing.
			var cy = 0, maxw = this._getLongestLine(lines).width;

			for(var i=0, l=lines.length; i<l; i++){
				var cx = 0, line=lines[i], linew = this._getWidth(line), lg=g.createGroup();
				
				//	loop through the glyphs and add them to the line group (lg)
				for (var j=0; j<line.length; j++){
					var glyph=line[j], p = lg.createPath(glyph.path).setFill(fillArgs);
					if(strokeArgs){ p.setStroke(strokeArgs); }
					p.setTransform([
						dojox.gfx.matrix.flipY,
						dojox.gfx.matrix.translate(cx, -this.viewbox.height-this.descent)
					]);
					cx += glyph.xAdvance;
					if(j+1<line.length && glyph.kern && glyph.kern[line[j+1].code]){
						cx += glyph.kern[line[j+1].code].x;
					}
				}

				//	transform the line group.
				var dx = 0;
				if(align=="middle"){ dx = maxw/2 - linew/2; }
				else if(align=="end"){ dx = maxw - linew; }
				lg.setTransform({ dx: dx, dy: cy });
				cy += this.viewbox.height * leading;
			}

			//	scale the group
			g.setTransform(dojox.gfx.matrix.scale(scale));

			//	return the overall group
			return g;
		},

		//	events
		onLoadBegin: function(/* String */url){ },
		onLoad: function(/* dojox.gfx.VectorFont */font){ }
	});

	//	Inherit from Group but attach Text properties to it.
	dojo.declare("dojox.gfx.VectorText", dojox.gfx.Group, {
		constructor: function(rawNode){
			dojox.gfx.Group._init.call(this);
			this.fontStyle = null;
		},

		//	private methods.
		_setFont: function(){
			//	render this using the font code.
			var f = this.fontStyle;
			var font = dojox.gfx._vectorFontCache[f.family];
			if(!font){
				throw new Error("dojox.gfx.VectorText._setFont: the passed font family '" + f.family + "' was not found.");
			}

			//	the actual rendering belongs to the font itself.
			font.draw(this, this.shape, this.fontStyle, this.fillStyle, this.strokeStyle);
		},

		getFont: function(){ return this.fontStyle; },

		//	overridden public methods.
		setShape: function(newShape){
			dojox.gfx.Group.setShape.call(this);
			this.shape = dojox.gfx.makeParameters(this.shape, newShape);
			this.bbox = null;
			this._setFont();
			return this;
		},

		//	if we've been drawing, we should have exactly one child, and that
		//		child will contain the real children.
		setFill: function(fill){
			this.fillStyle = fill;
			if(this.children[0]){
				dojo.forEach(this.children[0].children, function(group){
					dojo.forEach(group.children, function(path){
						path.setFill(fill);
					});
				}, this);
			}
			return this;
		},
		setStroke: function(stroke){
			this.strokeStyle = stroke;
			if(this.children[0]){
				dojo.forEach(this.children[0].children, function(group){
					dojo.forEach(group.children, function(path){
						path.setStroke(stroke);
					});
				}, this);
			}
			return this;
		},

		setFont: function(newFont){
			//	this will do the real rendering.
			this.fontStyle = typeof newFont == "string" ? dojox.gfx.splitFontString(newFont)
				: dojox.gfx.makeParameters(dojox.gfx.defaultFont, newFont);
			this._setFont();
			return this;
		},

		getBoundingBox: function(){
			return this.bbox;
		}
	});

	//	TODO: figure out how to add this to container objects!
	dojox.gfx.shape.Creator.createVectorText = function(text){
		return this.createObject(dojox.gfx.VectorText, text);
	}
})();
