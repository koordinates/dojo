dojo.provide("dojo.namespace");

dojo["namespace"] = {
	dojo: "dojo",
	namespaces: {},
	failed: {},
	loading: {},
	loaded: {},
	register: function(name, module, resolver /*optional*/, noOverride) {
		if((!noOverride)||(!this.namespaces[name])){
			this.namespaces[name] = new dojo["namespace"].Namespace(name, module, resolver);
		}
	},
	allow: function(name) {
		// summary: Return false if 'name' is filtered by configuration or has failed to load, true otherwise
		if(this.failed[name]){return false;} // if this namespace is known unloadable
		// if the user has specified that this namespace be disallowed, return false.
		var excl = djConfig.excludeNamespace;
		if((excl)&&(dojo.lang.inArray(excl, name))){return false;}
		// If the namespace is "dojo", or the user has not specified allowed namespaces return true.
		// Otherwise, if the user has specifically allowed this namespace, return true, otherwise false.
		var incl = djConfig.includeNamespace;
		return((name==this.dojo)||(!incl)||(dojo.lang.inArray(incl, name)));
	},
	get: function(name){
		// summary
		//  Return Namespace object registered to 'name', if any
		return this.namespaces[name];
	},
	require: function(name){
		// summary
  	//  Try to ensure that 'name' is registered by loading a namespace manifest
		var ns = this.namespaces[name];
		if((ns)&&(this.loaded[name])){return ns;}
		if(!this.allow(name)){return false;}
 		if(this.loading[name]){
			// FIXME: do we really ever have re-entrancy situation? this would appear to be really bad
			// original code did not throw an exception, although that seems the only course
			// adding debug output here to track if this occurs.
			dojo.debug('dojo.namespace.require: re-entrant request to load namespace "' + name + '" must fail.'); 
			return false;
		}
		// workaround so we don't break the build system
		var req = dojo.require;
		this.loading[name] = true;
		try {
			//dojo namespace file is always in the Dojo namespace folder, not a custom namespace folder
			if(name==this.dojo){
				req("dojo.namespaces.dojo");
			}else{
				// if no registered module prefix, use ../<name> by convention
				if(!dojo.hostenv.moduleHasPrefix(name)){
					dojo.registerModulePath(name, "../" + name);
				}
				req([name, 'manifest'].join('.'), false, true);
			}
			if(!this.namespaces[name]){
				this.failed[name] = true; //only look for a namespace once
			}
		}finally{
			this.loading[name]=false;
		}
		return this.namespaces[name];
	}
}

dojo.registerNamespace = function(/*String*/name, /*String*/module, /*Function?*/resolver){
	// summary: maps a module name to a namespace for widgets, and optionally maps widget names to modules for auto-loading
	// description: An unregistered namespace is mapped to an eponymous module.
	//	For example, namespace acme is mapped to module acme, and widgets are
	//	assumed to belong to acme.widget. If you want to use a different widget
	//	module, use dojo.registerNamespace.
	dojo["namespace"].register.apply(dojo["namespace"], arguments);
}

dojo.registerNamespaceResolver = function(/*String*/name, /*Function*/resolver){
	// summary: a resolver function maps widget names to modules, so the
	//	widget manager can auto-load needed widget implementations
	// description: The resolver provides information to allow Dojo
	//	to load widget modules on demand. When a widget is created,
	//	a namespace resolver can tell Dojo what module to require
	//	to ensure that the widget implementation code is loaded.
	//
	// The input string in the name argument will always be lower-case.
	//
	//  dojo.registerNamespaceResolver("acme",
	//    function(name){ 
	//      return "acme.widget."+dojo.string.capitalize(name);
	//    }
	//  );
	var n = dojo["namespace"].namespaces[name];
	if(n){
		n.resolver = resolver;
	}
}

dojo.registerNamespaceManifest = function(module, path, name, widgetModule, resolver /*optional*/){
	dojo.registerModulePath(name, path);
	dojo.registerNamespace(name, widgetModule, resolver);
}

dojo.defineNamespace = function(objRoot, location, nsPrefix, resolver /*optional*/, widgetPackage /*optional*/){
	dojo.deprecated("dojo.defineNamespace", " is replaced by other systems. See the Dojo Wiki [http://dojo.jot.com/WikiHome/Modules & Namespaces].", "0.5");
	dojo.registerNamespaceManifest(objRoot, location, nsPrefix, widgetPackage, resolver);
}

// namespace bookkeeping object

dojo["namespace"].Namespace = function(name, module, resolver){
	this.name = name;
	this.module = module;
	this.resolver = resolver;
}

dojo["namespace"].Namespace.prototype._loaded = {};
dojo["namespace"].Namespace.prototype._failed = {};

// map component with 'name' and 'domain' to a module via 
// namespace resolver, if specified
dojo["namespace"].Namespace.prototype.resolve = function(name, domain, omit_module_check){
	if(!this.resolver){return false;}
	var fullName = this.resolver(name,domain);
	//only load a widget once. This is a quicker check than dojo.require does
	if((fullName)&&(!this._loaded[fullName])&&(!this._failed[fullName])){
		//workaround so we don't break the build system
		var req = dojo.require;
		req(fullName, false, true); //omit the module check, we'll do it ourselves.
		if(dojo.hostenv.findModule(fullName, false)){
			this._loaded[fullName] = true;
		}else{
			if(!dj_undef(omit_module_check) & !omit_module_check){dojo.raise("dojo.namespace.Namespace.resolve: module '" + fullName + "' not found after loading via namespace '" + this.name + "'");} 
			this._failed[fullName] = true;
		}
	}
	return Boolean(this._loaded[fullName]);
}

dojo["namespace"].Namespace.prototype.getModule = function(widgetName){
	if (!this.module) {return null;}
	if (!this.resolver){return null;}
	var fullName = this.resolver(widgetName);
	
	if(!fullName){
		if(dojo.lang.isArray(this.module)){
			return this.module[0];
		} else {
			return this.module;
		}
	}
	
	if(dojo.lang.isArray(this.module)){
		var modpos=fullName.lastIndexOf(".");
		if(modpos > -1){
			return fullName.substr(0, modpos);
		} else { 
			return this.module[0]; 
		}
	} else {
		return this.module;
	}
}

// NOTE: rather put this in dojo.widget.Widget, but that fubars debugAtAllCosts
dojo.registerNamespace("dojo", ["dojo.widget","dojo.widget.validate"]);