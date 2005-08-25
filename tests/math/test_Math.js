dojo.require("dojo.math.Math");

function test_math_degToRad(){
	jum.assertEquals("test", Math.PI, dojo.math.degToRad(180));
}

function test_math_radToDeg(){
	jum.assertEquals("test", 180, dojo.math.radToDeg(Math.PI));
}

function test_math_factorial(){
	jum.assertEquals("test", 6, dojo.math.factorial(3));
}

function test_math_permutations(){
	jum.assertEquals("test", 24, dojo.math.permutations(4, 3));
}

function test_math_combinations(){
	jum.assertEquals("test", 4, dojo.math.combinations(4, 3));
}
