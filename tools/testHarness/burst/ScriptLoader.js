/**
* @file ScriptLoader.js
* Defines burst.ScriptLoader which loads scripts and manages dependencies.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

// last call before we replace it with the real one.
bu_loaded('burst.ScriptLoader', ['burst.runtime.AbstractRuntime']);

//=java package burst;

/** Class to represent each loaded module, managed by ScriptLoader . You generally never want to use this directly. */
//=java public class Script {
/** Construct a Script object given what we know. Instantiated at loading or requiring time, whichever mentions modulename first. */
//=java protected Script(String modulename, String state, Array load_deps, Array call_deps, Object handler) {}
//=java }
burst.Script = function(modulename, state, load_deps, call_deps, handler) {
  this.modulename_ = modulename;
  this.state_ = state;
  this.loaded_cb_ = null;
  this.load_deps_ = typeof load_deps == 'undefined' ? null : load_deps;
  this.call_deps_ = typeof call_deps == 'undefined' ? null : call_deps;
  this.nremaining_ = 0; // number of remaining event handlers to be called
  if (typeof handler == 'undefined') this.handler_ = null;
  else bu_set_handler(this, handler);
}

/**
Class to manage dependencies and loading of script files.

Currently, in practice this is a singleton kept in bu_ScriptLoader.

If you just want to load and evaluate some random file (that is, the
equivalent of a Perl 'do'), do not use this class.
There are other methods for that, such as those of burst.runtime.AbstractRuntime .
Instead this is intended for the equvalent of a Perl 'require'.

<i>NOTE: the astute examiner will realize that in the simple case, all the complexity
here accomplishes precisely nothing, because the single library file is already designed
to contain the concatenated source script files in the correct order.</i>

<h3>Module Names</h3>

Overall, our approach is more similar to Perl 'use'
than it is to Java 'import'. This stands to reason since ECMAScript, like Perl,
is interpreted. A Perl 'use' will use some documented
transformations on its argument to find a file, and will then load it at most once.
Loading the file may have some side effects. In contrast, a Java 'import' is a
namespace operation which applies only at compilation time.

Like both Java and Perl, we assume a certain convention to be followed
which relates a namespace hierarchy with a source directory hierarchy, and
like both, there are circumstances in which this convention can be violated
without penalty.

Dependencies are declared and managed at the file level, not the namespace or
object level.
Following Perl, for purposes of dependency tracking, we introduce
the concept of "module name" for identification. 
For convenience, a module name may be specified in any of these ways:
<pre>
  Module Name      File
  'Foo'            Foo.js
  'foo.Bar'        foo/Bar.js
  'foo/Bar.js'     foo/Bar.js
</pre>

The rules are as follows:
- If a module name contains a slash or ends in ".js" it is considered to be
  a file name and is not changed.
- Otherwise, any "." is changed to "/", and a ".js" is appended to find the external file.

<h3>ScriptLoader and Script</h3>

Scripts are loaded by a ScriptLoader instance which has this state:
- the base url that script files are resolved against
- the set of scripts already loaded

Note that while in the future a single ScriptLoader may support multiple base urls
to search through (ala Java ClassLoader and CLASSPATH), for now each ScriptLoader
has just a single base url.

The set of scripts loaded is indexed by relative file name, so that irrelevant
differences in module naming are ignored.

Because of the current restriction that each ScriptLoader has a different base url,
in effect each instance represents a different "library", insofar as a "library" means
a set of scripts available under a single directory, versus a single file.

There is a builtin instance of ScriptLoader, available from the static
method <var>burst.ScriptLoader.getScriptLoader</var>, which is used for managing the 
scripts in the library it itself came from. It is in effect the bootstrap loader.

There are global convenience functions <var>bu_require</var> and <var>bu_loaded</var>
which are used within the library to manage intra-library dependencies.

The scripts in a ScriptLoader which loaded (or not yet loaded, but indicated by a dependency)
are instances of <var>burst.Script</var>.

At this time, we do not have support for automatically choosing a particular ScriptLoader
instance based on namespace/package, nor for iterating through all ScriptLoader instances.
If you want to have additional ScriptLoader instances besides the builtin bootstrap one,
you have to create it yourself and keep a handle to it.

At this time, we require that a script that is loaded must explicitly call into ScriptLoader
to indicate that it is loaded (we do not simply assume that because we invoked a load
function that it succeeded).

<h3>Kinds of Dependencies</h3>

There are several kinds of dependencies:
- a "load dependency" is one where script B cannot be loaded until script A is loaded.
- a "call dependency" is one where script B may be loaded, but functions it defines may not be called until script A is loaded.
- an "event dependency" is one where a script cannot be considered ready until some external event has occurred.

In ECMAScript, when a script is loaded, the runtime inseparably carries out
both a parse and execute phase (where all statements in the file are run).
Therefore, any functions which will be called (perhaps indirectly) at load time must already
have been loaded.
On the other hand, if a script B just defines a function which calls functionality in some other
script A, but does not cause that function to be called at load time, then it doesn't matter
whether script A has been loaded yet: it only matters that the script is ready later
when the function is called.

An event dependency is one where something from the runtime must happen (versus just a dependency on some other script).
For example, the internal widget manager may need to parse the DOM
for inline constructors, after the DOM document has had its "onload" event.
Another example event dependency is that after the configuration object is available
(which may not be until an html "head" section is completed), a script may
want to do some initialization.

To support these requirements, every Script instance is in one of these states:
<pre>
 'loading'        initial state, learned from a module asking for load deps
 'requested'      initial state, learned from a dependency
 'loaded'         file has loaded, but not all call dependencies are 'loaded'
 'callable'       all call dependencies are 'loaded', but event dependencies haven't completed
 'failed'         a final state: a load operation failed, or some event handler threw an exception
 'ready'          a final state: after 'loaded', all event dependencies have completed
</pre>

Note that if there is a loop in declared load dependencies, then a deadlock will
ensue where neither of two scripts can enter the 'loadable' state, 
because they both have a load dependency on another script not in the 'loaded' state.

Note that load dependencies only require that the other script be in the 'loaded' state,
not that they be in the 'ready' state. So it is still the case that a script author
must carefully consider what happens at startup time. (Note that we do things this
way so that script dependencies can be resolved entirely within a browser page "head" section
if desired.)

When a script is loaded, it can register a handler for certain event dependencies.
A script need not provide a handler object, nor define all methods in the handler object.
This handler object may define any of these methods with one of these names:
<pre>
  onCallDeps           called on a script in 'loaded' state after its call deps are loaded, before moving to state 'callable'
  onConfig             called when the global config object is ready
  onConfigDone         called right after all 'onConfig' handlers have been called
  onDocumentLoad       (DOM environment only) called after document 'onload' 
  onDocumentLoadDone   (DOM environment only) called after all 'onDocumentLoad' handlers
</pre>
Those methods are generally called in the order indicated above, if multiple
handler methods exist.

When all of a script event handler's methods are called (with the exception of 
onDocumentLoad when there is no document), the script instance is put in the 'ready' state.
When not in a browser environment, any "onDocumentLoad*" methods are never called,
and have no bearing on a transition to 'ready'.

Except for the doubled event distinction (with and without "Done"), there is no application
control over the order in which multiple Script instances subscribed to the same event
will get executed.

Note that "onCallDeps" is different from the others, in that it is an event particular
to the Script instance. The other events are global events which happen only once.

Note that the events are "queued" for delivery to every Script, even future Scripts,
so that a all Script instances, regardless of when created, will have their onConfig*
and onDocumentLoad* handler methods called (if any), regardless of whether the original
event actually fired prior to their instantiation.
Furthermore, a Script instance will not have these methods called until it enters
the 'callable' state.

Note that at least in the case of onDocumentLoad, a script could register an event
handler through other means (e.g. register for document onload directly using the DOM API).
This ScriptLoader mechanism differs from other event notification mechanisms an author
might choose in that:
- the integrated state tracking associated with handler completion may be useful in debugging startup sequences
- the 'onCallDeps' event is not a global event; it is particular to each Script instance
- the 'onConfig*' and 'onDocumentLoad*' events are delivered to a Script instance regardless of when instantiated

Each ScriptLoader instance takes care of the event dependencies for its own Script instances.

<h3>Package Initialization</h3>

<div style="color: red"><b>NOTE: This feature is not implemented.</b></div>
 
In any directory "foo", a script file "foo/foo_first.js" will be loaded exactly once
by a ScriptLoader prior to any other script being loaded from that same directory.

This is a convenience so that if there is some common code that must be run prior
to any of the scripts in the directory, it can be done just in that one file, and
the other scripts need not declare it as an explicit dependency.

This is also used in the library to ensure that runtime workarounds (such as 
supplying a definition for Array.splice) are available prior to any other script
being loaded, without it having to worry about it.

That initialization script may itself have its own dependencies: when loaded,
it may call back into the ScriptLoader, indicating other required modules.

<h3>Checking of Script states</h3>

Before firing onDocumentLoad, a ScriptLoader instance will sanity check that all its Script
instances have reached the 'callable' state. If not, it will throw an exception. 

An application can cause the same checking to happen at any time by calling
<var>checkScripts</var>.


<h3>Disabled Library</h3>

If for some reason the application has chosen to load the ScriptLoader functionality yet
disable it (in global config), then the ScriptLoader will load scripts but will not call
their event handlers.


<h3>Error Handling</h3>

If a script file load fails or an event handler throws an exception, an exception is
thrown to the user library. Generally this should be considered fatal. If an application
chooses to catch this exception, at this time we provide no guarantees about what will
happen subsequently.
It may for example be the case that all future calls to the ScriptLoader instance will
also throw an exception.


@todo Support for module version numbers (declare and require)
*/
//=java public class ScriptLoader {

