/**
* @file Alg.js
*
* Defines burst.Alg which contains static utility functions for collections.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

//=java package burst;
/**
* Scoping class to hold static collection utility functions.
*
* These utilities are loosely inspired by the STL: http://www.sgi.com/tech/stl/stl_index.html
*
* No attempt is made at genericity. When we do support different types of
* collections, it is with different function names.
* Genericity is not natively supported by ECMAScript, nor is multi-dispatch, and
* while emulating it would be possible, we deem it not worth it.
* Another approach would be to introduce iterator objects for each underlying collection
* object, but that too is a bit heavy weight in both API complexity and overhead.
*
* The collection types which have at least some algorithm functions available are:
* - Array
* - Arguments (sadly not a real Array in ECMAScript)
* - Object (also called a "map" here, for its associative character)
* - DOM Collection
* - DOM Node (these algorithms are mostly found in the burst.xml.DomUtil static methods)
*
*
* @todo Investigate any speed improvement from hoisting arr.length into a constant outside of loop. 
* @todo perhaps use Duff's Device http://home.earthlink.net/~kendrasg/info/js_opt/jsOptMain.html#duffsdevice
* @todo Document which algorithms allow mutating function arguments.
*/
//:NSBEGIN Alg
burst.Alg = {};

/**
* Iterate through the properties of Object map calling the binary function
* binary_func with the two arguments of property name and value.
* Note that it is assumed that the caller has not added any extraneous properties
* or will filter those out in func. This does no filtering.
* @todo consider filtering by "k in obj.prototype", etc.
* @param map The object to iterate over.
* @param binary_func a binary function 
*/
//:NSFUNCTION void for_map(Object map, Function binary_func)
burst.Alg.for_map = function(map, binary_func) {
  for(var k in map) {
    binary_func(k, map[k]);
  }
}

/**
* Similar to for_map, except that the return values of binary_func
* are collected into the Array arr.
* @param map The object to iterate over.
* @param binary_func A binary function.
* @param arr Optional. If specified, the array to push onto. Otherwise a new Array is made.
* @return arr
*/
//:NSFUNCTION Array transform_map(Object map, Function binary_func, Array arr)
burst.Alg.transform_map = function(map, binary_func, arr) {
  if (!arr) arr = new Array();
  for(var k in map) {arr.push(binary_func(k, map[k]));}
  return arr;
}

/** 
* Call unary_func on each Array element. No return value.
* @param arr The Array to iterate over.
* @param unary_func The function to call on each element.
*/
//:NSFUNCTION void for_each(Array arr, Function unary_func)
burst.Alg.for_each = function(arr, unary_func) {
  for(var i=0;i<arr.length;++i) unary_func(arr[i]);
}

/**
* Unlike for_each, use obj.call to invoke the member function func
* on each Array element.
* @param arr The Array to iterate over.
* @param obj The object to invoke unary_func.call(obj, val) on.
* @param unary_func The function to call on each element.
*/
//:NSFUNCTION void for_each_call(Array arr, Object obj, Function unary_func)
burst.Alg.for_each_call = function(arr, obj, unary_func) {
  for(var i=0;i<arr.length;++i) unary_func.call(obj, arr[i]);
}

/**
* Just like for_each_call, but a binary function, and the second argument is the fixed arg2.
*/
//:NSFUNCTION void for_each_call2(Array arr, Object obj, Function binary_func, Object arg2)
burst.Alg.for_each_call2 = function(arr, obj, binary_func, arg2) {
  for(var i=0;i<arr.length;++i) binary_func.call(obj, arr[i], arg2);
}

/**
* Returns index of first element that is == val. Returns -1 if none.
* @param arr the Array to look through.
* @param val the value to look for
* @return the index of the first matching element, or -1 if none.
*/
//:NSFUNCTION Number find(Array arr, Object val)
burst.Alg.find = function(arr, val) {
  for(var i=0;i<arr.length;++i) {if (arr[i] == val) return i;}
  return -1;
}

