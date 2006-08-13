dojo.require('dojo.dom');
dojo.require("dojo.lang.declare");
dojo.require("dojo.graphics.color");
dojo.require('dojo.string.*');
dojo.provide("dojo.gfx.vml");

dojo.gfx.vml.xmlns = "urn:schemas-microsoft-com:vml";

// generic environment setup function;
// currently a stub
dojo.gfx.vml.init = function() {
};

dojo.gfx.vml._capTranslation = { butt: 'flat' };
dojo.gfx.vml._translateCap = function(capSpec) {
   var spec = dojo.gfx.vml._capTranslation[capSpec];
   return spec ? spec : capSpec;
};

dojo.gfx.vml._reverseCapTranslation = { flat: 'butt' };
dojo.gfx.vml._reverseTranslateCap = function(capSpec) {
   var spec = dojo.gfx.vml._reverseCapTranslation[capSpec];
   return spec ? spec : capSpec;
};

// this is a Shape object, which knows how to apply graphical attributes and a transformation
dojo.gfx.vml.Shape = function(){
	// NOTE: constructor --- used to initialiaze every instance

    // underlying VML node
    this.rawNode = null;
    
    // transformation matrix
    this.matrix  = null;

    // graphical attributes
    this.fillStyle   = null;
    this.strokeStyle = null;
};


