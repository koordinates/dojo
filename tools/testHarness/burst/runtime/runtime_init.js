/**
* @file runtime_init.js
*
* Executed after all possible AbstractRuntime classes are defined, to select among them
* and define bu_Runtime.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

BU_AbstractRuntime.ALL_CTORS = [burst.runtime.DomRuntime, burst.runtime.SpiderMonkeyRuntime, burst.runtime.RhinoRuntime, burst.runtime.WshRuntime, burst.runtime.KJSRuntime];

BU_AbstractRuntime.chooseInstance = function() {
  for(var i=0;i<BU_AbstractRuntime.ALL_CTORS.length;++i) {
    var ctor = BU_AbstractRuntime.ALL_CTORS[i];
    if (ctor.isPresent()) return new ctor();
  }
  throw("(Runtime.js) not a known environment");
}

var bu_Runtime = BU_AbstractRuntime.runtime_ = BU_AbstractRuntime.chooseInstance();

//print("bu_Runtime.name()=" + bu_Runtime.name());
//print("getBaseURI=" + bu_Runtime.getBaseURI());

/** current instance of burst.runtime.AbstractRuntime */
//:CLCMETHOD Runtime getRuntime()
BU_AbstractRuntime.getRuntime = function() {return BU_AbstractRuntime.runtime_}

BU_AbstractRuntime.CALL_DEPS = (bu_Runtime.name() == 'DOM') ? ['burst.xml.DomUtil', 'burst.xml.HtmlUtil'] : null;

bu_loaded('burst.runtime.runtime_init', BU_AbstractRuntime.CALL_DEPS);