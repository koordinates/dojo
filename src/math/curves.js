dojo.hostenv.startPackage("dojo.math.curves");

dojo.hostenv.loadModule("dojo.math");

/* Curves from Dan's 13th lib stuff. See: http://pupius.co.uk/js/Toolkit.Drawing.js */

dojo.math.curves = {
	//Creates a straight line object
	Line: function(start, end) {
		this.start = start;
		this.end = end;
		this.dimensions = start.length;

		//simple function to find point on an n-dimensional, straight line
		this.getValue = function(n) {
			var retVal = new Array(this.dimensions);
			for(var i=0;i<this.dimensions;i++)
				retVal[i] = ((this.end[i] - this.start[i]) * n) + this.start[i];
			return retVal;
		}

		return this;
	},


	//Takes an array of points, the first is the start point, the last is end point and the ones in
	//between are the Bezier control points.	REQUIRES THIRTEEN.MATH
	Bezier: function(pnts) {
		this.getValue = function(step) {
			var retVal = new Array(this.p[0].length);
			for(var k=0;j<this.p[0].length;k++) retVal[k]=0;
			for(var j=0;j<this.p[0].length;j++) {
				var C=0; var D=0;
				for(var i=0;i<this.p.length;i++) C += this.p[i][j] * this.p[this.p.length-1][0] * Toolkit.Math.bernstein(step,this.p.length,i);
				for(var l=0;l<this.p.length;l++) D += this.p[this.p.length-1][0] * Toolkit.Math.bernstein(step,this.p.length,l);
				retVal[j] = C/D;
			}
			return retVal;
		}
		this.p = pnts;
		return this;
	},


	//Catmull-Rom Spline - allows you to interpolate a smooth curve through a set of points in n-dimensional space
	CatmullRom : function(pnts,c) {
		this.getValue = function(step) {
			var percent = step * (this.p.length-1);
			var node = Math.floor(percent);
			var progress = percent - node;

			var i0 = node-1; if(i0 < 0) i0 = 0;
			var i = node;
			var i1 = node+1; if(i1 >= this.p.length) i1 = this.p.length-1;
			var i2 = node+2; if(i2 >= this.p.length) i2 = this.p.length-1;

			var u = progress;
			var u2 = progress*progress;
			var u3 = progress*progress*progress;

			var retVal = new Array(this.p[0].length);
			for(var k=0;k<this.p[0].length;k++) {
				var x1 = ( -this.c * this.p[i0][k] ) + ( (2 - this.c) * this.p[i][k] ) + ( (this.c-2) * this.p[i1][k] ) + ( this.c * this.p[i2][k] );
				var x2 = ( 2 * this.c * this.p[i0][k] ) + ( (this.c-3) * this.p[i][k] ) + ( (3 - 2 * this.c) * this.p[i1][k] ) + ( -this.c * this.p[i2][k] );
				var x3 = ( -this.c * this.p[i0][k] ) + ( this.c * this.p[i1][k] );
				var x4 = this.p[i][k];

				retVal[k] = x1*u3 + x2*u2 + x3*u + x4;
			}
			return retVal;

		}


		if(!c) this.c = 0.7;
		else this.c = c;
		this.p = pnts;

		return this;
	},


	//Creates a circle object, where start and end are points on the circle, and angle is
	//angle between them.	Function works out radius and centre of circle for you.
	//!!!!! Only works with 2D points !!!!!
	// FIXME: Dan says so :)
	Circle: function(start, end, angle) {
		this.start = start;
		this.end = end;
		this.angle = angle;

		//Use Cosine rule to find radius of the circle
		this.radius = Math.sqrt( (end[0]-start[0])*(end[0]-start[0]) + (end[1]-start[1])*(end[1]-start[1]) ) / (2 * Math.sin(Toolkit.Math.degToRad(angle)));

		//Use Sine rule to find centre of circle
		this.centre = [start[0] + this.radius*Math.sin(Toolkit.Math.degToRad(angle/2)), start[1] - this.radius*Math.cos(Toolkit.Math.degToRad(angle/2))];

		this.getValue = function(n) {
			var retVal = new Array(2);
			var theta = Toolkit.Math.degToRad(angle*n);

			//This bit basically translates the circle to (0,0), rotates the point and then translates it back
			retVal[0] = (this.start[0] - this.centre[0])*Math.cos(theta) - (this.start[1] - this.centre[1])*Math.sin(theta) + this.centre[0];
			retVal[1] = (this.start[0] - this.centre[0])*Math.sin(theta) + (this.start[1] - this.centre[1])*Math.cos(theta) + this.centre[1];

			return retVal;
		}
	}
};