dojo.lang.extend(
   dojo.gfx.vml.Shape, 
   {
      // NOTE: a list of shared methods and constants in the object notation
      nodeType: null,
    // set a stroke style
    setStroke: function(stroke){
        // normalized LineStroke object (will be in renderer-independent part of code)
        this.strokeStyle = { color:null, width:1, cap:"butt", join:4 };
        if(stroke == null){
            this.strokeStyle = null;
        }else { 
            dojo.gfx.normalizeParameters(this.strokeStyle, stroke);
        }
        // generate attributes
        var s = this.strokeStyle;
        if(s){
           this.rawNode.stroked = 1;
           this.rawNode.strokecolor = "rgb("+s.color.r+","+s.color.g+","+s.color.b+")";
           this.rawNode.strokeweight = s.width;
           if (this.rawNode.stroke) {
              this.rawNode.stroke.opacity = s.color.a;
              this.rawNode.stroke.endcap = dojo.gfx.vml._translateCap(s.cap);
              if(typeof(s.join) == "number") {
                 this.rawNode.stroke.joinstyle = "miter";
                 this.rawNode.stroke.miterlimit = s.join;
              }else{
                 this.rawNode.stroke.joinstyle = s.join;
                 // this.rawNode.stroke.miterlimit = s.width;
              }
              // dojo.debug('miterlimit: ' + this.rawNode.stroke.miterlimit);
              // dojo.debug('joinstyle: ' + this.rawNode.stroke.joinstyle);
           }
        }else{
           this.rawNode.stroked = 0;
        }
        // support for chaining
        return this;
    },
    
    // set a fill style
    setFill: function(fill){
        if( fill instanceof dojo.gfx.Gradient ) {
            this.fillStyle = fill;
            this.rawNode.appendChild( fill.getRawNode() );
            return this;
        } else if( fill instanceof dojo.graphics.color.Color) {
            // color object
            this.fillStyle = fill;
            this.rawNode.filled = true;
            this.rawNode.fillcolor = fill.toHex();
            this.rawNode.fill.opacity = fill.a;
        } else {
            this.fillStyle = null;
            this.rawNode.filled = false;
        }
       // support for chaining
       return this;
    },
    // set an absolute transformation matrix
    setTransform: function(matrix){
      this.matrix = dojo.gfx.normalizeMatrix(matrix);
      // generate the attribute
      if(this.matrix){
        var skew = this.rawNode.skew;
        var mt = "" + this.matrix.xx + "," + this.matrix.xy + 
          "," + this.matrix.yx + "," + this.matrix.yy +
          ", 0, 0";
        var offset = "" + this.matrix.dx + "px," + this.matrix.dy + "px";
        // dojo.debug( "mt = " + mt + " offset = " + offset );
        skew.matrix =  mt;
        skew.offset = offset;
        skew.on = "t";
        // dojo.debug( "skew : matrix = " + skew.matrix + " offset = " + skew.offset );
      }
        // support for chaining
        return this;
    },

    // apply-right a transformation matrix
    applyTransform: function(matrix){
		// FIXME: should be in renderer-independent part of code
		var m = dojo.gfx.normalizeMatrix(matrix);
		if(!m) return this;
		if(this.matrix){
			return this.setTransform({
				xx: this.matrix.xx * m.xx + this.matrix.xy * m.yx,
				xy: this.matrix.xx * m.xy + this.matrix.xy * m.yy,
				yx: this.matrix.yx * m.xx + this.matrix.yy * m.yx,
				yy: this.matrix.yx * m.xy + this.matrix.yy * m.yy,
				dx: this.matrix.xx * m.dx + this.matrix.xy * m.dy + this.matrix.dx,
				dy: this.matrix.yx * m.dx + this.matrix.yy * m.dy + this.matrix.dy
			});
		}
		return this.setTransform(m);
    },

    // apply-left a transformation matrix
    applyLeftTransform: function(matrix){
        dojo.unimplemented("dojo.gfx.vml.Shape.applyLeftTransform");
        // support for chaining
        return this;
    },

    setShape: function(newShape){
        dojo.gfx.normalizeParameters(this.shape, newShape);
        // generate attributes
        for(it in this.shape) {
            this.rawNode.setAttribute(it, this.shape[it]);
        }
        // support for chaining
        return this;
    },

    setRawNode: function(rawNode){
        this.rawNode = rawNode;
    },

    // Attach family
    attachFill: function(rawNode){
        fillStyle = null;
        if(rawNode) {
            if( rawNode.fill.type == "gradient" ) {
                // a gradient object !
                url = rawNode.fill.id;
                // TODO: build the stops from the colors
                fillStyle = {id:url, rawNode:rawNode.fill, gradient:{}, stops:null };
                fillStyle.gradient['type'] = "gradient";
            } else if( rawNode.fillcolor ) {
                // a color object !
                fillStyle = new dojo.graphics.color.Color(rawNode.fillcolor+"");
                fillStyle.a = rawNode.fill.opacity;
            }
        }
        return fillStyle;
    },

    attachStroke: function(rawNode) {
        strokeStyle = {color:null, widht:1, cap:"butt", join:4};
        if(rawNode && rawNode.stroked == 1) {
            strokeStyle.color = new dojo.graphics.color.Color(rawNode.strokecolor+"");
            strokeStyle.width = rawNode.strokeweight;
            strokeStyle.color.a = rawNode.stroke.opacity;
            strokeStyle.cap = dojo.gfx.vml._reverseTranslateCap(rawNode.stroke.endcap);

            if(rawNode.stroke.joinstyle == "miter") {
                strokeStyle.join = rawNode.stroke.miterlimit;
            } else {
                strokeStyle.join = rawNode.stroke.joinstyle;
            }
        }
        return strokeStyle;
    },

    attachTransform: function(rawNode) {
        matrix = null;
        if(rawNode) {
            // FIXME: check whether skew.on returns boolean or string
            on = rawNode.skew.on; 
            if( on ) {
                // FIXME: check the type of matrix!
                ts = rawNode.skew.matrix + ",foo"; 
                ts = ts.split(",");
                matrix = { xx:ts[0], xy:ts[1], yx:ts[2], yy:ts[3], dx:ts[4], dy:ts[5] };
                ts = rawNode.skew.offset+",foo";
                ts = ts.split(",")
                matrix.dx = ts[0].replace(/px/,"");
                matrix.dy = ts[1].replace(/px/,"");
            }
        }
        return matrix;
    },

    attach: function(rawNode){
        if(rawNode) {
            this.rawNode = rawNode;
            this.shape = this.attachShape(rawNode);
            this.fillStyle = this.attachFill(rawNode);
            this.strokeStyle = this.attachStroke(rawNode);
            this.matrix = this.attachTransform(rawNode);
        }
    },
    
    // trivial getters
    getNode:      function(){ return this.rawNode; },
    getTransform: function(){ return this.matrix; },
    getFill:      function(){ return this.fillStyle; },
    getStroke:    function(){ return this.strokeStyle; },
    getShape:     function(){ return this.shape; }
});

