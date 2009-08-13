dojo.provide("dojox.gfx.utils");

dojo.require("dojox.gfx");

dojo.required("dojox.gfx", function(){
	var serialize = function(
			/* dojox.gfx.Surface || dojox.gfx.Shape */ object
		){
			var t = {}, v, isSurface = object instanceof dojox.gfx.Surface;
			if(isSurface || object instanceof dojox.gfx.Group){
				t.children = dojo.map(object.children, dojox.gfx.utils.serialize);
				if(isSurface){
					return t.children;	// Array
				}
			}else{
				t.shape = object.getShape();
			}
			if(object.getTransform){
				v = object.getTransform();
				if(v){ t.transform = v; }
			}
			if(object.getStroke){
				v = object.getStroke();
				if(v){ t.stroke = v; }
			}
			if(object.getFill){
				v = object.getFill();
				if(v){ t.fill = v; }
			}
			if(object.getFont){
				v = object.getFont();
				if(v){ t.font = v; }
			}
			return t;	// Object
		};

	var deserialize = function(
			/* dojox.gfx.Surface || dojox.gfx.Shape */ parent,
			/* dojox.gfx.Shape || Array */ object
		){
			if(dojo.isArray(object)){
				return dojo.map(object, dojo.hitch(null, serialize, parent));	// Array
			}
			var shape = ("shape" in object) ? parent.createShape(object.shape) : parent.createGroup();
			if("transform" in object){
				shape.setTransform(object.transform);
			}
			if("stroke" in object){
				shape.setStroke(object.stroke);
			}
			if("fill" in object){
				shape.setFill(object.fill);
			}
			if("font" in object){
				shape.setFont(object.font);
			}
			if("children" in object){
				dojo.forEach(object.children, dojo.hitch(null, deserialize, shape));
			}
			return shape;	// dojox.gfx.Shape
		};

	dojo.mixin(dojox.gfx.utils, {
		forEach: function(
			/* dojox.gfx.Surface || dojox.gfx.Shape */ object,
			/*Function|String|Array*/ f, /*Object?*/ o
		){
			o = o || dojo.global;
			f.call(o, object);
			if(object instanceof dojox.gfx.Surface || object instanceof dojox.gfx.Group){
				dojo.forEach(object.children, function(shape){
					dojox.gfx.utils.inspect(shape, f, o);
				});
			}
		},

		serialize: serialize,

		toJson: function(
			/* dojox.gfx.Surface || dojox.gfx.Shape */ object,
			/* Boolean? */ prettyPrint
		){
			return dojo.toJson(serialize(object), prettyPrint);	// String
		},

		deserialize: deserialize,

		fromJson: function(
			/* dojox.gfx.Surface || dojox.gfx.Shape */ parent,
			/* String */ json
		){
			return deserialize(parent, dojo.fromJson(json));	// Array || dojox.gfx.Shape
		}
	});
});