/**
* Constructor.
*
* If url is an absolute file or URI, then it is used as is for the base_url.
* If it is relative, then the base url is determined in an environment-specific
* way. In the case of a browser environment, the base url is determined
* by looking in the document object's script elements for the one that loaded
* a src ending the provided url.
* @param init_url
* @param is_base (optional). If true, then init_url is already the base_url. Otherwise calls bu_Runtime.getBaseURI(init_url).
*/
//:CLCONSTRUCT ScriptLoader(String init_url, Boolean is_base)
burst.ScriptLoader = function(init_url, is_base) {
  this.modules_by_name_ = {};
  this.module_names_ = [];
  // sets this.base_url_ which includes any trailing slash
  try {
  this.base_url_ = is_base ? init_url : bu_Runtime.getBaseURI(init_url);
  }
  catch(e) {
  var mess = "(ScriptLoader.js) ERROR: failed to defined ScriptLoader.base_url_ probably because of unsupported environment: " + e + "\n Will proceed anyway...";
  if (typeof window == 'undefined') alert(mess); else bu_Runtime.println(mess);
  }
  this.seenConfig_ = false;
  this.seenDocumentLoad_ = false;

  // recorded modules that got loaded before we came along
  if (typeof BU_BOOTSTRAP_SCRIPTS != 'undefined') {
    for(var i=0;i<BU_BOOTSTRAP_SCRIPTS.length;++i) {
      var margs = BU_BOOTSTRAP_SCRIPTS[i];
      var modulename = margs[0];
      var module = new burst.Script(margs[0], 'loaded', margs[1], margs[2], margs[3]);
      this.modules_by_name_[modulename] = module;
      this.module_names_.push(modulename);
    }
  }

  // if we are in a window, register for onload
  if (typeof window != 'undefined') {
     // if document is not already loaded, await onload
     var this_ = this;
     // note that the onload handler will deal with inline constructors
     var bu_onload_handler = function() {this_.setDocumentLoadEvent();}

     // TODO: there are appears to be no cross-platform way to determine whether the current
     // document is loaded. We have to assume that we are loaded from the head, and the onload
     // has yet to fire.
     /*
     if (window.document && window.document.readyState == 'complete') 
        bu_onload_handler();
     else
     */
     burst.web.WindowEvent.addWindowListener('load', bu_onload_handler);
  }

}

