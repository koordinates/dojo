dojo.hostenv.startPackage("dojo.math");

/* Math utils from Dan's 13th lib stuff. See: http://pupius.co.uk/js/Toolkit.Drawing.js */

dojo.math = {
	degToRad: function(x) { return (x*Math.PI) / 180; },
	radToDeg: function(x) { return (angle*180) / Math.PI; },

	factorial: function(n) {
		if(n<1) { return 0; }
		var retVal = 1;
		for(var i=1;i<=n;i++) retVal *= i;
		return retVal;
	},

	//The number of ways of obtaining an ordered subset of k elements from a set of n elements
	permutations: function(n,k) {
		if(n==0 || k==0) return 1;
		return (Toolkit.Math.factorial(n) / Toolkit.Math.factorial(n-k));
	},

	//The number of ways of picking n unordered outcomes from r possibilities
	combinations: function(n,r) {
		if(n==0 || r==0) return 1;
		return (Toolkit.Math.factorial(n) / (Toolkit.Math.factorial(n-r) * Toolkit.Math.factorial(r)));
	},

	bernstein: function (t,n,i) {
		return ( Toolkit.Math.combinations(n,i) * Math.pow(t,i) * Math.pow(1-t,n-i) );
	}
};
