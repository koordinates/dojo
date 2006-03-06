var center = dojo.math.points.midpoint(start, end);
var sides = dojo.math.points.translate(dojo.math.points.invert(center), start);
var rad = Math.sqrt(Math.pow(sides[0], 2) + Math.pow(sides[1], 2));
var theta = dojo.math.radToDeg(Math.atan(sides[1]/sides[0]));
if( sides[0] < 0 ) {
	theta -= 90;
} else {
	theta += 90;
}
dojo.math.curves.CenteredArc.call(this, center, rad, theta, theta+(ccw?-180:180));