// display state of each module
// warn if any core modules are not loaded. 
burst.ScriptLoader.prototype.dumpModules = function() {
  //for(var mname in this.modules_by_name_) {
  var this_ = this;
  burst.Alg.for_each(this.module_names_, function(mname) {
    var module = this_.modules_by_name_[mname];
    bu_info("module name='", module.modulename_, "' state=", module.state_);
  });
  burst.Alg.for_each(BU_BOOTSTRAP_SCRIPTS, function(modulename) {
    if (!bu_in(modulename, this_.modules_by_name_)) 
      bu_error("the core module '" + modulename + "' seems not to have been loaded");
  });
}

burst.ScriptLoader.EVENTS = ['onCallDeps', 'onConfig', 'onConfigDone', 'onDocumentLoad', 'onDocumentLoadDone'];

function bu_set_handler (module, handler) {
    if (typeof handler == 'undefined') {
	//if (module.modulename_ == 'burst.webui.WidgetManager') alert("no handler at all!");
	return;
    }
   module.handler_ = handler;
   // set subscribed events
   module.subscribed_ = {};
   burst.Alg.for_each(burst.ScriptLoader.EVENTS, function(evname) {
     if (typeof handler[evname] != 'undefined') {
	 //if (module.modulename_ == 'burst.webui.WidgetManager') alert("does have handler for " + evname);
        module.subscribed_[evname] = true;
        module.nremaining_++;
     }
     else {
	 //if (module.modulename_ == 'burst.webui.WidgetManager') alert("does not have handler for " + evname);
	 module.subscribed_[evname] = false;
     }
   });
}


