/**
* @file DomRuntime.js
*
* Defines burst.runtime.DomRuntime, a subclass of burst.runtime.AbstractRuntime for a browser environment.
*/

//=java package burst.runtime;

/**
* Singleton subclass of AbstractRuntime for a browser environment (or wherever there is a DOM).
*/
//=java public class DomRuntime extends AbstractRuntime {

//=java public DomRuntime() {}
var BU_DomRuntime = function() {
  this.name = function() {return 'DOM'};

  // determine my base url
  this.getCurrentScriptURI = function(basename) {
      var self_url = burst.xml.HtmlUtil.getDocumentScriptSrc(basename, true);
      return self_url;
  }
}
burst.runtime.DomRuntime = BU_DomRuntime;
bu_inherits(BU_DomRuntime,BU_AbstractRuntime);

BU_DomRuntime.isPresent = function() {
  return typeof document !== 'undefined' && typeof window !== 'undefined';
};

BU_DomRuntime.SCRIPT_START = '<script type="text/javascript" language="JavaScript"';

/**
* Load a script by dynamically creating a 'script' element.
*
* If called before the current document has finished loading,
* it performs a <code>document.write</code> of a 'script' element.
* If called after the current document has finished loading, it
* does a <code>el = document.createElement('script'); ... document.documentElement.appendChild(el)</code> .
*
* As written, this function has no provision for error handling (for example, 
* an evaluation error in the loaded script).
* That might be done through an <code>onerror</code> on the current window.
*
* When supported by the browser, we implement completion notification by setting an onload
* value on the script element. 
* Otherwise it is implemented by simply creating another script element with inline content.
* - after calling this, also do a document.write('&lt;script>done()&lt;/script>')
*
* For some discussion, see Richard Cornford:
* http://groups.google.com/groups?selm=b4ocfi%24c5g%241%248300dec7%40news.demon.co.uk 
*
* @todo Find a way for browsers other than Mozilla to have a done_handler called.
*
* @param url Relative or absolute url. If relative, it is relative to the document.
* @param done_handler Optional Function to call when the script is done loading.
*/
//:NSFUNCTION void readEvalAsync(String url, Function done_handler)
BU_DomRuntime.prototype.readEvalAsync = function(url, done_handler, doc) {
   if (arguments.length < 3 || !doc) doc = document;

     // while processing scripts in the head, has document.documentElement: Moz
     // while processing scripts in the head, has document.body: not Moz

   if (burst.xml.DomUtil.isDocumentComplete(doc)) {
     // Cornford says: Moz >=0.9, IE >= 5.0, not Opera 7.0
     //alert("about to create a script element with url " + url);

     var s = document.createElement('script');
     // or for IE >= 5.0 s.setAttribute('src', url);
     s.src = url;
     // will call a script.onload set as a function in js: Moz
     // will not: IE5, IE6, Opera 7.5, Safari 1.2
     // can succesfully create a script element that is processed, using innerHTML: not Moz
     if (done_handler) s.onload = done_handler;
     doc.documentElement.appendChild(s);

     if (false) {
       doc.body.innerHTML += BU_DomRuntime.SCRIPT_START + ' src="' + url + '"></script>'; 
     }
   }

   else {
      var script_s = BU_DomRuntime.SCRIPT_START + ' src="' + url + '"></script>'
      //alert("about to write a script element: " + script_s);
      doc.write(script_s);
      if (done_handler) {
        var handler_string = burst.Lang.unevalFunctionCall(done_handler);
        doc.write(BU_DomRuntime.SCRIPT_START + '>' + handler_string + '</script>');
      }
   }


}


//=java } // class DomRuntime
