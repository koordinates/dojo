dojo.provide("dojo.html.metrics");

/*	dojo.html.metrics
 *	Methods to help determine font metrics, including things like
 *	how much of a string will fit inside a certain width, what size
 *	something might be if you were to place it in a certain node, etc.
 *
 *	Based partially on a submitted patch by Morris Johns, and work
 *	done with 13th Parallel and f( m ) (the 13th columns and the
 *	unreleased f( m ) layout manager.
 */

//	derived from Morris John's scrollbar measurer.
dojo.html.getScrollbar=function(){
	//	summary
	//	returns the width of a scrollbar.
	
	//	set up the test nodes.
	var scroll = document.createElement("div");
	scroll.style.width="100px";
	scroll.style.height="100px";
	scroll.style.overflow="scroll";
	scroll.style.position="absolute";
	scroll.style.top="-300px";
	scroll.style.left="0px"
	
	var test = document.createElement("div");
	test.style.width="400px";
	test.style.height="400px";
	scroll.appendChild(test);
	dojo.body().appendChild(scroll);

	var width=scroll.offsetWidth - scroll.clientWidth;

	dojo.body().removeChild(scroll);
	scroll.removeChild(test);
	scroll=test=null;

	//	we return an object because we may add additional info in the future.
	return { width: width };	//	object
};

//	derived from Morris John's emResized measurer
dojo.html.getFontMeasurements = function(){
	//	summary
	//	Returns an object that has pixel equivilents of standard font size values.
	var heights = {
		'1em':0, '100%':0, '12pt':0, '16px':0, 'xx-small':0, 'x-small':0,
		'small':0, 'medium':0, 'large':0, 'x-large':0, 'xx-large':0
	};

	if(dojo.render.html.ie){
		//	we do a font-size fix if and only if one isn't applied already.
		//	NOTE: If someone set the fontSize on the HTML Element, this will kill it.
		document.documentElement.style.fontSize="100%";
	}

	//	set up the measuring node.
	var div=document.createElement("div");
	div.style.position="absolute";
	div.style.left="-100px";
	div.style.top="0";
	div.style.width="30px";
	div.style.height="1000em";
	div.style.border="0";
	div.style.margin="0";
	div.style.padding="0";
	div.style.outline="0";
	div.style.lineHeight="1";
	div.style.overflow="hidden";
	dojo.body().appendChild(div);

	//	do the measurements.
	for(var p in heights){
		div.style.fontSize = p;
		heights[p] = Math.round(div.offsetHeight * 12/16) * 16/12 / 1000;
	}
	
	dojo.body().removeChild(div);
	div = null;
	return heights; 	//	object
};