/**
* Indicates that the specified modules in load_deps must be loaded now, because they must
* be available prior to the code about to evaluated (presumably because it is part of
* module modulename).
* This function will throw if some module in load_deps has not yet been loaded
* and the runtime can't do it synchronously.
* @param modulename The module name of the code following this.
* @param load_deps Array of module names of load dependencies.
*/
//:CLIMETHOD void require(String modulename, Array load_deps)
burst.ScriptLoader.prototype.require = function (modulename, load_deps) {
  // this may not be defined
  var sl = this instanceof burst.ScriptLoader ? this : bu_ScriptLoader;
  var module = bu_in(modulename, sl.modules_by_name_) ?
    sl.modules_by_name_[modulename] :
    new burst.Script(modulename, 'loading');
  // push
  if (module.load_deps_) module.load_deps_.push(load_deps);
  else module.load_deps_ = load_deps;
  // make sure module is ready
  sl.checkModuleState(module);
}

/**
* Indicates that the specified module has completed loading.
* Also lists what remaining modules must be loaded before any functions in this
* module can be called, and a handler for events.
*/
//:CLIMETHOD void loaded(String modulename, Array call_deps, handler)
burst.ScriptLoader.prototype.loaded = function(modulename, call_deps, handler) {
  // "this" may not be set.
  // pass in null instead of undefined because of IE5.0PC
  bu_ScriptLoader.declare_module(modulename, null, call_deps, handler);
}

burst.ScriptLoader.prototype.is_loaded = function(module) {
   return (module.state_ != 'requested' && module.state_ != 'loading') 
}

// not publicly documented
/*
* Declares a module, the other modules it relies on, and any initialization to be done
* after those dependencies are resolved.
*
* @param modulename The module name declaring itself.
* @param load_deps An optional array of names of other modules this one depends on prior to file loading
* @param call_deps An optional array of names of other modules this one depends on prior to calling its functions or methods
* @param handler An optional Object with methods such as onConfig() for further initialization.
*/
burst.ScriptLoader.prototype.declare_module = function (modulename, load_deps, call_deps, handler) {
//bu_alert("declare_module(" + modulename + ")");
  var module = bu_get(this.modules_by_name_, modulename);
  if (module) {
    if (this.is_loaded(module)) {
       var mess = "(ScriptLoader.js) module '" + modulename + "' already loaded";
       if (typeof alert != 'undefined') alert(mess);
       throw mess;
    }
    module.state_ = 'loaded';
    if (typeof load_deps != 'undefined') module.load_deps_ = load_deps;
    if (typeof call_deps != 'undefined') module.call_deps_ = call_deps;
    bu_set_handler(module, handler);
  }
  else {
    module = this.modules_by_name_[modulename] = new burst.Script(modulename, 'loaded', load_deps, call_deps, handler);
    this.module_names_.push(modulename);
  }

//bu_alert("checkModuleState(" + modulename + ")");
  this.checkModuleState(module);
}


