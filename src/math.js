dojo.provide("dojo.math");

dojo.math.degToRad = function degToRad (x) { return (x*Math.PI) / 180; }
dojo.math.radToDeg = function radToDeg (x) { return (x*180) / Math.PI; }

dojo.math.factorial = function factorial (n) {
	if(n<1){ return 0; }
	var retVal = 1;
	for(var i=1;i<=n;i++){ retVal *= i; }
	return retVal;
}

//The number of ways of obtaining an ordered subset of k elements from a set of n elements
dojo.math.permutations = function permutations (n,k) {
	if(n==0 || k==0) return 1;
	return (dojo.math.factorial(n) / dojo.math.factorial(n-k));
}

//The number of ways of picking n unordered outcomes from r possibilities
dojo.math.combinations = function combinations (n,r) {
	if(n==0 || r==0) return 1;
	return (dojo.math.factorial(n) / (dojo.math.factorial(n-r) * dojo.math.factorial(r)));
}

dojo.math.bernstein = function bernstein (t,n,i) {
	return (dojo.math.combinations(n,i) * Math.pow(t,i) * Math.pow(1-t,n-i));
}
