dojo.provide("dojo.collections.Collections");

dojo.collections = {Collections:true};
dojo.collections.DictionaryEntry = function(k,v){
	this.key = k;
	this.value = v;
	this.valueOf = function(){ return this.value; };
	this.toString = function(){ return this.value; };
}

dojo.collections.Iterator = function(a){
	var obj = a;
	var position = 0;
	this.current = null;
	this.atEnd = false;
	this.moveNext = function(){
		if(this.atEnd){
			return !this.atEnd;
		}
		this.current = obj[position];
		if(++position == obj.length){
			this.atEnd = true;
		}
		return !this.atEnd;
	}
	this.reset = function(){
		position = 0;
		this.atEnd = false;
	}
}

dojo.collections.DictionaryIterator = function(obj){
	var arr = [] ;	//	Create an indexing array
	for (var p in obj) arr.push(obj[p]) ;	//	fill it up
	var position = 0 ;
	this.current = null ;
	this.entry = null ;
	this.key = null ;
	this.value = null ;
	this.atEnd = false ;
	this.moveNext = function() { 
		if (this.atEnd) {
			return !this.atEnd ;
		}
		this.entry = this.current = arr[position] ;
		if (this.entry) {
			this.key = this.entry.key ;
			this.value = this.entry.value ;
		}
		if (++position == arr.length) {
			this.atEnd = true ;
		}
		return !this.atEnd ;
	} ;
	this.reset = function() { 
		position = 0 ; 
		this.atEnd = false ;
	} ;
};