/**
* Like <var>find</var>, but returns the matching value rather than the index.
* Returns undefined if none match.
* @param arr the Array to look through.
* @param val the value to look for
* @return the matching value in the array, or undefined if none.
*/
//:NSFUNCTION Object find_value(Array arr, Object val)
burst.Alg.find_value = function(arr, val) {
  for(var i=0;i<arr.length;++i) {
     var v = arr[i];
     if (v == val) return v;
  }
  return BU_UNDEFINED;
}

/** 
* Returns index of first element for which unary_predicate is true. Returns -1 if none.
* @param arr the Array to look through.
* @param unary_predicate the function to call on each element.
* @return the index of the first matching element, or -1 if none.
*/
//:NSFUNCTION Number find_if(Array arr, Function unary_predicate)
burst.Alg.find_if = function(arr, unary_predicate) {
  for(var i=0;i<arr.length;++i) {if (unary_predicate(arr[i])) return i;}
  return -1;
}

/** 
* Like find_if, but rather than returning an index, it returns the first
* return value from unary_func that tests as true.
* @param arr the Array to iterate through.
* @param unary_func the function to call on each element.
* @return the first true value returned, or undefined if none.
*/
//:NSFUNCTION Object find_if_value(Array arr, Function unary_func)
burst.Alg.find_if_value = function(arr, unary_func) {
  for(var i=0;i<arr.length;++i) {
    var v = unary_func(arr[i]);
    if (v) return v;
  }
  return BU_UNDEFINED;
}

/** 
* Like find_if_value, but returns the nth (zero-based) value
* returned from unary_func that tests as true.
* @param arr the Array to iterate through.
* @param n The number of the match to return (zero-based).
* @param unary_func the function to call on each element.
* @return the nth true value returned, or undefined if none.
*/
//:NSFUNCTION Object find_if_nth_value(Array arr, Number n, Function unary_func)
burst.Alg.find_if_nth_value = function(arr, n, unary_func) {
  var seen = 0;
  for(var i=0;i<arr.length;++i) {
    var v = unary_func(arr[i]);
    if (v) { if (n == seen) return v; ++seen;}
  }
  bu_debug("burst.Alg.find_if_nth_value saw=", seen, ' but did not see ', n);
  return BU_UNDEFINED;
}

/** 
* Like find_if_value, but returns the first first value that is not
* null or undefined (vs. testing for true).
* @param arr the Array to iterate through.
* @param unary_func the function to call on each element.
* @return the first not-null, not-undefined value returned, or undefined if none.
*/
//:NSFUNCTION Object find_if_specified(Array arr, Function unary_func)
burst.Alg.find_if_specified = function(arr, unary_func) {
  for(var i=0;i<arr.length;++i) {
    var v = unary_func(arr[i]);
    if (v !== null && (typeof v !== 'undefined')) return v;
  }
  return BU_UNDEFINED;
}

/*
* Remove the array elements starting with start, up to and excluding end.
* It does this in place, though it does return its argument array.
*/
burst.Alg.erase = function(arr, start, end) {
  arr.splice(start, end - start);
}

/** 
* Counts elements for which unary_predicate is true.
* @param arr the Array to iterate through.
* @param unary_predicate the function to call on each element.
* @return the count of elements for which unary_predicate returned a true value.
*/
//:NSFUNCTION Number count_if(Array arr, Function unary_predicate)
burst.Alg.count_if = function(arr, unary_predicate) {
  var count = 0; 
  for(var i=0;i<arr.length;++i) {if (unary_predicate(arr[i])) ++count;}
  return count;
}

/**
* Set all Array members with the result from calling the generator (with no arguments).
* Assumes the Array length has already been set.
* @param arr The Array to set values of (up to its existing length)
* @param zeroary_func The function to call to generate each value
* @return arr  
*/
//:NSFUNCTION Array generate(Array arr, Function zeroary_func)
burst.Alg.generate = function(arr, generator) {
  for(var i=0;i<arr.length;++i) {arr[i] = generator()}
  return arr;
}

/**
* Set the first n members of the Array by calling the generator.
* @param arr The Array to set values of.
* @param n The number of array members to set or add.
* @param zeroary_func The function to call to generate each value.
* @return arr  
*/
//:NSFUNCTION Array generate_n(Array arr, Number n, Function zeroary_func)
burst.Alg.generate_n = function(arr, n, generator) {
  for(var i=0;i<n;++i) {arr[i] = generator()}
  return arr;
}


