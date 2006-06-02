dojo.provide("dojo.lang.declare");

dojo.require("dojo.lang.common");
dojo.require("dojo.lang.extras");

/*
 * Creates a constructor: inherit and extend
 *
 * - inherits from "superclass" 
 *
 *   "superclass" argument may be a function, or an array of 
 *   functions. 
 *
 *   If "superclass" is an array, the first element is used 
 *   as the prototypal ancestor and any following functions 
 *   become mixin ancestors.
 *
 *   Using mixin ancestors provides a type of multiple
 *   inheritance, but mixin ancestors have special 
 *   restrictions (e.g. they cannot have their own prototype
 *   chains.
 *
 * - "props" are copied to the constructor prototype
 * - name of the class ("className" argument) is stored in 
 *   "clasName" property
 * 
 * An initializer function can be specified in the "init" 
 * argument, or by including a function called "initializer" 
 * in "props".
 * 
 * The initializer function works just like a constructor, 
 * except for the following benefits:
 * 
 * - it doesn't fire at inheritance time (when prototyping)
 * - properties set in the initializer do not become part of subclass prototypes
 *
 * Superclass methods (inherited methods) can be invoked using "inherited" method:
 *
 * this.inherited(<method name>[, <argument array>]);
 * - inherited will continue up the prototype chain until it finds an implementation of method
 * - nested calls to inherited are supported (i.e. inherited method "A" can succesfully call inherited("A"), and so on)
 *
 * Aliased as "dojo.declare"
 *
 * Usage:
 *
 * dojo.declare("my.classes.bar", my.classes.foo, {
 *	initializer: function() {
 *		this.myComplicatedObject = new ReallyComplicatedObject(); 
 *	},
 *	someValue: 2,
 *	aMethod: function() { doStuff(); }
 * });
 *
 */
dojo.lang.declare = function(className /*string*/, superclass /*function || array*/, props /*object*/, init /*function*/){
	var mixins = [ ];
	if (dojo.lang.isArray(superclass)) {
		mixins = superclass;
		superclass = mixins.shift();
	}
	var ctor = function(){ 
		// get the generational context (which object [or prototype] should be constructed)
		var self = this._getPropContext();
		var s = self.constructor.superclass;
		if((s)&&(s.constructor)){
			if(s.constructor==arguments.callee){
				// if this constructor is invoked directly (my.ancestor.call(this))
				this.inherited("constructor", arguments);
			}else{
				this._inherited(s, "constructor", arguments);
			}
		}
		var m = (self.constructor.mixins)||([]);
		for(var i=0,l=m.length; i<l; i++) {
			(((m[i].prototype)&&(m[i].prototype.initializer))||(m[i])).apply(this, arguments);
		}
		if((!this.prototyping)&&(self.initializer)){
			self.initializer.apply(this, arguments);
		}
	}
	var scp = (superclass ? superclass.prototype : null);
	if(scp){
		scp.prototyping = true;
		ctor.prototype = new superclass();
		scp.prototyping = false; 
	}
	ctor.superclass = scp;
	ctor.mixins = mixins;
	for(var i=0,l=mixins.length; i<l; i++){
		dojo.lang.extend(ctor, mixins[i].prototype);
	}
	ctor.prototype.declaredClass = className;
	if (props){dojo.lang.extend(ctor, props);}
	dojo.lang.extend(ctor, dojo.lang.declare.base);
	ctor.prototype.constructor = ctor;
	ctor.prototype.initializer=(props.initializer)||(init)||(function(){});
	dojo.lang.setObjPathValue(className, ctor, null, true);
}

dojo.lang.declare.base = {
	_getPropContext: function() { return (this.___proto||this); },
	// caches ptype context and calls method on it
	_inherited: function(ptype, method, args){
		var stack = this.___proto;
		this.___proto = ptype;
		var result = ptype[method].apply(this,(args||[]));
		this.___proto = stack;
		return result;
	},
	// searches backward thru prototype chain to find nearest ancestral implementation of method
	inherited: function(prop, args){
		var p = this._getPropContext();
		do{
			if((!p.constructor)||(!p.constructor.superclass)){return;}
			p = p.constructor.superclass;
		}while(!(prop in p));
		return (typeof p[prop] == 'function' ? this._inherited(p, prop, args) : p[prop]);
	}
}

dojo.declare = dojo.lang.declare;