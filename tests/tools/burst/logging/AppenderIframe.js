/**
* @file AppenderIframe.js
*
* Defines burst.logging.AppenderIframe, an instance of burst.logging.Appender .
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

//=java package burst.logging;

/**
* Subclass of Appender which sends output to an iframe within the current browser window.
* It relies on the existence of an external file, whose location is specified in class constant CONTENT_FILE .
*/
//=java public class AppenderIframe extends Appender {

/**
Constructor.
The classval and styleval are for attributes of the iframe element that is 
created in the current document. Styling of the content, and any extra functionality
that may be put there, is determined by the external html file.
@param classval Optional. if specified, a value for a class attribute in the iframe element.
@param styleval Optional. if specified, a value for a style attribute in the iframe element.
@param lazy_create Optional. if true, the output window is not created until the first message arrives.
*/
//=java public AppenderIframe(String classval, String styleval, Boolean lazy_create) {}

function BU_AppenderIframe(classval, styleval, lazy_create) {
  this.out_el_ = null;
  if (!burst.Lang.isSpecified(classval) && !burst.Lang.isSpecified(styleval)) {
     styleval = 'width: 600px; height: 300px;';
  }
  this.classval_ = classval;
  this.styleval_ = styleval;


  this.recentLast = true; // new messages go at end
  this.scrollIntoView = true; // scroll to make visible

  this.attempted_ = false;
  this.is_ready_ = function() {return this.out_el_ ? true : false};

  this.format = function(logger, levelobj, mess, stack_start) {
    var line = BU_Log.format(logger, levelobj, mess, 1 + stack_start);

    if (!this.is_ready_()) { 
      // maybe initializer is waiting on an event and isn't ready yet
      if (!this.create_()) {
         bu_alert("(Log.js) appender not ready yet to output line: \n" + line);
         return;
      }
    }
    this.append_line_(levelobj, line);
  };

  // called when copying over buffered lines
  this.appendl = function(line) {
     var levelobj;
     if (line.indexOf('DEBUG') != -1) levelobj = BU_Log.DEBUG;
     else if (line.indexOf('INFO') != -1) levelobj = BU_Log.INFO;
     else if (line.indexOf('WARN') != -1) levelobj = BU_Log.WARN;
     else if (line.indexOf('ERROR') != -1) levelobj = BU_Log.ERROR;
     else if (line.indexOf('FATAL') != -1) levelobj = BU_Log.FATAL;
     else levelobj = {name_ : 'UNKNOWN'};
     this.append_line_(levelobj, line);
  }

  if (!lazy_create) this.create_();
}
burst.logging.AppenderIframe = BU_AppenderIframe;
bu_inherits(BU_AppenderIframe, BU_Appender);

// some ugly global variables
// these are to keep track of whether we've attempted to make an iframe, so that the create_
// function can fallback to a window if so.
var bu_ai_init_lock_ = false;
var bu_ai_init_iframe_exception_ = null;
var bu_ai_init_window_exception_ = null;
var bu_ai_attempt_iframe_ = true; // whether to attempt an iframe
var bu_ai_attempt_window_ = true; // whether to attempt a window (if iframe fails)

// some class constants
BU_AppenderIframe.IFRAME_ID = 'buLogIFRAMEID'; // id attribute value for iframe element (dynamically created)

/** the name of the file loaded by the dynamically created iframe, and the value of the iframe src attribute */
//=java public static final String CONTENT_FILE = 'BurstLogIframe.html';
BU_AppenderIframe.CONTENT_FILE = 'BurstLogIframe.html'; 
/** the id of element within static html of CONTENT_FILE content that we use to parent the message children */
//=java public static final String CONTENT_ID = 'buLogCONTENTID';
BU_AppenderIframe.CONTENT_ID = 'buLogCONTENTID';

  // returns whether it is ready to use.
