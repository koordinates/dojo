dojo.provide("dojo.profile");
dojo.profile = new function(){
	// summary
	//	Utility class to profile (time) your code.
	// description
	//	Call:
	//		dojo.profile.start("someName");
	//		...
	//		dojo.profile.end("someName");
	//	to time an operation.  
	//
	//	Records the number of iterations "somename" was
	//	profiled as well as the total time.
	//
	//	Use dojo.profile.dump() to write profiling info for all items, 
	//	or dojo.profile.debugItem("name") to write info for one particular name.

	var profiles = {};
	var pns = [];

	this.start = function(/*string*/ name){
		// summary
		//	Start profiling under a particular name.

		var profile = profiles[name];
		if (profile == null) {
			profile = this.clearItem(name);
			pns.push(name);
		} else {
			if (profile.start) {
				this.end(name);
			}
		}
		profile.end = null;
		profile.start = new Date();
	}

	this.end = function(/*string*/ name, /*boolean?*/ debug, /*boolean?*/clear){
		// summary
		//	Finish profiling under a particular name.
		//	name: name you started profiling on
		//	debug: if true, outputs info to debug log about the profile
		//	clear: if true, clears this item for clean run next time

		var profile = profiles[name];
		
		if (profile && profile.start) {
			profile.end = new Date();
			profile.total += (profile.end - profile.start);
			profile.start = null;
			profile.iters++;

			if (debug) {
				this.debugItem(name);
			}
			if (clear) {
				this.clearItem(name);
			}
		} else {
			// oops! bad call to end(), what should we do here?
			return true;
		}
	}
	this.stop = this.end;

	this.getItemTotal = function(name) {
		// summary
		//	return the total time taken for one particular entry
		if (profiles[name]) return profiles[name].total;	/* Number in milliseconds */
		return null;
	}

	this.clearItem = function(name) {
		// summary:	clear the profile times for a particular entry
		return (profiles[name] = {iters: 0, total: 0});
	}
	
	this.debugItem = function(name) {
		// summary:	write profile information for a particular entry to the debug console
		var profile = profiles[name];
		if (profile == null) return null;
		
		if (profile.iters == 0) {
			return [name, " not profiled."].join("");
		}
		var output = [name, " took ", profile.total, " msec for ", profile.iters, " iteration"];
		if (profile.iters > 1) {
			output.push("s (", (Math.round(profile.total/profile.iters*100)/100), " msec each)");
		}

		// summary: print profile information for a single item out to the debug log
		dojo.debug(output.join(""));
	}
	


	this.dump = function(/*boolean?*/appendToDoc){
		// summary: create an HTML table with profile information for all entries
		// appendToDoc: if true, writes output into the document body in element id="profileOutputTable"
		var tbl = document.createElement("table");
		with(tbl.style){
			border = "1px solid black";
			borderCollapse = "collapse";
		}
		var hdr = tbl.createTHead();
		var hdrtr = hdr.insertRow(0);
		// document.createElement("tr");
		var cols = ["Identifier","Calls","Total","Avg"];
		for(var x=0; x<cols.length; x++){
			var ntd = hdrtr.insertCell(x);
			with(ntd.style){
				backgroundColor = "#225d94";
				color = "white";
				borderBottom = "1px solid black";
				borderRight = "1px solid black";
				fontFamily = "tahoma";
				fontWeight = "bolder";
				paddingLeft = paddingRight = "5px";
			}
			ntd.appendChild(document.createTextNode(cols[x]));
		}

		for(var x=0; x < pns.length; x++){
			var prf = profiles[pns[x]];
			this.end(pns[x]);
			if(prf.iters>0){
				var bdytr = tbl.insertRow(true);
				var vals = [pns[x], prf.iters, prf.total, parseInt(prf.total/prf.iters)];
				for(var y=0; y<vals.length; y++){
					var cc = bdytr.insertCell(y);
					cc.appendChild(document.createTextNode(vals[y]));
					with(cc.style){
						borderBottom = "1px solid gray";
						paddingLeft = paddingRight = "5px";
						if(x%2){
							backgroundColor = "#e1f1ff";
						}
						if(y>0){
							textAlign = "right";
							borderRight = "1px solid gray";
						}else{
							borderRight = "1px solid black";
						}
					}
				}
			}
		}

		if(appendToDoc){
			var ne = document.createElement("div");
			ne.id = "profileOutputTable";
			with(ne.style){
				fontFamily = "Courier New, monospace";
				fontSize = "12px";
				lineHeight = "16px";
				borderTop = "1px solid black";
				padding = "10px";
			}
			if(document.getElementById("profileOutputTable")){
				dojo.body().replaceChild(ne, document.getElementById("profileOutputTable"));
			}else{
				dojo.body().appendChild(ne);
			}
			ne.appendChild(tbl);
		}

		return tbl;
	}
}