dojo.declare("dojo.gfx.vml.Group", dojo.gfx.vml.Shape, {
    nodeType: 'g',
    shape: null,
    setTransform: function(matrix) {
       this.matrix = dojo.gfx.normalizeMatrix(matrix);
       if(this.matrix){
            dojo.debug("rotation for group is not implemented !");
            this.rawNode.coordorigin = this.matrix.dx + "," + this,matrix.dy;
       }
       return this;
    }
});

dojo.declare("dojo.gfx.vml.Path", dojo.gfx.vml.Shape, {
    nodeType: 'shape',
    initializer: function() {
        this.shape = { path:"", coordination:"absolute" };
        this.lastPos = {x:0, y:0 };
        this.lastControl = {x:0, y:0 };
        this.lastAction = "";
    },
    setShape: function(newShape){
        // FIXME: accept a string as well as a Path object
        // After setPath, could we add more actions here ?
        dojo.gfx.normalizeParameters(this.shape, newShape);
        this.setCoordination(this.shape.coordination);

        // TODO: this is quick-n-dirty approach, digg into VML coordination.
        this.rawNode.style.position = "absolute";
        this.rawNode.style.width = 300;
        this.rawNode.style.height = 300;
        this.rawNode.path.v = this.shape.path + ' e';
        return this;
    },
    setCoordination: function(cor) {
        this.shape.coordination = (cor == "relative") ? "relative" : "absolute";
        return this;
    },
    getCoordination: function() {
        return this.shape.coordination;
    },
    // Drawing actions
    drawTo: function(action, raction, args) {
        this.shape.path += ( this.shape.coordination == "absolute" ) ? action : raction;
        for( i = 0; i< args.length; i++ ) {
            this.shape.path += args[i] + " ";
        }
-        dojo.debug( 'action = ' + action + ' path = ' + this.shape.path );
        this.lastAction = action; 
        this.setShape();
        return this;
    },
    update : function(x, y, x2, y2)  {
        if( this.coordination == "absolute" ) {
            this.lastPos.x = x;
            this.lastPos.y = y;
            if( x2 && y2 ) {
                this.lastControl.x = x2;
                this.lastControl.y = y2;
            } else {
                this.lastControl.x = this.lastPos.x;
                this.lastControl.y = this.lastPos.y;
            }
        } else {
            if( x2 && y2 ) {
                this.lastControl.x = this.lastPos.x + x2;
                this.lastControl.y = this.lastPos.y + y2;
            } else {
                this.lastControl.x = this.lastPos.x + x;
                this.lastControl.y = this.lastPos.y + y;
            }
            this.lastPos.x += x;
            this.lastPos.y += y;
        }
    },
    
    mirror : function(action) {
        if( action != this.lastAction ) {
            return {x:lastPos.x, y:lastPos.y};
        }
        x1 = 2* this.lastPos.x - this.lastControl.x;
        y1 = 2* this.lastPos.y - this.lastControl.y;
        if( this.shape.coordination == "relative" ) {
            x1 -= this.lastPos.x;
            y1 -= this.lastPos.y;
        }
        return {x:x1, y:y1};
    },

    closePath: function() {
        return this.drawTo("x", "x", []);
    },
    moveTo: function(x, y) {
        this.update( x, y );
        return this.drawTo("m", "t", [x,y]);
    },
    lineTo: function(x, y) {
        this.update( x, y );
        return this.drawTo("l", "r", [x,y]);
    },
    hLineTo: function(x) {
        y = ( this.shape.coordination == "absolute" ) ? this.lastPos.y : 0;
        return this.lineTo(x, y);
    },
    vLineTo: function(y) {
        x = ( this.shape.coordination == "absolute" ) ? this.lastPos.x : 0;
        return this.lineTo(x, y);
    },
    curveTo: function(x1, y1, x2, y2, x, y) {
        this.update(x, y, x2, y2);
        return this.drawTo("c", "v", [x1, y1, x2, y2, x, y]);
    },
    smoothCurveTo: function(x2, y2, x, y) {
        pos = this.mirror("c");
        x1 = pos.x;
        y1 = pos.y;
        return this.curveTo(x1, y1, x2, y2, x, y);
    },

    qbCurveTo: function(x1, y1, x, y) {
        this.update(x, y, x1, y1);
        return this.drawTo("qb", "qb", [x1, y1, x, y]);
    },
    smoothQBCurveTo: function(x, y) {
        pos = this.mirror("qb");
        x1 = pos.x;
        y1 = pos.y;
        return this.qbCurveTo(x1, y1, x, y);
    },
    setPath: function(shape) { return this.setShape(shape); },
    getPath: function(){ return this.getShape(); }
});

