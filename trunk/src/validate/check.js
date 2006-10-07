dojo.provide("dojo.validate.check");
dojo.require("dojo.validate.common");
dojo.require("dojo.lang.common");

/**
  Validates user input of an HTML form based on input profile.

	@param form  The form object to be validated.
	@param profile  The input profile that specifies how the form fields are to be validated.
	@return results  An object that contains several methods summarizing the results of the validation.
*/
dojo.validate.check = function(form, profile) {
	// Essentially private properties of results object
	var missing = [];
	var invalid = [];

	// results object summarizes the validation
	var results = {
		isSuccessful: function() {return ( !this.hasInvalid() && !this.hasMissing() );},
		hasMissing: function() {return ( missing.length > 0 );},
		getMissing: function() {return missing;},
		isMissing: function(elemname) {
			for (var i = 0; i < missing.length; i++) {
				if ( elemname == missing[i] ) { return true; }
			}
			return false;
		},
		hasInvalid: function() {return ( invalid.length > 0 );},
		getInvalid: function() {return invalid;},
		isInvalid: function(elemname) {
			for (var i = 0; i < invalid.length; i++) {
				if ( elemname == invalid[i] ) { return true; }
			}
			return false;
		}
	};

	// Filters are applied before fields are validated.
	// Trim removes white space at the front and end of the fields.
	if ( profile.trim instanceof Array ) {
		for (var i = 0; i < profile.trim.length; i++) {
			var elem = form[profile.trim[i]];
			if ( elem.type != "text" && elem.type != "textarea" && elem.type != "password" ) { continue; }
			elem.value = elem.value.replace(/(^\s*|\s*$)/g, "");
		}
	}
	// Convert to uppercase
	if ( profile.uppercase instanceof Array ) {
		for (var i = 0; i < profile.uppercase.length; i++) {
			var elem = form[profile.uppercase[i]];
			if ( elem.type != "text" && elem.type != "textarea" && elem.type != "password" ) { continue; }
			elem.value = elem.value.toUpperCase();
		}
	}
	// Convert to lowercase
	if ( profile.lowercase instanceof Array ) {
		for (var i = 0; i < profile.lowercase.length; i++) {
			var elem = form[profile.lowercase[i]];
			if ( elem.type != "text" && elem.type != "textarea" && elem.type != "password" ) { continue; }
			elem.value = elem.value.toLowerCase();
		}
	}
	// Uppercase first letter
	if ( profile.ucfirst instanceof Array ) {
		for (var i = 0; i < profile.ucfirst.length; i++) {
			var elem = form[profile.ucfirst[i]];
			if ( elem.type != "text" && elem.type != "textarea" && elem.type != "password" ) { continue; }
			elem.value = elem.value.replace(/\b\w+\b/g, function(word) { return word.substring(0,1).toUpperCase() + word.substring(1).toLowerCase(); });
		}
	}
	// Remove non digits characters from the input.
	if ( profile.digit instanceof Array ) {
		for (var i = 0; i < profile.digit.length; i++) {
			var elem = form[profile.digit[i]];
			if ( elem.type != "text" && elem.type != "textarea" && elem.type != "password" ) { continue; }
			elem.value = elem.value.replace(/\D/g, "");
		}
	}

	// See if required input fields have values missing.
	if ( profile.required instanceof Array ) {
		for (var i = 0; i < profile.required.length; i++) { 
			if(!dojo.lang.isString(profile.required[i])){ continue; }
			var elem = form[profile.required[i]];
			// Are textbox, textarea, or password fields blank.
			if ( (elem.type == "text" || elem.type == "textarea" || elem.type == "password") && /^\s*$/.test(elem.value) ) {	
				missing[missing.length] = elem.name;
			}
			// Does drop-down box have option selected.
			else if ( (elem.type == "select-one" || elem.type == "select-multiple") 
						&& (elem.selectedIndex == -1 
						|| /^\s*$/.test(elem.options[elem.selectedIndex].value)) ) {
				missing[missing.length] = elem.name;
			}
			// Does radio button group (or check box group) have option checked.
			else if ( elem instanceof Array )  {
				var checked = false;
				for (var j = 0; j < elem.length; j++) {
					if (elem[j].checked) { checked = true; }
				}
				if ( !checked ) {	
					missing[missing.length] = elem[0].name;
				}
			}
		}
	}

	// See if checkbox groups and select boxes have x number of required values.
	if ( profile.required instanceof Array ) {
		for (var i = 0; i < profile.required.length; i++) { 
			if(!dojo.lang.isObject(profile.required[i])){ continue; }
			var elem, numRequired;
			for (var name in profile.required[i]) { 
				elem = form[name]; 
				numRequired = profile.required[i][name];
			}
			// case 1: elem is a check box group
			if ( elem instanceof Array )  {
				var checked = 0;
				for (var j = 0; j < elem.length; j++) {
					if (elem[j].checked) { checked++; }
				}
				if ( checked < numRequired ) {	
					missing[missing.length] = elem[0].name;
				}
			}
			// case 2: elem is a select box
			else if ( elem.type == "select-multiple" ) {
				var selected = 0;
				for (var j = 0; j < elem.options.length; j++) {
					if (elem.options[j].selected && !/^\s*$/.test(elem.options[j].value)) { selected++; }
				}
				if ( selected < numRequired ) {	
					missing[missing.length] = elem.name;
				}
			}
		}
	}

	// Dependent fields are required when the target field is present (not blank).
	// Todo: Support dependent and target fields that are radio button groups, or select drop-down lists.
	// Todo: Make the dependency based on a specific value of the target field.
	// Todo: allow dependent fields to have several required values, like {checkboxgroup: 3}.
	if(dojo.lang.isObject(profile.dependencies) || dojo.lang.isObject(profile.dependancies)){
		if (profile["dependancies"]){
			dojo.deprecated("dojo.validate.check() profile 'dependancies' are deprecated, please use "
							+ "new syntax of 'dependencies'");
			profile.dependencies=profile.dependancies;
		}
		// properties of dependencies object are the names of dependent fields to be checked
		for (name in profile.dependencies) {
			var elem = form[name];	// the dependent element
			if ( elem.type != "text" && elem.type != "textarea" && elem.type != "password" ) { continue; } // limited support
			if ( /\S+/.test(elem.value) ) { continue; }	// has a value already
			if ( results.isMissing(elem.name) ) { continue; }	// already listed as missing
			var target = form[profile.dependencies[name]];
			if ( target.type != "text" && target.type != "textarea" && target.type != "password" ) { continue; }	// limited support
			if ( /^\s*$/.test(target.value) ) { continue; }	// skip if blank
			missing[missing.length] = elem.name;	// ok the dependent field is missing
		}
	}

	// Find invalid input fields.
	if(dojo.lang.isObject(profile.constraints)){
		// constraint properties are the names of fields to bevalidated
		for(name in profile.constraints){
			var elem = form[name];
			if(	(elem.type != "text")&&
				(elem.type != "textarea")&&
				(elem.type != "password")){
				continue;
			}
			// skip if blank - its optional unless required, in which case it
			// is already listed as missing.
			if( /^\s*$/.test(elem.value)){ continue; }

			var isValid = true;
			// case 1: constraint value is validation function
			if(dojo.lang.isFunction(profile.constraints[name])){
				isValid = profile.constraints[name](elem.value);
			} else if(dojo.lang.isArray(profile.constraints[name])){
				// handle nested arrays for multiple constraints
				if (dojo.lang.isArray(profile.constraints[name][0])) {
					for (var i=0; i<profile.constraints[name].length; i++) {
						isValid = dojo.validate.evaluateConstraint(profile, profile.constraints[name][i], name, elem);
						if (!isValid) { break; }
					}
				} else {
					// case 2: constraint value is array, first elem is function,
					// tail is parameters
					isValid = dojo.validate.evaluateConstraint(profile, profile.constraints[name], name, elem);
				}
			}

			if(!isValid){	
				invalid[invalid.length] = elem.name;
			}
		}
	}

	// Find unequal confirm fields and report them as Invalid.
	if(dojo.lang.isObject(profile.confirm)){
		for(name in profile.confirm){
			var elem = form[name];	// the confirm element
			var target = form[profile.confirm[name]];
			if ( (elem.type != "text" && elem.type != "textarea" && elem.type != "password") 
				||(target.type != elem.type)
				||(target.value == elem.value)	// it's valid
				||(results.isInvalid(elem.name))// already listed as invalid
				||(/^\s*$/.test(target.value))	)	// skip if blank - only confirm if target has a value
			{
				continue; 
			}	
			invalid[invalid.length] = elem.name;
		}
	}

	return results;
}

/**
 * Evaluates dojo.validate.check() constraints that are specified as array
 * arguments. The arrays are expected to be in the format of:
 *
 * <pre>
 *     constraints:{
 *             fieldName: [functionToCall, param1, param2, etc.],
 *             fieldName: [[functionToCallFirst, param1],[functionToCallSecond,param2]]
 *     }
 * </pre>
 *
 * This function evaluates a single array function in the format of:
 * <pre>
 *     [functionName, argument1, argument2, etc]
 * </pre>
 *
 * The function will be parsed out and evaluated against the incoming parameters.
 *
 * @param profile - The dojo.validate.check() profile that this evaluation is against.
 * @param constraint - The single [] array of function and arguments for the function.
 * @param fieldName - The form dom name of the field being validated.
 * @param elem - The form element field.
 *
 * @return Boolean, True if constraint passed, false otherwise.
 */
dojo.validate.evaluateConstraint=function(profile, constraint, fieldName, elem){
	var isValidSomething = constraint[0];
	var params = constraint.slice(1);
	params.unshift(elem.value);
	if(typeof isValidSomething != "undefined"){
		return isValidSomething.apply(null, params);
	}
	return false;
}