/** 
* Return index of first element not less than val. 
* This is the first position where val could be inserted in a way preserving
* the order imposed by the "less" comparator.
* Returns length if val is greater than all elements.
* @param arr The Array to iterate through.
* @param val The value to pass into the less function
* @param less Optional. A binary predicate defaulting to function(a,b) {return a<b;}
* @return The first index i for which !less(arr[i],val)
*/
//:NSFUNCTION Number lower_bound(Array arr, Object val, Function less)
burst.Alg.lower_bound = function(arr, val, less) {
  if (!less) less = function(a,b) {return a < b;}
  for(var i=0;i<arr.length;++i) {
    if (! less(arr[i], val)) return i;
  }
  return i;
}

/** 
* Returns index of first element for which val is less than the element.
* This is the highest index where val could be inserted preserving the order
* imposed by the "less" comparator.
* Returns length if none.
*
* If val does not exist in the container, lower_bound and upper_bound are the
* same. If val exists exactly once in the container, then lower_bound returns
* the index of that val, and upper_bound returns the index of that val.
* Take a look at your favorite C++ text for more information.
*
* @param arr The Array to iterate through.
* @param val The value to pass into the less function
* @param less Optional. A binary predicate defaulting to function(a,b) {return a<b;}
* @return The first index i for which less(val,arr[i])
*/
//:NSFUNCTION Number upper_bound(Array arr, Object val, Function less)
burst.Alg.upper_bound = function(arr, val, less) {
  if (!less) less = function(a,b) {return a < b;}
  for(var i=0;i<arr.length;++i) {
    if (less(val, arr[i])) return i;
  }
  return i;
}

/**
* Collection the results of invoking unary_func on each element.
*
* Note that the same index is used in dest and arr; the results are
* not just push'd onto dest.
* @param arr The Array to iterate over.
* @param unary_func The function to call on each element (actually called with both value and index).
* @param dest Optional. If not provided, a new Array is created.
* @return dest
*/
//:NSFUNCTION Array transform(Array arr, Function unary_func, Array dest)
burst.Alg.transform = function(arr, unary_func, dest) {
  if (!dest) dest = new Array(arr.length);
  for(var i=0;i<arr.length;++i) {dest[i] = unary_func(arr[i], i);}
  return dest;
}

/**
* Initialize a map with keys being the results
* of calling unary_func on each element. The corresponding map values are
* the element values used to produce those keys.
* @param arr The Array to iterate over, which also has the eventual map values.
* @param unary_func The function to call on each element to produce a key.
* @param map Optional. If not specified a new Object is created.
* @return map.
*/
//:NSFUNCTION Object toMap(Array arr, Function unary_func, Object map)
burst.Alg.toMap = function(arr, keyfunc, map) {
  if (!map) map = {};
  if (!unary_func) unary_func = burst.Alg.identity;
  burst.Alg.for_each(arr, function(o) {map[unary_func(o)] = o;})
  return map;
}

// a convenience unary Function that returns its argument.
burst.Alg.identity = function identity(o) {return o;}

/**
* Initialize a map with keys taken from arr, and the value true.
* @param arr The Array of keys to iterate over.
* @param map Optional. If not specified a new Object is created.
* @return map.
*/
//:NSFUNCTION Object toSet(Array arr, Object map)
burst.Alg.toSet = function(arr, map) {
  if (!map) map = {};
  burst.Alg.for_each(arr, function(o) {map[o] = true;})
  return map;
}

/**
* Copy arr into dest. The same indexes are used (versus doing a push).
* @param arr The Array to copy.
* @param dest Optional. The destination Array. If not specified, one is created.
* @return dest
*/
//:NSFUNCTION Array copy(Array arr, Array dest)
burst.Alg.copy = function(arr, dest) {
  if (!dest) dest = new Array(arr.length);
  for(var i=0;i<arr.length;++i) {dest[i] = arr[i];}
  return dest;
}

//:NSEND


bu_loaded('burst.Alg');