dojo.declare("dojo.gfx.vml.Rect", dojo.gfx.vml.Shape, {
    nodeType: 'roundrect', // Use a roundrect so the stroke join type is respected
    initializer: function(rawNode) {
        this.shape = { x:0, y:0, width:100, height:100 };
        this.attach(rawNode);
    },
    setShape: function(newShape){
        dojo.gfx.normalizeParameters(this.shape, newShape);
        // generate attributes
        // more professional practice ?
        this.rawNode.style.position = "absolute";
        this.rawNode.style.width = this.shape.width;
        this.rawNode.style.height = this.shape.height;
        this.rawNode.style.left = this.shape.x;
        this.rawNode.style.top = this.shape.y;
        return this;
    },
    setRawNode: function(rawNode){
        // FIXME: could we update arcsize after it is attached ?
        rawNode.arcsize = 0;
        this.rawNode = rawNode;
    },
    attachShape: function(rawNode){
        return { x: rawNode.style.left.replace(/px/,"")-0,
                 y: rawNode.style.top.replace(/px/,"")-0,
                 width: rawNode.style.width.replace(/px/,"")-0,
                 height: rawNode.style.height.replace(/px/,"")-0
               };
    },

    setRect: function(shape){ return this.setShape(shape); },
    getRect: function(){ return this.getShape(); }
});

dojo.declare(
   'dojo.gfx.vml.Roundrect', dojo.gfx.vml.Rect, {
      nodeType: 'roundrect'
   });

dojo.declare("dojo.gfx.vml.Circle", dojo.gfx.vml.Shape, {
    nodeType: 'oval',
    initializer: function() {
        this.shape = { cx:0, cy:0, r:100 };
    },
    setShape: function(newShape){
        dojo.gfx.normalizeParameters(this.shape, newShape);
        // generate attributes
       this.rawNode.style.x = this.shape.cx - this.shape.r;
       this.rawNode.style.y = this.shape.cy - this.shape.r;
       this.rawNode.style.width = this.shape.r * 2;
       this.rawNode.style.height = this.shape.r * 2;
        return this;
    },
    setCircle: function(shape){ return this.setShape(shape); },
    getCircle: function(){ return this.getShape(); }
});

dojo.declare("dojo.gfx.vml.Ellipse", dojo.gfx.vml.Shape, {
    nodeType: 'oval',
    initializer: function() {
        this.shape = { rx:100, cx:100, ry:80, cy:80 };
    },
    setShape: function(newShape){
        dojo.gfx.normalizeParameters(this.shape, newShape);
        // generate attributes
       this.rawNode.style.width = this.shape.rx * 2;
       this.rawNode.style.height = this.shape.ry * 2;
       this.rawNode.style.left = this.shape.cx - this.shape.rx;
       this.rawNode.style.top = this.shape.cy - this.shape.ry;
        return this;
    },
    setEllipse: function(shape){ return this.setShape(shape); },
    getEllipse: function(){ return this.getShape(); }
});