BU_AppenderIframe.prototype.create_ = function() {
  if (this.is_ready_()) return true;

  if (this.attempted_)
     return false; // don't bother with any more attempts
  this.attempted_ = true;

  if (bu_ai_init_lock_) {
     bu_alert("(Log.js) got attempt to log output while in appender constructor: \n" + line); 
     return false;
  }

  if (bu_ai_attempt_iframe_ && !bu_ai_init_iframe_exception_) {
     try {this.init_iframe_();}
     catch(e) {
        bu_ai_init_iframe_exception_ = e;
        if (bu_ai_attempt_window_) {
           bu_alert("(Log.js) got exception making debug output iframe so attempting with a window: \n" + e);
        }
        else {
           bu_alert("(Log.js) got exception making debug output iframe: \n" + e);
           throw e;
        }
     }
     finally {bu_ai_init_lock_ = false;}
     return this.is_ready_();
  }

  if (bu_ai_attempt_window_) {
     try {this.init_window_();}
     catch(e) {
        bu_ai_init_window_exception_ = e;
        bu_alert("(Log.js) got exception making debug output window: \n" + e);
        throw e;
     }
     finally {bu_ai_init_lock_ = false;}
     return this.is_ready_();
  }
  return bu_throw("(Log.js) should never be reached");
};

// implement as iframe child
BU_AppenderIframe.prototype.init_iframe_ = function() {
  var url = bu_ScriptLoader.resolveHtmlUrl(BU_AppenderIframe.CONTENT_FILE);
  var this_ = this;
  var onload_handler = function() {
     //bu_alert('(BU_Log.js) in onload for debug output iframe');
     var doc = burst.xml.HtmlUtil.iframeContentDocument(this_.iframe_element_);
     this_.out_el_ = doc.getElementById(BU_AppenderIframe.CONTENT_ID) ||
        bu_throw("(Log.js) no element with id '" + BU_AppenderIframe.CONTENT_ID + "' to append to");
  };
  var el = burst.xml.HtmlUtil.iframeCreate(BU_AppenderIframe.IFRAME_ID, url, onload_handler, function(cel) {this_.iframe_element_ = cel}, true);
  if (burst.Lang.isSpecified(this.classval_)) burst.xml.DomUtil.setAttribute(el, 'class', this.classval_);
  if (burst.Lang.isSpecified(this.styleval_)) burst.xml.DomUtil.setAttribute(el, 'style', this.styleval_);
};

// implement as a popup window
BU_AppenderIframe.prototype.init_window_ = function() {
  var url = bu_ScriptLoader.resolveHtmlUrl(BU_AppenderIframe.CONTENT_FILE);
  this.child_window_ = window.open(url, '', 'width=600,height=500,status=no,resizable=yes,scrollbars=yes') || 
     bu_throw("(Log.js) window.open(" + url + " failed");
  var this_ = this;

  var onload_handler = function() {
    // bu_alert('(BU_Log.js) in onload for debug output window');
    var doc = this_.child_window_.document || bu_throw("(Log.js) window for " + url + " has no document");
    this_.out_el_ = doc.getElementById(BU_AppenderIframe.CONTENT_ID) || 
       bu_throw ("(Log.js) no element with id '" + BU_AppenderIframe.CONTENT_ID + "' to append to");
  };
  if (this.child_window_.document.body) onload_handler();
  else this.child_window_.onload = onload_handler;
};

// roughly copied from Alex Russell's console.js
// we add a feature of setting a class attribute equal to the debug level name
BU_AppenderIframe.prototype.append_line_ = function(levelobj, line) {
  var parent_el = this.out_el_ || bu_throw("(Log.js) no this.out_el_");

  var classval = levelobj.name_;
  //bu_alert('(BU_Log.js) appending line with classname ' + classval + ': ' + line);

  // create a div with a text node inside.
  // the div has a class attribute from the level
  var divnode = document.createElement('div');
  burst.xml.DomUtil.setAttribute(divnode, 'class', classval);
  var textnode = document.createTextNode(line);
  divnode.appendChild(textnode);

  // put child as first or last
  if (this.recentLast) parent_el.appendChild(divnode);
  else parent_el.insertBefore(divnode, parent_el.firstChild);

  // maybe scroll to view
  if (this.scrollIntoView) divnode.scrollIntoView(false);
}

//=java } // class AppenderIFrame

