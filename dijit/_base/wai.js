dojo.provide("dijit._base.wai");

// NOTE: Detect HTML 

dijit.wai = {
	onload: function(){
		// summary:
		//		Detects if we are in high-contrast mode or not

		// This must be a named function and not an anonymous
		// function, so that the widget parsing code can make sure it
		// registers its onload function after this function.
		// DO NOT USE "this" within this function.

		// create div for testing if high contrast mode is on or images are turned off
		var div = dojo.create("div",{
			id: "a11yTestNode",
			style:{
				cssText:'border: 1px solid;' +
					'border-color:red green;' +
					'position: absolute;' +
					'height: 5px;' +
					'top: -999px;' +
					'background-image: url("' + (dojo.config.blankGif || dojo.moduleUrl("dojo", "resources/blank.gif")) + '");'
			}
		}, dojo.body());

		// test it
		var cs = dojo.getComputedStyle(div);
		if(cs){
			var bkImg = cs.backgroundImage;
			var needsA11y = cs.borderTopColor==cs.borderRightColor || bkImg == "none" || bkImg == "url(invalid-url:)";
			dojo[needsA11y ? "addClass" : "removeClass"](dojo.body(), "dijit_a11y");
			if(typeof div.outerHTML == 'string'){
				div.outerHTML = "";		// prevent mixed-content warning, see http://support.microsoft.com/kb/925014
			}else{
				dojo.body().removeChild(div);
			}
		}
	}
};

// Test if computer is in high contrast mode.
// Make sure the a11y test runs first, before widgets are instantiated.
//if(dojo.isIE || dojo.isMoz){	// NOTE: checking in Safari messes things up
	dojo._loaders.unshift(dijit.wai.onload);
//}

dojo.mixin(dijit,
{
	_XhtmlRoles: /(banner|contentinfo|definition|main|navigation|search|note|secondary|seealso)/,

	hasWaiRole: function(/*Element*/ elem, /*String*/ role){
		// summary:
		//		Determines if an element has a particular non-XHTML role.
		// returns:
		//		True if elem has the specific non-XHTML role attribute and false if not.
		// 		For backwards compatibility if role parameter not provided, 
		// 		returns true if has non XHTML role 

		var waiRole = this.getWaiRole(elem);
		return role ? (waiRole.indexOf(role) > -1) : (waiRole.length > 0);
	},

	getWaiRole: function(/*Element*/ elem){
		// summary:
		//		Gets the non-XHTML role for an element (which should be a wai role).
		// returns:
		//		The non-XHTML role of elem or an empty string if elem
		//		does not have a role.
		return dojo.trim((elem.getAttribute("role") || "").replace(this._XhtmlRoles,"").replace("wairole:",""));
	},

	setWaiRole: function(/*Element*/ elem, /*String*/ role){
		// summary:
		//		Sets the role on an element.
		// description:
		//		In other than FF2 replace existing role attribute with new role.
		//		FF3 supports XHTML and ARIA roles so    
		//		if elem already has an XHTML role, append this role to XHTML role 
		//		and remove other ARIA roles.
		//		On Firefox 2 and below, "wairole:" is
		//		prepended to the provided role value.

		// NOTE: Collision here (need detection for ARIA support)

		var curRole = elem.getAttribute("role") || "";

		if(!curRole && !this._XhtmlRoles.test(curRole)){
			elem.setAttribute("role", "wairole:" + role);
		}

		if((" "+ curRole +" ").indexOf(" " + role + " ") == -1){
			var clearXhtml = dojo.trim(curRole.replace(this._XhtmlRoles, ""));
			var cleanRole = dojo.trim(curRole.replace(clearXhtml, ""));
	        		elem.setAttribute("role", cleanRole + (cleanRole ? ' ' : '') + role);
		}
	},

	removeWaiRole: function(/*Element*/ elem, /*String*/ role){
		// summary:
		//		Removes the specified non-XHTML role from an element.
		// 		Removes role attribute if no specific role provided (for backwards compat.)

		var roleValue = elem.getAttribute("role"); 
		if(!roleValue){ return; }
		if(role){
			var searchRole = "wairole:" + role;
			var t = dojo.trim((" " + roleValue + " ").replace(" " + searchRole + " ", " "));
			t = dojo.trim((" " + t + " ").replace(" " + role + " ", " "));
			elem.setAttribute("role", t);
		}else{
			elem.removeAttribute("role");	
		}
	},

	hasWaiState: function(/*Element*/ elem, /*String*/ state){
		// summary:
		//		Determines if an element has a given state.
		// description:
		//		On Firefox 2 and below, we check for an attribute in namespace
		//		"http://www.w3.org/2005/07/aaa" with a name of the given state.
		//		On all other browsers, we check for an attribute
		//		called "aria-"+state.
		// returns:
		//		true if elem has a value for the given state and
		//		false if it does not.

		var val;

		if (dojo.isHostMethod(elem, 'hasAttributeNS')) {
			val = elem.hasAttributeNS("http://www.w3.org/2005/07/aaa", state);
		}
		return val || dojo.hasAttr(elem, "aria-" + state);
	},

	getWaiState: function(/*Element*/ elem, /*String*/ state){
		// summary:
		//		Gets the value of a state on an element.
		// description:
		//		On Firefox 2 and below, we check for an attribute in namespace
		//		"http://www.w3.org/2005/07/aaa" with a name of the given state.
		//		On all other browsers, we check for an attribute called
		//		"aria-"+state.
		// returns:
		//		The value of the requested state on elem
		//		or an empty string if elem has no value for state.

		var value;

		if (dojo.isHostMethod(elem, 'getAttributeNS')) {
			value = elem.getAttributeNS("http://www.w3.org/2005/07/aaa", state);
		}		
		return value || elem.getAttribute("aria-"+state) || "";
	},

	setWaiState: function(/*Element*/ elem, /*String*/ state, /*String*/ value){
		// summary:
		//		Sets a state on an element.
		// description:
		//		On Firefox 2 and below, we set an attribute in namespace
		//		"http://www.w3.org/2005/07/aaa" with a name of the given state.
		//		On all other browsers, we set an attribute called
		//		"aria-"+state.
		if (dojo.isHostMethod(elem, 'setAttributeNS')) {
			elem.setAttributeNS("http://www.w3.org/2005/07/aaa", "aaa:"+state, value);
		}
		elem.setAttribute("aria-"+state, value);
	},

	removeWaiState: function(/*Element*/ elem, /*String*/ state){
		// summary:
		//		Removes a state from an element.
		// description:
		//		On Firefox 2 and below, we remove the attribute in namespace
		//		"http://www.w3.org/2005/07/aaa" with a name of the given state.
		//		On all other browsers, we remove the attribute called
		//		"aria-"+state.
		if (dojo.isHostMethod(elem, 'removeAttributeNS')) {
			elem.removeAttributeNS("http://www.w3.org/2005/07/aaa", state);
		}
		elem.removeAttribute("aria-"+state);
	}
});

dojo.provided("dijit._base.wai");