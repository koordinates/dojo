/**
* @file KJSRuntime.js
*
* Defines burst.runtime.KJSRuntime, a subclass of burst.runtime.AbstractRuntime for the KJS shell.
*/

//=java package burst.runtime;


/**
* Singleton subclass of AbstractRuntime for KJS.
*/
//=java public class KJSRuntime extends AbstractRuntime {

//=java public KJSRuntime() {}
function BU_KJSRuntime() {
  this.name = function() {return 'KJS'};
  this.version = function() {return '?'};
  this.getCurrentScriptURI = function() {bu_unimplemented('getCurrentScriptURI for KJS');};
  this.println = kjsprint;
}
burst.runtime.KJSRuntime = BU_KJSRuntime;
bu_inherits(BU_KJSRuntime, burst.runtime.AbstractRuntime);

// safari adds kjsprint unless NDEBUG. see JavaScriptCore/kjs/internal.cpp
// todo: what other symbol is unique?
BU_KJSRuntime.isPresent = function() {return typeof kjsprint !== 'undefined'};

//=java }

