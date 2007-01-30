dojo.provide("dojo.query");
dojo.require("dojo.experimental");
dojo.require("dojo.debug.console");
dojo.experimental("dojo.query");
(function(){
	var h = dojo.render.html;
	var d = dojo;

	var _getIndexes = function(q){
		return [ q.indexOf("#"), q.indexOf("."), q.indexOf("["), q.indexOf(":") ];
	}

	var getId = function(query){
		var i = _getIndexes(query);
		if(i[0] != -1){
			return query.substring(i[0]+1, getIdEnd(query));
		}else{
			return "";
		}
	}

	var getIdEnd = function(query){
		return _lowestFromIndex(query, 1);
	}

	////////////////////////////////////////////////////////////////////////
	// XPath query code
	////////////////////////////////////////////////////////////////////////

	var buildPath = function(query){
		var xpath = "";
		var qparts = query.split(" ");
		while(qparts.length){
			var tqp = qparts.shift();
			var prefix;
			if(tqp == ">"){
				prefix = "/";
				tqp = qparts.shift();
			}else{
				prefix = "//";
			}
			// get the tag name (if any)
			var tagName = getTagName(tqp);

			xpath += prefix + tagName;
			
			// check to see if it's got an id. Needs to come first in xpath.
			var id = getId(tqp);
			if(id.length){
				xpath += "[@id='"+id+"']";
			}

			var cn = getClassName(tqp);
			// check the class name component
			if(cn.length){
				var padding = " ";
				if(cn.charAt(cn.length-1) == "*"){
					padding = ""; cn = cn.substr(0, cn.length-1);
				}
				xpath += 
					"[contains(concat(' ',@class,' '), ' "+
					cn + padding + "')]";
			}

			// FIXME: need to implement attribute and pseudo-class checks!!

		};
		return xpath;
	};
	/*
	*/

	var _xpathFuncCache = {};
	var getXPathFunc = function(path){
		if(_xpathFuncCache[path]){
			return _xpathFuncCache[path];
		}

		var doc = dojo.doc();
		var parent = dojo.body(); // FIXME
		// FIXME: don't need to memoize. The closure scope handles it for us.
		var xpath = buildPath(path);

		var tf = function(){
			// XPath query strings are memoized.
			var ret = [];
			var xpathResult = doc.evaluate(xpath, parent, null, 
											// XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null);
											XPathResult.ANY_TYPE, null);
			var result = xpathResult.iterateNext();
			while(result){
				ret.push(result);
				result = xpathResult.iterateNext();
			}
			return ret;
		}
		return _xpathFuncCache[path] = tf;
	};

	/*
	d.xPathMatch = function(query){
		// XPath based DOM query system. Handles a small subset of CSS
		// selectors, subset is identical to the non-XPath version of this
		// function. 

		// FIXME: need to add support for alternate roots
		return getXPathFunc(query)();
	}
	*/

	////////////////////////////////////////////////////////////////////////
	// DOM query code
	////////////////////////////////////////////////////////////////////////

	var _filtersCache = {};
	var _simpleFiltersCache = {};

	var agree = function(first, second){
		if(first && second){
			return function(){
				return first.apply(window, arguments) && second.apply(window, arguments);
			}
		}else if(first){
			return first;
		}else{
			return second;
		}
	}

	var _filterDown = function(element, queryParts, matchArr, idx){
		var nidx = idx+1;
		var isFinal = (queryParts.length == nidx);
		var tqp = queryParts[idx];
		// dojo.debug(tqp);
		// var tqparts = queryParts.slice(1);
		// see if we can constrain our next level to direct children
		if(tqp == ">"){
			var ecn = element.childNodes;
			if(!ecn.length){
				return;
			}
			nidx++;
			// kinda janky, too much array alloc
			var isFinal = (queryParts.length == nidx);

			var tf = getFilterFunc(queryParts[idx+1]);
			for(var x=ecn.length-1, te; x>=0, te=ecn[x]; x--){
				if(tf(te)){
					if(isFinal){
						matchArr.push(te);
					}else{
						_filterDown(te, queryParts, matchArr, nidx);
					}
				}
				if(x==0){
					break;
				}
			}
		}

		// otherwise, keep going down, unless we'er at the end
		var candidates = getElements(tqp, element);
		if(isFinal){
			while(candidates.length){
				matchArr.push(candidates.shift());
			}
		}else{
			// if we're not yet at the bottom, keep going!
			while(candidates.length){
				_filterDown(candidates.shift(), queryParts, matchArr, nidx);
			}
		}
	}

	var filterDown = function(elements, queryParts, matchArr){
		var ret = matchArr||[];

		// for every root, get the elements that match the descendant selector
		for(var x=elements.length-1, te; x>=0, te=elements[x]; x--){
			_filterDown(te, queryParts, ret, 0);
		}
		return ret;
	}

	var _lowestFromIndex = function(query, index){
		// spammy and verbose, but fast
		var ql = query.length;
		var i = _getIndexes(query);
		var end = ql;
		for(var x=index; x<i.length; x++){
			if(i[x] >= 0){
				if(i[x] < end){
					end = i[x];
				}
			}
		}
		return (end < 0) ? ql : end;
	}

	var getTagNameEnd = function(query){
		var i = _getIndexes(query);
		if((i[0] == 0)||(i[1] == 0)){
			// hash or dot at the front, no tagname
			return 0;
		}else{
			return _lowestFromIndex(query, 0);
		}
	}


	var getTagName = function(query){
		var tagNameEnd = getTagNameEnd(query);
		// FIXME: should this be ">=" to account for tags like <a> ?
		return ((tagNameEnd > 0) ? query.substr(0, tagNameEnd).toLowerCase() : "*");
	}

	var getFilterFunc = function(query){
		// note: query can't have spaces!
		if(_filtersCache[query]){
			return _filtersCache[query];
		}
		var ff = null;
		var tagName = getTagName(query);

		// does it have a tagName component?
		if(tagName != "*"){
			// tag name match
			ff = agree(ff, 
				function(elem){
					var isTn = (
						(elem.nodeType == 1) &&
						(tagName == elem.tagName.toLowerCase())
					);
					return isTn;
				}
			);
		}

		var idComponent = getId(query);

		// does the node have an ID?
		if(idComponent.length){
			ff = agree(ff, 
				function(elem){
					return (
						(elem.nodeType == 1) &&
						(elem.id == idComponent)
					);
				}
			);
		}

		if(	Math.max.apply(this, _getIndexes(query).slice(1)) >= 0){
			// if we have other query param parts, make sure we add them to the
			// filter chain
			ff = agree(ff, getSimpleFilterFunc(query));
		}

		return _filtersCache[query] = ff;
	}

	var smallest = function(arr){
		var ret = -1;
		for(var x=0; x<arr.length; x++){
			var ta = arr[x];
			if(ta >= 0){
				if((ta > ret)||(ret == -1)){
					ret = ta;
				}
			}
		}
		return ret;
	}

	var getClassName = function(query){
		// [ "#", ".", "[", ":" ];
		var i = _getIndexes(query);
		if(-1 == i[1]){ return ""; } // no class component
		var di = i[1]+1;

		var othersStart = smallest(i.slice(2));
		if(di < othersStart){
			return query.substring(di, othersStart);
		}else if(-1 == othersStart){
			return query.substr(di);
		}else{
			return "";
		}
	}

	var getNodeIndex = function(node){
		// NOTE: we could have a more accurate caching mechanism by
		// invalidating caches after the query has finished, but I think that'd
		// lead to significantly more cache churn than the cache would provide
		// value for in the common case. Generally, we're more conservative
		// (and therefore, more accurate) than jQuery and DomQuery WRT node
		// node indexes, but there may be corner cases in which we fall down.
		// How much we care about them is TBD.

		var pn = node.parentNode;
		var pnc = pn.childNodes;

		// check to see if we can trust the cache. If not, re-key the whole
		// thing and return our node match from that.

		var nidx = -1;
		var child = pn.firstChild;
		if(!child){
			return nidx;
		}

		var ci = node["__cachedIndex"];
		var cl = pn["__cachedLength"];

		// only handle cache building if we've gone out of sync
		if(((typeof cl == "number")&&(cl != pnc.length))||(typeof ci != "number")){
			// rip though the whole set, building cache indexes as we go
			pn["__cachedLength"] = pnc.length;
			var idx = 1;
			do{
				// we only assign indexes for nodes with nodeType == 1, as per:
				//		http://www.w3.org/TR/css3-selectors/#nth-child-pseudo
				// only elements are counted in the search order, and they
				// begin at 1 for the first child's index

				if(child === node){
					nidx = idx;
				}
				if(child.nodeType == 1){
					child["__cachedIndex"] = idx;
					idx++;
				}
				child = child.nextSibling;
			}while(child);
		}else{
			// FIXME: could be incorrect in some cases (node swaps involving
			// the passed node, etc.), but we ignore those for now.
			nidx = ci;
		}
		return nidx;
	}

	var firedCount = 0;

	var getSimpleFilterFunc = function(query){
		// FIXME: this function currently doesn't support chaining of the same
		// sub-selector. E.g., we can't yet search on 
		//		span.thinger.thud 
		// or
		//		div:nth-child(even):last-child

		var fcHit = (_simpleFiltersCache[query]||_filtersCache[query]);
		if(fcHit){ return fcHit; }

		var ff = null;

		// [ q.indexOf("#"), q.indexOf("."), q.indexOf("["), q.indexOf(":") ];
		var i = _getIndexes(query);

		// the only case where we'll need the tag name is if we came from an ID query
		if(i[0] >= 0){
			var tn = getTagName(query);
			if(tn != "*"){
				ff = agree(ff, function(elem){
					return (elem.tagName.toLowerCase() == tn);
				});
			}
		}

		// if there's a class in our query, generate a match function for it
		var className = getClassName(query);
		if(className.length){
			// get the class name
			var isWildcard = className.charAt(className.length-1) == "*";
			if(isWildcard){
				className = className.substr(0, className.length-1);
			}
			var cnl = className.length;
			var spc = " ";
			// I dislike the regex thing, even if memozied in a cache, but it's VERY short
			var re = new RegExp("(?:^|\\s)" + className + (isWildcard ? ".*" : "") + "(?:\\s|$)");
			ff = agree(ff, function(elem){
				return re.test(elem.className);
			});
		}
		// [ "#", ".", "[", ":" ];
		if(i[2] >= 0){
			// FIXME: need to implement attribute searches!!
			var lBktIdx = query.lastIndexOf("]");
			ff = agree(ff, 
				function(elem){
					return true;
				}
			);
		}
		if(i[3]>= 0){
			// NOTE: we count on the pseudo name being at the end
			var pseudoName = query.substr(i[3]+1);
			var condition = "";
			var obi = pseudoName.indexOf("(");
			var cbi = pseudoName.lastIndexOf(")");
			if(	(0 <= obi)&&
				(0 <= cbi)&&
				(cbi > obi)){
				condition = pseudoName.substring(obi+1, cbi);
				pseudoName = pseudoName.substr(0, obi);
			}

			// NOTE: NOT extensible on purpose until I figure out
			// the portable xpath pseudos extensibility plan.

			// http://www.w3.org/TR/css3-selectors/#structural-pseudos
			if(pseudoName == "first-child"){
				ff = agree(ff, 
					function(elem){
						// check to see if any of the previous siblings are elements
						var fc = elem.previousSibling;
						while(fc && (fc.nodeType != 1)){
							fc = fc.previousSibling;
						}
						return (!fc);
					}
				);
			}else if(pseudoName == "last-child"){
				ff = agree(ff, 
					function(elem){
						// check to see if any of the next siblings are elements
						var nc = elem.nextSibling;
						while(nc && (nc.nodeType != 1)){
							nc = nc.nextSibling;
						}
						return (!nc);
					}
				);
			}else if(pseudoName == "empty"){
				ff = agree(ff, 
					function(elem){
						// DomQuery and jQuery get this wrong, oddly enough.
						// The CSS 3 selectors spec is pretty explicit about
						// it, too.
						var cn = elem.childNodes;
						var cnl = elem.childNodes.length;
						// if(!cnl){ return true; }
						for(var x=cnl-1; x >= 0; x--){
							var nt = cn[x].nodeType;
							if((nt == 1)||(nt == 3)){ return false; }
						}
						return true;
					}
				);
			}else if(pseudoName == "contains"){
				ff = agree(ff, 
					function(elem){
						// FIXME: I dislike this version of "contains", as
						// whimsical attribute could set it off. An inner-text
						// based version might be more accurate, but since
						// jQuery and DomQuery also potentially get this wrong,
						// I'm leaving it for now.
						return (elem.innerHTML.indexOf(condition) >= 0);
					}
				);
			}else if(pseudoName == "not"){
				var ntf = getFilterFunc(condition);
				ff = agree(ff, 
					function(elem){
						return (!ntf(elem));
					}
				);
			}else if(pseudoName == "nth-child"){
				if(condition == "odd"){
					ff = agree(ff, 
						function(elem){
							return (
								((getNodeIndex(elem)) % 2) == 1
							);
						}
					);
				}else if((condition == "2n")||
					(condition == "even")){
					ff = agree(ff, 
						function(elem){
							return ((getNodeIndex(elem) % 2) == 0);
						}
					);
				}else if(condition.indexOf("n") == -1){
					var ncount = parseInt(condition);
					ff = agree(ff, 
						function(elem){
							// removeChaffNodes(elem.parentNode);
							return (elem.parentNode.childNodes[ncount-1] === elem);
						}
					);
				}
			}
		}
		if(!ff){
			ff = function(){ return true; };
		}
		return _simpleFiltersCache[query] = ff;
	}

	var isTagOnly = function(query){
		return (Math.max.apply(this, _getIndexes(query)) == -1);
	}

	var _getElementsFuncCache = {};

	var getElementsFunc = function(query, root){
		var fHit = _getElementsFuncCache[query];
		if(fHit){ return fHit; }
		// NOTE: this function is in the fast path! not memoized!!!
		var retFunc = null;

		// the query doesn't contain any spaces, so there's only so many
		// things it could be
		// [ q.indexOf("#"), q.indexOf("."), q.indexOf("["), q.indexOf(":") ];
		var i = _getIndexes(query);
		var id = getId(query);
		if(i[0] == 0){
			// ID query. Easy.
			return _getElementsFuncCache[query] = function(root){
				return [ d.byId(id) ];
			}
		}

		var filterFunc = getSimpleFilterFunc(query);

		if(i[0] >= 0){
			// we got a filtered ID search (e.g., "h4#thinger")
			retFunc = function(root){
				var te = d.byId(id);
				if(filterFunc(te)){
					return [ te ];
				}
			}
		}else{
			var ret = [];
			var tret;
			var tn = getTagName(query);

			if(-1 != i[3]){
				var pseudoName = (0 <= i[3]) ? query.substr(i[3]+1) : "";
				switch(pseudoName){
					case "first":
						retFunc = function(root){
							var tret = root.getElementsByTagName(tn);
							for(var x=0, te; te = tret[x]; x++){
								if(filterFunc(te)){
									return [ te ];
								}
							}
							return [];
						}
						break;
					case "last":
						retFunc = function(root){
							var tret = root.getElementsByTagName(tn);
							for(var x=tret.length-1, te; te = tret[x]; x--){
								if(filterFunc(te)){
									return [ te ];
								}
							}
							return [];
						}
						break;
					default:
						retFunc = function(root){
							var tret = root.getElementsByTagName(tn);
							var ret = [];
							for(var x=0, te; te = tret[x]; x++){
								if(filterFunc(te)){
									ret[ret.length] = te;
									// ret.push(te);
								}
							}
							return ret;
						}
						break;
				}
			}else if(isTagOnly(query)){
				// it's just a plain-ol elements-by-tag-name query from the root
				retFunc = function(root){
					var ret = [];
					var tret = root.getElementsByTagName(tn);
					for(var x=0, te; te = tret[x]; x++){
						ret.push(te);
					}
					return ret;
				}
			}else{
				retFunc = function(root){
					var tret = root.getElementsByTagName(tn);
					var ret = [];
					for(var x=0, te; te = tret[x]; x++){
						if(filterFunc(te)){
							ret.push(te);
						}
					}
					return ret;
				}
			}
		}
		return _getElementsFuncCache[query] = retFunc;
	}

	var getElements = function(query, root){
		if(!root){ root = document; }
		return getElementsFunc(query)(root);
	}

	var _partsCache = {};

	////////////////////////////////////////////////////////////////////////
	// the query runner
	////////////////////////////////////////////////////////////////////////

	var _queryFuncCache = {};
	var getStepQueryFunc = function(query){
		if(_queryFuncCache[query]){ return _queryFuncCache[query]; }

		if(0 > query.indexOf(" ")){
			_queryFuncCache[query] = function(root){
				return getElements(query, root);
			}
			return _queryFuncCache[query];
		}


		var sqf = function(root){
			var qparts = query.split(" ");

			// FIXME: need to make root popping more explicit and cache it somehow

			// see if we can't pop a root off the front
			var partIndex = 0;
			var lastRoot;
			while((partIndex < qparts.length)&&(0 <= qparts[partIndex].indexOf("#"))){
				// FIXME: should we try to cache such that the step function
				// only ever looks for the last ID-based query part, thereby
				// avoiding re-runs and potential array alloc?

				// dojo.debug(qparts[partIndex]);
				lastRoot = root;
				root = getElements(qparts[partIndex])[0];
				if(!root){ root = lastRoot; break; }
				partIndex++;
			}
			if(qparts.length == partIndex){
				return [ root ];
			}
			root = root || document;
			// FIXME: need to handle tight-loop "div div div" style queries
			// here so as to avoid huge amounts of array alloc in repeated
			// getElements calls by filterDown
			var candidates;

			// FIXME: this isn't very generic. It lets us run like a bat outta
			// hell on queries like:
			//		div div span
			// and:
			//		#thinger span#blah div span span
			// but we might still fall apart on searches like:
			//		foo.bar span[blah="thonk"] div div span code.example
			// in short, we need to move the look-ahead logic into _filterDown()
			if(isTagOnly(qparts[partIndex]) && (qparts[partIndex+1] != ">")){
				// go as far as we can down the chain without any intermediate
				// array allocation
				qparts = qparts.slice(partIndex);
				var searchParts = [];
				var idx = 0;
				while(qparts[idx] && isTagOnly(qparts[idx]) && (qparts[idx+1] != ">" )){
					searchParts.push(qparts[idx]);
					idx++;
				}
				var curLevelItems = [ root ];
				var nextLevelItems = [];
				for(var x=0; x<searchParts.length; x++){
					var tsp = qparts.shift();
					for(var y=0; y<curLevelItems.length; y++){
						var tcol = curLevelItems[y].getElementsByTagName(tsp);
						for(var z=0; z<tcol.length; z++){
							nextLevelItems.push(tcol[z]);
						}
					}
					curLevelItems = nextLevelItems;
					nextLevelItems = [];
				}
				candidates = curLevelItems;
				if(!qparts.length){
					return candidates;
				}
			}else{
				candidates = getElements(qparts.shift(), root);
			}
			return filterDown(candidates, qparts);
		}
		_queryFuncCache[query] = sqf;
		return sqf;
	}

	var _getQueryFunc = (
		// NOTE: 
		//		XPath on the Webkit nighlies is slower than it's DOM iteration
		//		for most test cases
		// FIXME: 
		//		we should try to capture some runtime speed data for each query
		//		function to determine on the fly if we should stick w/ the
		//		potentially optimized variant or if we should try something
		//		new.
		(document["evaluate"] && !dojo.render.html.safari) ? 
		function(query){
			if(_queryFuncCache[query]){ return _queryFuncCache[query]; }
			// FIXME: xpath support temporarialy disabled to debug DOM code path
			// has xpath support
			var qparts = query.split(" ");
			if(	(document["evaluate"])&&
				(query.indexOf(":") == -1) ){
				// kind of a lame heuristic, but it works
				var gtIdx = query.indexOf(">")
				if(	
					// a "div div div" style query
					((qparts.length > 2)&&(query.indexOf(">") == -1))||
					// or something else with moderate complexity. kinda janky
					(qparts.length > 3)||
					// or if it's a ".thinger" query
					((0 > query.indexOf(" "))&&(0 == query.indexOf(".")))

				){
					// use get and cache a xpath runner for this selector
					return _queryFuncCache[query] = getXPathFunc(query);
				}
			}

			// getStepQueryFunc has caching built in
			return getStepQueryFunc(query);
		} : getStepQueryFunc
	);

	var getQueryFunc = function(query){
		if(_queryFuncCache[query]){ return _queryFuncCache[query]; }
		if(0 > query.indexOf(",")){
			return _queryFuncCache[query] = _getQueryFunc(query);
		}else{
			var parts = query.split(", ");
			var tf = function(root){
				var pindex = 0; // avoid array alloc for every invocation
				var ret = [];
				var tp;
				while(tp = parts[pindex++]){
					ret = ret.concat(_getQueryFunc(tp, tp.indexOf(" "))(root));
				}
				return ret;
			}
			return _queryFuncCache[query] = tf;
		}
	}

	var _zipIdx = 0;
	var _zip = function(arr){
		if(!arr){ return []; }
		var al = arr.length;
		if(al < 2){ return arr; }
		_zipIdx++;
		var ret = [arr[0]];
		arr[0]["_zipIdx"] = _zipIdx;
		for(var x=1; x<arr.length; x++){
			if(arr[x]["_zipIdx"] != _zipIdx){ 
				ret.push(arr[x]);
			}
			arr[x]["_zipIdx"] = _zipIdx;
		}
		// FIXME: should we consider stripping these properties?
		return ret;
	}

	d.query = function(query, root){
		// return is always an array
		// NOTE: elementsById is not currently supported
		// NOTE: ignores xpath-ish queries for now

		// FIXME: need to do a fast-path to avoid attribute searches for
		// queries of the form:
		//		"div span span"
		// FIXME: should support more methods on the return than the stock array.

		return _zip(getQueryFunc(query)(root));
	}
})();
