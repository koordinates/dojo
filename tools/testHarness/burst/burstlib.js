/* This file is generated. */
BU_CORE_FILENAME = 'burstlib.js';
var BU_VERSION_DATE = '200405160246';
var BU_VERSION_NUMBER = '0.9';

if (!(new Boolean(false))) throw "Do not use language='JavaScript1.2'";
function bu_in(mem,obj) { return (typeof obj[mem] !== 'undefined'); }
var BU_UNDEFINED;
function bu_get(obj, mem) {
  if (typeof obj[mem] == 'undefined') {
return null;
  }
  return obj[mem];
}
function bu_get_soft(obj, mem, fallback) {return typeof obj[mem] == 'undefined' ? fallback : obj[mem];}
var BU_CORE_MODULES = [
 'burst_first.js',
 'fix_ecma.js',
 'burst.runtime.AbstractRuntime',
 'burst.runtime.DomRuntime',
 'burst.runtime.SpiderMonkeyRuntime',
 'burst.runtime.RhinoRuntime',
 'burst.runtime.WshRuntime',
 'burst.runtime.KJSRuntime',
 'burst.runtime.runtime_init',
 'burst.Alg',
 'burst.logging.Log',
 'burst.logging.Appender',
 'burst.logging.AppenderIframe',
 'burst.logging.AppenderBuffer',
 'burst.logging.logging_init',
 'burst.Lang',
 'burst.MOP',
 'burst.BurstError',
 'burst.AssertFailure',
 'burst.web.UserAgent',
 'burst.xml.fix_dom',
 'burst.xml.DomUtil',
 'burst.xml.HtmlUtil',
 'burst.xml.HtmlBox',
 'burst.xml.XmlDoc',
 'burst.web.WindowEvent',
 'burst.web.DragDrop',
 'burst.web.TextSelection',
 'burst.io.AbstractURIRequest',
 'burst.io.IframeURIRequest',
 'burst.io.XmlHttpURIRequest',
 'burst.ScriptLoader',
 'burst.Text',
 'burst.URI',
 'burst.props.PropertyError',
 'burst.reflect.PropertyDef',
 'burst.props.AbstractProperties',
 'burst.Config',
 'burst.Functional',
 'burst.Comparator',
 'burst.Time',
 'burst.webui.WidgetManager',
 'burst.webui.widgets.AbstractWidget',
 'burst.xml.XPath',
];
var BU_OTHER_MODULES = [
];
var burst = {io: {}, logging: {}, props: {}, reflect: {}, runtime: {}, web: {}, webui: {widgets: {}}, xml: {}};
var BU_BOOTSTRAP_SCRIPTS = [];
var BU_BOOTSTRAP_NAMES = {};
function bu_bootstrap_module(modulename, load_deps, call_deps, handler) {
 BU_BOOTSTRAP_SCRIPTS[BU_BOOTSTRAP_SCRIPTS.length] = [modulename, load_deps, call_deps, handler];
 BU_BOOTSTRAP_NAMES[modulename] = true;
 var deps = load_deps;
 if (deps) {
   for(var i=0;i<deps.length;++i) {
    var depname = deps[i];
    if (typeof BU_BOOTSTRAP_NAMES[depname] == 'undefined') {
  var mess = "(burst_first.js) core module '" + modulename + "' has load dependency on module '" + depname + "' not already loaded";
  if (typeof alert != 'undefined') alert(mess);
     throw(mess);
    }
   }
 }
}
function bu_loaded(modulename, call_deps, handler) {
  bu_bootstrap_module(modulename, null, call_deps, handler);
}
function bu_require(modulename, load_deps) {
  bu_bootstrap_module(modulename, load_deps);
}
function bu_inherits(subclass, superclass) {
if (typeof superclass != 'function') { if (typeof alert != 'undefined') alert("eek: superclass not a function: " + superclass +"\nsubclass is: " + subclass);}
 subclass.prototype = new superclass();
 subclass.prototype.constructor = subclass;
 subclass['super'] = superclass;
}
var BU_CORE_FILENAME;
bu_loaded('burst_first.js');
var bu_fixed = [];
function bu_fixing(name) {
 bu_fixed[bu_fixed.length] = name;
}
var bu_jscript_version = null;
if (typeof ScriptEngineMajorVersion == 'function') {
 bu_jscript_version = parseFloat(ScriptEngineMajorVersion() + '.' + ScriptEngineMinorVersion());
}
if (!Function.prototype.apply) {
 bu_fixing('Function.apply');
 Function.prototype.apply = function bu_fix_apply(o,a) {
  var r;
  if (!o) o = {};
  o.___apply=this;
  switch((a && a.length) || 0) {
case 0: r = o.___apply(); break;
case 1: r = o.___apply(a[0]); break;
case 2: r = o.___apply(a[0],a[1]); break;
case 3: r = o.___apply(a[0],a[1],a[2]); break;
case 4: r = o.___apply(a[0],a[1],a[2],a[3]); break;
case 5: r = o.___apply(a[0],a[1],a[2],a[3],a[4]); break;
case 6: r = o.___apply(a[0],a[1],a[2],a[3],a[4],a[5]); break;
default:
     for(var i=0, s=""; i<a.length;i++){
      if(i!=0) s += ",";
      s += "a[" + i +"]";
     }
     r = eval("o.___apply(" + s + ")");
  }
  o.__apply = null;
  return r;
 }
}
if (!Function.prototype.call) {
 bu_fixing('Function.call');
 Function.prototype.call = function bu_fix_call(o) {
  var args = new Array(arguments.length - 1);
  for(var i=1;i<arguments.length;i++) {args[i - 1] = arguments[i];}
  return this.apply(o, args);
 }
}
if (!Array.prototype.push) {
 bu_fixing('Array.push');
 Array.prototype.push = function bu_fix_push() {
  for (var i = 0; i < arguments.length; i++) {this[this.length] = arguments[i];}
  return this.length;
 };
}
if (!Array.prototype.pop) {
 bu_fixing('Array.pop');
 Array.prototype.pop = function bu_fix_pop() {
  if (this.length == 0) return BU_UNDEFINED;
  return this[this.length--];
 }
}
if (!Array.prototype.shift) {
 bu_fixing('Array.shift');
 Array.prototype.shift = function bu_fix_shift() {
  this.reverse();
  var lastv = this.pop();
  this.reverse();
  return lastv;
 }
}
if (!Array.prototype.splice) {
 bu_fixing('Array.splice');
 Array.prototype.splice = function bu_fix_splice(start, deleteCount) {
  var len = parseInt(this.length);
  start = start ? parseInt(start) : 0;
  start = (start < 0) ? Math.max(start+len,0) : Math.min(len,start);
  deleteCount = deleteCount ? parseInt(deleteCount) : 0;
  deleteCount = Math.min(Math.max(parseInt(deleteCount),0), len);
  var deleted = this.slice(start, start+deleteCount);
  var insertCount = Math.max(arguments.length - 2,0);
  var new_len = this.length + insertCount - deleteCount;
  var start_slide = start + insertCount;
  var nslide = len - start_slide;
  for(var i=new_len - 1;i>=start_slide;--i) {this[i] = this[i - nslide];}
  for(i=start;i<start+insertCount;++i) {this[i] = arguments[i-start+2];}
  return deleted;
 }
}
if (!Array.prototype.unshift) {
 bu_fixing('Array.unshift');
 Array.prototype.unshift = function bu_fix_unshift() {
  var a = [0,0];
  for(var i=0;i<arguments.length;i++) {a.push(arguments[i]);}
  var ret = this.splice.apply(a);
  return this.length;
 }
}
if (!Number.prototype.toFixed || bu_jscript_version) {
 function bu_nz(n) {return n <= 0 ? '' : '0000000000000000000000000'.substring(25 - n)}
 bu_fixing('Number.toFixed');
 if (Number.prototype.toFixed) Number.prototype.$$toFixed$$ = Number.prototype.toFixed;
 Number.prototype.toFixed = function(fracDigits) {
  var f = this;
  if (typeof fracDigits == 'undefined') fracDigits = 0;
  if (fracDigits < 0) throw Error("negative fracDigits " + fracDigits);
  var n = Math.round(Math.abs(f) * Math.pow(10, fracDigits));
  var s;
  if (isNaN(n) || n == 2147483647) {
    s = String(f);
    var dec = s.indexOf('.');
if (dec == -1) return fracDigits > 0 ? s + '.' + bu_nz(fracDigits) : s;
    var res = s.substring(0,dec+1);
    var fraction = s.substring(dec+1);
    if (fraction.length >= fracDigits) return res + fraction.substring(0,fracDigits);
    res = res + fraction + bu_nz(fracDigits - fraction.length);
    return res;
  }
  s = String(n);
  if (fracDigits > 0) {
   if (s.length > fracDigits)
    s = s.substring(0, s.length - fracDigits) + '.' + s.substring(s.length - fracDigits);
   else {
    s = '0.' + bu_nz(fracDigits - s.length) + s;
   }
  }
  if (f < 0) s = '-' + s;
  return s;
 }
}
if (!Number.prototype.toPrecision || bu_jscript_version) {
 bu_fixing('Number.toPrecision');
 if (Number.prototype.toPrecision) Number.prototype.$$toPrecision$$ = Number.prototype.toPrecision;
 Number.prototype.toPrecision = function(prec) {
  var f = this;
  if (typeof prec == 'undefined') return String(f);
  if (prec < 0) throw Error("negative precision " + prec);
  if (Number.prototype.$$toPrecision$$ ) {
   var nat = Number.prototype.$$toPrecision$$.call(this, prec);
   if (/e/i.test(nat)) return nat;
  }
  var exp = Math.floor(Math.log(Math.abs(f))/Math.LN10 + 0.000001);
  if (exp >= prec) {
s = this.toExponential(prec - 1);
  }
  else {
var n = Math.round(Math.abs(f) * Math.pow(10, prec - exp - 1));
s = String(n);
var nshift = prec - exp - 1;
if (nshift == 0) {
}
else if (nshift < s.length) {
  s = s.substring(0, s.length - nshift) + '.' + s.substring(s.length - nshift);
}
else {
  s = '0.' + bu_nz(nshift - s.length) + s;
    }
  }
  return s;
 }
}
if (!Number.prototype.toExponential) {
 bu_fixing('Number.toExponential');
 Number.prototype.toExponential = function(fracDigits) {
  var f = this;
  var exp = Math.floor(Math.log(Math.abs(f))/Math.LN10 + 0.000001);
  var n;
  if (typeof fracDigits == 'undefined') {
   n = Math.abs(f) * Math.pow(10, 0 - exp - 1);
  }
  else {
   n = Math.round(Math.abs(f) * Math.pow(10, fracDigits - exp));
  }
  var s = String(n).replace(/(\d)/, "$1.");
  s += (exp >= 0 ? 'e+' : 'e') + exp;
  if (f < 0) s = '-' + s;
  return s;
 }
}
if (bu_jscript_version && (bu_jscript_version < 5.5)) {
  function bu_fix_re_flags(re) {
var s = re.toString();
var flags = s.substring(s.lastIndexOf('/'));
re.global = flags.indexOf('g') != -1;
re.multiline = flags.indexOf('m') != -1;
re.ignoreCase = flags.indexOf('i') != -1;
  }
  bu_fixing('RegExp.exec');
  RegExp.prototype.$$exec$$ = RegExp.prototype.exec;
  RegExp.prototype.exec = function(s) {
if (typeof this.global == 'undefined') bu_fix_re_flags(this);
var lastInd;
if (typeof this.lastIndex == 'undefined') {
  lastInd = this.lastIndex = 0;
}
else {
  lastInd = this.lastIndex;
}
var res = this.$$exec$$(s.substring(lastInd));
if (!res) {
  this.lastIndex = 0;
  return res;
}
this.lastIndex = (RegExp.lastIndex + lastInd);
res.index = this.lastIndex - res[0].length;
if (lastInd == 0) RegExp.$$lastInput$$ = s;
res.input = RegExp.$$lastInput$$;
return res;
  }
}
if ((typeof navigator != 'undefined' && (navigator.userAgent.indexOf('rv:') != -1)) ||
  (bu_jscript_version && (bu_jscript_version >= 5.5)) ||
  (typeof line2pc !== 'undefined')) {
}
else {
  bu_fixing('String.replace');
  String.prototype.$$replace$$ = String.prototype.replace;
  String.prototype.replace = function(searchValue, replaceValue) {
if (typeof replaceValue != 'function') {
  var v = this.$$replace$$(searchValue, replaceValue);
  return v;
}
if (!searchValue.exec) throw Error("unimplemented: searchValue not a RegExp: " + searchValue);
var re = searchValue;
var a;
var instr = this;
var out_parts = [];
var npasses = 0;
var prev_end = 0;
while( (a = re.exec(instr)) ) {
  npasses++;
  a.push(a.index);
  a.push(a.input);
  var res = replaceValue.apply(null, a);
  out_parts.push(this.substring(prev_end, a.index));
  out_parts.push(res);
  prev_end = a.index + a[0].length;
  if (!re.global) break;
}
if (npasses == 0) {
  return instr;
}
out_parts.push(this.substring(prev_end));
var s = out_parts.join('');
return s;
  }
}
if (!String.prototype.charCodeAt) {
 bu_fixing('String.charCodeAt');
 var BU_ASCII = "\000\001\002\003\004\005\006\007\010\011\012\013\014\015\016\017\020\021\022\023\024\025\026\027" +
    "\030\031\032\033\034\035\036\037\040\041\042\043\044\045\046\047\050\051\052\053\054\055\056\057" +
    "\060\061\062\063\064\065\066\067\070\071\072\073\074\075\076\077\100\101\102\103\104\105\106\107" +
    "\120\121\122\123\124\125\126\127\130\131\132\133\134\135\136\137\140\141\142\143\144\145\146\147" +
    "\150\151\152\153\154\155\156\157\160\161\162\163\164\165\166\167\170\171\172\173\174\175\176\177" +
"\200\201\202\203\204\205\206\207\210\211\212\213\214\215\216\217\220\221\222\223\224\225\226\227" +
    "\230\231\232\233\234\235\236\237\240\241\242\243\244\245\246\247\250\251\252\253\254\255\256\257" +
    "\260\261\262\263\264\265\266\267\270\271\272\273\274\275\276\277\300\301\302\303\304\305\306\307" +
    "\320\321\322\323\324\325\326\327\330\331\332\333\334\335\336\337\340\341\342\343\344\345\346\347" +
    "\350\351\352\353\354\355\356\357\360\361\362\363\364\365\366\367\370\371\372\373\374\375\376\377";
 String.prototype.charCodeAt = function(index) {
  var c = this.charAt(index);
  if (c == '') return NaN;
  var code = BU_ASCII.indexOf(c);
  if (code != -1) return code;
  throw "character at position " + index + " is not [0, 255]: " + c;
 }
}
if (typeof Error == 'undefined' || (bu_jscript_version && (bu_jscript_version < 5.5))) {
 bu_fixing('Error');
 Error = function(msg) {
  if (!(this instanceof Error)) return new Error(msg);
  this.message = msg || '';
  return this;
 };
 Error.prototype = new Object();
 Error.prototype.name = 'Error';
 Error.prototype.toString = function() {return this.name + ': ' + this.message};
}
if (bu_jscript_version && (bu_jscript_version < 5.5)) { eval("var undefined");}
if (escape('@') == '%40') {
 bu_fixing('escape');
 var $$escape$$ = escape;
 window.escape = function(s) {
  var esc = $$escape$$(s);
  return esc.replace(/\%40/g, '@');
 }
}
if (typeof decodeURIComponent == 'undefined') {
 bu_fixing('encodeURI');
 var BU_UNESCAPE_ENCODE = escape(';?:&=$,!~\'()#');
 function encodeURI(s) {
  var esc = escape(s);
  return esc.replace(/\%../g, function(match) {
   return BU_UNESCAPE_ENCODE.indexOf(match) == -1 ? match : unescape(match);
  });
 }
 bu_fixing('encodeURIComponent');
 var BU_UNESCAPE_ENCODE_COMP = escape('!~\'()');
 function encodeURIComponent(s) {
  var esc = escape(s);
  var unesc = esc.replace(/\%../g, function(match) {
   return BU_UNESCAPE_ENCODE_COMP.indexOf(match) == -1 ? match : unescape(match);
  });
  return unesc.replace(/\@/g, '%40').replace(/\+/g,'%2B').replace(/\//g,'%2F');
 }
 bu_fixing('decodeURI');
 var BU_PASSTHRU_DECODE = escape(';/?:@&=+$,#');
 function decodeURI(enc) {
  var s = enc.replace(/\%../g, function(match) {
   return BU_PASSTHRU_DECODE.indexOf(match) == -1 ? unescape(match) : match;
  });
  return s;
 }
 bu_fixing('decodeURIComponent');
 var decodeURIComponent = unescape;
}
if (typeof bu_loaded != 'undefined') bu_loaded('fix_ecma.js');
if (typeof __scripts__ != 'undefined') {
__scripts__.provide(__config__.corePath+"fix_ecma.js");
__scripts__.finalize(__config__.corePath+"fix_ecma.js");
}
var BU_AbstractRuntime = function () {
}
burst.runtime.AbstractRuntime = BU_AbstractRuntime;
BU_AbstractRuntime.prototype.name = function() {bu_unimplemented('burst.runtime.AbstractRuntime.name')};
BU_AbstractRuntime.prototype.version = function() {return null};
BU_AbstractRuntime.prototype.getBaseURI = function(relpath) {
  var uri = this.getCurrentScriptURI(relpath);
  if (relpath) {
var ind = uri.indexOf(relpath);
if (ind == -1) throw "(AbstractRuntime.js) could not find relpath '" + relpath + "' in uri '" + uri + "'";
return uri.substring(0,ind);
  }
  var last_slash = uri.indexOf('/');
  return last_slash == -1 ? '' : uri.substring(0, last_slash + 1);
};
BU_AbstractRuntime.prototype.getCurrentScriptURI = function() {bu_unimplemented('burst.runtime.AbstractRuntime.getCurrentScriptURI');}
BU_AbstractRuntime.prototype.readEvalAsync = function(url) {bu_unimplemented('burst.runtime.AbstractRuntime.readEvalAsync')};
BU_AbstractRuntime.prototype.readEvalSync = function(url) {bu_unimplemented('burst.runtime.AbstractRuntime.readEvalSync')};
BU_AbstractRuntime.prototype.getTextAsync = function(url, handler, nocache) {
  return this.getURIRequest().getTextAsync(url, handler, nocache);
}
BU_AbstractRuntime.prototype.getDocumentAsync = function(url, handler, progress_handler) {
  return this.getURIRequest().getDocumentAsync(url, handler, progress_handler);
}
BU_AbstractRuntime.prototype.getURIRequest = function() {
  if (bu_Runtime.has_HttpRequest()) {
return new burst.io.XmlHttpURIRequest();
  }
  else if (typeof navigator != 'undefined') {
return new burst.io.IframeURIRequest.getInstance();
  }
  else {throw Error("(AbstractRuntime.js) no available URIRequest class");}
}
BU_AbstractRuntime.prototype.readEval = function(url, done_handler) {
 if (bu_Runtime.readEvalAsync !== BU_AbstractRuntime.prototype.readEvalAsync) {
  bu_Runtime.readEvalAsync(url, done_handler);
  return null;
 }
 else if (bu_Runtime.readEvalSync !== BU_AbstractRuntime.prototype.readEvalSync) {
  bu_Runtime.readEvalSync(url);
  return done_handler ? done_handler() : null;
 }
 else throw Error("(AbstractRuntime.js) neither readEvalAsync nor readEvalSync is implemented, for url '" + url + "'");
}
BU_AbstractRuntime.prototype.has_msxml = function() {
 return (typeof ActiveXObject !== 'undefined');
}
BU_AbstractRuntime.prototype.has_moz_XMLHttpRequest = function() {
 return (typeof XMLHttpRequest !== 'undefined');
}
BU_AbstractRuntime.prototype.has_HttpRequest = function() {
 return this.has_moz_XMLHttpRequest() || this.has_msxml();
}
bu_loaded('burst.runtime.AbstractRuntime');
var BU_DomRuntime = function() {
 this.name = function() {return 'DOM'};
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
BU_DomRuntime.prototype.readEvalAsync = function(url, done_handler, doc) {
 if (arguments.length < 3 || !doc) doc = document;
 if (burst.xml.DomUtil.isDocumentComplete(doc)) {
  var s = document.createElement('script');
  s.src = url;
  if (done_handler) s.onload = done_handler;
  doc.documentElement.appendChild(s);
  if (false) {
   doc.body.innerHTML += BU_DomRuntime.SCRIPT_START + ' src="' + url + '"></script>';
  }
 }
 else {
   var script_s = BU_DomRuntime.SCRIPT_START + ' src="' + url + '"></script>'
   doc.write(script_s);
   if (done_handler) {
    var handler_string = burst.Lang.unevalFunctionCall(done_handler);
    doc.write(BU_DomRuntime.SCRIPT_START + '>' + handler_string + '</script>');
   }
 }
}
function BU_SpiderMonkeyRuntime() {
 this.name = function() {return 'SpiderMonkey'};
 this.version = function() {return version()};
 this.println = function(line) {print(line)};
 this.exit = function(exitcode) {quit(exitcode)};
};
burst.runtime.SpiderMonkeyRuntime = BU_SpiderMonkeyRuntime;
bu_inherits(BU_SpiderMonkeyRuntime, burst.runtime.AbstractRuntime);
function bu_getCurrentScriptURI_spidermonkey() {
 var s;
 try{throw Error("whatever");} catch(e) {s = e.stack; }
 var matches = s.match(/[^@]*\.js/gi);
 if (!matches) throw "could not parse stack string: '" + s + "'";
 var fname = matches[3];
 if (!fname) throw "could not find file name in stack string '" + s + "'";
 return fname;
}
BU_SpiderMonkeyRuntime.prototype.getCurrentScriptURI = bu_getCurrentScriptURI_spidermonkey;
BU_SpiderMonkeyRuntime.prototype.readEvalSync = function(fpath) {
 var ok = load(fpath);
 if (typeof ok == 'boolean' && !ok) bu_throw("load(" + fpath + ") returned " + (typeof ok) + " " + ok);
}
BU_SpiderMonkeyRuntime.readFile_xpcshell = function(fname) {
 var file = bu_xpcLocalFile(fname);
 if ( !file.exists() ) throw "File '" + fname + "' does not exist.";
 var sis = bu_xpcScriptableInputStream(file);
 var contents = sis.read(sis.available());
 return contents;
}
function bu_xpcScriptableInputStream(file) {
  var is = Components.classes["@mozilla.org/network/file-input-stream;1"]
    .createInstance( Components.interfaces.nsIFileInputStream );
  is.init( file, 0, 0, 0 );
  var sis = Components.classes["@mozilla.org/scriptableinputstream;1"]
    .createInstance( Components.interfaces.nsIScriptableInputStream );
  sis.init( is );
  return sis;
}
function bu_xpcLocalFile(fname) {
  var file = Components.classes["@mozilla.org/file/local;1"]
    .createInstance(Components.interfaces.nsILocalFile);
 file.initWithPath( fname );
 return file;
}
BU_SpiderMonkeyRuntime.isPresent = function() {
 return (typeof line2pc !== 'undefined' || typeof DumpXPC !== 'undefined');
}
var BU_RhinoRuntime = function() {
 this.name = function() {return 'Rhino'};
 this.version = function() {return version()};
 this.getCurrentScriptURI = bu_rhino_current_script_via_java;
 this.println = function(line) {print(line)};
 this.exit = function(exitcode) {quit(exitcode)};
};
burst.runtime.RhinoRuntime = BU_RhinoRuntime;
bu_inherits(BU_RhinoRuntime, BU_AbstractRuntime);
function bu_rhino_current_script_via_eval_exception() {
  var exc;
  try {eval ("undefinedsymbol()") } catch(e) {exc = e;}
  print("got exception: '" + exc + "'");
  print("exc.stack=" + (typeof exc.stack));
  var sn = exc.getSourceName();
  print("SourceName=" + sn);
  return sn;
}
function bu_rhino_current_script_via_java() {
 var optLevel = Packages.org.mozilla.javascript.Context.getCurrentContext().getOptimizationLevel();
 if (optLevel == -1) bu_unimplemented("getCurrentScriptURI (determine current script path for rhino when interpreter mode)")
 var caw = new java.io.CharArrayWriter();
 var pw = new java.io.PrintWriter(caw);
 var exc = new java.lang.Exception();
 exc.printStackTrace(pw);
 var s = caw.toString();
 var matches = s.match(/[^\(]*\.js\)/gi);
 if (!matches) throw Error("cannot parse printStackTrace output: " + s);
 var fname = matches[3];
 if (!fname) throw Error("could not find js file in printStackTrace output: " + s);
 return fname;
 };
BU_RhinoRuntime.prototype.readEvalSync = BU_SpiderMonkeyRuntime.prototype.readEvalSync;
BU_RhinoRuntime.isPresent = function() {return typeof loadClass != 'undefined'};
function BU_WshRuntime() {
 this.name = function() {return 'WSH'};
 this.getCurrentScriptURI = function() {
  var fname = WScript.ScriptFullName;
  return fname;
 }
 this.println = typeof print == 'undefined' ? function(line) {WScript.Echo(s)} : function(line) {print(s)};
 this.exit = function(exitcode) {WScript.Quit(exitcode)};
};
burst.runtime.WshRuntime = BU_WshRuntime;
bu_inherits(BU_WshRuntime,BU_AbstractRuntime);
BU_WshRuntime.readTextFile = function(fpath) {
 var fs = new ActiveXObject( "Scripting.FileSystemObject" );
 var istream = fso.OpenTextFile( fpath, 1 );
 var contents = istream.ReadAll();
 istream.Close();
 return contents;
}
BU_WshRuntime.readEvalSync = function(fpath) {
 var contents = BU_WshRuntime.readTextFile(fpath);
 return bu_eval(contents);
}
BU_WshRuntime.isPresent = function() {return typeof WScript !== 'undefined'};
function BU_KJSRuntime() {
 this.name = function() {return 'KJS'};
 this.version = function() {return '?'};
 this.getCurrentScriptURI = function() {bu_unimplemented('getCurrentScriptURI for KJS');};
 this.println = kjsprint;
}
burst.runtime.KJSRuntime = BU_KJSRuntime;
bu_inherits(BU_KJSRuntime, burst.runtime.AbstractRuntime);
BU_KJSRuntime.isPresent = function() {return typeof kjsprint !== 'undefined'};
BU_AbstractRuntime.ALL_CTORS = [burst.runtime.DomRuntime, burst.runtime.SpiderMonkeyRuntime, burst.runtime.RhinoRuntime, burst.runtime.WshRuntime, burst.runtime.KJSRuntime];
BU_AbstractRuntime.chooseInstance = function() {
 for(var i=0;i<BU_AbstractRuntime.ALL_CTORS.length;++i) {
  var ctor = BU_AbstractRuntime.ALL_CTORS[i];
  if (ctor.isPresent()) return new ctor();
 }
 throw("(Runtime.js) not a known environment");
}
var bu_Runtime = BU_AbstractRuntime.runtime_ = BU_AbstractRuntime.chooseInstance();
BU_AbstractRuntime.getRuntime = function() {return BU_AbstractRuntime.runtime_}
BU_AbstractRuntime.CALL_DEPS = (bu_Runtime.name() == 'DOM') ? ['burst.xml.DomUtil', 'burst.xml.HtmlUtil'] : null;
bu_loaded('burst.runtime.runtime_init', BU_AbstractRuntime.CALL_DEPS);
burst.Alg = {};
burst.Alg.for_map = function(map, binary_func) {
 for(var k in map) {
  binary_func(k, map[k]);
 }
}
burst.Alg.transform_map = function(map, binary_func, arr) {
 if (!arr) arr = new Array();
 for(var k in map) {arr.push(binary_func(k, map[k]));}
 return arr;
}
burst.Alg.for_each = function(arr, unary_func) {
 for(var i=0;i<arr.length;++i) unary_func(arr[i]);
}
burst.Alg.for_each_call = function(arr, obj, unary_func) {
 for(var i=0;i<arr.length;++i) unary_func.call(obj, arr[i]);
}
burst.Alg.for_each_call2 = function(arr, obj, binary_func, arg2) {
 for(var i=0;i<arr.length;++i) binary_func.call(obj, arr[i], arg2);
}
burst.Alg.find = function(arr, val) {
 for(var i=0;i<arr.length;++i) {if (arr[i] == val) return i;}
 return -1;
}
burst.Alg.find_value = function(arr, val) {
 for(var i=0;i<arr.length;++i) {
  var v = arr[i];
  if (v == val) return v;
 }
 return BU_UNDEFINED;
}
burst.Alg.find_if = function(arr, unary_predicate) {
 for(var i=0;i<arr.length;++i) {if (unary_predicate(arr[i])) return i;}
 return -1;
}
burst.Alg.find_if_value = function(arr, unary_func) {
 for(var i=0;i<arr.length;++i) {
  var v = unary_func(arr[i]);
  if (v) return v;
 }
 return BU_UNDEFINED;
}
burst.Alg.find_if_nth_value = function(arr, n, unary_func) {
 var seen = 0;
 for(var i=0;i<arr.length;++i) {
  var v = unary_func(arr[i]);
  if (v) { if (n == seen) return v; ++seen;}
 }
 bu_debug("burst.Alg.find_if_nth_value saw=", seen, ' but did not see ', n);
 return BU_UNDEFINED;
}
burst.Alg.find_if_specified = function(arr, unary_func) {
 for(var i=0;i<arr.length;++i) {
  var v = unary_func(arr[i]);
  if (v !== null && (typeof v !== 'undefined')) return v;
 }
 return BU_UNDEFINED;
}
burst.Alg.erase = function(arr, start, end) {
 arr.splice(start, end - start);
}
burst.Alg.count_if = function(arr, unary_predicate) {
 var count = 0;
 for(var i=0;i<arr.length;++i) {if (unary_predicate(arr[i])) ++count;}
 return count;
}
burst.Alg.generate = function(arr, generator) {
 for(var i=0;i<arr.length;++i) {arr[i] = generator()}
 return arr;
}
burst.Alg.generate_n = function(arr, n, generator) {
 for(var i=0;i<n;++i) {arr[i] = generator()}
 return arr;
}
burst.Alg.lower_bound = function(arr, val, less) {
 if (!less) less = function(a,b) {return a < b;}
 for(var i=0;i<arr.length;++i) {
  if (! less(arr[i], val)) return i;
 }
 return i;
}
burst.Alg.upper_bound = function(arr, val, less) {
 if (!less) less = function(a,b) {return a < b;}
 for(var i=0;i<arr.length;++i) {
  if (less(val, arr[i])) return i;
 }
 return i;
}
burst.Alg.transform = function(arr, unary_func, dest) {
 if (!dest) dest = new Array(arr.length);
 for(var i=0;i<arr.length;++i) {dest[i] = unary_func(arr[i], i);}
 return dest;
}
burst.Alg.toMap = function(arr, keyfunc, map) {
 if (!map) map = {};
 if (!unary_func) unary_func = burst.Alg.identity;
 burst.Alg.for_each(arr, function(o) {map[unary_func(o)] = o;})
 return map;
}
burst.Alg.identity = function identity(o) {return o;}
burst.Alg.toSet = function(arr, map) {
 if (!map) map = {};
 burst.Alg.for_each(arr, function(o) {map[o] = true;})
 return map;
}
burst.Alg.copy = function(arr, dest) {
 if (!dest) dest = new Array(arr.length);
 for(var i=0;i<arr.length;++i) {dest[i] = arr[i];}
 return dest;
}
bu_loaded('burst.Alg');
bu_require('burst.logging.Log', ['burst.runtime.AbstractRuntime']);
function bu_dbgdbg_(s) {
 if (arguments.length == 1) print('   BU_DBGDBG: ', s);
 else {
  var a = new Array(arguments.length);
  a[0] = '   BU_DBGDBG: ';
  for(var i=0;i<arguments.length;++i) {a[i+1] = arguments[i]}
  print.apply(null, a);
 }
}
function bu_dbgdbg(s) {}
burst.logging.LogLevel = function(name, val, is_fatal) {
 this.name_ = name;
 this.value_ = val;
 this.is_fatal_ = (typeof is_fatal == 'undefined' ? false : is_fatal);
 burst.logging.Log.LEVELS_BY_VAL[val] = this;
 burst.logging.Log.LEVELS_BY_NAME[name] = this;
}
var BU_LogLevel = burst.logging.LogLevel;
BU_LogLevel.prototype.toString = function() {return this.name_ + ' (' + this.value_ + ')';}
function BU_Log(name, parent, max_level) {
 this.name_ =  name;
 this.parent_ = parent;
 this.max_level_ = max_level;
 this.appenders_ = [];
 burst.logging.Log.addLogger_(this);
}
burst.logging.Log = BU_Log;
BU_Log.logs_by_name_ = {};
BU_Log.MAX_LEVEL = 7;
BU_Log.LEVELS_BY_VAL = new Array(BU_Log.MAX_LEVEL + 1);
BU_Log.LEVELS_BY_NAME = {};
BU_Log.DEBUG = new BU_LogLevel('DEBUG', 7);
BU_Log.INFO = new BU_LogLevel('INFO', 6);
BU_Log.WARN = new BU_LogLevel('WARN', 4);
BU_Log.ERROR = new BU_LogLevel('ERROR', 3);
BU_Log.FATAL = new BU_LogLevel('FATAL', 0, true);
BU_Log.getLogger = function(name) {
 return bu_get_soft(BU_Log.logs_by_name_, name, null);
}
BU_Log.addLogger_ = function(logger) {
 var name = logger.name_;
 if (BU_Log.getLogger(name)) throw "duplicate log name '" + name + "'";
 BU_Log.logs_by_name_[name] = logger;
}
function bu_Log_noop() {};
function bu_Log_debug() {
 bu_dbgdbg("in BU_Log_debug with arguments.length=" + arguments.length);
 return this.message(BU_Log.DEBUG, arguments);
}
BU_Log.real_bu_debug = null;
BU_Log.enableDebug = function(isEnabled) {
 BU_Log.prototype.debug = isEnabled ? bu_Log_debug : bu_Log_noop;
 if (isEnabled) {
  bu_debug = BU_Log.real_bu_debug || bu_debug_;
 }
 else {
  if (bu_debug !== bu_Log_noop) BU_Log.real_bu_debug = bu_debug;
  bu_debug = bu_Log_noop;
 }
 bu_dbgdbg('burst.logging.Log enabled: ' + (bu_Log_debug === BU_Log.prototype.debug));
}
BU_Log.toLevelObject = function(level) {
 switch(typeof level) {
 case 'object': return level;
 case 'string': return BU_Log.LEVELS_BY_NAME[level];
 case 'number': return BU_Log.LEVELS_BY_VAL[level];
 default: throw "unexpected level: " + level;
 }
}
BU_Log.prototype.debug = bu_Log_debug;
BU_Log.prototype.info = function bu_Log_info() {
 return this.message(BU_Log.INFO, arguments);
}
BU_Log.prototype.warn = function bu_Log_warn() {
 return this.message(BU_Log.WARN, arguments);
}
BU_Log.prototype.error = function bu_Log_error() {
 return this.message(BU_Log.ERROR, arguments);
}
BU_Log.prototype.fatal = function bu_Log_fatal() {
 this.message(BU_Log.FATAL, arguments);
}
BU_Log.prototype.setMaxLevel = function(level) {
 if (!level) {
  if(!this.parent_) throw "(Log.js) attempt to setMaxLevel of no level, at root logger";
  this.max_level_ = level;
  return;
 }
 var levelobj = BU_Log.toLevelObject(level);
 this.max_level_ = levelobj;
 if (levelobj === BU_Log.DEBUG && bu_debug === bu_Log_noop) BU_Log.enableDebug(true);
}
BU_Log.prototype.isOn = function(level) {
 var levelobj = BU_Log.toLevelObject(level);
 if (!this.max_level_) {
  if (this.parent_) return this.parent_.isOn(levelobj);
  throw "no max_level_ or parent_";
 }
 if (this.max_level_.value_ >= levelobj.value_) {
  return true;
 }
 bu_dbgdbg("isOn=false for level " + level + ", max_level=" + this.max_level_);
 return false;
}
BU_Log.prototype.message = function(level, args, stack_start) {
 if (typeof stack_start == 'undefined') stack_start = 2;
 bu_dbgdbg("in message");
 var levelobj = BU_Log.toLevelObject(level);
 if (!this.isOn(levelobj)) {
   bu_dbgdbg("level " + levelobj + " not on");
  return false;
 }
 var mess = '';
 for (var i=0; i<args.length; i++) {mess += args[i];}
 bu_dbgdbg("combined " + args.length + " args to get message '" + mess + "'");
 this.sendAppenders(levelobj, mess, 1 + stack_start);
 if (levelobj.is_fatal_) throw mess;
 return true;
}
BU_Log.prototype.sendAppenders = function(levelobj, message, stack_start) {
 bu_dbgdbg("sending to " + this.appenders_.length + " appenders for level " + levelobj);
 for(var i=0;i<this.appenders_.length;++i) {
  var appender = this.appenders_[i];
  appender.format(this, levelobj, message, 1 + stack_start);
 }
 if (this.parent_) this.parent_.sendAppenders(this, levelobj, message, 1 + stack_start);
}
BU_Log.prototype.addAppender = function(appender) {
 if (typeof appender == 'function') {
  appender = new burst.logging.Appender(appender);
 }
 if (!appender.format) throw "attempt to add appender which is neither a function nor an object implementing method 'format': " + appender;
 this.appenders_.push(appender);
 bu_dbgdbg("pushed appender");
};
BU_Log.prototype.clearAppenders = function() {this.appenders_ = []};
BU_Log.prototype.hasAppenders = function() {return this.appenders_.length > 0};
BU_Log.prototype.setAppender = function(appender, copy_buffered) {
  var old_appender = this.appenders_.pop();
  this.clearAppenders();
  this.addAppender(appender);
  if (copy_buffered && old_appender && old_appender instanceof burst.logging.AppenderBuffer) {
   old_appender.for_lines(function(line) {appender.appendl(line);})
  }
}
function bu_zp(i, len) {
 var s = '' + i;
 return '0000000000'.substring(10 - len + s.length) + s;
}
function bu_sp(s, len, is_lj) {
 if (arguments.length < 3) is_lj = false;
 if (typeof s != 'string') s = '' + s;
 var spaces = '          '.substring(10 - len + s.length);
 return is_lj ? s + spaces : spaces + s ;
}
function bu_format_date_time(d) {
 return [bu_zp(d.getHours(),2),':',bu_zp(d.getMinutes(),2),':',bu_zp(d.getSeconds(),2),'.',bu_zp(d.getMilliseconds(),3)].join('');
}
BU_Log.defaultFormat = function(logger, levelobj, message, stack_start) {
 var now = new Date();
 var tstr = bu_format_date_time(now);
 var level_name = bu_sp(levelobj.name_, 'DEBUG'.length, true);
 var line = [tstr, ' ', level_name, ' [', logger.name_, '] ', message].join('');
 return line;
}
BU_Log.setFormatter = function(formatter) {BU_Log.format = formatter};
BU_Log.setFormatter(BU_Log.defaultFormat);
BU_Log.initPropDefs = function() {
 BU_Log.PROP_DEFS = [
 new burst.reflect.PropertyDefString({
 name: 'maxLevel',
 description: 'The max level of the "root" logger. A string name of a level such as "DEBUG". If specified, it overrides BU_LOG_ROOT_MAX_LEVEL.'
 }),
 new burst.reflect.PropertyDefExpr({
 name: 'appender',
 description: "If specified, the string is eval'd and the result is passed to setAppender."
 }),
 new burst.reflect.PropertyDefExpr({
 name: 'formatter',
 description: "If specified, the string is eval'd and the result is passed to burst.logging.Log.setFormatter."
 })
 ];
};
bu_loaded('burst.logging.Log');
function BU_Appender(appendl, format) {
 this.format = (typeof format == 'undefined') ?
 function(logger, levelobj, mess, stack_start) {
  var line = BU_Log.format(logger, levelobj, mess, 1 + stack_start);
  this.appendl(line);
 } :
 format;
 this.appendl = (typeof appendl == 'undefined') ?
function() {throw "subclass failed to implement appendl";} :
  appendl;
}
burst.logging.Appender = BU_Appender;
function BU_AppenderIframe(classval, styleval, lazy_create) {
 this.out_el_ = null;
 if (!burst.Lang.isSpecified(classval) && !burst.Lang.isSpecified(styleval)) {
  styleval = 'width: 600px; height: 300px;';
 }
 this.classval_ = classval;
 this.styleval_ = styleval;
 this.recentLast = true;
 this.scrollIntoView = true;
 this.attempted_ = false;
 this.is_ready_ = function() {return this.out_el_ ? true : false};
 this.format = function(logger, levelobj, mess, stack_start) {
  var line = BU_Log.format(logger, levelobj, mess, 1 + stack_start);
  if (!this.is_ready_()) {
   if (!this.create_()) {
    bu_alert("(Log.js) appender not ready yet to output line: \n" + line);
    return;
   }
  }
  this.append_line_(levelobj, line);
 };
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
var bu_ai_init_lock_ = false;
var bu_ai_init_iframe_exception_ = null;
var bu_ai_init_window_exception_ = null;
var bu_ai_attempt_iframe_ = true;
var bu_ai_attempt_window_ = true;
BU_AppenderIframe.IFRAME_ID = 'buLogIFRAMEID';
BU_AppenderIframe.CONTENT_FILE = 'BurstLogIframe.html';
BU_AppenderIframe.CONTENT_ID = 'buLogCONTENTID';
BU_AppenderIframe.prototype.create_ = function() {
 if (this.is_ready_()) return true;
 if (this.attempted_)
  return false;
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
BU_AppenderIframe.prototype.init_iframe_ = function() {
 var url = bu_ScriptLoader.resolveHtmlUrl(BU_AppenderIframe.CONTENT_FILE);
 var this_ = this;
 var onload_handler = function() {
  var doc = burst.xml.HtmlUtil.iframeContentDocument(this_.iframe_element_);
  this_.out_el_ = doc.getElementById(BU_AppenderIframe.CONTENT_ID) ||
    bu_throw("(Log.js) no element with id '" + BU_AppenderIframe.CONTENT_ID + "' to append to");
 };
 var el = burst.xml.HtmlUtil.iframeCreate(BU_AppenderIframe.IFRAME_ID, url, onload_handler, function(cel) {this_.iframe_element_ = cel}, true);
 if (burst.Lang.isSpecified(this.classval_)) burst.xml.DomUtil.setAttribute(el, 'class', this.classval_);
 if (burst.Lang.isSpecified(this.styleval_)) burst.xml.DomUtil.setAttribute(el, 'style', this.styleval_);
};
BU_AppenderIframe.prototype.init_window_ = function() {
 var url = bu_ScriptLoader.resolveHtmlUrl(BU_AppenderIframe.CONTENT_FILE);
 this.child_window_ = window.open(url, '', 'width=600,height=500,status=no,resizable=yes,scrollbars=yes') ||
  bu_throw("(Log.js) window.open(" + url + " failed");
 var this_ = this;
 var onload_handler = function() {
  var doc = this_.child_window_.document || bu_throw("(Log.js) window for " + url + " has no document");
  this_.out_el_ = doc.getElementById(BU_AppenderIframe.CONTENT_ID) ||
   bu_throw ("(Log.js) no element with id '" + BU_AppenderIframe.CONTENT_ID + "' to append to");
 };
 if (this.child_window_.document.body) onload_handler();
 else this.child_window_.onload = onload_handler;
};
BU_AppenderIframe.prototype.append_line_ = function(levelobj, line) {
 var parent_el = this.out_el_ || bu_throw("(Log.js) no this.out_el_");
 var classval = levelobj.name_;
 var divnode = document.createElement('div');
 burst.xml.DomUtil.setAttribute(divnode, 'class', classval);
 var textnode = document.createTextNode(line);
 divnode.appendChild(textnode);
 if (this.recentLast) parent_el.appendChild(divnode);
 else parent_el.insertBefore(divnode, parent_el.firstChild);
 if (this.scrollIntoView) divnode.scrollIntoView(false);
}
burst.logging.AppenderBuffer = function(size) {
 this.size_ = size;
 this.buffer_ = new Array(size);
 this.count_ = 0;
 this.appendl = function(line) {
  var index = this.count_ % this.size_;
  bu_dbgdbg("buffering line[" + index + "]=" + line);
  this.buffer_[index] = line;
  this.count_++;
 }
 this.for_lines = function(func) {
  var index = this.count_ % this.size_;
  var i;
  if (this.count_ > this.size_) {
   for(i=index;i<this.size_;++i) func(this.buffer_[i]);
  }
  for(i=0;i<index;++i) func(this.buffer_[i]);
 }
}
bu_inherits(burst.logging.AppenderBuffer, burst.logging.Appender);
BU_Log.bu_onerror = function(mess,url,line) {
 var fullmess = '(BU_Log.js) bu_onerror at ' + url + ' line ' + line + ': ' + mess;
 bu_alert(fullmess);
 return false;
}
var BU_LOG_ROOT_MAX_LEVEL;
if (typeof BU_LOG_ROOT_MAX_LEVEL == 'undefined') BU_LOG_ROOT_MAX_LEVEL = BU_Log.WARN;
var bu_Log = new BU_Log('root', null, BU_Log.toLevelObject(BU_LOG_ROOT_MAX_LEVEL));
function bu_Log_callerLogger(skip) {
 return bu_Log;
}
var bu_alert = (typeof this.alert != 'undefined') ? this.alert : (this.load && this.print ? this.print : function() {});
function bu_debug_() {BU_Log.prototype.debug.apply(bu_Log_callerLogger(2), arguments);}
var bu_debug = bu_debug_;
function bu_info() {BU_Log.prototype.info.apply(bu_Log_callerLogger(2), arguments);}
function bu_warn() {BU_Log.prototype.warn.apply(bu_Log_callerLogger(2), arguments);}
function bu_error() {BU_Log.prototype.error.apply(bu_Log_callerLogger(2), arguments);}
var BU_LOG_USE_JSUNIT_APPENDER;
if (typeof BU_LOG_USE_JSUNIT_APPENDER == 'undefined') BU_LOG_USE_JSUNIT_APPENDER = false;
if (BU_LOG_USE_JSUNIT_APPENDER) {
 if (typeof setUp === 'function') {
 bu_Log.addAppender(new burst.logging.Appender(null, function(logger, levelobj, mess, stack_start) {
  switch(levelobj) {
  case BU_Log.DEBUG: return debug(mess);
  case BU_Log.INFO: return inform(mess);
  case BU_Log.WARN: return warn(mess);
  case BU_Log.ERROR: return warn(mess);
  case BU_Log.FATAL: return error(message);
  }
  throw("unknown levelobj " + levelobj + " typeof=" + typeof levelobj);
 }));
 }
 else if (typeof TestSetup === 'function') {
  bu_Log.addAppender(new burst.logging.Appender( function() { JsUtil_getSystemWriter().println.apply(JsUtil_getSystemWriter(), arguments)}));
 }
 else if (typeof jum !== 'undefined' && typeof jum.name !== 'undefined' && jum.name == 'mda') {
  bu_Log.addAppender(new burst.logging.Appender( function(line) { jum.my_output_('BULOG', line) }));
 }
}
var BU_LOG_USE_PRINTLN_APPENDER;
if (typeof BU_LOG_USE_PRINTLN_APPENDER == 'undefined') BU_LOG_USE_PRINTLN_APPENDER = true;
if (BU_LOG_USE_PRINTLN_APPENDER && !bu_Log.hasAppenders() && typeof bu_Runtime.println === 'function') {
 bu_Log.addAppender(bu_Runtime.println);
}
if (!bu_Log.hasAppenders()) {
 bu_Log.addAppender(new burst.logging.AppenderBuffer(100));
}
if (bu_fixed.length > 0)
 bu_debug("fix_ecma.js replaced these symbols: ", bu_fixed);
else
 bu_debug("fix_ecma.js had no symbols to replace");
BU_Log.onDocumentLoad = function() {
 BU_Log.initPropDefs();
 var props = bu_Config.setObjectValues({}, BU_Log.PROP_DEFS, 'burst.logging.Log', true);
 if (props.maxLevel) {
  var max_level_obj = BU_Log.toLevelObject(props.maxLevel);
  bu_Log.setMaxLevel(max_level_obj);
 }
 var appender = props.appender;
 if (appender) {
  if ((typeof appender.is_ready_ == 'function') && !appender.is_ready_()) {
   burst.Lang.wait(function() {return appender.is_ready_()},
   function() {bu_Log.setAppender(appender, true)},
   null,
   50,
   1000);
  }
  else {
bu_Log.setAppender(appender, true);
  }
 }
 var formatter = props.formatter;
 if (formatter) {
  BU_Log.setFormatter(formatter);
 }
}
bu_loaded('burst.logging.logging_init', ['burst.reflect.PropertyDef', 'burst.Lang', 'burst.BurstError', 'burst.ScriptLoader'], BU_Log);
function bu_eval(str) {return eval(str)}
var bu_global_this = this;
burst.Lang = {};
burst.Lang.gensym_counter_ = 0;
burst.Lang.gensym = function() {return 'bu_gensym' + burst.Lang.gensym_counter_++}
burst.Lang.cond = function(condarray) {
 for(var i=0;i<condarray.length;++i) {
  if(condarray[i]) return condarray[i+1];
  ++i;
 }
 return null;
}
burst.Lang.argumentsToArray = function(args) {
 return burst.Alg.copy(args);
}
burst.Lang.argumentsJoin = function(args, sep) {
 return burst.Lang.argumentsToArray(args).join(sep);
}
burst.Lang.keys = function bu_keys(o) {
 var a = [];
 for(k in o) {a.push(k)}
 return a;
}
burst.Lang.isSpecified = function(o) {
 return typeof o != 'undefined' && o != null;
}
burst.Lang.isArray = function(o) {
 return !!o && typeof o == 'object' && bu_builtin_constructor(o) === Array;
}
burst.Lang.isString = function(o) {
 return (typeof s == 'string' || (typeof s == 'object' && bu_builtin_constructor(s) === String));
}
burst.Lang.isPrimitive = function(o) {
 if (o == null) return true;
 switch(typeof o) {
 case 'undefined':
 case 'boolean':
 case 'number':
 case 'string':
 case 'function':
  return true;
 case 'object':
  switch(bu_builtin_constructor(o)) {
  case Array: case RegExp: case Date: case String: return true;
   default: return false;
  }
 default:
  return bu_throw("what is: " + o);
 }
}
burst.Lang.KEYWORDS = "break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof";
burst.Lang.RESERVEDS = "abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public";
burst.Lang.isKeyword = function(s) {
 if (typeof burst.Lang.KEYWORD_SET == 'undefined') burst.Lang.KEYWORD_SET = burst.Alg.toSet(burst.Lang.KEYWORDS.split(' '));
 return bu_in(s, burst.Lang.KEYWORD_SET);
}
burst.Lang.isReserved = function(s) {
 if (typeof burst.Lang.RESERVED_SET == 'undefined') burst.Lang.RESERVED_SET = burst.Alg.toSet(burst.Lang.RESERVEDS.split(' '));
 return bu_in(s, burst.Lang.RESERVED_SET);
}
burst.Lang.isLegalIdentifier = function(s) {
 if (!s) return false;
 if (burst.Lang.isReserved(s) || burst.Lang.isKeyword(s)) return false;
 return s.match(/^[a-zA-Z0-9_\$]+$/);
}
var BU_DBG_CTOR = false;
function bu_builtin_constructor_signature(o) {
 if (BU_DBG_CTOR) alert("(burst.Lang.js) in bu_builtin_constructor_signature on " + o);
 switch(o.constructor) {
 case Array: return Array;
 case RegExp: return RegExp;
 case Date: return Date;
 }
 if (typeof o.push != 'undefined' && typeof o.concat != 'undefined') return Array;
 if (typeof o.exec != 'undefined' && typeof o.test != 'undefined') return RegExp;
 if (typeof o.getHours != 'undefined') return Date;
 if (BU_DBG_CTOR) alert("(burst.Lang.js) object seems not to be a primitive builtin: " + o + " typeof o=" + (typeof o) + "\no.constructor=" + o.constructor);
 return o.constructor;
}
function bu_builtin_constructor_parse(o) {
 var m = o.constructor.toString().match(/function (\w+)/);
 if (!m) throw Error("(burst.Lang.js) object constructor could not be parsed: " + o.constructor.toString());
 var ctor_name = m[1];
 var ctor;
 var is_prim = true;
 switch(ctor_name) {
 case 'Array':  ctor = Array; break;
 case 'RegExp': ctor = RegExp; break;
 case 'Date':   ctor = Date; break;
 default:       ctor = o.constructor; is_prim = false; break;
 }
 if (o.constructor !== ctor)
  bu_debug("object with parsed constructor '", ctor_name, "' but o.constructor is not. o: ",
    o, " o.constructor: ", o.constructor);
 return ctor;
}
function bu_choose_builtin_constructor() {
 if (bu_UA.bug_builtin_constructor_unreliable()) {
  bu_debug("(burst.Lang.js) Object.constructor is not reliable for builtins");
  return bu_builtin_constructor_signature;
 }
 else {
  bu_debug("Object.constructor is reliable for builtins");
  return function(o) {return o.constructor};
 }
}
function bu_builtin_constructor(o) {
 bu_builtin_constructor = bu_choose_builtin_constructor();
 return bu_builtin_constructor(o);
}
burst.Lang.uneval = function(o) {
 var s = bu_Lang_uneval_Object(o);
 if (s &&
   (typeof s == 'string' || (typeof s == 'object' && bu_builtin_constructor(s) === String))
   && s.length>0 && s.charAt(0)=="{") return '(' + s + ')';
 return s;
}
function bu_Lang_uneval_Object(o) {
 if (o == null) return 'null';
 switch(typeof o) {
 case 'undefined': return 'undefined';
 case 'boolean':   return o;
 case 'number':    if (isNaN(o)) return 'Number.NaN';
       return o;
 case 'string':    return burst.Text.quote(o, true, false);
 case 'function':  return o.toString();
 case 'object': {
  var o_ctor = bu_builtin_constructor(o);
   switch(o_ctor) {
   case Array:   {if (BU_DBG_CTOR) alert("(burst.Lang.js) treating as array"); return bu_Lang_uneval_Array(o);}
   case RegExp:  {return bu_Lang_uneval_regexp(o);}
   case Date:    {return 'new Date(' + o.valueOf() + ')';}
   case String:  {return burst.Text.quote(o, true, false);}
  }
  if (BU_DBG_CTOR) alert("(burst.Lang.js) about to treat object as a map; o=" + o + " o.push=" + o.push + " o.constructor=" + o.constructor);
  return bu_Lang_uneval_map(o);
 }
 default:
  throw('uneval got unknown object: ' + o);
 }
}
var bu_Lang_uneval_regexp;
switch(/ab\sc/.toString()) {
 case 'ab\\sc':
  bu_Lang_uneval_regexp = function(re) {return '/' + re.toString() + '/'};
  bu_debug("(burst.Lang.js) RegExp.toString() requires slashes");
  break;
 case '/ab\\sc/':
  bu_Lang_uneval_regexp = function(re) {return re.toString()};
  bu_debug("(burst.Lang.js) RegExp.toString() requires no slashes");
  break;
 default:
  throw Error("(burst.Lang.js) unexpected RegExp.toString() behavior: " + /ab\sc/.toString() + ' (' + /ab\sc/.toString().length + ' chars)');
}
function bu_Lang_uneval_Array(a) {
 return '[' + burst.Alg.transform(a, bu_Lang_uneval_Object).join(', ') + ']';
}
function bu_Lang_uneval_map(m) {
 return '{' + burst.Alg.transform_map(m, function(k,v) {return burst.Text.quote(k,true,true) + ': ' + bu_Lang_uneval_Object(v)}).join(', ') + '}';
}
burst.Lang.unevalFunctionCall = function(func, scopeobj, symname) {
 if (!scopeobj) scopeobj = bu_global_this;
 if (!symname) symname = burst.Lang.gensym();
 scopeobj[symname] = func;
 return symname + '()';
}
burst.Lang.functionName = function bu_Lang_functionName(func) {
 if (func.name) return func.name;
 var matches = func.toString().match(/function (\w+)/);
 var s = matches ? matches[1] : null;
 return (s == null || s.length == 0) ? 'anonymous' : s;
}
burst.Lang.functionArgumentNames = function bu_Lang_functionArgumentNames(func) {
 var matches = func.toString().match(/function [^\{]*\(([^\{]*)\)/);
 var s = matches ? matches[1] : null;
 if (s == null || s.length == 0) return new Array();
 return s.split(/, ?/);
}
burst.Lang.functionBody = function bu_Lang_functionBody(func) {
 var matches = func.toString().match(/\{([\s\S]*)\}/);
 var s = matches ? matches[1] : null;
 if (!s) bu_warn("(burst.Lang.js) could not find function body for '" + func.toString() + "'");
 else s = burst.Text.trim(s);
 return s;
}
function bu_function_arguments(func) {
 return burst.Lang.callNoStrict(function() {return func.arguments});
}
burst.Lang.formatStackFrame = function bu_Lang_formatStackFrame(func) {
 var funcname = burst.Lang.functionName(func);
 var argnames = burst.Lang.functionArgumentNames(func);
 var argvalues = bu_function_arguments(func);
 var parts = [funcname, '('];
 for(var i=0;i<Math.max(argnames.length,argvalues.length);++i) {
  if(i>0) parts.push(', ');
  var argname = i<argnames.length ? argnames[i] : null;
  var argval = i<argvalues.length ? argvalues[i] : null;
  var do_uneval = burst.Lang.isPrimitive(argval);
  if (do_uneval) argval = burst.Lang.uneval(argval);
  if (argname) {parts.push(argname); parts.push(': '); parts.push(argval);}
  else {parts.push(argval);}
 }
 parts.push(')');
 return parts.join('');
}
burst.Lang.functionCaller = bu_Lang_callerImpl();
function bu_functionCaller(func) {
 return func.caller || (func.arguments && func.arguments.caller);
}
function bu_Lang_callerImpl() {
 if (arguments.length == 0) return bu_Lang_callerImpl(bu_Lang_callerImpl);
 if (bu_Lang_callerImpl.caller) {
  bu_debug('(burst.Lang.js) can find caller via Function.caller');
  return function(f) {
   if (f.caller) {
    return f.caller;
   }
   else {
return BU_UNDEFINED;
   }
  }
 }
 if (bu_Lang_callerImpl.arguments && bu_Lang_callerImpl.arguments.caller) {
  bu_debug('(burst.Lang.js) can find caller via Arguments.caller');
  return function(f) {
   if (f.arguments && f.arguments.caller) {
     return f.arguments.caller.callee;
   }
   else {
 return BU_UNDEFINED;
   }
  };
 }
 bu_warn("(burst.Lang.js) neither Function.caller nor Arguments.caller appear to be available");
 return function(f) {return BU_UNDEFINED;};
}
function bu_Lang_getCallers(skip, op) {
 if (!skip) skip = 0;
 var func_refs = new Array();
 var func_results = op ? new Array() : null;
 for(var i=0, func = burst.Lang.functionCaller(bu_Lang_getCallers);
func != null;
func = burst.Lang.functionCaller(func), ++i) {
  if (i<skip) continue;
  var already = burst.Alg.find_value(func_refs, func);
  if (op) {
   func_results.push(op(func));
  }
  func_refs.push(func);
  if (already) {
   break;
  }
 }
 return op ? func_results : func_refs;
}
burst.Lang.getCallers = bu_Lang_getCallers;
burst.Lang.getCallerNames = function(skip) {
 if (!skip) skip = 0;
 return bu_Lang_getCallers(skip+1, burst.Lang.functionName);
}
burst.Lang.getCallerName = function(skip) {
 var names = burst.Lang.getCallerNames(skip+1);
 return names.length > 0 ? names[0] : null;
}
burst.Lang.getCallerArguments = function(skip) {
 if (!skip) skip = 0;
 return bu_Lang_getCallers(skip+1, function(f) {return burst.Lang.argumentsToArray(bu_function_arguments(f));});
}
burst.Lang.getStackTrace = function(skip) {
 if (!skip) skip = 0;
 var frames = bu_Lang_getCallers(skip+1, burst.Lang.formatStackFrame);
 return frames.join("\n");
}
burst.Lang.wait = function(check_func, true_func, timeout_func, period_millis, max_millis) {
  var count = 0;
  var checker = function() {
count++;
if (check_func()) {
  if (true_func) true_func();
}
else {
  max_millis -= period_millis;
  if (max_millis < 0) {
	if (timeout_func) timeout_func();
	else throw Error("timed out after " + max_millis + " millis waiting and " + count + " attempts");
  }
  else {
	window.setTimeout(checker, period_millis);
  }
}
  };
  window.setTimeout(checker, period_millis);
}
function bu_set_strict(is_strict) {
 if (typeof options != 'undefined' && options().indexOf('strict') != -1) {
  var orig_options = options(is_strict ? 'strict' : '');
  return function() {options(orig_options)};
 }
 else if (typeof _options != 'undefined') {
  var orig = _options.strict;
  _options.strict = is_strict;
  _options.werror = is_strict;
  return function() {_options.strict = orig; _options.werror = orig;};
 }
 else if (typeof user_pref != 'undefined') {
  var orig_val = user_pref("javascript.options.strict");
  user_pref("javascript.options.strict", is_strict ? true : false);
  return function() {user_pref("javascript.options.strict", orig_val)};
 }
 return function() {};
}
burst.Lang.callNoStrict = function(func) {
 var restore = bu_set_strict(false);
 try {return func();}
 catch (e) {throw e;}
 finally {restore();}
}
burst.Lang.securityEnableRead_moz = function bu_moz_enable() {
 try {
  netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
 } catch (e) {
  alert(e);
 }
}
burst.Lang.createActiveXObject = function bu_create_activex(progid_obj, progid_key, what) {
 var xobj;
 var progid = progid_obj[progid_key];
 if (typeof progid == 'string') {
  xobj = new ActiveXObject(progid);
 }
 else {
  var progids = progid;
  for(var i=0;i<progids.length;++i) {
   progid = progids[i];
   var threw = false;
   try{xobj = new ActiveXObject(progid);}
   catch(e) {
    threw = true;
    bu_debug("failed to create a '" + what + "' with ProgID '" + progid + "': " + e.message);
   }
   if (xobj) {
    progid_obj[progid_key] = progid;
    break;
   }
   else {
    if (!threw) bu_debug("failed to create a '" + what + "' with ProgID '" + progid + "'");
   }
  }
  if(!xobj) bu_throw("could not create a " + what + " using any of these ProgIDs: " + progids);
 }
 return xobj;
}
bu_loaded('burst.Lang', ['burst.Alg', 'burst.Text', 'burst.web.UserAgent']);
burst.MOP = {};
burst.MOP.inherits = bu_inherits;
burst.MOP.assertImplements = function(objclass, iface) {
 if(arguments.length!=2 || typeof objclass != 'function' || typeof iface != 'function') throw new Error("bad arguments: [" + objclass + "," + iface + "]");
 if (!objclass.prototype) throw new Error("no prototype in object " + objclass);
 if (!iface.prototype) throw new Error("no prototype in interface " + objclass);
 var found = 0;
 for(var funcname in iface.prototype) {
  if(typeof iface.prototype[funcname] == 'function') {
   switch(typeof objclass.prototype[funcname]) {
   case 'undefined': throw new Error("no implementation for interface function '" + funcname + "'");
   case 'function': found++; break;
   default: throw new Error("implementation not a function for '" + funcname + "': " + objclass.prototype[funcname]);
   }
  }
  else {
   throw new Error("interface has a member '" + funcname + "' which is not a function: " + iface.prototype[funcname]);
  }
 }
 return found;
}
burst.MOP.condFunction = function(funcname, condarray) {
 var f = burst.Lang.cond(condarray);
 if (!f) throw new Error("No definition for '" + funcname + "' in cond array: " + condarray);
 return f;
}
burst.MOP.singletons_ = {};
burst.MOP.singleton = function(funcname, ctor) {
 if (burst.MOP.singletons_[funcname]) throw "Attempt to make multiple instances of " + funcname;
 if (!ctor) ctor = eval(funcname);
 if (typeof ctor != 'function') throw "ctor not a function: " + ctor;
 return burst.MOP.singletons_[funcname] = ctor();
}
burst.MOP.call_cache_ = {};
burst.MOP.memoize = function(obj, funcname, func) {
 return function() {
  var key = funcname + '|' + burst.Lang.joinArguments(arguments,'|');
  if (bu_in(key, burst.MOP.call_cache_)) return burst.MOP.call_cache_[key];
  return burst.MOP.call_cache_[key] = obj.apply(func, arguments);
 }
}
burst.MOP.lazyChooseMethod = function(obj, memname, getfunc) {
 return function() {
  var func = getfunc();
  obj[memname] = func;
  return func.apply(null, arguments);
 };
}
burst.MOP.memoizeNew1 = function(cache, ctor, arg1) {
 return (bu_in(arg1, cache)) ? cache[arg1] : (cache[arg1] = new ctor(arg1));
}
burst.MOP.memoizeNew2 = function(cache, ctor, arg1, arg2) {
 var key = arg1 + '|' + arg2;
 return (bu_in(key, cache)) ? cache[key] : (cache[key] = new ctor(arg1,arg2));
}
burst.MOP.onceonly = function(cache, key, func) {
 return (bu_in(key, cache)) ? cache[key] : (cache[key] = func());
}
burst.MOP.combineMethods = function(f,g) {
 return function() {
  f.apply(this, arguments);
  g.apply(this, arguments);
 }
}
burst.MOP.afterMethod = function(obj, methname, aftermeth, must_exist) {
 if (bu_in(methname, obj)) {
  obj[methname] = burst.MOP.combineMethods(obj[methname], aftermeth);
 }
 else if (must_exist) {
  bu_throw("object does not have a method named '" + methname + "': " + obj);
 }
 else {
  obj[methname] = aftermeth;
 }
}
burst.MOP.addMethodAdvice = function(obj, methname, advice, advice_kind, precedence, meth_must_exist) {
 if (arguments.length < 4) bu_throw("insufficient args");
 if (arguments.length < 5 || !precedence) precedence = 'last';
 var joinpoint = burst.MethodJoinPoint.getForMethod(obj, methname, meth_must_exist, true);
 joinpoint.addAdvice(advice, advice_kind, precedence);
}
burst.MOP.removeMethodAdvice = function(obj, methname, advice, advice_kind, missing_ok) {
 var joinpoint = burst.MethodJoinPoint.getForMethod(obj, methname, !missing_ok, false);
 if (!joinpoint) return false;
 return joinpoint.removeAdvice(advice, advice_kind, missing_ok);
}
burst.MOP.removeAllMethodAdvice = function(obj, methname, missing_ok) {
 var joinpoint = burst.MethodJoinPoint.getForMethod(obj, methname, !missing_ok, false);
 if (!joinpoint) return false;
 return joinpoint.unintercept();
}
burst.MethodJoinPoint = function(obj, methname) {
 this.object = obj;
 this.methodname = methname;
 this.methodfunc = obj[methname];
 this.before = [];
 this.after = [];
}
burst.MethodJoinPoint.getForMethod = function(obj, methname, meth_must_exist, create_if_none) {
 if (!bu_in(methname, obj)) {
  if (meth_must_exist) bu_throw("object does not have a method named '" + methname + "': " + obj);
  if (create_if_none) obj[methname] = function() {};
  else return null;
 }
 var jpname = methname + '$joinpoint';
 var joinpoint = bu_get_soft(obj, jpname, null);
 if (joinpoint) {
  ;
 }
 else if (create_if_none) {
  joinpoint = obj[jpname] = new burst.MethodJoinPoint(obj, methname);
  obj[methname] = function() {return joinpoint.run()};
 }
 return joinpoint;
}
burst.MethodJoinPoint.prototype.unintercept = function() {
 this.object[this.methodname] = this.methodfunc;
}
burst.MethodJoinPoint.prototype.run = function() {
 var obj = this.object;
 var args = arguments;
 burst.Alg.for_each(this.before, function(meth) {meth.apply(obj, args);});
 var result; if (this.methodfunc) result = this.methodfunc.apply(obj, args);
 burst.Alg.for_each(this.after, function(meth) {meth.apply(obj, args);});
 if (this.methodfunc) return result; else return BU_UNDEFINED;
}
burst.MethodJoinPoint.prototype.addAdvice = function(advice, advice_kind, precedence) {
 var arr = (advice_kind == 'before' ? this.before : this.after);
 if (!arr) bu_throw("bad this: " + this);
 if (precedence == 'first') arr.unshift(advice);
 else arr.push(advice);
}
burst.MethodJoinPoint.prototype.removeAdvice = function(advice, advice_kind, missing_ok) {
 var arr = (advice_kind == 'before' ? this.before : this.after);
 if (!arr) bu_throw("bad this: " + this);
 var ind = burst.Alg.find(arr, advice);
 if (ind == -1) {
  if (!missing_ok) bu_throw("object does not have that advice on method named '" + methname + "': " + obj);
  return false;
 }
 arr.splice(ind, 1);
 return true;
}
burst.MOP.initNamed = function(obj, values, names, nullDefault) {
 if (typeof obj != 'object') bu_throw("obj not an object: " + obj);
 if (typeof values != 'object') bu_throw("initNamed values not an object: " + values);
 for(var k in values) {
  if (names && !(bu_in(k, names))) bu_throw("Unexpected initializer key '" + k + "' not among:" + burst.Lang.uneval(names));
  obj[k] = values[k];
 }
 if (names) {
  for(k in names) {
   if (!(bu_in(k, values))) {
    if (names[k]) {
     bu_debug("about to throw because of key '", k, "'");
     bu_throw("No value provided for mandatory key '" + k + "', just: " + burst.Lang.uneval(values));
    }
    else if (nullDefault) {
bu_debug("defaulting key '", k, "' to null");
     obj[k] = null;
    }
   }
  }
 }
 return obj;
}
bu_loaded('burst.MOP', ['burst.BurstError', 'burst.Lang']);
bu_require('burst.BurstError', ['burst.MOP']);
function bu_throw(msg) {
 throw burst.BurstError(msg);
}
function bu_unsupported(funcname) {
 throw burst.BurstError("The function '" + funcname + "' is not supported in this environment");
}
function bu_unimplemented(funcname) {
 throw burst.BurstError("The function '" + funcname + "' is not yet implemented.");
}
burst.BurstError = function(msg) {
 if (!(this instanceof burst.BurstError)) return new burst.BurstError(msg);
 this.message = msg || '';
 return this;
}
bu_inherits(burst.BurstError, Error);
burst.BurstError.prototype.name = 'burst.BurstError';
burst.BurstError.prototype.toString = function() {return this.name + ': ' + this.message;}
function bu_assertTrue(msg, cond) {
 if (arguments.length == 1) {cond = msg; msg = null;}
 if (!eval(cond)) throw burst.AssertFailure("assertTrue('" + cond + "') failed" + (msg ? ': ' + msg : ''));
}
function bu_assertFalse(msg, cond) {
 if (arguments.length == 1) {cond = msg; msg = null;}
 if (eval(cond)) throw burst.AssertFailure("assertFalse('" + cond + "') failed" + (msg ? ': ' + msg : ''));
}
function bu_assertEquals(msg, expected, actual) {
 if (arguments.length == 2) {actual = expected; expected = msg; msg = null;}
 if (expected != actual) throw burst.AssertFailure("assertEquals failed, Expected:<" + expected + ">, but was:<" + actual + ">" + (msg ? ': ' + msg : ''));
}
function bu_assertState(statename, expected, actual) {
 if (arguments.length == 2) {actual = expected; expected = statename; statename = null;}
 if (expected !== actual) throw burst.BurstError("assertState for state" +
  (statename ? " '" + statename + "'": '') +
  " failed, Expected:<" + expected + ">, but was:<" + actual + ">");
}
function bu_assertArgs(funcname, num, args) {
 if (args.length < num) bu_throw("Function '" + funcname + "' expected " + num + " arguments and instead got " + args.length);
 for(var i=0;i<num;++i) {
  var v = args[i];
  if (v == null || (typeof v == 'undefined')) bu_throw("Function '" + funcname + "' expected " + num + " non-null non-undefined arguments and argument " + i + " is " + v);
 }
}
burst.AssertFailure = function(msg) {
 if (!(this instanceof burst.AssertFailure)) return new burst.AssertFailure(msg);
 this.message = msg || '';
 return this;
}
bu_inherits(burst.AssertFailure, burst.BurstError);
burst.AssertFailure.prototype.name = 'burst.AssertFailure';
var BU_UA_FAMILY_IE = 'ie';
var BU_UA_FAMILY_IEMAC = 'iemac';
var BU_UA_FAMILY_OPERA = 'opera';
var BU_UA_FAMILY_KHTML = 'khtml';
var BU_UA_FAMILY_GECKO = 'gecko';
var BU_UA_FAMILY_ICAB = 'icab';
var BU_UA_FAMILY_ICE = 'ice';
var BU_UA_FAMILY_W3M = 'w3m';
var BU_UA_FAMILY_UNKNOWN = 'unknown';
var BU_UA_FAMILY_NONE = 'none';
var BU_UA_BRAND_KONQ = 'konqueror';
var BU_UA_BRAND_SAFARI = 'safari';
var BU_UA_BRAND_OPERA = 'opera';
var BU_UA_BRAND_IE = 'ie';
var BU_UA_BRAND_IEMAC = 'iemac';
var BU_UA_BRAND_NETSCAPE = 'netscape';
var BU_UA_BRAND_MOZILLA = 'mozilla';
var BU_UA_BRAND_ICAB = 'icab';
var BU_UA_BRAND_ICE = 'ice';
var BU_UA_BRAND_W3M = 'w3m';
var BU_UA_BRAND_UNKNOWN = 'unknown';
var BU_UA_BRAND_NONE = 'none';
var BU_UA_OS_WIN = 'windows';
var BU_UA_OS_MAC = 'mac';
var BU_UA_OS_LINUX = 'linux';
var BU_UA_OS_X11 = 'x11';
var BU_UA_OS_UNKNOWN = 'unknown';
var bu_last_index;
var bu_last_match;
function bu_first_match(str, pairs) {
 for(var i=0;i<pairs.length;++i) {
  var s = pairs[i++];
  var val = pairs[i];
  bu_last_index = str.indexOf(s);
  if (bu_last_index != -1) {bu_last_match = s; return val;}
 }
 return null;
}
burst.web.UserAgent = function() {
 if (typeof navigator == 'undefined') {
  this.family_ = BU_UA_FAMILY_NONE;
  this.brand_ = BU_UA_BRAND_NONE;
  return;
 }
 var ua = navigator.userAgent.toLowerCase();
 var os = bu_first_match(ua,
  ['win',   BU_UA_OS_WIN,
   'mac',   BU_UA_OS_MAC,
   'linux', BU_UA_OS_LINUX,
   'x11',   BU_UA_OS_X11
  ]) || BU_UA_OS_UNKNOWN;
 bu_last_match = bu_last_index = null;
 var brand = bu_first_match(ua,
  ['konqueror', BU_UA_BRAND_KONQ,
   'safari',    BU_UA_BRAND_SAFARI,
   'opera',     BU_UA_BRAND_OPERA,
   'icebrowser',BU_UA_BRAND_ICE,
   'icab',      BU_UA_BRAND_ICAB,
   'w3m',       BU_UA_BRAND_W3M,
   'msie',      BU_UA_BRAND_IE,
   'netscape6', BU_UA_BRAND_NETSCAPE,
   'netscape',  BU_UA_BRAND_NETSCAPE,
   'gecko',     BU_UA_BRAND_MOZILLA
 ]) || BU_UA_BRAND_UNKNOWN;
 if (typeof navigator.__ice_version != 'undefined') {
  brand = BU_UA_BRAND_ICE;
 }
 var ver = null;
 var rvind = ua.indexOf('rv:');
 var gecko_rv = (rvind == -1) ? null : parseFloat(ua.substring(rvind + 3));
 if (brand == BU_UA_BRAND_MOZILLA) {
  ver = gecko_rv;
 }
 if (!ver && bu_last_match) {
  ver = parseFloat(ua.substring(bu_last_index + bu_last_match.length + 1));
 }
 var gen;
 var fam = null;
 switch(brand) {
 case BU_UA_BRAND_IE: {
  fam = BU_UA_FAMILY_IE;
  if (ver >= 5) gen = 5;
  break;
 }
 case BU_UA_BRAND_NETSCAPE: {
  fam = BU_UA_FAMILY_GECKO;
  if (ver >= 6) gen = 5;
  break;
 }
 case BU_UA_BRAND_MOZILLA: {
  fam = BU_UA_FAMILY_GECKO;
  gen = 5;
  break;
 }
 case BU_UA_BRAND_ICAB: {
  fam = BU_UA_FAMILY_ICAB;
  gen = 4;
  break;
 }
 case BU_UA_BRAND_W3M: {
  fam = BU_UA_FAMILY_W3M;
  gen = 4;
  break;
 }
 case BU_UA_BRAND_ICE: {
  fam = BU_UA_FAMILY_ICE;
  ver = navigator.__ice_version;
  gen = 5;
  break;
 }
 case BU_UA_BRAND_KONQ: {
  fam = BU_UA_FAMILY_KHTML;
  gen = ver > 2 ? 5 : 4;
  break;
 }
 case BU_UA_BRAND_SAFARI: {
  fam = BU_UA_FAMILY_KHTML;
  gen = 5;
  break;
 }
 case BU_UA_BRAND_OPERA: {
  fam = BU_UA_FAMILY_OPERA;
  gen = (ver < 7) ? 4 : 5;
  break;
 }
 default: {
  throw Error("unexpected brand " + brand);
 }
 }
 if (os == BU_UA_OS_MAC && fam == BU_UA_FAMILY_IE) {
  fam = BU_UA_FAMILY_IEMAC;
  brand = BU_UA_BRAND_IEMAC;
 }
 this.os_ = os;
 this.brand_ = brand;
 this.version_ = ver;
 this.gecko_version_ = gecko_rv;
 this.family_ = fam;
 this.generation_ = gen;
}
burst.web.UserAgent.prototype.is_family_ie = function() {return this.family_ == BU_UA_FAMILY_IE};
burst.web.UserAgent.prototype.is_family_opera = function() {return this.family_ == BU_UA_FAMILY_OPERA};
burst.web.UserAgent.prototype.has_window_event_listener = function() {return true};
burst.web.UserAgent.prototype.is_browser = function() {return this.family_ !== BU_UA_FAMILY_NONE;}
burst.web.UserAgent.prototype.bug_set_style_attribute = function() {
 return this.is_family_ie();
};
burst.web.UserAgent.prototype.bug_builtin_constructor_unreliable = function() {
 var isbug =
  (this.brand_ === BU_UA_BRAND_OPERA) ||
  (this.family_ === BU_UA_FAMILY_KHTML) ||
  false;
 return isbug;
}
burst.web.UserAgent.prototype.bug_create_iframe = function() {
 var isbug =
  (this.is_family_ie() && this.version_ < 7) ||
  false;
 return isbug;
};
burst.web.UserAgent.prototype.bug_iframe_delayed_create = function() {
 var isbug =
  (this.family_ === BU_UA_FAMILY_OPERA) ||
  false;
 return isbug;
}
burst.web.UserAgent.prototype.bug_iframe_display_none = function() {
 var isbug =
  (this.family_ == BU_UA_FAMILY_GECKO && this.gecko_version_ < 1.1) ||
  (this.family_ === BU_UA_FAMILY_OPERA) ||
  (this.family_ === BU_UA_FAMILY_KHTML) ||
  false;
 return isbug;
};
burst.web.UserAgent.prototype.bug_iframe_relative_url = function() {
 var isbug =
  (this.brand_ === BU_UA_BRAND_OPERA) ||
  (this.family_ === BU_UA_FAMILY_KHTML) ||
  false;
 return isbug;
}
burst.web.UserAgent.prototype.bug_ie_attributes = function() {
 var isbug =
  (this.is_family_ie() && this.version_ < 7) ||
  false;
 return isbug;
}
burst.web.UserAgent.prototype.can_setTimeout_function = function() {
 var can =
  (this.is_family_ie()) ||
  (this.family_ === BU_UA_FAMILY_GECKO) ||
  (this.family_ === BU_UA_FAMILY_OPERA) ||
  false;
 return can;
}
burst.web.UserAgent.prototype.can_iframe_onload_static = function() {
 var can =
  (this.is_family_ie() && this.version_ >= 5.5) ||
  (this.brand_ === BU_UA_BRAND_NETSCAPE && this.version_ >= 6.2) ||
  (this.family_ === BU_UA_FAMILY_GECKO && this.gecko_version_ >= 1.0) ||
  false;
 return can;
}
burst.web.UserAgent.prototype.can_iframe_onload_dyn = function() {
 var can =
  (this.brand_ === BU_UA_BRAND_NETSCAPE && this.version_ >= 6.2) ||
  (this.family_ === BU_UA_FAMILY_GECKO && this.gecko_version_ >= 1.0) ||
  (this.family_ === BU_UA_FAMILY_KHTML) ||
  false;
 return can;
}
var bu_UA = new burst.web.UserAgent();
bu_UA.isIE = bu_UA.is_family_ie();
bu_UA.isIE50 = bu_UA.isIE && bu_UA.version_ < 5.5;
bu_UA.isIEBox = bu_UA.isIE && document.compatMode != 'CSS1Compat';
bu_UA.isOpera = (bu_UA.family_ == BU_UA_FAMILY_OPERA);
bu_UA.isGecko = (bu_UA.family_ == BU_UA_FAMILY_GECKO);
bu_UA.isKHTML = (bu_UA.family_ == BU_UA_FAMILY_KHTML);
bu_UA.isIce = (bu_UA.family_ == BU_UA_FAMILY_ICE);
bu_loaded('burst.web.UserAgent');
if (typeof window != 'undefined') {
if (!window.Node) {
 window.Node = {
  ELEMENT_NODE           : 1,
  ATTRIBUTE_NODE         : 2,
  TEXT_NODE              : 3,
  CDATA_SECTION_NODE     : 4,
  ENTITY_REFERENCE_NODE  : 5,
  ENTITY_NODE            : 6,
  PROCESSING_INSTRUCTION_NODE    : 7,
  COMMENT_NODE           : 8,
  DOCUMENT_NODE          : 9,
  DOCUMENT_TYPE_NODE     : 10,
  DOCUMENT_FRAGMENT_NODE : 11,
  NOTATION_NODE          : 12
 }
}
}
bu_loaded('burst.xml.fix_dom');
var BU_DBG_DOM = false;
function bu_debug_Dom() {
 if (BU_DBG_DOM) bu_alert.apply(null, arguments);
}
burst.xml.DomUtil = {};
burst.xml.DomUtil.escapeHtml = function(s, quot_too) {
 if (typeof s === 'number' || typeof s === 'boolean') return '' + s;
 s = s.replace(/\&/g, '&amp;');
 s = s.replace(/</g, '&lt;');
 s = s.replace(/>/g, '&gt;');
 if (quot_too) s = s.replace(/\"/g, '&quot;');
 return s;
}
burst.xml.DomUtil.setTimeout = function(win, func, millis) {
 if (bu_UA.can_setTimeout_function() || typeof func == 'string') return win.setTimeout(func, millis);
 if (typeof func != 'function') bu_throw("func is not a function: " + func);
 var str = burst.Lang.unevalFunctionCall(func, win);
 return win.setTimeout(str, millis);
}
burst.xml.DomUtil.ownerDocument = function(node) {
 if (typeof node.ownerDocument != 'undefined') return node.ownerDocument;
 while (node.parentNode) node = node.parentNode;
 return node;
}
burst.xml.DomUtil.isDocumentComplete = function(doc) {
 if (arguments.length < 1 || !doc) doc = document;
 if (doc.readyState && doc.readyState == 'complete') return true;
 return (typeof doc.body != 'undefined' && doc.body != null);
}
burst.xml.DomUtil.getAttributeNodes = function(node) {
 if (bu_UA.bug_ie_attributes()) {
  var a = [];
  var push_att = function(attn) {
   if (!attn) return;
   if (typeof attn.nodeValue == 'undefined' || attn.nodeValue == null) return;
   if (attn.nodeValue == '') return;
   a.push(attn);
  };
  for(var k in node.attributes) {
   var attnode = node.attributes[k];
   if (!attnode) continue;
   if (typeof attnode == 'object') {
    push_att(attnode);
   }
   else {
    if (typeof node.getAttributeNode != 'undefined')
     push_att(node.getAttributeNode(k));
    else if (typeof node.getAttribute != 'undefined' && typeof node.getAttribute(k) == 'object')
     push_att(node.getAttribute(k));
    else
     bu_unsupported("getAttributeNodes");
   }
  }
  return a;
 }
 else {
  return node.attributes;
 }
}
burst.xml.DomUtil.getInnerText = function(node) {
 if (!node) bu_throw("getInnerText called with bad node: " + node);
 if (typeof node.innerText != 'undefined') return node.innerText;
 if (typeof node.documentElement != 'undefined' && node.documentElement !== null && typeof node.documentElement.outerText != 'undefined')
  return node.documentElement.outerText;
 return bu_DomUtil_getInnerText(node);
}
function bu_DomUtil_getInnerText(node) {
 var texts = [];
 burst.xml.DomUtil.for_children(node, function(child) {
  if (child.nodeType == Node.TEXT_NODE) texts.push(child.nodeValue);
  else if (child.nodeType == Node.ELEMENT_NODE) texts.push(bu_DomUtil_getInnerText(child));
 });
 return texts.join('');
}
burst.xml.DomUtil.setInnerText = function(node, text) {
 if(typeof node.innerText != 'undefined') {node.innerText = text; return;}
 bu_DomUtil_setInnerText(node, text);
}
function bu_DomUtil_setInnerText(node, text) {
 var html = burst.xml.DomUtil.escapeHtml(text);
 burst.xml.DomUtil.setInnerHTML(node, html);
}
burst.xml.DomUtil.getInnerHTML = function(node) {
 if (typeof node.innerHTML != 'undefined') return node.innerHTML;
 if (typeof node.documentElement != 'undefined' && node.documentElement !== null && typeof node.documentElement.outerHTML != 'undefined')
  return node.documentElement.outerHTML;
 return bu_DomUtil_getInnerHTML(node);
}
function bu_DomUtil_getInnerHTML(node) {
 var texts = [];
 burst.xml.DomUtil.for_children(node, function(child) {
  texts.push(burst.xml.DomUtil.getOuterHTML(child));
 });
 return texts.join('');
}
burst.xml.DomUtil.setInnerHTML = function(node, html) {
 if (typeof node.innerHTML != 'undefined') {node.innerHTML = html; return;}
 bu_throw("No implementation of innerHTML");
}
burst.xml.DomUtil.getOuterHTML = function(node) {
 if (typeof node.outerHTML != 'undefined') return node.outerHTML;
 return bu_DomUtil_getOuterHTML(node);
}
function bu_DomUtil_getOuterHTML(node) {
 return burst.xml.DomUtil.serialize(node, true);
}
burst.xml.DomUtil.setOuterHTML = function(node, html) {
 if (typeof node.outerHTML != 'undefined') {node.outerHTML = html; return;}
 var doc = burst.xml.DomUtil.ownerDocument(node);
 var range = doc.createRange();
 range.setStartBefore(node);
 if (typeof range.createContextualFragment == 'undefined')
  bu_unsupported("setOuterHTML without Range.createContextualFragment");
 var fragment = range.createContextualFragment(html);
 node.parentNode.replaceChild(fragment, node);
}
burst.xml.DomUtil.insertAdjacentElement = function(where, node) {
 if (typeof node.insertAdjacentElement != 'undefined')
  node.insertAdjacentElement(where, el);
 else
  bu_DomUtil_insertAdjacentElement_thor(node, where, el);
}
function bu_DomUtil_insertAdjacentElement_thor(node, where, el) {
 switch (where){
 case 'beforeBegin':
  node.parentNode.insertBefore(el, node);
  break;
 case 'afterBegin':
  node.insertBefore(el, node.firstChild);
  break;
 case 'beforeEnd':
  node.appendChild(el);
  break;
 case 'afterEnd':
  if (node.nextSibling)
   node.parentNode.insertBefore(el, node.nextSibling);
  else
   node.parentNode.appendChild(el);
  break;
 default:
  bu_throw("bad where '" + where + "'");
 }
}
burst.xml.DomUtil.insertAdjacentText = function(where, node) {
 if (typeof node.insertAdjacentText != 'undefined')
  node.insertAdjacentText(where, el);
 else
  bu_DomUtil_insertAdjacentText_thor(node, where, el);
}
function bu_DomUtil_insertAdjacentText_thor(node, where, txt) {
 var parsedText = document.createTextNode(txt);
 burst.xml.DomUtil.insertAdjacentElement(node, where, parsedText);
}
burst.xml.DomUtil.insertAdjacentHTML = function(where, node) {
 if (typeof node.insertAdjacentHTML != 'undefined')
  node.insertAdjacentHTML(where, el);
 else
  bu_DomUtil_insertAdjacentHTML_thor(node, where, el);
}
function bu_DomUtil_insertAdjacentHTML_thor(node, where, html) {
 if (typeof node.ownerDocument == 'undefined' || typeof node.ownerDocument.createRange == 'undefined')
   bu_unsupported("insertAdjacentHTML without Document.createRange");
 var r = node.ownerDocument.createRange();
 r.setStartBefore(node);
 if (typeof r.createContextualFragment == 'undefined')
  bu_unsupported("insertAdjacentHTML without Range.createContextualFragment");
 var parsedHTML = r.createContextualFragment(html);
 burst.xml.DomUtil.insertAdjacentElement(node, where, html);
}
burst.xml.DomUtil.serialize = function(node, isHtml, depth) {
 if (typeof node == 'undefined' || !node) bu_throw("(burst.xml.DomUtil.js) bad node to serialize: " + node);
 if (typeof node.nodeType == 'undefined' && typeof node.documentElement != 'undefined' && node.documentElement !== null)
  return burst.xml.DomUtil.serialize(node.documentElement);
 if (arguments.length < 3) depth = 0;
 var texts = [];
 switch(node.nodeType) {
 case Node.ELEMENT_NODE: {
  texts.push('<');
  texts.push(node.nodeName);
  burst.Alg.for_each(burst.xml.DomUtil.getAttributeNodes(node), function(att) {
   texts.push(' ');
   texts.push(att.nodeName);
   texts.push('="');
   texts.push(burst.xml.DomUtil.escapeHtml(att.nodeValue,true));
   texts.push('"');
  });
  if (node.firstChild) {
   texts.push('>');
   if (isHtml) {
    texts.push(burst.xml.DomUtil.getInnerHTML(node));
   }
   else {
    burst.xml.DomUtil.for_children(node, function(child) {texts.push(burst.xml.DomUtil.serialize(child, isHtml, ++depth))});
   }
   texts.push('</'); texts.push(node.nodeName); texts.push('>');
  }
  else {
   texts.push('/>');
  }
  return texts.join('');
 }
 case Node.TEXT_NODE: {
  return node.nodeValue;
 }
 case Node.CDATA_SECTION_NODE: {
  return "<![CDATA[" + node.nodeValue + "]]>";
 }
 case Node.ENTITY_REFERENCE_NODE: {
  return "&" + node.nodeName + ";"
 }
 case Node.PROCESSING_INSTRUCTION_NODE: {
  return "<?" + node.target + " " + node.data + "?>" ;
 }
 case Node.COMMENT_NODE: {
 return "<!--" + node.nodeValue + "-->" ;
 }
 case Node.DOCUMENT_NODE: {
   if (isHtml) {
    texts.push(burst.xml.DomUtil.getInnerHTML(node));
   }
   else {
    burst.xml.DomUtil.for_children(node, function(child) {texts.push(burst.xml.DomUtil.serialize(child,isHtml,++depth))});
   }
   return texts.join('');
 }
 case Node.DOCUMENT_TYPE_NODE: {
  texts.push('<!DOCTYPE ');
  texts.push(node.nodeName);
  if (node.publicId) {
   texts.push(' PUBLIC \"'); texts.push(node.publicId); texts.push('\"');
   if (node.systemId) {
    texts.push(' \"'); texts.push(node.systemId); texts.push('\"');
   }
  }
  else if (node.systemId) {
   texts.push(' SYSTEM \"'); texts.push(node.systemId); texts.push('\"');
  }
  if (node.internalSubset) {texts.push(" "); texts.push(node.internalSubset);}
  texts.push(">\n");
  return texts.join('');
 }
 default:
  if (typeof node.nodeType == 'undefined') {
   bu_alert("(burst.xml.DomUtil.js) skipping node with undefined nodeType at depth " + depth);
  }
  else bu_throw("(burst.xml.DomUtil.js) unsupported node.nodeType=" + node.nodeType);
  return '';
 }
}
burst.xml.DomUtil.nd = function(node, attmap, children) {
 if (attmap) {
  for(var attname in attmap) {
   node.setAttribute(attname, attmap[attname]);
  }
 }
 if (children) {
  for(var i=2;i<arguments.length;++i) {
   var child = arguments[i];
   if (burst.Lang.isArray(child)) {
    for(var j=0;j<child.length;++j) {node.appendChild(child[j])}
   }
   else node.appendChild(child);
  };
 }
 return node;
}
burst.xml.DomUtil.structToNode = function(st, doc, depth, child_index) {
 if (!doc) doc = document;
 if (arguments.length <= 2) {depth = 0; child_index = -1;}
 bu_debug("structToNode(",st,")");
 if (typeof st === 'number') st = '' + st;
 if (typeof st === 'string') {
  return doc.createTextNode(st);
 }
 if (!burst.Lang.isArray(st)) bu_throw("(burst.xml.DomUtil.js) unexpected structure type: " + st + "\n typeof=" + (typeof st) + " st.constructor=\n" + st.constructor + "\nisArray=" + (st.constructor==Array) + " name=" + st.constructor.name + " has push=" + (typeof st.push) + "\n at depth " + depth + " and child index " + child_index);
 var tagname = st[0] || bu_throw("no tag name");
 var el;
 switch(tagname) {
 case '#document-fragment': el = doc.createDocumentFragment(); break;
 default: el = doc.createElement(tagname);
 }
 var attmap = st[1];
 if (attmap) {
  for(var attname in attmap) {
   el.setAttribute(attname, attmap[attname]);
  }
 }
 for(var i=2;i<st.length;++i) {
  var child = burst.xml.DomUtil.structToNode(st[i], doc, ++depth, i - 2);
  el.appendChild(child);
 }
 return el;
}
burst.xml.DomUtil.el = function(name, attmap, children) {
 if (typeof name != 'string') bu_throw('(burst.xml.DomUtil.js) bad name argument to el: ' + name);
 var indent = false;
 var a = [];
 a.push('<'); a.push(name);
 if (attmap) {
  for(var attname in attmap) {
   a.push(' '); a.push(attname); a.push('="');
bu_debug("attname -> " + attmap[attname]);
   var attval = attmap[attname];
   if (typeof attval == 'undefined') {
    var mess = '(burst.xml.DomUtil.js) attribute "' + attname + '" has bad typeof ' + (typeof attval) +
      ' and value |' + attval + '|' +
      ' el so far is "' + a.join('') + '"';
    bu_alert(mess);
   }
   else if (attval == null) {}
   else
    a.push(burst.xml.DomUtil.escapeHtml(attval, true));
   a.push('"');
  }
 }
 a.push('>');
 if (children) {
  function add_child(s) {
   if (indent) {a.push("\n  "); s = s.replace(/\n/g, "\n  ");}
   a.push(s);
  }
  for(var i=2;i<arguments.length;++i) {
   var str = arguments[i];
   if (burst.Lang.isArray(str)) {
    for(var j=0;j<str.length;++j) {add_child(str[j])}
   }
   else add_child(str);
  };
 }
 a.push('</'); a.push(name); a.push('>');
 return a.join('');
}
burst.xml.DomUtil.for_children = function(node, unary_func, node_type) {
 if (!node) bu_throw("no node");
 if (!unary_func) bu_throw("no unary_func");
 if (typeof unary_func != 'function') bu_throw("unary_func not a function");
 for(var child=node.firstChild;child;child=child.nextSibling) {
  if (!node_type || child.nodeType == node_type) {
   unary_func(child);
  }
 }
}
burst.xml.DomUtil.find_child = function(node, unary_pred, node_type) {
 if (!node) throw "no node";
 for(var child=node.firstChild;child;child=child.nextSibling) {
  if (!node_type || child.nodeType == node_type) {
   if (unary_pred(child)) return child;
  }
 }
 return null;
}
burst.xml.DomUtil.firstChildWithTagName = function(node, name, must_exist, cs) {
 if (!cs) name = name.toUpperCase();
 var func = function(n) {
  return name == n.nodeName;
 };
 var child = burst.xml.DomUtil.find_child(node, func, Node.ELEMENT_NODE);
 if (!child && must_exist) bu_throw("node has no '" + name + "' child");
 return child;
}
burst.xml.DomUtil.nthChildWithTagName = function(node, n, name, must_exist, cs) {
 if (!cs) name = name.toUpperCase();
 var seen = 0;
 for(var child=node.firstChild; child; child=child.nextSibling) {
  if (child.nodeType == Node.ELEMENT_NODE && name == child.nodeName) {
   if (n == seen) break;
   seen++;
  }
 }
 if (!child && must_exist) bu_throw("found " + seen + " element children with tag name " + name + " but not " + n);
 return child;
}
burst.xml.DomUtil.getChildrenWithTagName = function(node, name, cs) {
 if (!cs) name = name.toUpperCase();
 var children = [];
 for(var child=node.firstChild; child; child=child.nextSibling) {
  bu_debug("(burst.xml.DomUtil.js) getChildrenWithTagName at child with name " + child.nodeName);
  if (child.nodeType == Node.ELEMENT_NODE && (name == '*' || name == child.nodeName)) {
   children.push(child);
  }
 }
 return children;
}
burst.xml.DomUtil.childrenNamed = function(node, name, is_snapshot) {
 return is_snapshot ?
  burst.xml.DomUtil.getChildrenWithTagName(node, name) :
  node.getElementsByTagName(name);
}
burst.xml.DomUtil.getAttribute = function(node, name) {
 if (node.nodeType != Node.ELEMENT_NODE) return BU_UNDEFINED;
 if (!node || !node.getAttribute) throw Error("(DomUtil.js) attempt to call getAttribute(" + node + ", " + name + ")");
 var val = node.getAttribute(name);
 if (name == 'class') {return val ? val : burst.xml.DomUtil.getAttribute(node, 'className');}
 if (name == 'for') {return val ? val : burst.xml.DomUtil.getAttribute(node, 'htmlFor');}
 if (name == 'style') {
  if (!val || typeof val == 'string') return val;
  return val.cssText;
 }
 if (val && typeof val == 'object') {alert("getAttribute returned object"); return val.value;}
 return val;
}
burst.xml.DomUtil.setAttribute = function(node, name, val) {
 if (name == 'class') {node.className = val; return;}
 if (name == 'style' && bu_UA.bug_set_style_attribute()) {
  node.style.cssText = val;
  return;
 }
 node.setAttribute(name, val);
}
bu_loaded('burst.xml.DomUtil', ['burst.BurstError', 'burst.Lang', 'burst.web.UserAgent', 'burst.URI', 'burst.Alg']);
burst.xml.HtmlUtil = {};
burst.xml.HtmlUtil.getDocumentScriptSrc = function(matching, mustFind) {
 var scripts = document.getElementsByTagName('script');
 if (typeof matching == 'string') {
 for(var i=0;i<scripts.length;++i) {
  if (scripts[i].src && scripts[i].src.indexOf(matching)!=-1) return scripts[i].src;
 }
 }
 else {
 for( i=0;i<scripts.length;++i) {
  if (scripts[i].src && scripts[i].src.match(matching)) return scripts[i].src;
 }
 }
 if (mustFind) throw Error("none of the " + scripts.length + " script elements have a src matching " + matching);
 return null;
}
burst.xml.HtmlUtil.addClassValue = function(el, val, first) {
 var s = burst.xml.DomUtil.getAttribute(el, 'class');
 if (!s || s.length == 0) {
  burst.xml.DomUtil.setAttribute(el, val);
  return true;
 }
 var vals = s.split(' ');
 if (burst.Alg.find(vals, val) != -1) return false;
 if (first) vals.shift(val); else vals.push(val);
 burst.xml.DomUtil.setAttribute(node, 'class', vals.join(' '));
 return true;
}
burst.xml.HtmlUtil.removeClassValue = function(el, val) {
 var s = burst.xml.DomUtil.getAttribute(el, 'class');
 if (!s || s.length == 0) {return false;}
 var vals = s.split(' ');
 var ind = burst.Alg.find(vals, val);
 if (ind == -1) return false;
 vals.splice(ind, 1);
 burst.xml.DomUtil.setAttribute(node, 'class', vals.join(' '));
 return true;
}
burst.xml.HtmlUtil.getStylePropertyValue = function(node, propName) {
 if (propName == 'float') propName = 'cssFloat';
 var v;
 if (document.defaultView)
   v = document.defaultView.getComputedStyle(node,null).getPropertyValue(propName);
 else if (x.currentStyle)
   v = eval('node.currentStyle.' + propName);
 else bu_throw("no way to get style properties");
 return v;
}
burst.xml.HtmlUtil.setStyleProperty = function(node, propName, propVal) {
 if (propName == 'float') propName = 'cssFloat';
 if (bu_UA.bug_set_style_attribute()) {
  node.style.setProperty(propName, propVal);
 }
 else {
  node.style[propName] = propVal;
 }
}
burst.xml.HtmlUtil.maxZIndex = function(doc) {
 var maxz = null;
 burst.xml.DomUtil.for_children(doc.documentElement, function(n) {
			     var nz = burst.xml.HtmlUtil.getComputedStyle(n, 'z-index');
			     var nzi = parseInt(nz);
			     if (nz && !isNaN(nzi) && (maxz == null || nz > maxz)) maxz = nz;
			 });
 return maxz;
}
burst.xml.HtmlUtil.getComputedStyle = function(node, attname) {
  var doc = node.ownerDocument;
  if (doc && doc.defaultView && doc.defaultView.getComputedStyle) {
var s = doc.defaultView.getComputedStyle(node, null).getPropertyValue(attname);
   return s;
  }
  var propname = burst.xml.HtmlUtil.stylePropertyName(attname);
  if (bu_UA.isIE) {
return node.currentStyle[propname];
  }
  var val = node.style[propname];
  return val;
}
burst.xml.HtmlUtil.parseStylePixels = function(s, attname, fallback) {
  if (s && (/px$/i.test(s) || /^\d+$/.test(s)) ) {
var v = parseInt(s);
if (!isNaN(v)) {
  return v;
}
  }
  if (typeof fallback != 'undefined') return fallback;
  alert("unexpected value '" + s + "' from style value of '" + attname + "'");
  return 0;
}
burst.xml.HtmlUtil.getComputedStylePixels = function(node, attname, fallback) {
  var s = burst.xml.HtmlUtil.getComputedStyle(node, attname);
  if (!s || s == '') {
var propname = burst.xml.HtmlUtil.stylePropertyName(attname);
var inlineval = node.style[propname];
return 0;
  }
  return burst.xml.HtmlUtil.parseStylePixels(s, attname, fallback);
}
burst.xml.HtmlUtil.stylePropertyName = function(attname) {
 var words = attname.split('-');
 if (words.length == 1) return attname;
 var a = [words[0]];
 for(var i=1;i<words.length;++i) {a.push(burst.Text.ucfirst(words[i]))}
 return a.join('');
}
burst.xml.HtmlUtil.getDocumentElementIE = function(doc) {
  if (!doc) doc = document;
  return doc.compatMode == 'CSS1Compat' ? doc.documentElement : doc.body;
}
burst.xml.HtmlUtil.parseStyle = function(text) {
 if (!text || text.length == 0) return {};
 var a = burst.Text.splitTerms(text, '[\\w,#%+-]+|;|:');
 var map = {};
 if (a.length == 0) return map;
 var i=0;
 while(true) {
  var name = a[i++];
  if (a[i++] != ':') bu_throw("found '" + a[i-1] + "' expected ':'");
  var vals = [];
  for(;i<a.length;i++) {
   if(a[i] == ';') {i++; break;}
   vals.push(a[i]);
  }
  var valstring = burst.Text.unquote(vals.join(' '));
  map[name] = valstring;
  if(i==a.length) break;
 }
 return map;
}
burst.xml.HtmlUtil.getWindowBaseUrl = function(win, recurse_parent) {
 var base_url;
 var head_el = win.document.documentElement.firstChild;
 var base_el
 if (head_el)
  base_el = burst.xml.DomUtil.firstChildWithTagName(head_el, 'base');
 if (base_el) {
  base_url = base_el.getAttribute('href');
 }
 if (!base_url) base_url = win.location.href;
 if (recurse_parent && !burst.URI.isAbsolute(url) && win.parent && win != win.parent) {
  return burst.xml.HtmlUtil.resolveWindowUrl(base_url, win.parent);
 }
 return base_url;
}
burst.xml.HtmlUtil.resolveWindowUrl = function(url, win) {
 if (burst.URI.isAbsolute(url)) return url;
 var base_url = burst.xml.HtmlUtil.getWindowBaseUrl(win);
 return burst.URI.resolveUrl(url, base_url, true);
}
burst.xml.HtmlUtil.createImg = function(doc, src, alt, title) {
  return burst.xml.DomUtil.structToNode(['img', {src: src, alt: alt, title: title}], doc);
}
burst.xml.HtmlUtil.iframeCreate = function(iframe_id, srcval, onloadval, create_cb, as_visible) {
 if (typeof srcval == 'undefined' || srcval == null) {
  srcval = burst.io.IframeURIRequest.NO_SRC;
 }
 if (!document.body)
   bu_throw("(burst.xml.HtmlUtil.js) no document.body to append the iframe element child to, window.location.href=" +
      (window.location ? window.location.href : 'undefined'));
 var iframe_el_parent = document.body;
 var needs_onload = true;
 if (typeof onloadval == 'undefined' || onloadval == null) {
  needs_onload = false;
  onloadval = "alert('(HtmlUtil.js) in onload from initial iframe create of url " + srcval + "')";
 }
 var iframe_el;
 if (bu_UA.bug_create_iframe() ||
   (needs_onload && bu_UA.can_iframe_onload_static() && !bu_UA.can_iframe_onload_dyn())
 ) {
  var visstyle = bu_UA.bug_iframe_display_none() ?
   'visibility: hidden; border: 0px; height: 0px; width: 0px;' :
   'display: none;';
  if (typeof onloadval == 'undefined') onloadval = null;
  if (onloadval && typeof onloadval != 'string') {
   if (typeof onloadval != 'function') bu_throw("(burst.xml.HtmlUtil.js) onloadval neither string nor function: " + onloadval);
   onloadval = 'parent.' + burst.Lang.unevalFunctionCall(onloadval);
  }
  bu_debug_Dom("(burst.xml.HtmlUtil.js) bug_create_iframe() || needs_onload=true. using html to create iframe with id " + iframe_id + " and onload=" + onloadval);
  var html = burst.xml.DomUtil.el('IFRAME', {
ID:     iframe_id,
NAME:   iframe_id,
STYLE:  visstyle,
    ONLOAD: onloadval,
SRC:    srcval
}, null);
  bu_debug("(burst.xml.HtmlUtil.js) inserting html: ", html);
  iframe_el_parent.insertAdjacentHTML('beforeEnd', html);
  iframe_el = document.getElementById(iframe_id) || bu_throw("can't get the iframe I just created");
  if (typeof create_cb == 'function') create_cb(iframe_el);
 }
 else {
  bu_debug_Dom("(burst.xml.HtmlUtil.js) bug_create_iframe()=false. using createElement to create iframe with id " + iframe_id + " bug_iframe_display_none=" + bu_UA.bug_iframe_display_none() + " src=" + srcval);
  iframe_el = document.createElement('iframe');
  if (create_cb) create_cb(iframe_el);
  iframe_el.setAttribute('id', iframe_id);
  iframe_el.setAttribute('name', iframe_id);
  if (!as_visible) {
   if (bu_UA.bug_iframe_display_none()) {
    iframe_el.style.visibility = 'hidden';
    iframe_el.style.border = '0px';
    iframe_el.style.height = '0px';
    iframe_el.style.width = '0px';
   }
   else
    iframe_el.style.display = 'none';
  }
  iframe_el.setAttribute('src', srcval);
  if (onloadval) {
   if (typeof onloadval == 'function') iframe_el.onload = onloadval;
   else iframe_el.onload = new Function(onloadval);
  }
  iframe_el_parent.appendChild(iframe_el);
 }
 if (!iframe_el.getAttribute('name'))
  bu_debug_Dom("(HtmlUtil.js) the iframe element I just made does not have a value for getAttribute('name')");
 if (typeof window != 'undefined' && !window.frames[iframe_id]) {
  if (BU_DBG_DOM || !bu_UA.bug_iframe_delayed_create())
   bu_alert("(burst.xml.HtmlUtil.js) The iframe I just created is not in window.frames");
 }
 return iframe_el;
}
burst.xml.HtmlUtil.iframeContentWindow = function(iframe_el) {
 bu_assertArgs('iframeContentWindow',1,arguments);
 var win =
  iframe_el.contentWindow ||
  burst.xml.HtmlUtil.iframeContentDocument(iframe_el).defaultView ||
  burst.xml.HtmlUtil.iframeContentDocument(iframe_el).__parent__ ||
  (iframe_el.name && document.frames[iframe_el.name]) ||
  bu_unsupported('iframeContentWindow');
 return win;
}
burst.xml.HtmlUtil.iframeContentDocument = function(iframe_el) {
 bu_assertArgs('iframeContentDocument',1,arguments);
 var doc =
  iframe_el.contentDocument ||
  (iframe_el.contentWindow && iframe_el.contentWindow.document) ||
  (iframe_el.name && document.frames[iframe_el.name] && document.frames[iframe_el.name].document) ||
  bu_unsupported('iframeContentDocument');
 return doc;
}
burst.xml.HtmlUtil.iframeLocation = function(iframe_el, fallback_name) {
 bu_assertArgs('iframeLocation',1,arguments);
 var loc =
  (iframe_el.contentWindow && iframe_el.contentWindow.location) ||
  (iframe_el.contentDocument &&
    (iframe_el.contentDocument.location ||
     (iframe_el.contentDocument.defaultView && iframe_el.contentDocument.defaultView.location)));
 if (!loc) {
  bu_alert("could not find frame window using expected methods");
  var name = iframe_el.getAttribute('name') || fallback_name;
  loc = frames && frames[name] && frames[name].location;
  if (loc) bu_alert("found in frames");
  if (!loc) {
   loc = document.frames && document.frames[name] && document.frames[name].location;
   if (loc) bu_alert("found in document.frames");
  }
  if (iframe_el.location) {
   bu_alert("iframe element itself has a location " + iframe_el.location + " ===window.location:" + (window.location===iframe_el.location));
   loc = iframe_el.location;
  }
  if (!loc)
   bu_unsupported("iframeLocation, for iframe with getAttribute('name')='" +
      iframe_el.getAttribute('name') + "' and fallback_name='" + fallback_name + "'");
 }
 return loc;
}
burst.xml.HtmlUtil.iframeReplaceContents = function(iframe_el, html) {
  var idoc = burst.xml.HtmlUtil.iframeContentDocument(iframe_el);
  if (idoc === document) bu_throw("(burst.xml.HtmlUtil.js) attempt to write over my own document");
  idoc.close();
  idoc.open();
  idoc.write(html);
  idoc.close();
}
burst.xml.HtmlUtil.iframeSetVisible = function(iframe_el, isvis) {
 if (bu_UA.bug_iframe_display_none()) {
  if (isvis) {
   iframe_el.style.visibility = 'visible';
   iframe_el.style.width = '300px';
   iframe_el.style.height = '100px';
  }
  else {
   iframe_el.style.visibility = 'hidden';
   iframe_el.style.width = '0px';
   iframe_el.style.height = '0px';
  }
 }
 else {
  iframe_el.style.display = isvis ? 'block' : 'none';
 }
}
bu_loaded('burst.xml.HtmlUtil', ['burst.xml.DomUtil', 'burst.Alg', 'burst.web.UserAgent', 'burst.Text', 'burst.io.IframeURIRequest']);
burst.xml.HtmlBox = {};
var BU_HtmlBox = burst.xml.HtmlBox;
BU_HtmlBox.getDocumentWidth = function(doc) {
 if (!doc) doc = document;
 return bu_UA.isIE ? burst.xml.HtmlUtil.getDocumentElementIE(doc).scrollWidth : (bu_UA.isOpera ? 0 : doc.body.scrollWidth);
}
BU_HtmlBox.getDocumentHeight = function(doc) {
 if (!doc) doc = document;
 return bu_UA.isIE ? burst.xml.HtmlUtil.getDocumentElementIE(doc).scrollHeight : (bu_UA.isOpera ? doc.documentElement.scrollHeight : doc.body.scrollHeight);
}
BU_HtmlBox.getDocumentScrollLeft = function(doc) {
 if (!doc) doc = document;
 return bu_UA.isIE ? burst.xml.HtmlUtil.getDocumentElementIE(doc).scrollLeft : doc.body.scrollLeft;
}
BU_HtmlBox.getDocumentScrollTop = function(doc) {
 if (!doc) doc = document;
 return bu_UA.isIE ? burst.xml.HtmlUtil.getDocumentElementIE(doc).scrollTop : doc.body.scrollTop;
}
BU_HtmlBox.getDocumentViewWidth = function(doc) {
 if (!doc) doc = document;
 return bu_UA.isIE ? burst.xml.HtmlUtil.getDocumentElementIE(doc).clientWidth : (bu_UA.isKHTML ? doc.documentElement.clientWidth : doc.body.clientWidth);
}
BU_HtmlBox.getDocumentViewHeight = function(doc) {
 if (!doc) doc = document;
 if (bu_UA.isKHTML) return doc === document ? window.innerHeight : bu_throw("unimplemented");
 return bu_UA.isIE ? burst.xml.HtmlUtil.getDocumentElementIE(doc).clientHeight : doc.body.clientWidth;
}
BU_HtmlBox.getWindowWidth = function(win) {
 if (!win) win = window;
 return bu_UA.isIE ? (bu_UA.isIEBox ? win.document.documentElement.scrollWidth : win.document.documentElement.offsetWidth) :
 win.innerWidth;
}
BU_HtmlBox.getWindowHeight = function(win) {
 if (!win) win = window;
 return bu_UA.isIE ? (bu_UA.isIEBox ? win.document.documentElement.scrollHeight : win.document.documentElement.offsetHeight) :
 win.innerHeight;
}
BU_HtmlBox.getBorderBoxLeft = function(el) {
  var x = 0;
  var lastel = el;
  while(el) {
x += el.offsetLeft || 0;
lastel = el;
el = el.offsetParent;
if (el && bu_UA.isIE) x += el.clientLeft;
  }
  if (bu_UA.isIE && !bu_UA.isIEBox && lastel.tagName == 'BODY') {
x += 2;
  }
  return x;
}
BU_HtmlBox.getBorderBoxTop = function(el) {
  var y = 0;
  var lastel = el;
  while(el) {
y += el.offsetTop || 0;
lastel = el;
el = el.offsetParent;
if (el && bu_UA.isIE) y += el.clientTop;
  }
  if (bu_UA.isIE && !bu_UA.isIEBox && lastel.tagName == 'BODY') {
y += 2;
  }
  return y;
}
BU_HtmlBox.getBorderBoxWidth = function(el) {
 return el.offsetWidth;
}
BU_HtmlBox.getBorderBoxHeight = function(el) {
 return el.offsetWidth;
}
BU_HtmlBox.getBorderBoxRect = function(el) {
  return [BU_HtmlBox.getBorderBoxLeft(el), BU_HtmlBox.getBorderBoxTop(el),
  BU_HtmlBox.getBorderBoxWidth(el), BU_HtmlBox.getBorderBoxHeight(el)];
}
BU_HtmlBox.getBorderLeftWidth = function(el) {
  return (bu_UA.isIE || bu_UA.isOpera) ? el.clientLeft : burst.xml.HtmlUtil.getComputedStylePixels(el, 'border-left-width');
}
BU_HtmlBox.getBorderTopWidth = function(el) {
  return (bu_UA.isIE || bu_UA.isOpera) ? el.clientTop : burst.xml.HtmlUtil.getComputedStylePixels(el, 'border-top-width');
}
BU_HtmlBox.getBorderRightWidth = function(el) {
  if (bu_UA.isIE || bu_UA.isOpera)
return el.offsetWidth - el.clientWidth - el.clientLeft;
  else
   return burst.xml.HtmlUtil.getComputedStylePixels(el, 'border-right-width');
}
BU_HtmlBox.getBorderBottomWidth = function(el) {
  if (bu_UA.isIE || bu_UA.isOpera)
return el.offsetHeight - el.clientHeight - el.clientTop;
  else
   return burst.xml.HtmlUtil.getComputedStylePixels(el, 'border-bottom-width');
}
BU_HtmlBox.getPaddingLeftWidth = function(el) {
  var pl = burst.xml.HtmlUtil.getComputedStylePixels(el, 'padding-left');
  return pl;
}
BU_HtmlBox.getPaddingTopWidth = function(el) {
  var pt = burst.xml.HtmlUtil.getComputedStylePixels(el, 'padding-top');
  return pt;
}
BU_HtmlBox.getPaddingRightWidth = function(el) {
  var pr = burst.xml.HtmlUtil.getComputedStylePixels(el, 'padding-right');
  return pr;
}
BU_HtmlBox.getPaddingBottomWidth = function(el) {
  var pb = burst.xml.HtmlUtil.getComputedStylePixels(el, 'padding-bottom');
  return pb;
}
BU_HtmlBox.getPaddingBoxLeft = function(el) {
  return BU_HtmlBox.getBorderBoxLeft(el) + BU_HtmlBox.getBorderLeftWidth(el);
}
BU_HtmlBox.getPaddingBoxTop = function(el) {
  return BU_HtmlBox.getBorderBoxTop(el) + BU_HtmlBox.getBorderTopWidth(el);
}
BU_HtmlBox.getPaddingBoxWidth = function(el) {
  if (bu_UA.isIE || bu_UA.isOpera) return el.clientWidth;
  return BU_HtmlBox.getBorderBoxWidth(el) -
  BU_HtmlBox.getBorderLeftWidth(el) -
  BU_HtmlBox.getBorderRightWidth(el);
}
BU_HtmlBox.getPaddingBoxHeight = function(el) {
  if (bu_UA.isIE || bu_UA.isOpera) return el.clientHeight;
  return BU_HtmlBox.getBorderBoxHeight(el) -
  BU_HtmlBox.getBorderTopWidth(el) -
  BU_HtmlBox.getBorderBottomWidth(el);
}
BU_HtmlBox.getContentBoxLeft = function(el) {
  var padleft = BU_HtmlBox.getPaddingBoxLeft(el);
  var padwidth = BU_HtmlBox.getPaddingLeftWidth(el);
  return padleft + padwidth;
}
BU_HtmlBox.getContentBoxTop = function(el) {
  var padtop = BU_HtmlBox.getPaddingBoxTop(el);
  var padwidth = BU_HtmlBox.getPaddingTopWidth(el);
  return padtop + padwidth;
}
BU_HtmlBox.getContentBoxWidth = function(el) {
  if (bu_UA.isGecko) {
return burst.xml.HtmlUtil.getComputedStylePixels(el, 'width');
  }
  var cw = BU_HtmlBox.getPaddingBoxWidth(el) -
  BU_HtmlBox.getPaddingLeftWidth(el) -
  BU_HtmlBox.getPaddingRightWidth(el);
  if (bu_UA.isIE) return cw;
  if (bu_UA.isIE) {
if (!bu_UA.isIEBox) {
  var pw = el.style.pixelWidth;
  if (pw > 0) return pw;
}
  }
  if (!bu_UA.isIEBox) {
var pos = burst.xml.HtmlUtil.getComputedStyle(el, 'position');
var try_style = (pos && pos == 'absolute');
if (try_style) {
  var sw = burst.xml.HtmlUtil.getComputedStylePixels(el, 'width', 0);
  if (sw > 0) return sw;
}
  }
  return cw;
}
BU_HtmlBox.getContentBoxHeight = function(el) {
  if (bu_UA.isGecko) {
return burst.xml.HtmlUtil.getComputedStylePixels(el, 'height');
  }
  var ch = BU_HtmlBox.getPaddingBoxHeight(el) -
  BU_HtmlBox.getPaddingTopWidth(el) -
  BU_HtmlBox.getPaddingBottomWidth(el);
  if (bu_UA.isIE) return ch;
  if (bu_UA.isIE) {
if (!bu_UA.isIEBox) {
  var ph = el.style.pixelHeight;
  if (ph > 0) return ph;
}
  }
  if (!bu_UA.isIEBox) {
var pos = burst.xml.HtmlUtil.getComputedStyle(el, 'position');
var try_style = (pos && pos == 'absolute');
if (try_style) {
  var sh = burst.xml.HtmlUtil.getComputedStylePixels(el, 'height', 0);
  if (sh > 0) return sh;
}
  }
  return ch;
}
BU_HtmlBox.getContentBoxRect = function(el) {
  return [BU_HtmlBox.getContentBoxLeft(el), BU_HtmlBox.getContentBoxTop(el),
  BU_HtmlBox.getContentBoxWidth(el), BU_HtmlBox.getContentBoxHeight(el)];
}
BU_HtmlBox.getMarginBoxLeft = function(el) {
  return BU_HtmlBox.getBorderBoxLeft(el) - BU_HtmlBox.getMarginLeftWidth(el);
}
BU_HtmlBox.getMarginBoxTop = function(el) {
  return BU_HtmlBox.getBorderBoxTop(el) - BU_HtmlBox.getMarginTopWidth(el);
}
BU_HtmlBox.getMarginBoxWidth = function(el) {
  return BU_HtmlBox.getBorderBoxWidth(el) +
  BU_HtmlBox.getMarginLeftWidth(el) +
  BU_HtmlBox.getMarginRightWidth(el);
}
BU_HtmlBox.getMarginBoxHeight = function(el) {
  return BU_HtmlBox.getBorderBoxHeight(el) +
  BU_HtmlBox.getMarginTopWidth(el) +
  BU_HtmlBox.getMarginBottomWidth(el);
}
BU_HtmlBox.getScrollLeft = function(el) {
 return el.scrollLeft;
}
BU_HtmlBox.getScrollTop = function(el) {
 return el.scrollTop;
}
BU_HtmlBox.getCanvasPaddingBoxWidth = function(el) {
 if (bu_UA.isIE || bu_UA.isKHTML) return el.scrollWidth;
 if (el.scrollWidth == el.offsetWidth) return BU_HtmlBox.getPaddingBoxWidth(el);
 return el.scrollWidth;
}
BU_HtmlBox.getCanvasPaddingBoxHeight = function(el) {
 if (bu_UA.isIE || bu_UA.isKHTML) return el.scrollHeight;
 if (bu_UA.isOpera && el.scrollHeight > el.clientHeight) return el.scrollHeight;
 if (!bu_UA.isOpera && el.scrollHeight == el.offsetHeight) return BU_HtmlBox.getPaddingBoxHeight(el);
 return el.scrollHeight;
}
BU_HtmlBox.setContentBoxLeft = function(el, contentleft) {
  if (bu_UA.isIEBox) {
contentleft = contentleft - BU_HtmlBox.getBorderBoxLeft(el) - BU_HtmlBox.getPaddingBoxLeft(el);
  }
  el.style.left = contentleft + 'px';
}
BU_HtmlBox.setBorderBoxLeft = function(el, boxleft) {
  if (!bu_UA.isIEBox) {
boxleft += BU_HtmlBox.getBorderBoxLeft(el) + BU_HtmlBox.getPaddingBoxLeft(el);
  }
  el.style.left = boxleft + 'px';
}
BU_HtmlBox.setContentBoxTop = function(el, contenttop) {
  if (bu_UA.isIEBox) {
contenttop = contenttop - BU_HtmlBox.getBorderBoxTop(el) - BU_HtmlBox.getPaddingBoxTop(el);
  }
  el.style.top = contenttop + 'px';
}
BU_HtmlBox.setBorderBoxTop = function(el, boxtop) {
  if (!bu_UA.isIEBox) {
boxtop += BU_HtmlBox.getBorderBoxTop(el) + BU_HtmlBox.getPaddingBoxTop(el);
  }
  el.style.top = boxtop + 'px';
}
BU_HtmlBox.setContentBoxWidth = function(el, contentwidth) {
  if (bu_UA.isIEBox) {
contentwidth = contentwidth + BU_HtmlBox.getBorderLeftWidth(el) + BU_HtmlBox.getBorderRightWidth(el) +
BU_HtmlBox.getPaddingLeftWidth(el) + BU_HtmlBox.getPaddingRightWidth(el);
  }
  el.style.width = contentwidth + 'px';
}
BU_HtmlBox.setBorderBoxWidth = function(el, boxwidth) {
  if (!bu_UA.isIEBox) {
boxwidth = boxwidth - (BU_HtmlBox.getBorderLeftWidth(el) + BU_HtmlBox.getBorderRightWidth(el) +
BU_HtmlBox.getPaddingLeftWidth(el) + BU_HtmlBox.getPaddingRightWidth(el));
  }
  el.style.width = boxwidth + 'px';
}
BU_HtmlBox.setContentBoxHeight = function(el, contentheight) {
  if (bu_UA.isIEBox) {
contentheight = contentheight + BU_HtmlBox.getBorderTopWidth(el) + BU_HtmlBox.getBorderBottomWidth(el) +
BU_HtmlBox.getPaddingTopWidth(el) + BU_HtmlBox.getPaddingBottomWidth(el);
  }
  el.style.height = contentheight + 'px';
}
BU_HtmlBox.setBorderBoxHeight = function(el, boxheight) {
  if (!bu_UA.isIEBox) {
boxheight = boxheight - (BU_HtmlBox.getBorderTopWidth(el) + BU_HtmlBox.getBorderBottomWidth(el) +
BU_HtmlBox.getPaddingTopWidth(el) + BU_HtmlBox.getPaddingBottomWidth(el));
  }
  el.style.height = boxheight + 'px';
}
BU_HtmlBox.setStylePos = function(el, left, top) {
  el.style.left = left + 'px';
  el.style.top = top + 'px';
}
BU_HtmlBox.incStylePos = function(el, left_delta, top_delta) {
  var curleft = burst.xml.HtmlUtil.getComputedStylePixels(el, 'left');
  el.style.left = (currleft + left_delta) + 'px';
  var curtop = burst.xml.HtmlUtil.getComputedStylePixels(el, 'top');
  el.style.top = (curtop + top_delta) + 'px';
}
BU_HtmlBox.incStyleDims = function(node, width_delta, height_delta) {
 var curwidth = burst.xml.HtmlUtil.getComputedStylePixels(el, 'width');
 node.style.width = (curwidth + width_delta) + 'px';
 var curheight = burst.xml.HtmlUtil.getComputedStylePixels(el, 'height');
 node.style.height = (curheight + height_delta) + 'px';
}
BU_HtmlBox.fixBoxModel = function() {
}
burst.xml.XmlDoc = {};
burst.xml.XmlDoc.XMLDOM_PROGID = ['Msxml2.DOMDocument.4.0', 'Msxml2.DOMDocument', 'Microsoft.XMLDom'];
burst.xml.XmlDoc.createEmpty = function() {
 var domdoc;
 if (document && document.implementation && document.implementation.createDocument) {
  domdoc = document.implementation.createDocument('', '', null);
 }
 else if (bu_Runtime.has_msxml()) {
  domdoc = burst.Lang.createActiveXObject(burst.xml.XmlDoc, 'XMLDOM_PROGID', 'DomDocument');
 }
 else {
  bu_unsupported('burst.xml.XmlDoc.createEmpty');
 }
 return domdoc;
}
burst.xml.XmlDoc.createFromUrl = function(url, handler) {
 var domdoc = burst.xml.XmlDoc.createEmpty();
 burst.xml.XmlDoc.loadUrl(domdoc, url, handler);
 return domdoc;
}
burst.xml.XmlDoc.createFromString = function(str) {
 var domdoc;
 if (bu_Runtime.has_msxml()) {
  domdoc = burst.xml.XmlDoc.createEmpty();
  var is_success = domdoc.loadXML(str);
  if (!is_success) bu_throw("loadXML('" + burst.Text.ellipsis(str,100) + "') failed, parseError: " + burst.xml.XmlDoc.getParseError(domdoc));
 }
 else if (DOMParser) {
  var parser = new DOMParser();
  domdoc = parser.parseFromString(str, 'text/xml');
 }
 return domdoc;
}
burst.xml.XmlDoc.loadUrl = function(domdoc, url, handler) {
 var onload2 = function() {handler(domdoc,url)};
 var assert_success = false;
 if (document && document.implementation && document.implementation.createDocument) {
  assert_success = true;
  domdoc.addEventListener("load", onload2, false);
 }
 else {
  assert_success = true;
  domdoc.async = true;
  domdoc.resolveExternals = false;
  domdoc.onreadystatechange = function() {if (domdoc.readyState == 4) onload2()};
 }
 var is_success = domdoc.load(url);
 if (!is_success && assert_success) bu_throw("load(" + url + ") failed, parseError: " + burst.xml.XmlDoc.getParseError(domdoc));
}
burst.xml.XmlDoc.getParseError = function(domdoc) {
 if (typeof domdoc.parseError != 'undefined') return domdoc.parseError;
 if (domdoc.documentElement && domdoc.documentElement.localName == "parsererror") {
  return burst.xml.XmlDoc.toXmlString(domdoc);
 }
 return BU_UNDEFINED;
}
burst.xml.XmlDoc.toXmlString = function(domdoc) {
 if (!domdoc) bu_throw("(burst.xml.XmlDocjs) no domdoc argument");
 if (domdoc === document) bu_throw("(burst.xml.XmlDocjs) domdoc === document");
 var must_msxml = false;
 var str = null;
 if (typeof domdoc.xml != 'undefined') {
  str = domdoc.xml;
 }
 else if (typeof domdoc.XMLDocument != 'undefined' && typeof domdoc.XMLDocument.xml != 'undefined') {
  str = domdoc.XMLDocument.xml;
 }
 else if (bu_Runtime.has_msxml()) {
  var mess = "(burst.xml.XmlDoc.js) have msxml but domdoc has no .xml member. .innerXml=" + domdoc.innerXml +
  " documentElement.xml=" + (domdoc.documentElement ? domdoc.documentElement.xml : 'no documentElement') +
  " XMLDocument=" + domdoc.XMLDocument ;
  if (must_msxml) bu_throw(mess);
  else bu_alert(mess);
 }
 if (!str) {
  if (typeof XMLSerializer != 'undefined') {
   var serializer = new XMLSerializer;
   str = serializer.serializeToString(domdoc);
  }
  else {
   str = burst.xml.DomUtil.serialize(domdoc);
   if (/contentEditable/.test(str)) {
    var mess2 = '(burst.xml.XmlDoc.js) tried to serialize xml document but got contentEditable crap';
bu_alert(mess2);
   }
  }
 }
 return str;
}
function bu_fix_readystate(obj) {
 if (obj.readyState == null) {
   obj.readyState = 1;
   obj.addEventListener("load", function () {
     obj.readyState = 4;
     if (typeof obj.onreadystatechange == "function")
         obj.onreadystatechange();
   }, false);
 }
}
bu_loaded('burst.xml.XmlDoc', ['burst.xml.DomUtil', 'burst.Text', 'burst.runtime.AbstractRuntime', 'burst.Lang']);
burst.web.IEEvent = function(ev) {
 if (!ev) ev = window.event;
 this.ie_event_ = ev;
 this.target = ev.srcElement;
 this.type = ev.type;
 if (bu_in('keyCode',ev)) this.keyCode = ev.keyCode;
 var this_obj = this;
 if (true) {
  burst.Alg.for_each(['shiftKey', 'altKey', 'ctrlKey', 'metaKey'], function(k) {
   if (bu_in(k, ev)) this_obj[k] = ev[k];
  });
 }
 if (typeof ev.button != 'undefined') {
  burst.Alg.for_each(['button', 'screenX', 'screenY', 'clientX', 'clientY'], function(k) {
   if (bu_in(k, ev)) this_obj[k] = ev[k];
  });
 }
 if (ev.fromElement) this.relatedTarget = ev.fromElement;
 if (ev.toElement) this.relatedTarget = ev.toElement;
}
burst.web.IEEvent.prototype.callListener = function(listener, curTarget) {
 if (typeof listener != 'function') bu_throw("listener not a function: " + listener);
 this.currentTarget = curTarget;
 var ret = listener.call(curTarget, this);
 return ret;
}
burst.web.IEEvent.prototype.stopPropagation = function() {
 this.ie_event_.cancelBubble = true;
}
burst.web.IEEvent.prototype.preventDefault = function() {
 this.ie_event_.returnValue = false;
}
burst.web.WindowEvent = {};
var BU_WindowEvent = burst.web.WindowEvent;
BU_WindowEvent.addEventListener = function(node, eventType, listener, useCapture, unsupported_ok) {
 if (node.addEventListener) {
  node.addEventListener(eventType, listener, useCapture);
  return true;
 }
 else if (node.attachEvent) {
  if (useCapture) {
   bu_throw("no emulation for useCapture=true with attachEvent");
  }
  var ok = node.attachEvent('on' + eventType, function() {return (new burst.web.IEEvent()).callListener(listener, node)});
  if (!ok && !bu_UA.isOpera) {
   bu_throw("(WindowEvent.js) attachEvent returned false");
  }
  return true;
 }
 else {
  if (typeof unsupported_ok != 'undefined' && unsupported_ok) return false;
  bu_unsupported("burst.web.WindowEvent.addEventListener");
  return false;
 }
}
BU_WindowEvent.removeEventListener = function(node, eventType, listener, useCapture) {
 if (node.removeEventListener) {
  node.removeEventListener(node, eventType, listener, useCapture);
 }
 else if (node.detachEvent) {
  node.detachEvent('on' + eventType, listener);
 }
 else {
  bu_unsupported('burst.web.WindowEvent.removeEventListener');
 }
}
BU_WindowEvent.addWindowListener = function(eventtype, func, win) {
 if (typeof win == 'undefined') win = window;
 if (bu_UA.has_window_event_listener() &&
   BU_WindowEvent.addEventListener(win, eventtype, func, false, true)) {
  return;
 }
 var onev = 'on' + eventtype;
 win[onev] = bu_in(onev, win) ? burst.MOP.combineMethods(win[onev], func) : func;
}
BU_WindowEvent.dispatchClick = function(node) {
 if (typeof document.createEvent !== 'undefined' && typeof node.dispatchEvent !== 'undefined') {
  var ev = document.createEvent('MouseEvents');
  var node_win = node.ownerDocument.defaultView || bu_warn('no node.ownerDocument.defaultView for dispatchEvent');
  ev.initMouseEvent(
  'click',
  true,
  true,
  node_win,
  1,
  0,
  0,
  0,
  0,
  false,
  false,
  false,
  false,
  0,
  null
  );
  node.dispatchEvent(ev);
 }
 else if (typeof document.createEventObject !== 'undefined' && typeof node.fireEvent !== 'undefined') {
  var ieev = document.createEventObject();
  ieev.type = 'click';
  node.fireEvent('on' + ieev.type, ieev);
 }
 else if (typeof node.click != 'undefined') {
  node.click();
 }
 else bu_unsupported('dispatchClick');
}
BU_WindowEvent.stopEvent = function(ev) {
  if (window.event) {
  ev.returnValue = false;
  ev.cancelBubble = true;
  }
  else {
  ev.preventDefault();
  ev.stopPropagation();
  }
}
BU_WindowEvent.getEventDocument = function(ev) {
  if (window.event && (window.event === ev || window.event.srcElement === ev.srcElement)) return document;
  if (ev.view) return ev.view.document;
  return burst.xml.DomUtil.ownerDocument(BU_WindowEvent.getEventTarget(ev));
}
BU_WindowEvent.getEventWindow = function(ev) {
  if (window.event && (window.event === ev || window.event.srcElement === ev.srcElement)) return window;
  if (ev.view) return ev.view;
  var doc = burst.xml.DomUtil.ownerDocument(BU_WindowEvent.getEventTarget(ev));
  return doc.defaultView ? doc.defaultView : (bu_UA.isIE ? doc.parentWindow : window);
}
BU_WindowEvent.getEventTarget = function(ev) {
  return ev.target ? ev.target : ev.srcElement;
}
BU_WindowEvent.getMousePos = function(ev, name) {
  if (!name) throw Error("no name argument");
  switch(name) {
  case 'screenX': return bu_UA.isKHTML ? 0 : ev.screenX;
  case 'screenY': return bu_UA.isKHTML ? 0 : ev.screenY;
  case 'pageX':   {
if (!bu_UA.isIE) return ev.pageX;
var relx = burst.xml.HtmlUtil.getDocumentElementIE(BU_WindowEvent.getEventDocument(ev));
return ev.clientX + relx.scrollLeft - relx.clientLeft;
  }
  case 'pageY': {
if (!bu_UA.isIE) return ev.pageX;
var rely = burst.xml.HtmlUtil.getDocumentElementIE(BU_WindowEvent.getEventDocument(ev));
return ev.clientY + rely.scrollTop - rely.clientTop;
  }
  case 'clientX': return ev.clientX;
  case 'clientY': return ev.clientY;
  case 'offsetX': {
if (bu_UA.isIE) return ev.offsetX + ev.srcElement.clientLeft;
if (!bu_UA.isGecko) return ev.offsetX;
var pos = burst.xml.HtmlUtil.getComputedStyle(el, 'position');
if (pos && pos != 'static') return ev.layerX;
return ev.pageX - burst.xml.HtmlBox.getBorderBoxleft(ev.target);
  }
  case 'offsetY': {
if (bu_UA.isIE) return ev.offsetY + ev.srcElement.clientTop;
if (!bu_UA.isGecko) return ev.offsetY;
var posy = burst.xml.HtmlUtil.getComputedStyle(el, 'position');
if (posy && posy != 'static') return ev.layerY;
return ev.pageY - burst.xml.HtmlBox.getBorderBoxTop(ev.target);
  }
  default: throw Error("bad getMousePos name '" + name + "'");
  }
}
bu_loaded('burst.web.WindowEvent', ['burst.MOP']);
burst.web.DragDrop = {};
var BU_DragDrop = burst.web.DragDrop;
BU_DragDrop.dragStart = function(node, ev, dragZIndex) {
  var startPageX = BU_WindowEvent.getMousePos(ev, 'pageX');
  var startPageY = BU_WindowEvent.getMousePos(ev, 'pageY');
  var startLeft = burst.xml.HtmlBox.getBorderBoxLeft(node);
  var startTop = burst.xml.HtmlBox.getBorderBoxTop(node);
  var startZ = node.style.zIndex;
  if (!dragZIndex) dragZIndex = burst.xml.HtmlUtil.maxZIndex(node.ownerDocument) + 1;
  node.style.zIndex = dragZIndex;
  BU_WindowEvent.stopEvent(ev);
  node.style.cursor = 'move'
  var dragData = {
startPageX: startPageX,
startPageY: startPageY,
startLeft: startLeft,
startTop: startTop,
startZ: startZ,
dragNode: node
  };
  var moveHandler = function(ev) {BU_DragDrop.dragMove(dragData, ev?ev:window.event)};
  var upHandler = function(ev) {BU_DragDrop.dragEnd(dragData, ev?ev:window.event)};
  dragData['moveHandler'] = moveHandler;
  dragData['upHandler'] = upHandler;
  if (document.attachEvent) {
document.attachEvent('onmousemove', moveHandler);
document.attachEvent('onmouseup', upHandler);
  }
  else {
document.addEventListener('mousemove', moveHandler, true);
document.addEventListener('mouseup', upHandler, true);
  }
}
BU_DragDrop.dragMove = function(dragData, ev) {
  var mousePageX = BU_WindowEvent.getMousePos(ev, 'pageX');
  var mousePageY = BU_WindowEvent.getMousePos(ev, 'pageY');
  var newLeft = dragData.startLeft + (mousePageX - dragData.startPageX);
  var newTop = dragData.startTop + (mousePageY - dragData.startPageY);
  if (dragData.minLeft && dragData.minLeft > newLeft) newLeft = dragData.minLeft;
  if (dragData.minTop && dragData.minTop > newTop) newTop = dragData.minTop;
  if (dragData.maxRight && dragData.maxRight < newLeft + dragData.dragNode.offsetWidth) newLeft = dragData.maxRight - dragData.dragNode.offsetWidth;
  if (dragData.maxBottom && dragData.maxBottom < newTop + dragData.dragNode.offsetHeight) newTop = dragData.maxBottom - dragData.dragNode.offsetHeight;
  BU_DragDrop.moveTo(dragData.dragNode, newLeft, newTop);
  BU_WindowEvent.stopEvent(ev);
}
BU_DragDrop.moveTo = function(el, left, top) {
   burst.xml.HtmlBox.setBorderBoxLeft(el, left);
   burst.xml.HtmlBox.setBorderBoxTop(el, top);
}
BU_DragDrop.dragEnd = function(dragData, ev) {
 dragData.dragNode.zIndex = dragData.startZ;
 if (document.attachEvent) {
 document.detachEvent('onmousemove', dragData.moveHandler);
 document.detachEvent('onmouseup', dragData.upHandler);
 }
 else {
 document.removeEventListener('mousemove', dragData.moveHandler, true);
 document.removeEventListener('mouseup', dragData.upHandler, true);
 }
 BU_WindowEvent.stopEvent(ev);
}
burst.web.TextSelection = {};
function setSelectionRange(input, selectionStart, selectionEnd) {
 if (input.setSelectionRange) {
  input.focus();
  input.setSelectionRange(selectionStart, selectionEnd);
 }
 else if (input.createTextRange) {
  var range = input.createTextRange();
  range.collapse(true);
  range.moveEnd('character', selectionEnd);
  range.moveStart('character', selectionStart);
  range.select();
 }
}
function setCaretToEnd (input) {
 setSelectionRange(input, input.value.length, input.value.length);
}
function setCaretToBegin (input) {
 setSelectionRange(input, 0, 0);
}
function setCaretToPos (input, pos) {
 setSelectionRange(input, pos, pos);
}
function selectMatchingString (input, string) {
 var match = new RegExp(string, "i").exec(input.value);
 if (match) {
  setSelectionRange (input, match.index, match.index + match
[0].length);
 }
}
function replaceSelection (input, replaceString) {
 if (input.setSelectionRange) {
  var selectionStart = input.selectionStart;
  var selectionEnd = input.selectionEnd;
  input.value = input.value.substring(0, selectionStart)
         + replaceString
         + input.value.substring(selectionEnd);
  if (selectionStart != selectionEnd)
   setSelectionRange(input, selectionStart, selectionStart + replaceString.length);
  else
   setCaretToPos(input, selectionStart + replaceString.length);
 }
 else if (document.selection) {
  var range = document.selection.createRange();
  if (range.parentElement() == input) {
   var isCollapsed = range.text == '';
   range.text = replaceString;
   if (!isCollapsed)  {
    range.moveStart('character', -replaceString.length);
    range.select();
   }
  }
 }
}
function BU_AbstractURIRequest() {
}
burst.io.AbstractURIRequest = BU_AbstractURIRequest;
BU_AbstractURIRequest.text_url_cache = {};
BU_AbstractURIRequest.prototype.getTextAsync = function(url, handler, nocache) {
  if (arguments.length < 3) nocache = false;
 if (!nocache && bu_in(url, BU_AbstractURIRequest.text_url_cache)) {
   handler(BU_AbstractURIRequest.text_url_cache[url]);
 }
 this.getTextAsync_(url, function(text) {
		 if (!nocache) BU_AbstractURIRequest.text_url_cache[url] = text;
		 handler(text, this);
	     });
}
BU_AbstractURIRequest.prototype.getTextAsync_ = function() {bu_unimplemented('burst.io.AbstractURIRequest.getTextAsync_');}
BU_AbstractURIRequest.prototype.getDocumentAsync = function() {bu_unimplemented('burst.io.AbstractURIRequest.getDocumentAsync');}
bu_loaded('burst.io.AbstractURIRequest', null, ['burst.Lang','burst.io.IframeURIRequest', 'burst.xml.DomUtil','burst.io.XmlHttpURIRequest']);
function BU_IframeURIRequest(iframe_el) {
 if (iframe_el) {
  if (!iframe_el.nodeName) bu_throw("iframe argument not a node: " + iframe_el);
  if (iframe_el.nodeName.toUpperCase() !== 'IFRAME') bu_throw("iframe argument not an iframe but a " + iframe_el.nodeName);
  this.element_ = iframe_el;
  this.id_ = iframe_el.getAttribute('name') || bu_throw("no name attribute in provided iframe element");
 }
 else {
  this.id_ = 'if' + BU_IframeURIRequest.id_counter_++;
  this.element_ = null;
 }
 BU_IframeURIRequest.register(this);
 this.state_ = 'uninitialized';
 this.loadCount_ = 0;
 return this;
}
burst.io.IframeURIRequest = BU_IframeURIRequest;
bu_inherits(BU_IframeURIRequest, BU_AbstractURIRequest);
BU_IframeURIRequest.id_counter_ = 0;
BU_IframeURIRequest.all_instances_ = {};
BU_IframeURIRequest.loading_instances_ = {};
BU_IframeURIRequest.pool_ = [];
BU_IframeURIRequest.DO_POOLING = true;
BU_IframeURIRequest.getInstance = function() {
  var instance = BU_IframeURIRequest.acquire();
  return instance ? instance : new BU_IframeURIRequest();
}
BU_IframeURIRequest.register = function(instance) {
 var iframe_id = instance.id_;
 if (bu_in(iframe_id, BU_IframeURIRequest.all_instances_)) bu_throw("attempt to re-register iframe instance with id '" + iframe_id + "'");
 BU_IframeURIRequest.all_instances_[iframe_id] = instance;
}
BU_IframeURIRequest.acquire = function() {
 var instance = BU_IframeURIRequest.pool_.pop();
 if (instance) {
  instance.state_ = 'uninitialized';
  bu_debug("(IframeURIRequest.js) returning instance from pool");
  return instance;
 }
 bu_debug("(IframeURIRequest.js) no instance in pool");
 return instance;
}
BU_IframeURIRequest.release = function(instance) {
 instance.state_ = 'deleted';
 if (typeof instance.innerDocument_ != 'undefined') delete instance[innerDocument_];
 delete BU_IframeURIRequest.loading_instances_[instance.id_];
 if (BU_IframeURIRequest.DO_POOLING) {
  BU_IframeURIRequest.pool_.push(instance);
 }
 else {
  delete BU_IframeURIRequest.all_instances_[instance.id_];
  instance.destroy();
 }
}
BU_IframeURIRequest.prototype.destroy = function() {
 this.element_.parentNode.removeChild(this.element_);
 this.element_ = null;
}
BU_IframeURIRequest.NO_SRC = '';
BU_IframeURIRequest.prototype.getTextAsync_ = function(url, handler) {
  this.load(url, function(iframeobj) {
    var text = iframeobj.getContents();
    handler(text, this);
   });
}
BU_IframeURIRequest.prototype.getDocumentAsync = function(url, handler, progress_handler) {
  this.load(url, function(iframeobj) {
    var doc = iframeobj.getDocument();
    handler(doc);
  });
}
function bu_make_onload_function(iframe_id) {
 return function() {
  if (typeof BU_IframeURIRequest == 'undefined') alert("(IframeURIRequest.js) huh? no BU_IframeURIRequest. parent.BU_IframeURIRequest=" + parent.BU_IframeURIRequest);
  else BU_IframeURIRequest.callHandler(iframe_id);
  return false;
 };
}
function bu_make_onload_string(iframe_id, is_nested, inner_id) {
 var functest = is_nested ? 'parent && (typeof parent.BU_IframeURIRequest != "undefined")' : 'typeof BU_IframeURIRequest != "undefined"';
 var calljs = (is_nested ? 'parent.' : '') +
       "BU_IframeURIRequest.callHandler('" + iframe_id + "'" +
       (inner_id ? ", window, '" + inner_id + "'" : '') +
       ")";
 var onload_string;
 if (!BU_DBG_DOM) {
  onload_string = calljs;
 }
 else {
  onload_string = "alert('(IframeURIRequest.js) in onload handler for iframe " +
     iframe_id +
     ", from String onload, is_nested=" +
     (is_nested ? true : false) +
 "');" +
 "alert(" +
   ["'(IframeURIRequest.js) parent? '",
   "( (parent && parent !== window) ? true : false)",
   "' BU_IframeURIRequest?'",
   "(typeof BU_IframeURIRequest != 'undefined')",
   "' parent.BU_IframeURIRequest?'",
   "(typeof parent.BU_IframeURIRequest != 'undefined')",
   "' parent.parent.BU_IframeURIRequest?'",
   "(typeof parent.parent.BU_IframeURIRequest != 'undefined')"].join(' +\n ') +
  ");" +
  "if (" + functest + ") {" +
    calljs + ";" +
  "} else {" +
   "alert('(IframeURIRequest.js) test failed: " + functest + "');" +
   "for(var w=window; w ; w=(w===w.parent?null:w.parent)) {" +
     "alert(' w.BU_IframeURIRequest=' + (typeof w.BU_IframeURIRequest) + ' w.location=' + w.location + ' w.fallbackBU_IframeURIRequest=' + (typeof w.fallbackBU_IframeURIRequest));" +
   "}" +
  "} return false;"
  }
  return onload_string;
}
function bu_nested_iframe_html(iframe_id, url) {
  var inner_id = iframe_id + 'inner';
  var onload_string = bu_make_onload_string(iframe_id, true, inner_id);
  if (typeof onload_string != 'string') bu_throw("(IframeURIRequest.js) bad onload_string: " + onload_string);
  var base_el = bu_UA.bug_iframe_relative_url() ?
burst.xml.DomUtil.el('BASE', {HREF: self.document.location.href}) : null;
  var html = burst.xml.DomUtil.el('HTML', null,
        burst.xml.DomUtil.el('HEAD', null,
		burst.xml.DomUtil.el('TITLE'),
		base_el
	 ),
        burst.xml.DomUtil.el('BODY', {
          ONLOAD: onload_string
         },
         burst.xml.DomUtil.el('IFRAME', {
          NAME: inner_id,
          ONLOAD: (BU_DBG_DOM ? "alert('(IframeURIRequest.js) inner iframe onload called, for inner iframe id " + inner_id + "');" : null),
          SRC: url
         }, null)));
  return html;
}
BU_IframeURIRequest.prototype.setVisible = function(isvis) {burst.xml.HtmlUtil.iframeSetVisible(this.element_, isvis)};
BU_IframeURIRequest.callHandler = function(iframe_id, caller_window, inner_id) {
 if (!iframe_id)
  bu_throw("(IframeURIRequest.js) got callback with " + arguments.length + " arguments and no frame id: " + iframe_id);
 bu_debug_Dom("(IframeURIRequest.js) got callback for frame id '" + iframe_id + "'" +
    (inner_id ? ' (inner_id=' + inner_id + ')' : '') +
    '');
 var inner_window;
 if (inner_id) {
  inner_window = caller_window.frames[inner_id] || bu_throw("no inner window for inner_id='" + inner_id + "'");
 }
 var instance = BU_IframeURIRequest.loading_instances_[iframe_id];
 if (instance) bu_debug_Dom("(IframeURIRequest.js) loadcount=" + instance.loadCount_ + " state=" + instance.state_);
 if (!instance) {
  instance = BU_IframeURIRequest.all_instances_[iframe_id];
  if (!instance) bu_throw("(IframeURIRequest.js) got callback for unknown frame id '" + iframe_id + "'");
  var can_dyn = bu_UA.can_iframe_onload_dyn();
  var can_static = bu_UA.can_iframe_onload_static();
  if (!inner_id && !can_dyn && can_static && instance.loadCount_ > 1) {
   bu_debug_Dom('(IframeURIRequest.js) ignoring redundant onload event');
   return;
  }
  bu_throw("(IframeURIRequest.js) got callback for frame id '" + iframe_id + "'" +
    (inner_id ? ' (inner_id=' + inner_id + ')' : '') +
    " that exists but is in state '" + instance.state_ + "', loadCount=" + instance.loadCount_);
 }
 if (!instance.element_) {
  instance.element_ = caller_window ? caller_window.parent.getElementById(iframe_id) : window.getElementByid(iframe_id);
  bu_alert("(IframeURIRequest.js) no element_ in instance for id " + iframe_id + "; " + (instance.element_ ? "was" : "was not") + " able to set");
  if (!instance.element_)
    bu_throw("(IframeURIRequest.js) BU_IframeURIRequest instance for id " + iframe_id +
      " has no element_ and was not able to find it " +
      (caller_window ? ' (has caller_window)' : ' (no caller_window)'));
 }
 instance.state_ = 'complete';
 if (inner_id) {
  instance.contentDocument_ = inner_window.document || bu_throw("no document object in inner_window");
 }
 else {
  instance.contentDocument_ = burst.xml.HtmlUtil.iframeContentDocument(instance.element_);
 }
 try {
  instance.handler_(instance);
 }
 catch(e) {
  bu_alert("(IframeURIRequest.js) handler threw an exception: " + e + "\nrethrowing...");
  throw e;
 }
 finally {
  BU_IframeURIRequest.release(instance);
 }
}
BU_IframeURIRequest.prototype.getDocument = function() {
 bu_assertState(this.state_, 'complete');
 return (this.contentDocument_ || bu_throw('no contentDocument_'));
}
BU_IframeURIRequest.prototype.getContents = function() {
 switch(burst.URI.guessMimeType(this.url_)) {
 case 'text/plain': return this.getText();
 case 'text/html': return this.getHTML();
 case 'text/xml': return this.getXML();
 default: return this.getHTML();
 }
}
BU_IframeURIRequest.prototype.getXML = function() {
 var doc = this.getDocument();
 return burst.xml.XmlDoc.toXmlString(doc);
}
BU_IframeURIRequest.prototype.getText = function() {
 var doc = this.getDocument();
 return burst.xml.DomUtil.getInnerText(doc);
}
BU_IframeURIRequest.prototype.getHTML = function() {
 var doc = this.getDocument();
 return burst.xml.DomUtil.getOuterHTML(doc.documentElement);
}
var BU_ONLOAD_AS_FUNCTION = false;
BU_IframeURIRequest.prototype.load = function(url, handler) {
 bu_assertState(this.state_, 'uninitialized');
 this.state_ = 'loading';
 this.loadCount_++;
 BU_IframeURIRequest.loading_instances_[this.id_] = this;
 this.handler_ = handler;
 this.url_ = url;
 if (false) {
  this.actual_url_ = url;
 }
 bu_debug("(IframeURIRequest.js) url='", url, "' window.location.href=", window.location.href);
 bu_debug("(IframeURIRequest.js) base=", burst.xml.HtmlUtil.getWindowBaseUrl(window));
 var iframe_el = this.element_;
 var iframe_id = this.id_;
 var can_dyn = bu_UA.can_iframe_onload_dyn();
 var can_static = bu_UA.can_iframe_onload_static();
 if (iframe_el) {
  if (can_dyn) {
    bu_debug("(IframeURIRequest.js) element exists, can_iframe_onload_dyn()=true. Setting onload and replacing location, for id " + iframe_id + " and url " + url);
    iframe_el.onload = bu_make_onload_function(iframe_id);
    var loc = burst.xml.HtmlUtil.iframeLocation(iframe_el, iframe_id);
    loc.replace(url);
  }
  else {
    bu_debug("(IframeURIRequest.js) element exists, can_iframe_onload_dyn()=false, so writing inner content for id " + iframe_id + " and url " + url);
    var html = bu_nested_iframe_html(iframe_id, url);
    burst.xml.HtmlUtil.iframeReplaceContents(iframe_el, html);
    if (true) {
     var iframe_win = burst.xml.HtmlUtil.iframeContentWindow(iframe_el);
     iframe_win.fallbackBU_IframeURIRequest = BU_IframeURIRequest;
    }
  }
 }
 else {
  if (can_dyn || can_static) {
    bu_debug_Dom("(IframeURIRequest.js) no element, can_dyn=" + can_dyn + " can_static=" + can_static + ", so creating and loading together, for id " + iframe_id + " and url " + url);
    var onloadval = (can_dyn || BU_ONLOAD_AS_FUNCTION) ? bu_make_onload_function(iframe_id) : bu_make_onload_string(iframe_id);
    var this_ = this;
    iframe_el = burst.xml.HtmlUtil.iframeCreate(iframe_id, url, onloadval, function(el) {this_.element_ = el});
  }
  else {
    bu_debug_Dom("(IframeURIRequest.js) no element, can_iframe_onload_static()=false, so creating and loading separately for id " + iframe_id + " and url " + url);
    iframe_el = burst.xml.HtmlUtil.iframeCreate(iframe_id);
    this.element_ = iframe_el;
var created_handler = function() {
     var newhtml = bu_nested_iframe_html(iframe_id, url);
     burst.xml.HtmlUtil.iframeReplaceContents(iframe_el, newhtml);
     if (true) {
      var iframe_win2 = burst.xml.HtmlUtil.iframeContentWindow(iframe_el);
      iframe_win2.fallbackBU_IframeURIRequest = BU_IframeURIRequest;
     }
    }
if (bu_UA.bug_iframe_delayed_create()) {window.setTimeout(created_handler, 10)}
else created_handler();
  }
 }
}
bu_loaded('burst.io.IframeURIRequest', ['burst.xml.HtmlUtil', 'burst.xml.DomUtil', 'burst.URI']);
function BU_XmlHttpURIRequest() {
}
burst.io.XmlHttpURIRequest = BU_XmlHttpURIRequest;
bu_inherits(BU_XmlHttpURIRequest, BU_AbstractURIRequest);
BU_XmlHttpURIRequest.prototype.getTextAsync_ = function(url, handler) {
  BU_XmlHttpURIRequest.getAsync(url, function(httpreq, url) {
	      var text = httpreq.responseText;
	      handler(text);
	  });
}
BU_XmlHttpURIRequest.prototype.getDocumentAsync = function(url, handler, progress_handler) {
  BU_XmlHttpURIRequest.getAsync(url, function(httpreq, url) {
   var xml = httpreq.responseXML;
   if (xml) {
    var parse_error = burst.xml.XmlDoc.getParseError(xml);
 if (parse_error && parse_error != 0) bu_alert("(XmlHttpURIRequest.js) parseError: " + parse_error);
   }
   else
 bu_alert("(XmlHttpURIRequest.js) no xml object");
   handler(xml, httpreq);
  }, progress_handler);
}
BU_XmlHttpURIRequest.XMLHTTP_PROGID = ['Msxml2.XMLHTTP.4.0', 'Msxml2.XMLHTTP', 'Microsoft.XMLHTTP'];
function bu_check_result(result, what) {}
BU_XmlHttpURIRequest.create = function() {
 var onerror_ok = true;
 var httpreq;
 if (bu_Runtime.has_moz_XMLHttpRequest()) {
  httpreq = new XMLHttpRequest();
 }
 else if (bu_Runtime.has_msxml()) {
  onerror_ok = false;
  httpreq = burst.Lang.createActiveXObject(BU_XmlHttpURIRequest, 'XMLHTTP_PROGID', 'XMLHttpRequest');
 }
 else {
  bu_unsupported("(XmlHttpURIRequest.js) no XMLHttpRequest implementation available");
 }
 if (onerror_ok)
  httpreq.onerror = function() {
bu_alert("(XmlHttpURIRequest.js) onerror callback fired from httprequest " + httpreq);
for(var i=0;i<arguments.length;++i) bu_alert("argument[" + i + "]='" + arguments[i] + "'");
  }
 return httpreq;
}
BU_XmlHttpURIRequest.getAsync = function(url, handler, progress_handler) {
 var httpreq = BU_XmlHttpURIRequest.create();
 var already_called = false;
 httpreq.onreadystatechange = function() {
  if (progress_handler) progress_handler(httpreq, url);
  if (httpreq.readyState == 4) {
   if (!already_called) {
    already_called = true;
    bu_dbg_httpreq(url, httpreq);
    handler(httpreq, url);
   }
  }
 };
 bu_httpRequest_open_send(httpreq, url, null, true);
 return httpreq;
}
BU_XmlHttpURIRequest.getTextSync = function(url) {
 var httpreq = BU_XmlHttpURIRequest.create();
 bu_httpRequest_open_send(httpreq, url, null, false);
 var text = httpreq.responseText;
 return text;
}
function bu_httpRequest_open_send(httpreq, url, requestBody, async) {
 var open_url = url;
 if (bu_UA.family_ === BU_UA_FAMILY_GECKO &&
    (typeof window != 'undefined') && window !== top &&
!burst.URI.isAbsolute(url)) {
  bu_debug("(XmlHttpURIRequest.js) compensating for HttpRequest relative url bug, for url=" + url);
  open_url = burst.xml.HtmlUtil.resolveWindowUrl(url, window);
alert("normalized '" + url + "' to '" + open_url + "' for mozilla");
 }
 else {
  bu_debug("(XmlHttpURIRequest.js) not expecting HttpRequest relative url bug, for url=" + url);
 }
 var result = httpreq.open('GET', open_url, async);
 bu_check_result(result, 'HttpRequest.open(', open_url, ",", async, ')');
 result = httpreq.send(requestBody);
 bu_check_result(result, "HttpRequest.send(", requestBody, ")");
 if (!async && httpreq.status != 200) bu_throw("Request for url '" + open_url + "' resulted in http status " + httpreq.status + " (" + httpreq.statusText + ")");
}
function bu_dbg_httpreq(url, httpreq) {
}
bu_loaded('burst.io.XmlHttpURIRequest', null, ['burst.xml.HtmlUtil', 'burst.URI', 'burst.xml.XmlDoc']);
bu_loaded('burst.ScriptLoader', ['burst.runtime.AbstractRuntime']);
burst.Script = function(modulename, state, load_deps, call_deps, handler) {
 this.modulename_ = modulename;
 this.state_ = state;
 this.loaded_cb_ = null;
 this.load_deps_ = typeof load_deps == 'undefined' ? null : load_deps;
 this.call_deps_ = typeof call_deps == 'undefined' ? null : call_deps;
 this.nremaining_ = 0;
 if (typeof handler == 'undefined') this.handler_ = null;
 else bu_set_handler(this, handler);
}
burst.ScriptLoader = function(init_url, is_base) {
 this.modules_by_name_ = {};
 this.module_names_ = [];
 try {
 this.base_url_ = is_base ? init_url : bu_Runtime.getBaseURI(init_url);
 }
 catch(e) {
 var mess = "(ScriptLoader.js) ERROR: failed to defined ScriptLoader.base_url_ probably because of unsupported environment: " + e + "\n Will proceed anyway...";
 if (typeof window == 'undefined') alert(mess); else bu_Runtime.println(mess);
 }
 this.seenConfig_ = false;
 this.seenDocumentLoad_ = false;
 if (typeof BU_BOOTSTRAP_SCRIPTS != 'undefined') {
  for(var i=0;i<BU_BOOTSTRAP_SCRIPTS.length;++i) {
   var margs = BU_BOOTSTRAP_SCRIPTS[i];
   var modulename = margs[0];
   var module = new burst.Script(margs[0], 'loaded', margs[1], margs[2], margs[3]);
   this.modules_by_name_[modulename] = module;
   this.module_names_.push(modulename);
  }
 }
 if (typeof window != 'undefined') {
  var this_ = this;
  var bu_onload_handler = function() {this_.setDocumentLoadEvent();}
  burst.web.WindowEvent.addWindowListener('load', bu_onload_handler);
 }
}
burst.ScriptLoader.prototype.dumpModules = function() {
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
return;
  }
 module.handler_ = handler;
 module.subscribed_ = {};
 burst.Alg.for_each(burst.ScriptLoader.EVENTS, function(evname) {
  if (typeof handler[evname] != 'undefined') {
    module.subscribed_[evname] = true;
    module.nremaining_++;
  }
  else {
 module.subscribed_[evname] = false;
  }
 });
}
burst.ScriptLoader.prototype.require = function (modulename, load_deps) {
 var sl = this instanceof burst.ScriptLoader ? this : bu_ScriptLoader;
 var module = bu_in(modulename, sl.modules_by_name_) ?
  sl.modules_by_name_[modulename] :
  new burst.Script(modulename, 'loading');
 if (module.load_deps_) module.load_deps_.push(load_deps);
 else module.load_deps_ = load_deps;
 sl.checkModuleState(module);
}
burst.ScriptLoader.prototype.loaded = function(modulename, call_deps, handler) {
 bu_ScriptLoader.declare_module(modulename, null, call_deps, handler);
}
burst.ScriptLoader.prototype.is_loaded = function(module) {
 return (module.state_ != 'requested' && module.state_ != 'loading')
}
burst.ScriptLoader.prototype.declare_module = function (modulename, load_deps, call_deps, handler) {
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
 this.checkModuleState(module);
}
burst.ScriptLoader.prototype.checkModuleState = function (module) {
 switch(module.state_) {
 case 'loading': break;
 case 'requested': break;
 case 'loaded': {
  if (module.loaded_cb_) {
module.loaded_cb_();
module.loaded_cb_ = null;
  }
  var deps = module.call_deps_;
  var num = 0;
  if (deps) {
   for(var i=0;i<deps.length;++i) {
if (!this.requireModule(module.modulename_, deps[i], null, false)) ++num;
   }
  }
  if (num == 0) {
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
burst.ScriptLoader.prototype.requireModule = function (requiringName, requiredName, done_handler, is_load_dep) {
 var module = this.modules_by_name_[requiredName];
 if (!module) {
  module = this.modules_by_name_[requiredName] = new burst.Script(requiredName, 'requested');
  this.module_names_.push(requiredName);
  if (done_handler) {
module.loaded_cb_ = done_handler;
  }
  this.loadModule(requiredName, null );
 }
 return this.is_loaded(module);
}
burst.ScriptLoader.prototype.loadModule = function (modulename, done_handler) {
 var rel_url = modulename.replace(/\./g, '/') + '.js';
 var full_url = this.resolveScriptUrl(rel_url);
 return bu_Runtime.readEval(full_url, done_handler);
}
burst.ScriptLoader.prototype.callHandler = function (module, funcname) {
 if (module.handler_ && typeof module.handler_[funcname] == 'function') {
   module.subscribed_[funcname] = false;
   module.nremaining_--;
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
var BU_SCRIPT_ROOT;
if (typeof BU_SCRIPT_ROOT == 'undefined') BU_SCRIPT_ROOT = '';
var BU_IMAGES_ROOT;
if (typeof BU_IMAGES_ROOT == 'undefined') BU_IMAGES_ROOT = '../burststatic/images/';
var BU_HTML_ROOT;
if (typeof BU_HTML_ROOT == 'undefined') BU_HTML_ROOT = '../burststatic/html/';
burst.ScriptLoader.prototype.resolveScriptUrl = function(rel_url) {
 return this.base_url_ + BU_SCRIPT_ROOT + rel_url;
}
burst.ScriptLoader.prototype.resolveImageUrl = function(rel_url) {
 var u = this.base_url_ + BU_IMAGES_ROOT + rel_url;
 return u;
}
burst.ScriptLoader.prototype.resolveHtmlUrl = function(rel_url) {
 return this.base_url_ + BU_HTML_ROOT + rel_url;
}
burst.ScriptLoader.prototype.setConfigEvent = function() {
 this.seenConfig_ = true;
 this.checkScripts();
}
burst.ScriptLoader.prototype.setDocumentLoadEvent = function() {
 this.seenDocumentLoad_ = true;
 this.checkScripts();
}
burst.ScriptLoader.prototype.checkScripts = function(assert_state) {
 var this_ = this;
 burst.Alg.for_each(this.module_names_, function(modulename) {
  var module = this_.modules_by_name_[modulename];
  this_.checkModuleState(module);
  if(assert_state) {
  }
 });
}
burst.ScriptLoader.getScriptLoader = function() {return bu_ScriptLoader};
var bu_ScriptLoader;
try {
  bu_ScriptLoader =
  (typeof BU_BASE_URL == 'undefined') ?
  new burst.ScriptLoader('burst/' + (BU_CORE_FILENAME ? BU_CORE_FILENAME : 'ScriptLoader.js')) :
  new burst.ScriptLoader(BU_BASE_URL, true);
}
catch(e) {bu_alert("failed to make bu_ScriptLoader: " + e); throw e;}
bu_require = bu_ScriptLoader.require;
bu_loaded = bu_ScriptLoader.loaded;
burst.Text = {};
burst.Text.doubleEscape = function(s) {return s.indexOf('\\') != -1 ? s.replace(/\\/g, '\\\\') : s;}
burst.Text.quote = function(s, escapeEOL, notIfIdent) {
 if (notIfIdent && burst.Lang.isLegalIdentifier(s)) return s;
 s = burst.Text.doubleEscape(s);
 if (escapeEOL) {
  s = s.replace(/\n/g, "\\n");
 }
 if (s.indexOf('"')==-1) return '"' + s + '"';
 if (s.indexOf("'")==-1) return "'" + s + "'";
 s = '"' +  s.replace(/\"/g, '\\"') + '"';
 return s;
}
burst.Text.endsWith = function(s, s2) {
 if (s2.length > s.length) return false;
 return s.substring(s.length - s2.length) == s2;
}
burst.Text.startsWith = function(s, s2) {
 if (s2.length > s.length) return false;
 return s.substring(0,s2.length) == s2;
}
burst.Text.ltrim = function(s) {
 if (!s || s.length == 0 || s.charAt(0) > ' ') return s;
 return s.replace(/^\s+/,'');
}
function bu_trim(s) {
 if (!s || s.length == 0) return s;
 if (s.charAt(0) <= ' ') s = s.replace(/^\s+/,'');
 if (s.length > 0 && s.charAt(s.length - 1) <= ' ') s = s.replace(/\s+$/,'');
 return s;
}
function bu_trim2(s) {
 if (!s || s.length == 0) return s;
 return s.replace(/^\s+/,'').replace(/\s+$/);
}
function bu_trim3(s) {
 if (!s || s.length == 0) return s;
 return s.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
}
function bu_trim3a(s) {
 return s.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
}
function bu_trim4(s) {
 if (!s || s.length == 0) return s;
 return s.replace(/^\s+|\s+$/g,'');
}
burst.Text.trim = bu_trim3a;
burst.Text.isWhite = function(s) {return !s || s == '' || /^\s*$/.test(s);}
burst.Text.DEFAULT_SPLIT_RE_STRING = '\'[^\']*\'|"[^\"]*"|';
burst.Text.DEFAULT_SPLIT_RE = /'[^']*'|"[^"]*"|\w+/g;
burst.Text.splitTerms = function(s, tokenre) {
 var re;
 if (tokenre) {re = new RegExp(burst.Text.DEFAULT_SPLIT_RE_STRING + tokenre,'g');}
 else {
  if (!burst.Text.DEFAULT_SPLIT_RE) {burst.Text.DEFAULT_SPLIT_RE = new RegExp(burst.Text.DEFAULT_SPLIT_RE_STRING + '\\w+', 'g');}
  re = burst.Text.DEFAULT_SPLIT_RE;
 }
 var matches = s.match(re);
 return matches ? matches : [];
}
burst.Text.unquote = function(s) {
 if (!s || s.length == 0) return s;
 if (s.charAt(0) == "'" || s.charAt(0) == '"') return s.substring(1,s.length-1);
 return s;
}
burst.Text.ellipsis = function(s, maxlen) {
 return s.length <= maxlen ? s : s.substring(0,maxlen) + '...';
}
burst.Text.isDigit = function(s) {
 return s && s.length == 1 && '0123456789'.indexOf(s) != -1;
}
burst.Text.isLetter = function(s) {
 return s && s.length == 1 && /[a-zA-Z]/.test(s);
}
burst.Text.ZEROS10 = '0000000000';
burst.Text.zeroPad = function(s, len) {
 if (typeof s != 'string') s = '' + s;
 var padlen = len - s.length;
 if (padlen < 0) return s;
 else if (padlen == 0) return s;
 else if (padlen == 1) return '0' + s;
 else if (padlen == 2) return '00' + s;
 else if (padlen < 10) return burst.Text.ZEROS10.substring(0,padlen) + s;
 else return burst.Text.ZEROS10 + arguments.callee(s, len - 10);
}
function buzp2(i) {return i >= 10 ? "" + i : "0" + i;}
function buzp3(i) {
 return i > 100 ? '' + i : (i > 10 ? '0' + i : '00' + i);
}
function buzp4(i) {
 var s = '' + i;
 return '0000'.substring(s.length) + s;
}
burst.Text.SPACES10 = '          ';
burst.Text.spacePad = function(s, len, is_lj) {
 if (arguments.length < 3) is_lj = false;
 if (typeof s != 'string') s = '' + s;
 var padlen = len - s.length;
 if (padlen < 0) return s;
 else if (padlen == 0) return s;
 else if (padlen == 1) return is_lj ? s + ' ' : ' ' + s;
 else if (padlen == 2) return is_lj ? s + '  ' : '  ' + s;
 else if (padlen < 10) return is_lj ? s + burst.Text.SPACES10.substring(0,padlen) : burst.Text.SPACES10.substring(0,padlen) + s;
 else return is_lj ? arguments.callee(s, len - 10, is_lj) + burst.Text.SPACES10 :
 burst.Text.SPACES10 + arguments.callee(s, len - 10, is_lj);
}
burst.Text.ucfirst = function(s) {
 var uc = s.charAt(0).toUpperCase() + s.substring(1).toLowerCase();
 return uc;
}
burst.Text.fprintf = function(writer, fmt) {
 var s = burst.Text.sprintf_internal(fmt, arguments, 2);
 if (typeof writer == 'function') writer(s);
 else writer.write(s);
 return s.length;
}
burst.Text.sprintf = function(fmt) {
 return burst.Text.sprintf_internal(fmt, arguments, 1);
}
burst.Text.sprintf_internal = function(fmt, args, args_offset) {
 var DIR_RE = /\%([\'0 +\-\#]*)(\*|\d+)?(\.)?(\*|\d+)?([\%scdeEfgGiouxX])/g;
 var argi = args_offset;
 function get_arg(pos) {
  var ind = (arguments.length == 0 ? argi++ : pos + args_offset);
  if (ind >= args.length) {
   var mess = "got " + (args.length - args_offset) + " printf arguments, insufficient for '" + fmt + "'" +
     " (args.length=" + args.length + " args_offset=" + args_offset + " ind=" + ind + " argi=" + argi + ")";
   bu_alert(mess);
   throw Error(mess);
  }
  return args[ind];
 }
 var nsubs = 0;
 function do_match(matching_str, flags, minwidth, period, precision, specifier, offset, input_str) {
  nsubs++;
  if (specifier == '%') {
   if (matching_str != '%' + specifier) throw Error("unexpected '%' specifier in format '" + fmt + "'");
   return '%';
  }
  var sd = burst.Text.sprintf_directive(get_arg, flags, minwidth, period, precision, specifier);
  return sd;
 }
 var s = fmt.replace(DIR_RE, do_match);
 if (s == fmt && fmt.indexOf('%') != -1) {
   var mess = "could not parse format string '" + fmt + "'";
   bu_alert(mess);
   throw Error(mess);
 }
 return s;
}
burst.Text.sprintf_directive = function(get_arg, flags, minwidth, period, precision, specifier) {
 var sign = '';
 var zp = false;
 var lj = false;
 var radic = false;
 var alt = false;
 for(var fi=flags.length; fi--;) {
  switch(flags.charAt(fi)) {
   case ' ': sign = ' '; break;
   case '+': sign = '+'; break;
   case '0': zp = true; break;
   case '-': lj = true; break;
   case '\'': radic = true; throw Error("flag ' not supported"); break;
   case '\#': alt = true; break;
   default: throw Error("bad formatting flag '" + flags.charAt(fi) + "'");
  }
 }
 if (lj) zp = false;
 var minw = 0;
 if (minwidth == '*') {
   minw = parseInt(get_arg());
   if (isNaN(minw)) throw Error("the argument for * width is not a number: " + minwidth);
   if (minw < 0) {lj = true; minw = - minw;}
 }
 else if (minwidth) {
  minw = parseInt(minwidth);
 }
 var prec = 1;
 if (period == '.') {
  if (precision == '*') {
   prec = parseInt(get_arg());
   if (isNaN(prec)) throw Error("the argument for * precision is not a number: " + precision);
   if (prec < 0) {prec = 1; period = '';}
  }
  else if (precision) {
   prec = parseInt(precision);
  }
  else prec = 0;
 }
 var arg = get_arg();
 var maxw = -1;
 var to_upper = false;
 var is_unsigned = false;
 var is_int = false;
 var is_double = false;
 var double_notation;
 var base;
 var s;
 switch(specifier) {
  case 'b': base = 2; is_int = true; break;
  case 'o': base = 8; is_int = true; break;
  case 'X': to_upper = true;
  case 'x': base = 16; is_int = true; break;
  case 'u': is_unsigned = true;
  case 'd': case 'i': base = 10; is_int = true; break;
  case 'c': {
    var num = parseInt(arg);
    s = isNaN(num) ? '' + num : String.fromCharCode(num);
    break;
  }
  case 's': s = arg; maxw = period == '.' ? prec : -1; break;
  case 'E': to_upper = true;
  case 'e': is_double = true; double_notation = 'e'; break;
  case 'f': is_double = true; double_notation = 'f'; break;
  case 'G': to_upper = true;
  case 'g': is_double = true; double_notation = 'g'; break;
  default: throw Error("unexpected specifier '" + specifier + "'");
 }
 if (is_int) {
  if (period == '.') zp = false;
  s = burst.Text.format_int(arg, prec, base, is_unsigned, to_upper, sign, radic, alt);
 }
 else if (is_double) {
  if (period != '.') prec = 6;
  s = burst.Text.format_double(arg, prec, double_notation, to_upper, sign, alt);
 }
 var field = burst.Text.fit_field(s, lj, zp, minw, maxw);
 return field;
}
burst.Text.fit_field = function(s, lj, zp, minw, maxw) {
 if (maxw >= 0 && s.length > maxw) return s.substring(0,maxw);
 if (zp) return burst.Text.zeroPad(s, minw);
 return burst.Text.spacePad(s, minw, lj);
}
burst.Text.format_int = function(arg, prec, base, is_unsigned, to_upper, sign, radic, alt) {
 var i = parseInt(arg);
 if (!isFinite(i)) {
  if (typeof arg != 'number') throw Error("format argument '" + arg + "' not an integer; parseInt returned " + i);
  i = 0;
 }
 var s;
 if (i < 0 && (is_unsigned || base != 10)) {
  i = 0xffffffff + i + 1;
 }
 if (i < 0) {
  s = (- i).toString(base);
  s = '-' + burst.Text.zeroPad(s, prec);
 }
 else {
  s = i.toString(base);
  s = (i == 0 && prec == 0) ? '' : burst.Text.zeroPad(s, prec);
  if (sign) s = sign + s;
 }
 if (base == 16) {
  if (alt) s = '0x' + s;
  s = to_upper ? s.toUpperCase() : s.toLowerCase();
 }
 if (base == 8) {
  if (alt && s.charAt(0) != '0') s = '0' + s;
 }
 return s;
}
burst.Text.format_double = function(arg, prec, double_notation, to_upper, sign, alt) {
 var f = parseFloat(arg);
 if (!isFinite(f)) {
  if (typeof arg != 'number') throw Error("format argument '" + arg + "' not a float; parseFloat returned " + f);
  f = 0;
 }
 var s;
 switch(double_notation) {
 case 'e': {
  s = f.toExponential(prec);
  break;
 }
 case 'f': {
   s = f.toFixed(prec);
  break;
 }
 case 'g': {
  if (Math.abs(f) < 0.0001) {
   s = f.toExponential(prec > 0 ? prec - 1 : prec);
  }
  else {
   s = f.toPrecision(prec);
  }
  if (!alt) {
   s = s.replace(/(\..*[^0])0*/, "$1");
   s = s.replace(/\.0*e/, 'e').replace(/\.0$/,'');
  }
  break;
 }
 default: throw Error("unexpected double notation '" + double_notation + "'");
 }
 s = s.replace(/e\+(\d)$/, "e+0$1").replace(/e\-(\d)$/, "e-0$1");
 if (bu_UA.isOpera) s = s.replace(/^\./, '0.');
 if (alt) {
  s = s.replace(/^(\d+)$/,"$1.");
  s = s.replace(/^(\d+)e/,"$1.e");
 }
 if (f >= 0 && sign) s = sign + s;
 s = to_upper ? s.toUpperCase() : s.toLowerCase();
 return s;
}
bu_loaded('burst.Text', ['burst.Lang']);
function BU_URI(uri) {
 this.uri_ = uri;
}
burst.URI = BU_URI;
burst.URI.queryToMap = function(s, dup_handling) {
 var pairs = s.split(/[\&\;]/);
 var map = {};
 if (!dup_handling) dup_handling = 'last';
 burst.Alg.for_each(pairs, function(pair) {
  var i = pair.indexOf('=');
  var key = i == -1 ? pair : pair.substring(0,i);
  var val = i == -1 ? '' : pair.substring(i+1);
  key = decodeURIComponent(key);
  val = decodeURIComponent(val);
  if (bu_in(key, map)) {
   switch(dup_handling) {
    case 'first': break;
    case 'last': map[key] = val; break;
    case 'array': map[key] = [map[key], val]; break;
    case 'error': throw "duplicate values for key '" + key + "'";
    default: throw "unknown duplicate handling '" + dup_handling + "'";
   }
  }
  else {
   map[key] = val;
  }
 });
 return map;
}
burst.URI.queryToPairs = function(s) {
 var pairs = s.split(/[\&\;]/);
 var a = [];
 burst.Alg.for_each(pairs, function(pair) {
  var i = pair.indexOf('=');
  var key = i == -1 ? pair : pair.substring(0,i);
  var val = i == -1 ? '' : pair.substring(i+1);
  key = decodeURIComponent(key);
  val = decodeURIComponent(val);
  a.push([key,val]);
 });
 return a;
}
burst.URI.queryToArray = function(s) {
 var pairs = s.split(/[\&\;]/);
 var a = [];
 burst.Alg.for_each(pairs, function(pair) {
  var i = pair.indexOf('=');
  var key = i == -1 ? pair : pair.substring(0,i);
  var val = i == -1 ? '' : pair.substring(i+1);
  key = decodeURIComponent(key);
  val = decodeURIComponent(val);
  a.push(key);
  a.push(val);
 });
 return a;
}
burst.URI.mapToQuery = function(map, sep) {
 var a = [];
 var count = 0;
 if (!sep) sep = ';';
 for(var k in map) {
  var v = map[k] || '';
  if (count++ > 0) a.push(sep);
  a.push(encodeURIComponent(k));
  a.push('=');
  a.push(encodeURIComponent(v));
 }
 return a.join('');
}
burst.URI.isAbsolute = function(url) {
 if (!url) return false;
 if (url.indexOf('/') == -1) return false;
 if (url.substring(0,7) == 'http://') return true;
 return /^\w+:\/\//.test(url);
}
burst.URI.resolveUrl = function(url, base_url, noabscheck) {
 if (!noabscheck && burst.URI.isAbsolute(url)) return url;
 var base_isabs = burst.URI.isAbsolute(base_url);
 if (url.charAt(0) == '/' && base_isabs) {
 }
 var last_slash = base_url.lastIndexOf("/") + 1;
 if (last_slash == 0) return url;
 if (base_isabs) {
  if (/^\w+:\/\/[^\/]+$/.test(base_url)) {
   base_url += '/';
   last_slash = base_url.length;
  }
 }
 var res_url = base_url.substring(0, last_slash) + url;
 res_url = res_url.replace(/\w+\/\.\.\//g,'');
 res_url = res_url.replace(/\/\.\//g,'/');
 return res_url;
}
burst.URI.parse = function(url) {
 var rest;
 var fragment_ind = url.indexOf('#');
 var fragment;
 if (fragment_ind == -1) {
  fragment = null;
  rest = url;
 }
 else {
  fragment = url.substring(fragment_ind + 1);
  rest = url.substring(0, fragment_ind);
 }
 var scheme_matches = /^([a-z\d\.\-\+]+):/i.exec(rest);
 var scheme;
 if (scheme_matches) {
  scheme = scheme_matches[1];
  rest = rest.substring(scheme_matches[0].length);
 }
 else {
  scheme = null;
 }
 var net_loc = null;
 if (rest.substring(0,2) == '//') {
  net_loc = rest.substring(2);
  var path_slash = net_loc.indexOf('/');
  if (path_slash == -1) {
   rest = '';
  }
  else {
   rest = net_loc.substring(path_slash);
   net_loc = net_loc.substring(0,path_slash);
  }
bu_debug("after net_loc=" + net_loc + ' rest=' + rest + ' path_slash=' + path_slash);
 }
 var question_ind = rest.indexOf('?');
 var path;
 var query;
 if (question_ind == -1) {
  query = null;
  path = rest;
 }
 else {
  query = rest.substring(question_ind + 1);
  path = rest.substring(0, question_ind);
 }
 return [scheme, net_loc, path, query, fragment];
}
burst.URI.urlPath = function(url) {
 return burst.URI.parse(url)[2];
}
burst.URI.pathSuffix = function(url) {
 var path = burst.URI.urlPath(url);
 var suf_matches = /\.([^\/\\]*)$/.exec(path);
 return suf_matches ? suf_matches[1] : '';
}
burst.URI.guessMimeType = function(url) {
 var suffix = burst.URI.pathSuffix(url).toLowerCase();
 switch(suffix) {
 case 'txt':
 case 'text':
   return 'text/plain';
 case 'htm':
 case 'html':
   return 'text/html';
 case 'xml':
   return 'text/xml';
 case 'js':
   return 'text/javascript';
 default:
   return '';
 }
}
bu_loaded('burst.URI', ['burst.Alg']);
burst.props.PropertyError = function(propdef, str, msg) {
 if (!(this instanceof burst.props.PropertyError)) return new burst.props.PropertyError(propdef, str, msg);
 this.msg_ = msg;
 this.propdef_ = propdef;
 this.str_ = str;
 this.message = "Property '" + propdef.name + "'";
 if (typeof this.str_ == 'string') this.message += ", string '" + this.str_ + "'";
 this.message += ': ' + msg;
 return this;
}
bu_inherits(burst.props.PropertyError, burst.BurstError);
burst.props.PropertyError.prototype.name = 'burst.props.PropertyError';
bu_require('burst.reflect.PropertyDef', ['burst.MOP', 'burst.BurstError']);
function BU_PropertyDef(values) {
 if (arguments.length==0) return;
 burst.MOP.initNamed(this, values, burst.reflect.PropertyDef.INIT_VARS, true);
 if (this.enumArray) {
  if (this.enumMap) bu_throw("not allowed to have both enumArray and enumMap");
  this.enumSet = burst.Alg.toSet(this.enumArray);
 }
}
burst.reflect.PropertyDef = BU_PropertyDef;
BU_PropertyDef.INIT_VARS = {
name: true,
defaultValue: false,
description: false,
isMandatory: false,
isArray: false,
regexp: false,
enumArray: false,
enumMap: false
};
BU_PropertyDef.prototype.parse = function(str, dflt) {
 if (typeof str == 'number' || typeof str == 'boolean') str = '' + str;
 if (burst.Text.isWhite(str)) {
  if (typeof dflt != 'undefined') return dflt;
  if (typeof this.defaultValue != 'undefined') return this.defaultValue;
  return BU_UNDEFINED;
 }
 var v = this.parseImpl(str);
 if (this.regexp && !this.regexp.test(str)) {
  throw burst.props.PropertyError(this, str, "Does not match regexp /" + burst.Lang.uneval(this.regexp) + "/");
 }
 if (this.enumArray && !(bu_in(str, this.enumSet))) {
  throw burst.props.PropertyError(this, str, "Not among the enum values: " + burst.Lang.uneval(this.enumArray));
 }
 if (this.enumMap) {
  v = this.enumMap[str];
  if (!v) throw burst.props.PropertyError(this, str, "Not in enum map: " + burst.Lang.uneval(this.enumMap));
 }
 return v;
}
BU_PropertyDef.prototype.parseImpl = function(str) {bu_throw("subclass has not implemented parse");}
BU_PropertyDef.prototype.setDefault = function(obj) {
 if (typeof this.defaultValue == 'undefined') {
  bu_debug("(burst.reflect.PropertyDef.js) ", this.name, " has no default to set");
  return false;
 }
 var name = this.name;
 if (typeof obj[name] != 'undefined') {
  bu_debug("(burst.reflect.PropertyDef.js) ", this.name, " already has a value in the object: ", obj[name]);
  return false;
 }
 else {
  bu_debug("(burst.reflect.PropertyDef.js) ", this.name, " being set to default value: ", this.defaultValue);
  obj[name] = this.defaultValue;
  return true;
 }
}
BU_PropertyDef.prototype.checkMandatory = function(obj, handler) {
 if (!this.isMandatory) return;
 var name = this.name;
 if (typeof obj[name] != 'undefined') return;
 if (handler) {handler(this, obj)}
 else throw burst.props.PropertyError(this, null, "No value for mandatory property.");
}
BU_PropertyDef.setDefaultEach = function(obj, propdefs) {
 bu_debug("in burst.reflect.PropertyDef.setDefaultEach");
 burst.Alg.for_each(propdefs, function(propdef) {propdef.setDefault(obj)});
}
BU_PropertyDef.checkMandatoryEach = function(obj, propdefs, handler) {
 burst.Alg.for_each(propdefs, function(propdef) {propdef.checkMandatory(obj, handler)});
}
burst.reflect.PropertyDefBoolean = function(values) {
 burst.reflect.PropertyDef.call(this, values);
}
bu_inherits(burst.reflect.PropertyDefBoolean, BU_PropertyDef);
burst.reflect.PropertyDefBoolean.prototype.parseImpl = function(s) {
 switch(s) {
 case 'true': return true;
 case 'false': return false;
 default:
  throw new burst.props.PropertyError(this, s, "Not a valid boolean string (must be 'true' or 'false').");
 }
}
burst.reflect.PropertyDefBoolean.prototype.valueType = function() {return 'boolean'};
burst.reflect.PropertyDefBoolean.prototype.propertyType = function() {return 'burst.reflect.PropertyDefBoolean'};
burst.reflect.PropertyDefExpr = function(values) {
 burst.reflect.PropertyDef.call(this, values);
}
bu_inherits(burst.reflect.PropertyDefExpr, BU_PropertyDef);
burst.reflect.PropertyDefExpr.prototype.parseImpl = function(s) {
 var v;
 try {v = eval(s);}
 catch(e) {throw burst.props.PropertyError(this, s, "eval threw an exception: " + e);}
 if (typeof v == 'undefined') throw burst.props.PropertyError(this, s, "eval returned undefined");
 return v;
}
burst.reflect.PropertyDefExpr.prototype.valueType = function() {return 'string'};
burst.reflect.PropertyDefExpr.prototype.propertyType = function() {return 'burst.reflect.PropertyDefExpr'};
burst.reflect.PropertyDefString = function(values) {
 burst.reflect.PropertyDef.call(this, values);
}
bu_inherits(burst.reflect.PropertyDefString, BU_PropertyDef);
burst.reflect.PropertyDefString.prototype.parseImpl = function(s) {return s;}
burst.reflect.PropertyDefString.prototype.valueType = function() {return 'string'};
burst.reflect.PropertyDefString.prototype.propertyType = function() {return 'burst.reflect.PropertyDefString'};
burst.reflect.PropertyDefImageUrl = function(values) {
 burst.reflect.PropertyDef.call(this, values);
 if (typeof this.defaultValue != 'undefined' && this.defaultValue) {
  this.defaultValue = this.relativizeBuiltinUrl(this.defaultValue);
 }
}
bu_inherits(burst.reflect.PropertyDefImageUrl, BU_PropertyDef);
burst.reflect.PropertyDefImageUrl.prototype.relativizeBuiltinUrl = function(url) {
 if (burst.URI.isAbsolute(url)) return url;
 if (url.charAt(0) == '/') return url;
 return bu_ScriptLoader.resolveImageUrl(url);
}
burst.reflect.PropertyDefImageUrl.prototype.parseImpl = function(s) {
 return s;
}
burst.reflect.PropertyDefImageUrl.prototype.valueType = function() {return 'string'};
burst.reflect.PropertyDefImageUrl.prototype.propertyType = function() {return 'burst.reflect.PropertyDefImageUrl'};
burst.reflect.PropertyDefNumber = function(values) {
 burst.reflect.PropertyDef.call(this, values);
}
bu_inherits(burst.reflect.PropertyDefNumber, BU_PropertyDef);
burst.reflect.PropertyDefNumber.prototype.parseImpl = function(s) {
 var v = parseInt(s);
 if (isNaN(v)) throw new burst.props.PropertyError(this, s, "Not a valid integer.");
 return v;
}
burst.reflect.PropertyDefNumber.prototype.valueType = function() {return 'number'};
burst.reflect.PropertyDefNumber.prototype.propertyType = function() {return 'burst.reflect.PropertyDefNumber'};
bu_loaded('burst.reflect.PropertyDef', ['burst.Text', 'burst.Alg', 'burst.Lang', 'burst.URI', 'burst.ScriptLoader']);
bu_require('burst.props.AbstractProperties', ['burst.MOP']);
burst.props.AbstractProperties = function(implicit_prefix) {
 this.implicit_prefix_ = typeof implicit_prefix == 'undefined' ? null : implicit_prefix;
}
burst.props.AbstractProperties.prototype.getProperty = function(name) {
  if (this.implicit_prefix_) {
   if (burst.Text.startsWith(name, this.implicit_prefix_)) {
    name = name.substring(this.implicit_prefix_.length);
   }
   else {return BU_UNDEFINED;}
  }
  var s = this.getPropertyImpl(name);
  if (burst.Text.isWhite(s)) return BU_UNDEFINED;
  return burst.Text.trim(s);
}
burst.props.AbstractProperties.prototype.getSubProperty = function(prefix, name) {
  return this.getProperty(prefix + '.' + name);
}
burst.props.AbstractProperties.prototype.getValue = function(propdef, dflt) {
  return propdef.parse(this.getProperty(propdef.name), dflt);
}
burst.props.AbstractProperties.prototype.getSubValue = function(prefix, propdef, dflt) {
  return propdef.parse(this.getSubProperty(prefix, propdef.name), dflt);
}
burst.props.AbstractProperties.prototype.setObjectValue = function(obj, propdef, prefix) {
 var name = propdef.name;
 if (typeof obj[name] != 'undefined') {
  bu_debug("(AbstractProperties.js) object already has a value for ", name, ": ", obj[name]);
  return false;
 }
 var v = (arguments.length > 2 && burst.Lang.isSpecified(prefix)) ?
   this.getSubValue(prefix, propdef) :
   this.getValue(propdef);
 if (typeof v == 'undefined') {
   bu_debug("(AbstractProperties.js) i have no value for ", name);
   return false;
 }
 bu_debug("(AbstractProperties.js) setting value for ", name, " to ", v);
 obj[name] = v;
 return true;
}
burst.props.AbstractProperties.prototype.setObjectValues = function(obj, propdefs, prefix, do_defaults, do_mandatory) {
 bu_debug("in burst.props.AbstractProperties.prototype.setObjectValues(", " prefix=", prefix, " do_defaults=", do_defaults, " do_mandatory=", do_mandatory,")");
 var this_ = this;
 burst.Alg.for_each(propdefs, function(propdef) {
   this_.setObjectValue(obj, propdef, prefix)
 });
 if (do_defaults) burst.reflect.PropertyDef.setDefaultEach(obj, propdefs);
 if (do_mandatory) burst.reflect.PropertyDef.checkMandatoryEach(obj, propdefs);
 return obj;
}
burst.props.MapProperties = function(map, implicit_prefix) {
  burst.props.AbstractProperties.call(this, implicit_prefix);
  this.map_ = map;
}
burst.MOP.inherits(burst.props.MapProperties, burst.props.AbstractProperties);
burst.props.MapProperties.prototype.getPropertyImpl = function(name) {
  return bu_get(this.map_, name);
}
burst.props.QueryStringProperties = function(qstring, dup_handling, implicit_prefix) {
  burst.props.AbstractProperties.call(this, implicit_prefix);
  if(!burst.Lang.isSpecified(qstring)) bu_throw("bad qstring: " + qstring);
  if (qstring.length > 0 && qstring.charAt(0)=='?') qstring = qstring.substring(1);
  this.map_ = burst.URI.queryToMap(qstring, dup_handling);
}
burst.MOP.inherits(burst.props.QueryStringProperties, burst.props.AbstractProperties);
burst.props.QueryStringProperties.prototype.getPropertyImpl = function(name) {
 return bu_get(this.map_, name);
}
burst.props.GroupProperties = function(instances, implicit_prefix) {
  if (arguments.length == 0) return;
  burst.props.AbstractProperties.call(this, implicit_prefix);
  if (!burst.Lang.isSpecified(instances)) bu_throw("(AbstractProperties.js) no instances: " + instances);
  bu_debug("(AbstractProperties.js) burst.props.GroupProperties constructor with ", instances.length, " instances");
  this.instances_ = instances;
}
burst.MOP.inherits(burst.props.GroupProperties, burst.props.AbstractProperties);
burst.props.GroupProperties.prototype.getPropertyImpl = function(name) {
  var i = 0;
  return burst.Alg.find_if_value(this.instances_, function(p) {
bu_debug("(AbstractProperties.js) burst.props.GroupProperties.getPropertyImpl(", name, ") at i=", i++, " and value=", p.getProperty(name));
return p.getProperty(name);
});
}
burst.props.SubProperties = function(parent_instance, implicit_prefix) {
 if (arguments.length < 2 || !implicit_prefix) bu_throw("implicit_prefix must be specified");
 burst.props.AbstractProperties.call(this, implicit_prefix);
 this.parent_instance_ = instance;
}
burst.MOP.inherits(burst.props.SubProperties, burst.props.AbstractProperties);
burst.props.SubProperties.prototype.getPropertyImpl = function(name) {
 return this.parent_instance_.getPropertyImpl(name);
}
burst.props.StyleProperties = function(csstext) {
  burst.props.AbstractProperties.call(this, implicit_prefix);
  this.map_ = burst.xml.HtmlUtil.parseStyle(csstext);
}
burst.MOP.inherits(burst.props.StyleProperties, burst.props.AbstractProperties);
burst.props.StyleProperties.prototype.getPropertyImpl = function(name) {
  return this.map_[name];
}
burst.props.NodeAttributesProperties = function(node, nsuri, implicit_prefix) {
  bu_debug("(AbstractProperties.js) burst.props.NodeAttributesProperties constructor with ", (node.attributes ? node.attributes.length : 0), " attributes");
  burst.props.AbstractProperties.call(this, implicit_prefix);
  this.node_ = node;
  this.nsuri_ = nsuri;
}
burst.MOP.inherits(burst.props.NodeAttributesProperties, burst.props.AbstractProperties);
burst.props.NodeAttributesProperties.prototype.getPropertyImpl = function(name) {
 var v = burst.xml.DomUtil.getAttribute(this.node_, name);
 if (!v && this.nsuri_) {
   v = this.node_.getAttributeNS(nsuri, name);
 }
 bu_debug("(AbstractProperties.js) burst.props.NodeAttributesProperties.getPropertyImpl(", name, ") returning ", v);
 return v;
}
bu_loaded('burst.props.AbstractProperties', ['burst.Text','burst.URI', 'burst.Alg', 'burst.reflect.PropertyDef', 'burst.Lang', 'burst.xml.HtmlUtil', 'burst.xml.DomUtil']);
bu_require('burst.Config', ['burst.props.AbstractProperties', 'burst.reflect.PropertyDef']);
burst.Config = function() {
 var instances = [];
 var url_instance;
 if (!this.urlConfigDisabled() && typeof window != 'undefined') {
  var qs = window.location.search;
  url_instance = new burst.props.QueryStringProperties(qs);
  instances.push(url_instance);
 }
 var app_instance;
 if (typeof bu_AppConfig != 'undefined') {
  app_instance = new burst.props.MapProperties(bu_AppConfig);
  instances.push(app_instance);
 }
 bu_debug("calling burst.props.GroupProperties with instances: ", instances);
 burst.props.GroupProperties.call(this, instances);
}
burst.MOP.inherits(burst.Config, burst.props.GroupProperties);
function bu_app_config_is_true(propname) {
 return (typeof bu_AppConfig != 'undefined' && typeof bu_AppConfig[propname] != 'undefined' &&
   (bu_AppConfig[propname] == true || bu_AppConfig[propname] == 'true'));
}
burst.Config.prototype.allDisabled = function() {return bu_app_config_is_true('allDisabled')};
burst.Config.prototype.urlConfigDisabled = function() {return bu_app_config_is_true('urlConfigDisabled')};
burst.Config.PROP_DEFS = [
 new burst.reflect.PropertyDefBoolean({
  name: 'allDisabled',
  defaultValue: false,
  description: "Prevents any configuration or processing by the library."
 }),
 new burst.reflect.PropertyDefBoolean({
  name: 'urlConfigDisabled',
  defaultValue: false,
  description: "Prevents reading any config from the window url"
 })
];
var bu_Config = new burst.Config();
bu_ScriptLoader.setConfigEvent();
bu_loaded('burst.Config');
burst.Functional = {};
burst.Functional.bind1st = function(binary_op, arg1) {
 return function(arg2) {return binary_op(arg1, arg2)};
}
burst.Functional.bind2nd = function(binary_op, arg2) {
 return function(arg1) {return binary_op(arg1, arg2)}
}
burst.Functional._1 = new Number(1);
burst.Functional._2 = new Number(2);
burst.Functional._3 = new Number(3);
burst.Functional.bind = function(func) {
 bu_unimplemeted('burst.Functional.bind');
}
burst.Functional.not1 = function(unary_pred) {
 return function(arg1) {return !unary_pred(arg1)}
}
burst.Functional.not2 = function(binary_pred) {
 return function(arg1,arg2) {return !binary_pred(arg1,arg2)}
}
burst.Functional.mem_fun0 = function(mem_func) {
 return function(obj) {return mem_func.call(obj)};
}
burst.Functional.mem_fun1 = function(mem_func) {
 return function(obj, arg1) {return mem_func.call(obj, arg1)};
}
burst.Functional.mem_fn = function(mem_func) {
 bu_unimplemented("burst.Functional.mem_fn");
}
function bind_object(mem_func, object) {return function() {mem_func.apply(object, arguments)}}
burst.Functional.compose_f_gx = function(f, g) {
 return function(arg1) {return f(g(arg1))};
}
burst.Functional.compose_f_gx_hx = function(f, g, h) {
 return function(arg1) {return f(g(arg1), h(arg1))};
}
burst.Functional.compose_f_gx_hy = function(f, g, h) {
 return function(arg1,arg2) {return f(g(arg1), h(arg2))};
}
burst.Functional.compose_f_gxy = function(f, g) {
 return function(arg1,arg2) {return f(g(arg1,arg2))};
}
burst.Functional.compose_f_g = function(f, g) {
 return function() {return f(g())};
}
burst.Functional.compose = function(f, g) {
 return function() {return f(g.apply(null, arguments))}
}
burst.Functional.compose_sort = function(secondary, primary) {
 return function(a,b) {
  var result = primary(a,b);
  return result == 0 ? secondary(a,b) : result;
 };
}
bu_loaded('burst.Functional');
function BU_Comparator(name, desc, convert, compare) {
 this.name_ = name;
 this.description_ = desc;
 this.convert = convert;
 this.compare = compare;
 burst.Comparator.ALL[name] = this;
}
burst.Comparator = BU_Comparator;
burst.Comparator.prototype.toString = function() {
 return 'burst.Comparator{' + 'name_: "' + this.name_ + '", description_: ' +
  (this.description ? '"' + this.description + '"' : this.description) +
  ', convert: ' + this.convert + ', compare: ' + this.compare + '}';
}
burst.Comparator.getComparator = function(name, missing_ok) {
 if (bu_in(name, burst.Comparator.ALL)) {
  return burst.Comparator.ALL[name];
 }
 return missing_ok ? null : bu_throw("no such comparator '" + name + "'");
}
burst.Comparator.stringCompare = function(a, b) {
 return (a<b ? -1 : (a==b ? 0 : 1));
}
function bu_minus(a,b) {return a - b;}
burst.Comparator.ALL = {};
new burst.Comparator('string:cs', 'case-sensitive String', null, null);
new burst.Comparator('string:cis', 'case-insensitive String', function(v) {return v.toUpperCase()}, null);
new burst.Comparator('date:native', 'any String that Date.parse understands',
  function(v) {return Date.parse(v)},
  bu_minus);
new burst.Comparator('integer:10', 'calls parseInt(v,10)',
  function(v) {return parseInt(v,10)},
  bu_minus);
new burst.Comparator('float', 'calls parseFloat(v)',
  function(v) {return parseFloat(v)},
  bu_minus);
bu_loaded('burst.Comparator');
bu_require('burst.Time', ['burst.Text', 'burst.Alg']);
burst.Time = {};
var BU_Time = burst.Time;
function buhr12(hr) {var h = hr % 12; return h == 0 ? 12 : h;}
BU_Time.formatField = function(d, spec) {
 switch(spec) {
 case 'M':    return d.getMonth() + 1;
 case 'MM':   return buzp2(d.getMonth() + 1);
 case 'MMM':  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
 case 'MMMM':
 case 'MMMMM': return ['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()];
 case 'd':    return d.getDate();
 case 'dd':   return buzp2(d.getDate());
 case 'yy':   return ('' + d.getFullYear()).substring(3);
 case 'yyyy': return d.getFullYear();
 case 'H':    return d.getHours();
 case 'HH':   return buzp2(d.getHours());
 case 'h':    return buhr12(d.getHours());
 case 'hh':   return buzp2(buhr12(d.getHours()));
 case 'm':    return d.getMinutes();
 case 'mm':   return buzp2(d.getMinutes());
 case 's':    return d.getSeconds();
 case 'ss':   return buzp2(d.getSeconds());
 case 'S':    return d.getMilliseconds();
 case 'SS':
 case 'SSS':  return buzp3(d.getMilliseconds());
 case 'a':    return d.getHours() > 12 ? 'PM' : 'AM';
 case 'EEE':  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
 case 'Z':    {
  var tzo = d.getTimezoneOffset();
  var atzo = Math.abs(tzo);
  return (tzo > 0 ? '-' : '+') + buzp2(tzo / 60) + buzp2(tzo % 60);
 }
 default:
  return bu_throw("unsupported date format field '" + spec + "'");
 }
}
BU_Time.formatFields = function(d, fmt, sep) {
 return burst.Alg.transform(fmt.split(sep), function(spec) {return BU_Time.formatField(d,spec);}).join(sep);
}
function bu_split_date_format(fmt) {
 var specs = fmt.match(/(y+|M+|d+|h+|H+|k+|K+|m+|s+|S+|a+|E+|z+|Z+|w+|W+|[^a-zA-Z])/g);
 return specs;
}
BU_Time.format = function(d, fmt) {
 switch(fmt) {
 case 'MM/dd/yyyy': return [buzp2(d.getMonth()+1), buzp2(d.getDate()), d.getFullYear()].join('/');
 case 'yyyy-MM-dd': return BU_Time.formatFields(d, fmt, '-');
 case 'HH:mm:ss':   return BU_Time.formatFields(d, fmt, ':');
 case 'HH:mm:ss.S': return BU_Time.format(d, 'HH:mm:ss') + '.' + formatField(d,'S');
 default:
  var specs = bu_split_date_format(fmt);
  var parts = [];
  burst.Alg.for_each(specs, function(spec) {
   if (/[a-zA-Z]/.test(spec)) parts.push(BU_Time.formatField(d,spec));
   else parts.push(spec);
  });
  return parts.join('');
 }
}
BU_Time.parse = function(s, fmt) {
}
bu_loaded('burst.Time');
function BU_WidgetManager() {
 this.instance_counter_ = 0;
 this.widgets_by_id_ = [];
}
BU_WidgetManager.classes_by_name_ = {};
burst.webui.WidgetManager = BU_WidgetManager;
BU_WidgetManager.getWidgetManager = function() {return bu_WidgetManager}
var bu_WidgetManager = new BU_WidgetManager();
BU_WidgetManager.prototype.nextInstanceId = function() {return this.instance_counter_++;}
BU_WidgetManager.prototype.registerWidget = function(instance, id) {
 this.widgets_by_id_[id] = instance;
}
BU_WidgetManager.prototype.findByWidgetId = function (widget_id, missing_ok) {
 if (typeof widget_id != 'number') {
  widget_id = parseInt(widget_id);
  if (isNaN(widget_id)) bu_throw("bogus widget_id '" + widget_id + "'");
 }
 var widget = this.widgets_by_id_[widget_id];
 if (widget) return widget;
 if (missing_ok) return null;
 return bu_throw("no such widget with id '" + widget_id + "'");
}
BU_WidgetManager.prototype.findByNode = function(node) {
 return burst.Alg.find_if_value(this.widgets_by_id_, function(w) {return w.inputNode === node});
}
BU_WidgetManager.prototype.findByAppId = function(app_id) {
 return burst.Alg.find_if_value(this.widgets_by_id_, function(w) {return w.appId === app_id});
}
BU_WidgetManager.registerWidgetClass = function(name, ctor) {
 BU_WidgetManager.classes_by_name_[name] = ctor;
}
BU_WidgetManager.getWidgetConstructor = function(name) {
 return bu_get_soft(BU_WidgetManager.classes_by_name_, name, null);
}
BU_WidgetManager.prototype.processConstructorNodes = function(nodes, ctor_must_exist) {
 return burst.Alg.for_each_call2(nodes, this, BU_WidgetManager.prototype.processConstructorNode, ctor_must_exist);
}
BU_WidgetManager.wtype_to_module_name = function(wtype) {
  return (wtype.indexOf('.') == -1) ? 'burst.webui.widgets.' + wtype : wtype;
}
BU_WidgetManager.prototype.processConstructorNode = function(node, ctor_must_exist) {
 var wtype = BU_WidgetManager.getInlineWidgetType(node);
 var ctor = BU_WidgetManager.getWidgetConstructor(wtype);
 var module_name = BU_WidgetManager.wtype_to_module_name(wtype);
 if (!ctor) {
  if (ctor_must_exist) bu_throw("attempt to construct a widget of unknown type '" + wtype + "'");
  var this_ = this;
  var done_handler = function() {
    ctor = BU_WidgetManager.getWidgetConstructor(wtype);
    if (!ctor) bu_throw("widget constructor for '" + wtype + "' still not defined after loading widget script");
    return this_.call_ctor(ctor, node);
  };
  return bu_ScriptLoader.requireModule('burst.webui.WidgetManager', module_name, done_handler);
 }
 return this.call_ctor(ctor, node);
}
BU_WidgetManager.prototype.findAndProcessConstructorNodes = function() {
 var nodes = BU_WidgetManager.findConstructorNodes();
 this.processConstructorNodes(nodes);
}
BU_WidgetManager.prototype.getAndProcessConstructorNodes = function(ids, widget_id_strict) {
 var nodes = BU_WidgetManager.getConstructorNodes(ids, widget_id_strict);
 this.processConstructorNodes(nodes);
}
BU_WidgetManager.prototype.call_ctor = function(ctor, node) {
  if (typeof ctor !== 'function') {
   var mess = "(WidgetManager.js) ctor not a function: " + ctor;
   bu_alert(mess);
   bu_throw(mess);
  }
  return new ctor(node, true);
}
BU_WidgetManager.MARKER_ATT = 'buType';
BU_WidgetManager.APPID_ATT = 'buAppId';
BU_WidgetManager.PROPERTIES_ATT = 'buProperties';
BU_WidgetManager.PROPERTY_ATT = 'buProperty';
BU_WidgetManager.VALUE_ATT = 'buValue';
BU_WidgetManager.maybe_set_inline_prop = function(obj, node, marker_ok) {
 if (!marker_ok && BU_WidgetManager.isInlineConstructor(node)) return false;
 var natt = burst.xml.DomUtil.getAttribute(node, BU_WidgetManager.PROPERTY_ATT);
 if (!natt) return false;
 var vatt = burst.xml.DomUtil.getAttribute(node, BU_WidgetManager.VALUE_ATT);
 if (vatt) {
  obj[natt] = vatt;
 }
 else {
  obj[natt] = burst.xml.DomUtil.getInnerHTML(node);
 }
 return true;
}
BU_WidgetManager.getInlineWidgetType = function(node, missing_ok) {
 if (node.nodeType !== Node.ELEMENT_NODE) return BU_UNDEFINED;
 var butype = burst.xml.DomUtil.getAttribute(node, BU_WidgetManager.MARKER_ATT);
 if (!butype && (arguments.length < 2 || !missing_ok)) bu_throw("Node has no '" + BU_WidgetManager.MARKER_ATT + "' attribute to indicate widget type");
 return butype;
}
BU_WidgetManager.isInlineConstructor = function(node) {
 return BU_WidgetManager.getInlineWidgetType(node, true) ? true : false;
}
BU_WidgetManager.findConstructorNodes = function(doc, node, arr) {
 if (arguments.length < 1) doc = document;
 if (arguments.length < 2) return arguments.callee(doc, doc.documentElement, []);
 if (BU_WidgetManager.isInlineConstructor(node)) {
  arr.push(node);
  return arr;
 }
 burst.xml.DomUtil.for_children(node, function(child) {
  BU_WidgetManager.findConstructorNodes(doc, child, arr);
 });
 return arr;
};
BU_WidgetManager.getConstructorNodes = function(ids, be_strict, doc) {
 if (typeof be_strict == 'undefined') be_strict = false;
 if (typeof doc == 'undefined') doc = document;
 if (typeof ids == 'string') {
  var idarray = ids.split(/\s*,\s*/);
  ids = idarray;
 }
 var arr = [];
 burst.Alg.for_each(ids, function(id) {
  var node = doc.getElementById(id);
  var mess;
  if (!node) {
   mess = "(WidgetManager.js) There is no Node with ID '" + id + "'";
   if (be_strict) bu_throw(mess); else bu_warn(mess + '; skipping it');
   return;
  }
  if (!BU_WidgetManager.isInlineConstructor(node)) {
   mess = "The Node with ID '" + id + "' does not appear to be an inline constructor";
   if (be_strict) bu_throw(mess); else bu_warn(mess + '; skipping it');
   return;
  }
  arr.push(node);
 });
 return arr;
}
BU_WidgetManager.PROP_DEFS = [
 new burst.reflect.PropertyDefBoolean({
  name: 'findWidgets',
  defaultValue: false,
  description: "Whether to search all elements on the page for inline constructors (elements with the marker attribute)"
 }),
 new burst.reflect.PropertyDefString({
  name: 'initWidgetIds',
  description: "If specified, a list of IDs of elements on the page which are inline constructors. Can be an Array or a comma-separated String."
 })
];
BU_WidgetManager.onDocumentLoad = function() {
 var props = bu_Config.setObjectValues({}, BU_WidgetManager.PROP_DEFS, 'burst.webui.WidgetManager', true);
 if (props.findWidgets) {
  bu_WidgetManager.findAndProcessConstructorNodes();
 }
 if (props.initWidgetIds) {
  var widget_id_strict = true;
  bu_WidgetManager.getAndProcessConstructorNodes(props.initWidgetIds, widget_id_strict);
 }
 else {
 }
};
bu_loaded('burst.webui.WidgetManager', ['burst.Alg','burst.xml.DomUtil'], BU_WidgetManager);
function BU_AbstractWidget(node, propdefs, parse_properties) {
 if (arguments.length == 0) return;
 this.propdefs_ = propdefs;
 this.inputNode = node;
 this.widgetId = bu_WidgetManager.nextInstanceId();
 this.appId = null;
 this.childWidgets = null;
 this.parentWidget = null;
 if (false) {
  dom_node.setAttribute('BU_compID', this.widgetId);
  dom_node.id = this.widgetId;
 }
 bu_WidgetManager.registerWidget(this, this.widgetId);
 if (parse_properties) this.parseProperties(true, true);
 else if (this.propdefs_) burst.reflect.PropertyDef.setDefaultEach(this, this.propdefs_);
}
burst.webui.widgets.AbstractWidget = BU_AbstractWidget;
BU_AbstractWidget.prototype.addChildWidget = function(child_widget) {
 child_widget.parentWidget = this;
 if (!this.childWidgets) this.childWidgets = [child_widget];
 else this.childWidgets.push(child_widget);
 return child_widget;
}
BU_AbstractWidget.prototype.parseProperties = function(do_defaults, do_mandatory) {
 bu_debug("in AbstractWidget.prototype.parseProperties("," do_defaults=",do_defaults," do_mandatory=",do_mandatory,")");
 var node = this.inputNode;
 var app_id = burst.xml.DomUtil.getAttribute(node, BU_WidgetManager.APPID_ATT);
 if (app_id) this.appId = app_id;
 var props_arr = [];
 var attprops = new burst.props.NodeAttributesProperties(node);
 props_arr.push(attprops);
 var prop_text = burst.xml.DomUtil.getAttribute(node, BU_WidgetManager.PROPERTIES_ATT);
 if (prop_text) {
  var prop_text_map = burst.xml.HtmlUtil.parseStyle(prop_text);
  props_arr.push(new burst.props.MapProperties(prop_txt_map));
 }
 var propvals = {};
 BU_WidgetManager.maybe_set_inline_prop(propvals, node, true);
 burst.xml.DomUtil.for_children(node, function(child) {BU_WidgetManager.maybe_set_inline_prop(propvals, child, false)}, Node.ELEMENT_NODE);
 props_arr.push(new burst.props.MapProperties(propvals));
 var group_props = new burst.props.GroupProperties(props_arr);
 var prefix = null;
 group_props.setObjectValues(this, this.propdefs_, prefix, do_defaults, do_mandatory);
}
var BU_ControlWidget = function(node, propdefs, parse_properties) {
 BU_AbstractWidget.call(this, node, propdefs, parse_properties);
 this.controlName = null;
 this.controlValue = null;
 if (parse_properties) this.parseControlName();
 else {
 }
}
bu_inherits(BU_ControlWidget, BU_AbstractWidget);
burst.webui.widgets.ControlWidget = BU_ControlWidget;
BU_ControlWidget.NAME_ATTS = ['buControlName', 'name', 'id'];
BU_ControlWidget.VALUE_ATTS = ['buControlValue', 'value'];
BU_ControlWidget.prototype.parseControlName = function() {
 var node = this.inputNode;
 this.controlName = burst.Alg.find_if_value(BU_ControlWidget.NAME_ATTS, function(attname) {
  return burst.xml.DomUtil.getAttribute(node, attname);
 });
 if (!this.controlName) bu_throw("can't find controlName in node using any of the attributes: " + burst.Lang.uneval(BU_ControlWidget.NAME_ATTS));
 this.controlValue = burst.Alg.find_if_specified(BU_ControlWidget.VALUE_ATTS, function(attname) {
  return burst.xml.DomUtil.getAttribute(node, attname);
 });
 if (!this.controlValue) this.controlValue = burst.Text.trim(burst.xml.DomUtil.getInnerHTML(node));
}
function BU_XPath(pathstr, flags) {
 if (!(this instanceof BU_XPath)) {
  return burst.MOP.memoizeNew1(BU_XPath.instance_cache, BU_XPath, pathstr);
 }
 bu_debug("burst.xml.XPath(" + pathstr + ")");
 if (!flags) flags = 'h';
 pathstr = pathstr.replace(/\/\//g,'/descendant::');
 if (pathstr.charAt(0) === '/') {
  this.is_absolute_ = true;
  pathstr = pathstr.substring(1);
 }
 else {
  this.is_absolute_ = false;
 }
 var stepstrs = pathstr.split(/\//);
 bu_debug("pathstr='" + pathstr + "' stepstrs=" + stepstrs.join('|'));
 this.steps_ = burst.Alg.transform(stepstrs, function(stepstr) {return BU_XPathStep(stepstr,flags)});
 this.str_ = pathstr;
 return this;
}
burst.xml.XPath = BU_XPath;
BU_XPath.instance_cache = {};
function BU_XPath_Axis_descendant_or_self() {}
function BU_XPath_Axis_descendant() {}
function BU_XPath_Axis_self() {}
function BU_XPath_Axis_child() {}
BU_XPath.AXES = {
 descendant_or_self: BU_XPath_Axis_descendant_or_self,
 descendant: BU_XPath_Axis_descendant,
 self: BU_XPath_Axis_self,
 child: BU_XPath_Axis_child
};
BU_XPath.compilePredicate = function(pred_str) {
 if (!pred_str.match(/^\d+$/)) bu_throw("predicate '" + pred_str + "' not supported");
 match_index = parseInt(pred);
 return function(node, pos) {return pos == match_index;}
}
function BU_XPath_NodeTest_text(node)    {return node.nodeType == Node.TEXT_NODE;}
function BU_XPath_NodeTest_node(node)    {return true;}
function BU_XPath_NodeTest_element(node) {return node.nodeType == Node.ELEMENT_NODE;}
BU_XPath.compileNodeTest = function(node_test_str, flags) {
 switch(node_test_str) {
  case '':        bu_throw("empty NodeTest");
  case 'text()' : return BU_XPath_NodeTest_text;
  case 'node()' : return BU_XPath_NodeTest_node;
  case '*' :      return BU_XPath_NodeTest_element;
  default:
   if (typeof node_test_str != 'string') alert("node_test_str " + node_test_str + " is a " + (typeof node_test_str));
   if (/^[\w\.\-\_\:]+$/.test(node_test_str)) {
    if (flags.indexOf('h') != -1) {node_test_str = node_test_str.toUpperCase();}
    return function(node) {return node.nodeType == Node.ELEMENT_NODE && node.nodeName == node_test_str};
   }
   bu_throw("unsupported NodeTest '" + node_test_str + "'");
 }
 throw("never reached");
}
var BU_XPathStep_instance_cache = {};
function BU_XPathStep(step_str,flags) {
 if (!(this instanceof BU_XPathStep)) {
  return burst.MOP.memoizeNew2(BU_XPathStep_instance_cache, BU_XPathStep, step_str, flags);
 }
 bu_debug("BU_XPathStep(" + step_str + ")");
 this.str_ = step_str;
 this.preds_ = null;
 if (step_str == '.') {
  this.axis_ = BU_XPath_Axis_self;
  this.node_test_ = BU_XPath_NodeTest_node;
 }
 else if (step_str == 'descendant-or-self::node()') {
  this.axis_ = BU_XPath_Axis_descendant_or_self;
  this.node_test_ = BU_XPath_NodeTest_node;
 }
 else {
  var rest = step_str;
  var axis_ind = step_str.indexOf('::');
  if (axis_ind != -1) {
   var axis_str = step_str.substring(0,axis_ind);
   rest = step_str.substring(axis_ind + 2);
   if (rest.indexOf('::')!=-1) bu_throw("multiple axes in step '" + step_str + "'");
   this.axis_ = BU_XPath.AXES[axis_str] || bu_throw("unknown axis '" + axis_str + "'");
  }
  else {
   this.axis_ = BU_XPath_Axis_child;
  }
  var node_test_str;
  var pred_ind = rest.indexOf('[');
  if (pred_ind != -1) {
   node_test_str = rest.substring(0,pred_ind);
   rest = rest.substring(pred_ind + 1);
  }
  else {
   node_test_str = rest;
  }
  this.node_test_ = BU_XPath.compileNodeTest(node_test_str, flags);
  if (pred_ind != -1) {
   this.preds_ = [];
   while(true) {
    var end_pred = rest.indexOf(']');
    if (end_pred == -1) bu_throw("no end to predicate in '" + step_str + "'");
    var pred_str = rest.substring(0,end_pred);
    this.preds_.push(BU_XPath.compilePredicate(pred_str));
    if (rest.length == end_pred + 1) break;
    if (rest.charAt(end_pred + 1) != '[')
     bu_throw("expected [ at '" + rest.substring(end_pred+1) + "' in '" + step_str + "'");
    rest = rest.substring(end_pred + 2);
   }
  }
 }
 return this;
}
BU_XPathStep.prototype.isMatch = function(node, match_counts) {
 var is_match = this.node_test_(node);
 if (is_match && this.preds_) {
  if (!match_counts) bu_throw("no match_counts");
  for(var i=0;i<this.preds_.length;++i) {
   var pred = step.preds_[i];
   var m = match_counts[i] || 0;
   if (pred(node, m)) {
    match_counts[i] = m + 1;
   }
   else {
    is_match = false;
    break;
   }
  }
 }
 return is_match;
}
BU_XPath.prototype.iterate = function(node, func) {
 var cur_node = this.is_absolute_ ? document : node;
 if (typeof cur_node.nodeType == 'undefined' && typeof cur_node.documentElement != 'undefined')
  cur_node = cur_node.documentElement;
 this.iterate_(node, func, cur_node, 0, 0);
}
BU_XPath.prototype.selectSingleNode = function(node) {
 var match;
 this.iterate(node, function(n) {match = n; return true;});
 return match;
}
BU_XPath.prototype.selectNodes = function(node) {
 var matches = [];
 this.iterate(node, function(n) {matches.push(n); return false;});
 return matches;
}
BU_XPath.prototype.iterate_ = function(start_node, func, cur_node, tree_depth, step_index) {
 var step = this.steps_[step_index] || bu_throw("no step number '" + step_index + "'");
 var axis = step.axis_;
 var is_descend = (axis === BU_XPath_Axis_descendant_or_self || axis === BU_XPath_Axis_descendant);
 var is_last_step = (step_index == this.steps_.length - 1);
 var node_test = step.node_test_;
 if (axis === BU_XPath_Axis_self || axis === BU_XPath_Axis_descendant_or_self) {
  if (node_test !== BU_XPath_NodeTest_node) bu_throw("unsupported: self axis without node()");
  if (step.preds_) bu_throw("unsupported: self axis with predicates");
  if (is_last_step) {
   if (func(cur_node)) return true;
   return false;
  }
  return this.iterate_(start_node, func, cur_node, tree_depth, step_index + 1);
 }
 if (!is_descend && axis !== BU_XPath_Axis_child) bu_throw("unsupported axis: " + axis);
 var match_counts = step.preds_ ? new Array(step.preds_.length): null;
 bu_debug("step=" + step.str_ + " tree_depth=" + tree_depth + " step_index=" + step_index + " is_last_step=" + is_last_step + " is_descend=" + is_descend);
 for(var child=cur_node.firstChild;child;child=child.nextSibling) {
  var is_match = step.isMatch(child, match_counts);
  bu_debug("  child=" + child.nodeName + " is_match=" + is_match);
  if (is_match && is_last_step) {
   if (func(child)) return true;
  }
  if ((is_match && !is_last_step) || is_descend) {
   if (!is_descend) ++step_index;
   if (this.iterate_(start_node, func, child, tree_depth+1, step_index)) return true;
   if (is_descend && is_match && !is_last_step) {
    bu_debug("descending again");
    if (this.iterate_(start_node, func, child, tree_depth+1, step_index + 1)) return true;
   }
  }
  if (is_match && step.preds_) break;
 }
 return false;
}
bu_loaded('burst.xml.XPath');