// see if a module's state can be moded, and throw if it is a bad state
burst.ScriptLoader.prototype.checkModuleState = function (module) {
    // if (module.modulename_ == 'burst.webui.widgets.SortTable') alert("checkModuleState says " + module.state_ + " seenDocumentLoad_=" + this.seenDocumentLoad_ + " subscribed_=" + module.subscribed_ + " nremaining=" + module.nremaining_ + " loaded_cb_=" + module.loaded_cb_);
//bu_alert("checkModuleState, state=" + module.state_);
  switch(module.state_) {
  case 'loading': break;
  case 'requested': break;

  // module is loaded, see about its call deps
  case 'loaded': {
    if (module.loaded_cb_) {
	module.loaded_cb_();
	module.loaded_cb_ = null;
    }
    var deps = module.call_deps_;
    var num = 0;
    if (deps) {
      for(var i=0;i<deps.length;++i) {
//bu_alert("requireModule " + i + "/" + deps.length);
	if (!this.requireModule(module.modulename_, deps[i], null, false)) ++num;
      }
    }
    // no more unresolved dependencies; call hook function and change state
    if (num == 0) {
//bu_alert("callHandler");
      this.callHandler(module, 'onCallDeps');
      module.state_ = 'callable';
      this.checkModuleState(module);
    }
    break;
  }

  case 'callable': {
    if (this.seenConfig_) this.callEvent(module, 'onConfig');
    if (this.seenDocumentLoad_) this.callEvent(module, 'onDocumentLoad');
    if (module.nremaining_ == 0 && module.state_ != 'failed') {
      module.state_ = 'ready';
      this.checkModuleState(module);
    }
    break;
  }

  case 'ready': break;
  case 'failed': break;

  default: {
    var mess = "(ScriptLoader.js) unknown module state " + module.state_;
    if (typeof alert != 'undefined') alert(mess);
    bu_throw (mess);
  }
  }
}

burst.ScriptLoader.prototype.isSubscribed = function (module, evname) {
  if (typeof module.subscribed_ == 'undefined') return false;
  return (bu_in(evname, module.subscribed_) || bu_in(evname + 'Done', module.subscribed_));
}

burst.ScriptLoader.prototype.callEvent = function (module, evname) {
  if (!module) throw Error("bad module, for event " + evname);
  if (typeof module.subscribed_ == 'undefined') return;
  if (bu_in(evname, module.subscribed_)) this.callHandler(module, evname);
  var done_evname = evname + 'Done';
  if (bu_in(done_evname, module.subscribed_)) this.callHandler(module, done_evname);
}

// called from checkModuleState. it creates a new burst.Script if there is a dependency that we never heard of.
burst.ScriptLoader.prototype.requireModule = function (requiringName, requiredName, done_handler, is_load_dep) {
  var module = this.modules_by_name_[requiredName];

  // if the module already exists, it has already at least been requested.
  // if it doesn't already exist, we have to create the module object,
  // and start the load request.
  if (!module) {
    // TODO: if during startup, warn about declared dependency that was
    // not already satisfied by our startup load order.
//bu_alert("new module: " + requiredName);
//var a = []; for(var n in this.modules_by_name_) a.push(n); bu_alert("among: " + a.join(','));
    module = this.modules_by_name_[requiredName] = new burst.Script(requiredName, 'requested');
    this.module_names_.push(requiredName);
    // for now, don't rely on universal support for calling a done_handler,
    // since we can assume that our file will call bu_loaded at its bottom. 
    if (done_handler) {
	module.loaded_cb_ = done_handler;
    }
    this.loadModule(requiredName, null /*done_handler*/);
  }
  
  return this.is_loaded(module);
}

/**
In modulename, replaces '.' with '/' and appends '.js'.
Then it calls resolveScriptUrl, then bu_Runtime.readEval.

Called automatically for load and call dependencies.
May also be called directly.
@param modulename The name of the module to load.
@param done_handler Optional, the function to call when the module is loaded (supported when readEval supports it).
*/
//:CLIMETHOD void loadModule(String modulename, Function done_handler)
burst.ScriptLoader.prototype.loadModule = function (modulename, done_handler) {
  var rel_url = modulename.replace(/\./g, '/') + '.js';
  var full_url = this.resolveScriptUrl(rel_url);
  return bu_Runtime.readEval(full_url, done_handler);
}

// call a single handler
burst.ScriptLoader.prototype.callHandler = function (module, funcname) {
   //if (modulename == 'burst.Log') {bu_alert("(ScriptLoader.js) calling module " + modulename + " handler for " + funcname + ", handler=" + module.handler_);}
   if (module.handler_ && typeof module.handler_[funcname] == 'function') {
      module.subscribed_[funcname] = false;
      module.nremaining_--;
      //bu_alert("(ScriptLoader.js) calling module " + modulename + " handler for " + funcname);
      try {
        module.handler_[funcname]();
      }
      catch(e) {
        if (typeof alert != 'undefined') alert("(ScriptLoader.js) got exception calling handler: " + (typeof e.description != 'undefined' ? e.description : e.message));
        module.state_ = 'failed';
        throw e;
      }
   }
}

