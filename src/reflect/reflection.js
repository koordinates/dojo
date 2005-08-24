dojo.provide("dojo.reflect.reflection");

/*****************************************************************
	reflection.js
	v.1.5.0
	(c) 2003-2004 Thomas R. Trenka, Ph.D.

	Derived from the reflection functions of f(m).
	http://dojotoolkit.org
	http://fm.dept-z.com

	There is a dependency on the variable dJ_global, which
	should always refer to the global object.
******************************************************************/
if (!dj_global) var dj_global = this;

dojo.reflection = {} ;
dojo.reflection.$unknownType = function(){ } ;
dojo.reflection.ParameterInfo = function(name, type){ 
	this.name = name ;
	this.type = (type) ? type : dojo.reflection.$unknownType ;
} ;
dojo.reflection.PropertyInfo = function(name, type) { 
	this.name = name ;
	this.type = (type) ? type : dojo.reflection.$unknownType ;
} ;
dojo.reflection.MethodInfo = function(name, fn){
	var parse = function(f) {
		var o = {} ; 
		var s = f.toString() ;
		var param = ((s.substring(s.indexOf('(')+1, s.indexOf(')'))).replace(/\s+/g, "")).split(",") ;
		o.parameters = [] ;
		for (var i = 0; i < param.length; i++) {
			o.parameters.push(new dojo.reflection.ParameterInfo(param[i])) ;
		}
		o.body = (s.substring(s.indexOf('{')+1, s.lastIndexOf('}'))).replace(/(^\s*)|(\s*$)/g, "") ;
		return o ;
	} ;

	var tmp = parse(fn) ;
	var p = tmp.parameters ;
	var body = tmp.body ;
	
	this.name = (name) ? name : "anonymous" ;
	this.getParameters = function(){ return p ; } ;
	this.getNullArgumentsObject = function() {
		var a = [] ;
		for (var i = 0; i < p.length; i++) a.push(null);
		return a ;
	} ;
	this.getBody = function() { return body ; } ;
	this.type = Function ;
	this.invoke = function(src, args){ return fn.apply(src, args) ; } ;
} ;

//	Static object that can activate instances of the passed type.
dojo.reflection.Activator = new (function(){
	this.createInstance = function(type, args) {
		switch (typeof(type)) {
			case "function" : { 
				var o = {} ;
				type.apply(o, args) ;
				return o ;
			} ;
			case "string" : {
				var o = {} ;
				(dojo.reflection.Reflector.getTypeFromString(type)).apply(o, args) ;
				return o ;
			} ;
		}
		throw new Error("dojo.reflection.Activator.createInstance(): no such type exists.");
	}
})() ;

dojo.reflection.Reflector = new (function(){
	this.getTypeFromString = function(s) {
		var parts = s.split("."), i = 0, obj = dj_global ; 
		do { obj = obj[parts[i++]] ; } while (i < parts.length && obj) ; 
		return (obj != dj_global) ? obj : null ;
	} ; 
	this.typeExists = function(s) {
		var parts = s.split("."), i = 0, obj = dj_global ; 
		do { obj = obj[parts[i++]] ; } while (i < parts.length && obj) ; 
		return (obj && obj != dj_global) ;
	}; 
	this.getFieldsFromType = function(s) { 
		var type = s ;
		if (typeof(s) == "string") {
			type = dojo.reflection.Reflector.getTypeFromString(s) ;
		}
		var nullArgs = (new dojo.reflection.MethodInfo(type)).getNullArgumentsObject() ;
		return dojo.reflection.Reflector.getFields(dojo.reflection.Activator.createInstance(s, nullArgs)) ;
	} ;
	this.getPropertiesFromType = function(s) { 
		var type = s ;
		if (typeof(s) == "string") {
			type = dojo.reflection.Reflector.getTypeFromString(s) ;
		}
		var nullArgs = (new dojo.reflection.MethodInfo(type)).getNullArgumentsObject() ;
		return dojo.reflection.Reflector.getProperties(dojo.reflection.Activator.createInstance(s, nullArgs)) ;
	} ;
	this.getMethodsFromType = function(s) { 
		var type = s ;
		if (typeof(s) == "string") {
			type = dojo.reflection.Reflector.getTypeFromString(s) ;
		}
		var nullArgs = (new dojo.reflection.MethodInfo(type)).getNullArgumentsObject() ;
		return dojo.reflection.Reflector.getMethods(dojo.reflection.Activator.createInstance(s, nullArgs)) ;
	} ;
	this.getType = function(o) { return o.constructor ; } ;
	this.getFields = function(obj) {
		var arr = [] ;
		for (var p in obj) { 
			if (dojo.reflection.Reflector.getType(obj[p]) != Function) 
				arr.push(new dojo.reflection.PropertyInfo(p, dojo.reflection.Reflector.getType(obj[p]))) ;
			else arr.push(new dojo.reflection.MethodInfo(p, obj[p])) ;
		}
		return arr ;
	} ;
	this.getProperties = function(obj) {
		var arr = [] ;
		var fi = dojo.reflection.Reflector.getFields(obj) ;
		for (var i = 0; i < fi.length; i++) if (dojo.reflection.Reflector.isInstanceOf(fi[i], dojo.reflection.PropertyInfo)) arr.push(fi[i]) ;
		return arr ;
	} ;
	this.getMethods = function(obj) {
		var arr = [] ;
		var fi = dojo.reflection.Reflector.getFields(obj) ;
		for (var i = 0; i < fi.length; i++) if (dojo.reflection.Reflector.isInstanceOf(fi[i], dojo.reflection.MethodInfo)) arr.push(fi[i]) ;
		return arr ;
	};
	this.implements = function(o, type) {
		if (dojo.reflection.Reflector.isSubTypeOf(o, type)) return false ;
		var f = dojo.reflection.Reflector.getFieldsFromType(type) ;
		for (var i = 0; i < f.length; i++) {
			if (typeof(o[(f[i].name)]) == "undefined") return false ;
		}
		return true ;
	} ;
	this.getBaseClass = function(o) {
		if (o.getType().prototype.prototype.constructor)
			return (o.getType()).prototype.prototype.constructor ;
		return Object ;
	} ;
	this.isInstanceOf = function(o, type) { return (dojo.reflection.Reflector.getType(o) == type) ; } ;
	this.isSubTypeOf = function(o, type) { return (o instanceof type) ; } ;
	this.isBaseTypeOf = function(o, type) { return (type instanceof o) ; } ;
})() ;
