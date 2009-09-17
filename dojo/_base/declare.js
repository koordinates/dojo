dojo.provide("dojo._base.declare");

dojo.require("dojo._base.lang");
dojo.require("dojo._base.array");

// a drop-in replacement for dojo.declare() with fixed bugs and enhancements

(function(){
	var d = dojo, op = Object.prototype, isF = d.isFunction, each = d.forEach, xtor = function(){}, counter = 0;

	function err(msg){ throw new Error("declare: " + msg); }

	// C3 Method Resolution Order (see http://www.python.org/download/releases/2.3/mro/)
	function c3mro(bases){
		var result = [0], l = bases.length, classes = new Array(l),
			i = 0, j, m, m2, c, cls, lin, proto, name, t;

		// initialize
		for(; i < l; ++i){
			c = bases[i];
			if(!c){
				err("mixin #" + i + " is null");
			}
			lin = c._meta && c._meta.bases || [c];
			m = {};
			for(j = 0, m2 = lin.length; j < m2; ++j){
				cls = lin[j];
				proto = cls.prototype;
				name = proto.hasOwnProperty("declaredClass") && proto.declaredClass;
				if(!name){
					name = proto.declaredClass = "dojoUniqClassName_" + (counter++);
				}
				m[name] = cls;
			}
			classes[i] = {
				idx: 0,
				map: m,
				lin: d.map(lin, function(c){ return c.prototype.declaredClass; })
			};
		}

		// C3 MRO algorithm
		while(l){
			if(l == 1){
				// just one chain of inheritance => copy it directly
				c = classes[0];
				m = c.map;
				return result.concat(d.map(c.lin.slice(c.idx), function(c){ return m[c]; }));
			}
			for(i = l; i--;){
				m = classes[i];
				c = m.lin[m.idx];
				if(c){
					// check if it is in the tail of any classes
					t = 1;
					for(j = l; j--;){
						m2 = classes[j];
						if(i != j && (c in m2.map)){
							if(c == m2.lin[m2.idx]){
								++t;
							}else{
								// there is a class in the tail => aborting
								break;
							}
						}
					}
					if(j < 0){
						result.push(m.map[c]);
						// remove c from all heads
						for(j = l; j--;){
							m = classes[j];
							if(c == m.lin[m.idx]){
								++m.idx;
								if(!--t){
									// all proper heads are deleted => stop
									break;
								}
							}
						}
						break;
					}
				}else{
					classes.splice(i, 1);
					--l
				}
			}
			if(i < 0 && l > 0){
				err("can't build consistent linearization");
			}
		}

		return result;
	}

	d.makeDeclare = function(ctorSpecial, chains){
		chains = chains || {};

		function buildMethodList(bases, name){
			var methods = [], i = 0, l = bases.length, h, b;
			for(;i < l; ++i){
				b = bases[i];
				h = b._meta;
				if(h){
					// this is a class created with dojo.declare()
					h = h.hidden;
					if(h.hasOwnProperty(name)){
						// if this class has the method we need => add it
						methods.push(h[name]);
					}
				}else{
					// this is a native class
					if(name == "constructor"){
						// constructor => add it
						methods.push(b);
					}else{
						h = b.prototype[name];
						if(h && h !== op[name]){
							// if this class has the method we need,
							// and it is not default one => add it
							methods.push(h);
						}
					}
				}
			}
			// the last method comes from Object
			if(name != "constructor"){
				// we already handled the native constructor above => skip it
				h = op[name];
				if(h){
					// there is a native method with such name => add it
					methods.push(h);
				}
			}
			// reverse the chain for "after" methods
			return chains[name] === "after" ? methods.reverse() : methods;
		}

		function findInherited(self, caller, name){
			var c = self.constructor, m = c._meta, cache = c._cache,
				i, l, f, n, ch, x;

			if(!name){
				n = caller.nom;
				if(!n){
					err("can't deduce a name to call inherited()");
				}
				name = n;
			}
			ch = cache.hasOwnProperty(name) && cache[name];

			// get the cached method list
			if(!ch){
				if(name == "constructor" && ctorSpecial){
					err("calling constructor as inherited");
				}
				if(chains.hasOwnProperty(name)){
					err("calling chained method as inherited: " + name);
				}
				ch = cache[name] = buildMethodList(m.bases, name);
			}

			// simple caching
			x = self._inherited;
			if(x.name !== name || ch[x.pos] !== caller){
				// find the caller
				for(i = 0, l = ch.length; i < l && ch[i] !== caller; ++i);
				if(i == l){
					if(self[name] === caller){
						i = -1;
					}else{
						err("can't find the inherited caller");
					}
				}
				self._inherited = x = {name: name, pos: i};
			}

			return ch[++x.pos];
		}
		
		function getInherited(args, a){
			var name;
			// crack arguments
			if(typeof args == "string"){
				name = args;
				args = a;
			}
			return findInherited(this, args.callee, name);
		}
		
		function inherited(args, a, f){
			var name;
			// crack arguments
			if(typeof args == "string"){
				name = args;
				args = a;
				a = f;
			}
			f = findInherited(this, args.callee, name);
			// do not call the inherited at the end of the chain
			return f ? f.apply(this, a || args) : undefined;
		}

		return function(className, superclass, props){
			var mixins, proto, i, l, t, ctor, ctorChain, name, bases;

			// crack parameters
			if(typeof className != "string"){
				props = superclass;
				superclass = className;
				className = "";
			}
			props = props || {};

			// build a prototype
			t = 0; // flag: the superclass chain is not handled yet
			if(d.isArray(superclass)){
				// suspected multiple inheritance
				if(superclass.length > 1){
					// we have several base classes => C3 MRO
					bases = c3mro(superclass);
					// build a chain
					l = bases.length - 1;
					superclass = bases[l];
					for(i = l - 1;;){
						t = bases[i--];
						// delegation
						xtor.prototype = superclass.prototype;
						proto = new xtor;
						if(!t){
							// stop if nothing to add (the last base)
							break;
						}
						// mix in properties
						d._mixin(proto, t.prototype);
						// chain in new constructor
						ctor = function(){};
						ctor.superclass = superclass;
						ctor.prototype = proto;
						superclass = proto.constructor = ctor;
					}
					t = 1; // flag: the superclass chain is handled
				}else{
					// false alarm: we have just one (or zero?) base class
					superclass = superclass[0];
				}
			}
			if(!t){
				// the supeclass chain is not handled yet
				bases = [0];
				if(superclass){
					// we have a superclass
					t = superclass._meta;
					if(t){
						// this class was made by dojo.declare() => add its bases
						bases = bases.concat(t.bases);
					}else{
						// this is a native class => add it
						bases.push(superclass);
					}
					// delegation
					xtor.prototype = superclass.prototype;
					proto = new xtor;
				}else{
					// no superclass
					proto = {};
				}
			}
			xtor.prototype = 0;	// cleanup

			// add metadata for incoming functions
			for(name in props){
				t = props[name];
				if(t !== op[name] && isF(t)){
					// non-trivial function method => attach its name
					t.nom = name;
				}
			}
			// process unenumerable methods on IE
			each(d._extraNames, function(name, t){
				t = props[name];
				if(t !== op[name] && isF(t)){
					// non-trivial function method => attach its name
					t.nom = name;
				}
			});

			// add props
			d._mixin(proto, props);

			// build ctor
			if(ctorSpecial){
				// compatibility mode with the legacy dojo.declare()
				ctor = function(){
					var a = arguments, args = a, a0 = a[0], f, i, l, h, preArgs;
					this._inherited = {};
					// perform the shaman's rituals of the original dojo.declare()
					// 1) call two types of the preamble
					if(a0 && a0.preamble || this.preamble){
						// full blown ritual
						preArgs = new Array(bases.length);
						// prepare parameters
						preArgs[0] = a;
						for(i = 0, l = bases.length;;){
							// process the preamble of the 1st argument
							a0 = a[0];
							if(a0){
								f = a0.preamble;
								if(f){
									a = f.apply(this, a) || a;
								}

							}
							// process the preamble of this class
							f = bases[i]._meta.hidden.preamble;
							if(f){
								a = f.apply(this, a) || a;
							}
							// one pecularity of the preamble:
							// it is called if it is not needed,
							// e.g., there is no constructor to call
							// let's watch for the last constructor
							// (see ticket #9795)
							if(++i == l){
								break;
							}
							preArgs[i] = a;
						}
						// call all unique constructors using prepared arguments
						for(--i; i >= 0; --i){
							h = bases[i]._meta.hidden;
							if(h.hasOwnProperty("constructor")){
								h.constructor.apply(this, preArgs[i]);
							}
						}
					}else{
						// reduced ritual
						// 2) call the constructor with the same parameters
						for(i = ctorChain.length - 1; i >= 0; --i){
							ctorChain[i].apply(this, a);
						}
					}
					// 3) continue the original ritual: call the postscript
					f = this.postscript;
					if(f){
						f.apply(this, args);
					}
				};
			}else{
				// new construction (no preabmle, chaining is allowed)
				if(chains.hasOwnProperty("constructor")){
					// chained constructor
					ctor = function(){
						var a = arguments, f, i, l;
						this._inherited = {};
						// perform the shaman's rituals of the original dojo.declare()
						// 1) do not call the preamble
						// 2) call the constructor with the same parameters
						for(i = 0, l = ctorChain.length; i < l; ++i){
							ctorChain[i].apply(this, a)
						}
						// 3) call the postscript
						f = this.postscript;
						if(f){
							f.apply(this, args);
						}
					};
				}else{
					// plain vanilla constructor (can use inherited() to call its base constructor)
					ctor = function(){
						var a = arguments, f;
						this._inherited = {};
						// perform the shaman's rituals of the original dojo.declare()
						// 1) do not call the preamble
						// 2) call our original constructor
						f = ctorChain[0];
						if(f){
							f.apply(this, a);
						}
						// 3) call the postscript
						f = this.postscript;
						if(f){
							f.apply(this, args);
						}
					};
				}
			}

			// build metadata on the constructor
			bases[0] = ctor;
			ctor._meta  = {bases: bases, hidden: props};
			ctor._cache = {};
			ctor.superclass = superclass && superclass.prototype;

			proto.constructor = ctor;
			ctor.prototype = proto;

			// add "standard" methods to the ptototype
			proto.getInherited = getInherited;
			proto.inherited = inherited;
			proto.isInstanceOf = function(cls){
				for(var i = 0, l = bases.length; i < l; ++i){
					if(bases[i] === cls){
						return true;
					}
				}
				return this instanceof cls;
			};

			// process named classes
			if(className){
				proto.declaredClass = className;
				d.setObject(className, ctor);
			}

			// build chains and add them to the prototype
			function bindChain(name){
				if(typeof chains[name] == "string")
					var f = proto[name] = function(){
						var t = buildMethodList(bases, name), l = t.length,
							f = function(){ for(var i = 0; i < l; ++i){ t[i].apply(this, arguments); } };
						f.nom = name;
						// memoization
						ctor.prototype[name] = f;
						f.apply(this, arguments);
					};
					f.nom = name;
			}
			for(name in chains){
				bindChain(name);
			}
			//each(d._extraNames, bindChain); // no need to chain functions

			// get the constructor chain (used directly in constructors)
			ctorChain = buildMethodList(bases, "constructor");
			if(!ctorSpecial && !chains.hasOwnProperty(name)){
				ctor._cache.constructor = ctorChain;
			}

			return ctor;	// Function
		};
	};

	d.declare = d.makeDeclare(true);

	/*=====
	dojo.makeDeclare = function(ctorSpecial, chains){
		//	summary:
		//		Create a specialized version of dojo.declare
		//	ctorSpecial: Boolean
		//		If true, the classic dojo.declare() compatibility mode is enabled.
		//	chains: Object?
		//		The optional dictionary of chained method names. Allowed values
		//		can be strings "before" or "after". They specify how to chain
		//		methods.
		//	returns:
		//		New declare function.
		//	description:
		//		Create a specialized version of dojo.declare with support for the
		//		legacy compatibility mode, method chaining, and anonymous classes
		//		(see dojo.declare for more details).
		//
		//		If "ctorSpecial" is true, the resulting function works as the
		//		classic dojo.declare. In this mode, all constructors are chained
		//		using the "after" rule, preamble() method is going to be called
		//		like in the classic dojo.declare(), and user cannot use
		//		"this.inherited()" in the constructor. Otherwise, if
		//		"constructor" appears in "chains", it will be chained as
		//		specified, no magic preamble() support, and if "constructor" is
		//		not mentioned in chains, it is treated as a regular method and
		//		user can call "this.inherited()" to chain constructors manually.
		//
		//		"chains" is a literal object, which looks like this:
		//		|	{
		//		|		method1: "before",
		//		|		method2: "after"
		//		|	}
		//
		//		"before" means that a method is called before its base methods.
		//		"after" means that a method is called after its base methods.
		//		In both cases methods are called with the same arguments.
		//		Usually constructors are chained as "after" and destructors are
		//		chained as "before". Note that chaining assumes that chained
		//		methods do not return any value: any returned value will be
		//		discarded.
		//
		//	example:
		//	|	var decl = dojo.makeDeclare(false, {
		//	|		constructor: "after",
		//	|		destroy:     "before"
		//	|	});
		//	|	var A = decl(null, {
		//	|		constructor: function(){ console.log("constructing A"); },
		//	|		destroy:     function(){ console.log("destroying A"); }
		//	|	});
		//	|	var B = decl(A, {
		//	|		constructor: function(){ console.log("constructing B"); },
		//	|		destroy:     function(){ console.log("destroying B"); }
		//	|	});
		//	|	var C = decl(B, {
		//	|		constructor: function(){ console.log("constructing C"); },
		//	|		destroy:     function(){ console.log("destroying C"); }
		//	|	});
		//	|	new C().destroy();
		//	|	// will print:
		//	|	// constructing A
		//	|	// constructing B
		//	|	// constructing C
		//	|	// destroying C
		//	|	// destroying B
		//	|	// destroying A
		return new Function(); // Function
	};
	=====*/

	/*=====
	dojo.declare = function(className, superclass, props){
		//	summary:
		//		Create a feature-rich constructor from compact notation.
		//	className: String?:
		//		The optional name of the constructor (loosely, a "class")
		//		stored in the "declaredClass" property in the created prototype.
		//		It will be used as a global name for a created constructor.
		//	superclass: Function|Function[]:
		//		May be null, a Function, or an Array of Functions. This argument
		//		specifies a list of bases (the left-most one is the most deepest
		//		base).
		//	props: Object:
		//		An object whose properties are copied to the created prototype.
		//		Add an instance-initialization function by making it a property
		//		named "constructor".
		//	returns:
		//		New constructor function.
		//	description:
		//		Create a constructor using a compact notation for inheritance and
		//		prototype extension.
		//
		//		Mixin ancestors provide a type of multiple inheritance.
		//		Prototypes of mixin ancestors are copied to the new class:
		//		changes to mixin prototypes will not affect classes to which
		//		they have been mixed in.
		//
		//		Ancestors can be compound classes created by this version of
		//		dojo.declare. In complex cases all base classes are going to be
		//		linearized according to C3 MRO algorithm
		//		(see http://www.python.org/download/releases/2.3/mro/ for more
		//		details).
		//
		//		"className" is cached in "declaredClass" property of the new class,
		//		if it was supplied. The immediate super class will be cached in
		//		"superclass" property of the new class.
		//
		//		Methods in "props" will be copied and modified: "nom" property
		//		(the declared name of the method) will be added to all copied
		//		functions to help identify them for the internal machinery. Be
		//		very careful, while reusing methods: if you use the same
		//		function under different names, it can produce errors in some
		//		cases.
		//
		//		It is possible to use constructors created "manually" (without
		//		dojo.declare) as bases. They will be called as usual during the
		//		creation of an instance, their methods will be chained, and even
		//		called by "this.inherited()".
		//
		//	example:
		//	|	dojo.declare("my.classes.bar", my.classes.foo, {
		//	|		// properties to be added to the class prototype
		//	|		someValue: 2,
		//	|		// initialization function
		//	|		constructor: function(){
		//	|			this.myComplicatedObject = new ReallyComplicatedObject();
		//	|		},
		//	|		// other functions
		//	|		someMethod: function(){
		//	|			doStuff();
		//	|		}
		//	|	});
		//
		//	example:
		//	|	var MyBase = dojo.declare(null, {
		//	|		// constructor, properties, and methods go here
		//	|		// ...
		//	|	});
		//	|	var MyClass1 = dojo.declare(MyBase, {
		//	|		// constructor, properties, and methods go here
		//	|		// ...
		//	|	});
		//	|	var MyClass2 = dojo.declare(MyBase, {
		//	|		// constructor, properties, and methods go here
		//	|		// ...
		//	|	});
		//	|	var MyDiamond = dojo.declare([MyClass1, MyClass2], {
		//	|		// constructor, properties, and methods go here
		//	|		// ...
		//	|	});
		//
		//	example:
		//	|	var F = function(){ console.log("raw constructor"); };
		//	|	F.prototype.method = function(){
		//	|		console.log("raw method");
		//	|	};
		//	|	var A = dojo.declare(F, {
		//	|		constructor: function(){
		//	|			console.log("A.constructor");
		//	|		},
		//	|		method: function(){
		//	|			console.log("before calling F.method...");
		//	|			this.inherited(arguments);
		//	|			console.log("...back in A");
		//	|		}
		//	|	});
		//	|	new A().method();
		//	|	// will print:
		//	|	// raw constructor
		//	|	// A.constructor
		//	|	// before calling F.method...
		//	|	// raw method
		//	|	// ...back in A
		return new Function(); // Function
	};
	=====*/

	/*=====
	Object.inherited = function(name, args, newArgs){
		//	summary:
		//		Calls a super method.
		//	name: String?
		//		The optional method name. Should be the same as the caller's
		//		name. Usually "name" is specified in complex dynamic cases, when
		//		the calling method was dynamically added, undecorated by
		//		dojo.declare, and it cannot be determined.
		//	args: Arguments
		//		The caller supply this argument, which should be the original
		//		"arguments".
		//	newArgs: Array?
		//		If supplied, it will be used to call a super method. Otherwise
		//		"args" will be used.
		//	returns:
		//		Whatever is returned by a super method.
		//	description:
		//		This method is used inside method of classes produced with
		//		dojo.declare to call a super method (next in the chain). It is
		//		used for manually controlled chaining. Consider using the regular
		//		chaining, because it is faster. Use "this.inherited()" only in
		//		complex cases.
		//
		//		This method cannot me called from automatically chained
		//		constructors including the case of a special (legacy)
		//		constructor chaining. It cannot be called from chained methods.
		//
		//		If "this.inherited()" cannot find the next-in-chain method, it
		//		does nothing and returns "undefined". The last method in chain
		//		can be a default method implemented in Object, which will be
		//		called last.
		//
		//		If "name" is specified, it is assumed that the method that
		//		received "args" is the parent method for this call. It is looked
		//		up in the chain list and if it is found the next-in-chain method
		//		is called. If it is not found, the first-in-chain method is
		//		called.
		//
		//		If "name" is not specified, it will be derived from the calling
		//		method (using a methoid property "nom").
		//
		//	example:
		//	|	var B = dojo.declare(A, {
		//	|		method1: function(a, b, c){
		//	|			this.inherited(arguments);
		//	|		},
		//	|		method2: function(a, b){
		//	|			return this.inherited(arguments, [a + b]);
		//	|		}
		//	|	});
		//	|	// next method is not in the chain list because it is added
		//	|	// manually after the class was created.
		//	|	B.prototype.method3 = function(){
		//	|		console.log("This is a dynamically-added method.");
		//	|		this.inherited("method3", arguments);
		//	|	};
		return	{};	// Object
	}
	=====*/

	/*=====
	Object.getInherited = function(name, args){
		//	summary:
		//		Returns a super method.
		//	name: String?
		//		The optional method name. Should be the same as the caller's
		//		name. Usually "name" is specified in complex dynamic cases, when
		//		the calling method was dynamically added, undecorated by
		//		dojo.declare, and it cannot be determined.
		//	args: Arguments
		//		The caller supply this argument, which should be the original
		//		"arguments".
		//	returns:
		//		Returns a super method (Function) or "undefined".
		//	description:
		//		This method is complimentary to "this.inherited()". It uses the
		//		same algorithm but instead of executing a super method, it
		//		returns it, or "undefined" if not found.
		//
		//	example:
		//	|	var B = dojo.declare(A, {
		//	|		method: function(a, b){
		//	|			var super = this.getInherited(arguments);
		//	|			// ...
		//	|			if(!super){
		//	|				console.log("there is no super method");
		//	|				return 0;
		//	|			}
		//	|			return super.apply(this, arguments);
		//	|		}
		//	|	});
		return	{};	// Object
	}
	=====*/

	/*=====
	Object.isInstanceOf = function(cls){
		//	summary:
		//		Checks the inheritance cahin to see if it is inherited from this
		//		class.
		//	cls: Function
		//		Class constructor.
		//	returns:
		//		"true", if this object is inherited from this class, "false"
		//		otherwise.
		//	description:
		//		This method is used with instances of classes produced with
		//		dojo.declare to determine of they support a certain interface or
		//		not. It models "instanceof" operator.
		//
		//	example:
		//	|	var A = dojo.declare(null, {
		//	|		// constructor, properties, and methods go here
		//	|		// ...
		//	|	});
		//	|	var B = dojo.declare(null, {
		//	|		// constructor, properties, and methods go here
		//	|		// ...
		//	|	});
		//	|	var C = dojo.declare([A, B], {
		//	|		// constructor, properties, and methods go here
		//	|		// ...
		//	|	});
		//	|	var D = dojo.declare(A, {
		//	|		// constructor, properties, and methods go here
		//	|		// ...
		//	|	});
		//	|
		//	|	var a = new A(), b = new B(), c = new C(), d = new D();
		//	|
		//	|	console.log(a.isInstanceOf(A)); // true
		//	|	console.log(b.isInstanceOf(A)); // false
		//	|	console.log(c.isInstanceOf(A)); // true
		//	|	console.log(d.isInstanceOf(A)); // true
		//	|
		//	|	console.log(a.isInstanceOf(B)); // false
		//	|	console.log(b.isInstanceOf(B)); // true
		//	|	console.log(c.isInstanceOf(B)); // true
		//	|	console.log(d.isInstanceOf(B)); // false
		//	|
		//	|	console.log(a.isInstanceOf(C)); // false
		//	|	console.log(b.isInstanceOf(C)); // false
		//	|	console.log(c.isInstanceOf(C)); // true
		//	|	console.log(d.isInstanceOf(C)); // false
		//	|
		//	|	console.log(a.isInstanceOf(D)); // false
		//	|	console.log(b.isInstanceOf(D)); // false
		//	|	console.log(c.isInstanceOf(D)); // false
		//	|	console.log(d.isInstanceOf(D)); // true
		return	{};	// Object
	}
	=====*/
})();