/*
The relative path between the base_url_ and dynamically loaded scripts.
Since base_url_ is determined from where this file is loaded, and we
want to support running both from individual source files as well as
a combined file, this pretty much has to be an empty string.
This means that burstlib.js has to live inside the "burst/" directory,
as a sibling to ScriptLoader.js
*/
var BU_SCRIPT_ROOT;
if (typeof BU_SCRIPT_ROOT == 'undefined') BU_SCRIPT_ROOT = '';

/*
The relative path between the base_url_ and images such as ones needed by widgets.
Trailing slash is necessary.
*/
var BU_IMAGES_ROOT;
if (typeof BU_IMAGES_ROOT == 'undefined') BU_IMAGES_ROOT = '../burststatic/images/';
/*
The relative path between the base_url_ and html pages such as ones needed by logging.
Trailing slash is necessary.
*/
var BU_HTML_ROOT;
if (typeof BU_HTML_ROOT == 'undefined') BU_HTML_ROOT = '../burststatic/html/';

/**
Return the full url to use to fetch the specified top-level script file from the installation.
@param rel_url Has '.js' file suffix, is relative to the 'burst' directory of the installation.
*/
//:CLIMETHOD String resolveScriptUrl(String rel_url)
burst.ScriptLoader.prototype.resolveScriptUrl = function(rel_url) {
  return this.base_url_ + BU_SCRIPT_ROOT + rel_url;
}

/**
Return the full url to use to fetch the specified image file from the installation.
@param rel_url Has a file suffix, is relative to the 'images' directory of the installation.
*/
//:CLIMETHOD String resolveImageUrl(String rel_url)
burst.ScriptLoader.prototype.resolveImageUrl = function(rel_url) {
  var u = this.base_url_ + BU_IMAGES_ROOT + rel_url;
  //bu_alert("resolved '" + rel_url + "' to " + u);
  return u;
}

/**
Return the full url to use to fetch the specified html file from the installation.
@param rel_url Has a file suffix, is relative to the 'html' directory of the installation.
*/
//:CLIMETHOD String resolveHtmlUrl(String rel_url)
burst.ScriptLoader.prototype.resolveHtmlUrl = function(rel_url) {
  return this.base_url_ + BU_HTML_ROOT + rel_url;
}

// called by config object when it is ready.
burst.ScriptLoader.prototype.setConfigEvent = function() {
  this.seenConfig_ = true;
  this.checkScripts();
}

burst.ScriptLoader.prototype.setDocumentLoadEvent = function() {
  this.seenDocumentLoad_ = true;
  this.checkScripts();
}

// does checkModuleState on each, and maybe assert state
burst.ScriptLoader.prototype.checkScripts = function(assert_state) {
  var this_ = this;
  burst.Alg.for_each(this.module_names_, function(modulename) {
    var module = this_.modules_by_name_[modulename];
    this_.checkModuleState(module);
    if(assert_state) {
    }
  });
}

/*
// call the named member function for each module handler that has such a method
burst.ScriptLoader.prototype.callModuleHandlers = function(funcname) {
  //bu_alert("(ScriptLoader.js) calling module handlers for " + funcname);
  var this_ = this;
  burst.Alg.for_each(this.module_names_, function(modulename) {
    var module = this_.modules_by_name_[modulename];
    this_.callHandler(module, funcname);
  });
}
*/

/** The bootstrap instance of ScriptLoader. */
//:CLCMETHOD burst.ScriptLoader getScriptLoader()
burst.ScriptLoader.getScriptLoader = function() {return bu_ScriptLoader};

//:CLEND

// Instantiate the bootstrap instance.
//    If BU_BASE_URL is defined:       ScriptLoader(BU_BASE_URL, true)
//    If BU_CORE_FILENAME is defined:  ScriptLoader(BU_CORE_FILENAME, false)
//    Otherwise:                       ScriptLoader('ScriptLoader.js', false)
// BU_BASE_URL is just for debugging. It is not normally used.
// When we are loading the library all as one file, BU_CORE_FILENAME is defined.
var bu_ScriptLoader;

try {
    bu_ScriptLoader = 
    (typeof BU_BASE_URL == 'undefined') ? 
    new burst.ScriptLoader('burst/' + (BU_CORE_FILENAME ? BU_CORE_FILENAME : 'ScriptLoader.js')) : 
    new burst.ScriptLoader(BU_BASE_URL, true);
}
catch(e) {bu_alert("failed to make bu_ScriptLoader: " + e); throw e;}

// set real functions
bu_require = bu_ScriptLoader.require;
bu_loaded = bu_ScriptLoader.loaded;

