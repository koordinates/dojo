/**
* @file Time.js
* Defines burst.Time which contains static utility functions for the date and time.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

// need zeropad functions
bu_require('burst.Time', ['burst.Text', 'burst.Alg']);

//=java package burst;
/**
* Scoping class for static date and time utilities.
*
* @todo characterize what formats the native Date will parse, to determine what compensation might be necessary.
*/
//:NSBEGIN Time
burst.Time = {};
var BU_Time = burst.Time;

// utility to return an hour in 1-12
function buhr12(hr) {var h = hr % 12; return h == 0 ? 12 : h;}

BU_Time.formatField = function(d, spec) {
  switch(spec) {
  // month
  case 'M':    return d.getMonth() + 1;
  case 'MM':   return buzp2(d.getMonth() + 1);
  case 'MMM':  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()];
  case 'MMMM':
  case 'MMMMM': return ['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()];
  // day of month
  case 'd':    return d.getDate();
  case 'dd':   return buzp2(d.getDate());
  // year
  case 'yy':   return ('' + d.getFullYear()).substring(3);
  case 'yyyy': return d.getFullYear();
  // 24 hour
  case 'H':    return d.getHours();
  case 'HH':   return buzp2(d.getHours());
  // 12 hour
  case 'h':    return buhr12(d.getHours());
  case 'hh':   return buzp2(buhr12(d.getHours()));
  // minute
  case 'm':    return d.getMinutes();
  case 'mm':   return buzp2(d.getMinutes());
  // second
  case 's':    return d.getSeconds();
  case 'ss':   return buzp2(d.getSeconds());
  // millis
  case 'S':    return d.getMilliseconds();
  case 'SS':   
  case 'SSS':  return buzp3(d.getMilliseconds());
  // am/pm
  case 'a':    return d.getHours() > 12 ? 'PM' : 'AM';
  // day of week
  case 'EEE':  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
  // timezone like '+0730'
  case 'Z':    {
     // getTimezoneOffset is in minutes as UTC - local (so it is positive in USA, when negative is the convention)
     // TODO: daylight savings time consideratios
     // it may be easier to just parse the native d.toString() output     // ECMAScript
     var tzo = d.getTimezoneOffset();
     var atzo = Math.abs(tzo);
     // sign reversal
     return (tzo > 0 ? '-' : '+') + buzp2(tzo / 60) + buzp2(tzo % 60);
  }
  default:
    return bu_throw("unsupported date format field '" + spec + "'");
  }
}

BU_Time.formatFields = function(d, fmt, sep) {
  return burst.Alg.transform(fmt.split(sep), function(spec) {return BU_Time.formatField(d,spec);}).join(sep);
}

// splits into segments of repeating letters and punctuation
// todo: detect and complain about alien letters, or add the whole alphabet in.
function bu_split_date_format(fmt) {
   // IE6 String.split doesn't seem to support capturing parentheses
  //var specs = fmt.split(/(y+|M+|d+|h+|H+|k+|K+|m+|s+|S+|a+|E+|z+|Z+|w+|W+|[^a-zA-Z])/);
  var specs = fmt.match(/(y+|M+|d+|h+|H+|k+|K+|m+|s+|S+|a+|E+|z+|Z+|w+|W+|[^a-zA-Z])/g);
  return specs;
}

/**
* format the provided date d using the specified format string, following java.text.SimpleDateFormat conventions.
* @see http://java.sun.com/j2se/1.4/docs/api/java/text/SimpleDateFormat.html
*/
//:NSFUNCTION String format(Date d, String fmt)
BU_Time.format = function(d, fmt) {
  switch(fmt) {
  case 'MM/dd/yyyy': return [buzp2(d.getMonth()+1), buzp2(d.getDate()), d.getFullYear()].join('/');
  case 'yyyy-MM-dd': return BU_Time.formatFields(d, fmt, '-');
  case 'HH:mm:ss':   return BU_Time.formatFields(d, fmt, ':');
  case 'HH:mm:ss.S': return BU_Time.format(d, 'HH:mm:ss') + '.' + formatField(d,'S');

  default: 
    // loop through repeating alpha tokens, and join again with same punctuation
    var specs = bu_split_date_format(fmt);
    //bu_alert("specs=" + specs.join('|'));
    var parts = [];
    burst.Alg.for_each(specs, function(spec) {
      if (/[a-zA-Z]/.test(spec)) parts.push(BU_Time.formatField(d,spec));
      else parts.push(spec);
    });
    return parts.join('');
    //return bu_throw("unsupported date format '" + fmt + "'");
  }
}

// not implemented yet
// the best approach would to only make up for cases not properly parsed by native Date.parse
/*
  // MM/dd/yyyy
  var re =/^\s*(\d{1,2})\/(\d{1,2})\/(\d{4,})\s*$/;
  var match = s.match(re);
  if (match) {
    var y = parseInt(match[3],10);
    var M = parseInt(match[1],10) - 1;
    var d = parseInt(match[2],10);
    var d = new Date(y,M,d);
  }
*/

BU_Time.parse = function(s, fmt) {
}

//:NSEND

bu_loaded('burst.Time');