dojo.declare("dojo.gfx.vml.Line", dojo.gfx.vml.Shape, {
    nodeType: 'line',
    initializer: function() {
        this.shape = { x1:0, y1:0, x2:50, y2:50 };
    },
    setShape: function(newShape){
        dojo.gfx.normalizeParameters(this.shape, newShape);
        // generate attributes
       this.rawNode.from = this.shape.x1 + "," + this.shape.y1;
       this.rawNode.to = this.shape.x2 + "," + this.shape.y2;

        return this;
    },
    setLine: function(shape){ return this.setShape(shape); },
    getLine: function(){ return this.getShape(); }
});

dojo.declare("dojo.gfx.vml.Polyline", dojo.gfx.vml.Shape, {
    nodeType: 'polyline',
    initializer: function() {
        this.shape = { points:null };
    },
    setShape: function(points){
        dojo.gfx.normalizeParameters(this.shape, points);
        // generate attributes
        attr = "";
        for( i = 0; i< this.shape.points.length; i++ ) {
            attr += this.shape.points[i].x + " " + this.shape.points[i].y + " ";
        }
        this.rawNode.points.value = attr;
       return this;
    },
    setPolyline: function(shape){ return this.setShape(shape); },
    getPolyline: function(){ return this.getShape(); }
});

dojo.declare("dojo.gfx.vml.Polygon", dojo.gfx.vml.Shape, {
    nodeType: 'polyline',
    initializer: function() {
        this.shape = { points:null };
    },
    setShape: function(points){
        dojo.gfx.normalizeParameters(this.shape, points);
        // generate attributes
        attr = "";
        for( i = 0; i< this.shape.points.length; i++ ) {
            attr += this.shape.points[i].x + " " + this.shape.points[i].y + " ";
        }
        attr += this.shape.points[0].x + " " + this.shape.points[0].y + " ";

        this.rawNode.points.value = attr;
        return this;
    },
    setPolygon: function(shape){ return this.setShape(shape); },
    getPolygon: function(){ return this.getShape(); }
});

var metacreator = {
   createObject: function(shape, rawShape) {
      if(!this.rawNode) return null;
      var n = document.createElement('v:' + shape.nodeType);
      shape.setRawNode(n);
      this.rawNode.appendChild(n);
      if(rawShape) shape.setShape(rawShape);
      return shape;
   }
};

var creators = {
    // creators
    createPath: function(path){
        return this.createObject(new dojo.gfx.vml.Path(), path);
    },
    createRect: function(rect){
        return this.createObject(new dojo.gfx.vml.Rect(), rect);
    },
    createRoundrect: function(roundrect){
        return this.createObject(new dojo.gfx.vml.Roundrect(), roundrect);
    },
    createCircle: function(circle){
        return this.createObject(new dojo.gfx.vml.Circle(), circle);
    },
    createEllipse: function(ellipse){
        return this.createObject(new dojo.gfx.vml.Ellipse(), ellipse);
    },
    createLine: function(line){
        return this.createObject(new dojo.gfx.vml.Line(), line);
    },
    createPolyline: function(points){
        return this.createObject(new dojo.gfx.vml.Polyline(), points);
    },
    createPolygon: function(points){
        return this.createObject(new dojo.gfx.vml.Polygon(), points);
    },
    createGroup: function(){
        return this.createObject(new dojo.gfx.vml.Group());
    }
};


// Misc utility functions
dojo.gfx.vml.attachNode = function(node){
    if(!node) return null;
    var s = null;
    switch(node.tagName.toLowerCase()){
        case "path":
            s = new dojo.gfx.vml.Path();
            break;
        case "roundrect":
            s = new dojo.gfx.vml.Rect(node);
            break;
        case "roundrect":
            s = new dojo.gfx.vml.Roundrect();
            break;
        case "circle":
            s = new dojo.gfx.vml.Circle();
            break;
        case "ellipse":
            s = new dojo.gfx.vml.Ellipse();
            break;
        case "line":
            s = new dojo.gfx.vml.Line();
            break;
        case "polyine":
            s = new dojo.gfx.vml.Polyline();
            break;
        case "polygon":
            s = new dojo.gfx.vml.Polygon();
            break;
        default:
            dojo.debug("FATAL ERROR! tagName = " + rawNode.tagName);
    }
    s.rawNode = node;
    return s;
};

// this is a Surface object
dojo.gfx.vml.Surface = function(){
    // underlying VML node
    this.rawNode = null;
};

dojo.lang.extend(dojo.gfx.vml.Surface, {
    // trivial setters/getters
    setDimensions: function(width, height){
        if(!this.rawNode) return this;
       s.rawNode.style.width = width;
       s.rawNode.style.height = height;
        // support for chaining
        return this;
    },
    getDimensions: function(){
        return this.rawNode ?
            { width: this.rawNode.style.width, height: this.rawNode.style.height } : 
            null;
    }
});

dojo.gfx.vml.createSurface = function(parentNode, width, height){
   var s = new dojo.gfx.vml.Surface();
   // TODO: Do we really need a v:group wrapper ?
   s.rawNode = document.createElement("v:group");
   s.rawNode.style.width = width;
   s.rawNode.style.height = height;
   s.rawNode.coordsize = "" + width + " " + height;
   s.rawNode.coordorigin = "0 0";
   parentNode.appendChild(s.rawNode);
   return s;
};

dojo.gfx.vml.attachSurface = function(node){
    var s = new dojo.gfx.vml.Surface();
    s.rawNode = node;
    return s;
};

// Gradient and pattern
dojo.gfx.vml.Gradient = function(){
    this.rawNode = null;
    this.gradient = null;
    this.id = "";
};

dojo.lang.extend(dojo.gfx.vml.Gradient, {
    addStop: function(stop){
        if(stop){
            this.rawNode.colors += ", " + stop.offset + " " + stop.color
            this.rawNode.on = "t";
        }
        return this;
    },
    setGradient: function(newGradient){
        dojo.gfx.normalizeParameters(this.gradient, newGradient );
        // FIXME: find a real guid() !
        this.id = dojo.gfx.guid();
        this.rawNode = document.createElement("v:" + this.nodeType);

        for(it in this.gradient) {
            this.rawNode.setAttribute(it, this.gradient[it]);
        }
        this.rawNode.setAttribute("id", this.id);
        this.rawNode.setAttribute("on", "t");
        return this;
    },
    getId: function(){ return this.id; },
    getRawNode: function(){  return this.rawNode; }
});

dojo.declare("dojo.gfx.vml.LinearGradient", dojo.gfx.vml.Gradient, {
    nodeType: "fill",
    initializer: function( newGradient ) {
        this.gradient = {  color:"red", color2:"blue", type:"gradient" };
        this.setGradient(newGradient);
    }
});

dojo.declare("dojo.gfx.vml.RadialGradient", dojo.gfx.vml.Gradient, {
    nodeType: "fill",
    initializer: function(newGradient) {
        this.gradient = { cx:"50%", cy:"50%", r:"50%", fx:"0%", fy:"0%", type:"gradientradial", color:"red", color2:"blue" };
        this.setGradient(newGradient);
    }
});

dojo.declare("dojo.gfx.vml.Pattern", dojo.gfx.vml.Gradient, {
    nodeType: "pattern",
    addStop: null,
    initializer: function( newGradient ) {
        this.gradient = { x:0, y:0, width:100, height:100, patternUnits:"userSpaceOnUse"};
        this.setGradient(newGradient);
    }
});


dojo.lang.extend(dojo.gfx.vml.Group, metacreator);
dojo.lang.extend(dojo.gfx.vml.Group, creators);

dojo.lang.extend(dojo.gfx.vml.Surface, metacreator);
dojo.lang.extend(dojo.gfx.vml.Surface, creators);

delete metacreator ;
delete creators ;

