How the dojo-driven Doc Tool Will Work
======================================

This is only for starters, to give you a good idea of how things are going down, and to give me a good idea of building practical JSON objects. Enjoy!

JSON Objects
------------

In all of the following examples, a key with "" around it means that it is a text link. That is, it does not change.

Also, it is assumed that if anything begins with a _, then it is replaced by its parents. It should be intuitive after looking at the functions.

Examples:

* function_names packages have "dojo" as their parent
* function_names functions have package as their parent
* etc

Directory structure:

package/
	"meta"
	function/
		"meta"
		"src"
		id/
			"meta"
			"src"
	
This object is found in json/function_names and is a list of all dojo methods by package. It uses the following keys and variables:
* package: The name of the dojo package.
* "method": The name of the dojo method.
	{
		package: [
			"method",
			"method",
			"method"
		],
		package: [
			"method",
			"method"
		]
	}

The next object is found in json/pkg_meta/[package] and is a list of all package metadata. Note: Windows can't take the * character, so it is replaced with _. It uses the following keys and variables:
* "requires": A key that holds the *hostenv* and *package* values.
* hostenv: The environmental variables (browser, html, svg, etc)
* "package": The name of the dojo package (is limited to child packages)
* method: The name of the dojo method
* "is": A key that holds a pointer to another method (dojo.requireAfterIf "is" dojo.requireIf)
* id: The id of the polymorphic sygnature. Default signature doesn't have a key (it is immediately below "method:")
* signature: The function signature: returnType functionName(paramType param, paramType param)
* "summary": A brief description of what this function signature does.
	{
		"requires": {
			hostenv: [
				"package",
				"package",
				"package"
			],
			hostenv: [
				"package",
				"package"
			]
		},
		method: {
			"is": "method"
		},
		method: {
			id: {
				signature: "summary"
			},
			id: {
				signature: "summary"
			}
		},
		method: { // This has the default ID
			signature: "summary"
		}
	}
	
The next object is found in json/fnc_src/[package]-[id]-[method] and is the source code for each method. It is plain text.
	
The next object is found in json/fnc_meta/[method].[id] and is the metadata for each function. That means it contains things like parameters and return type. It uses the following keys and variables
* "variables": A static key that holds all the publicly exposed variables.
* "variable": The name of a publicly exposed variable
* "inherits": A static key that holds the methods that this function inherits from.
* "metod": A dojo method
* "this_variables": A static key that holds all variables set within the constructor
* "this_inherits": A static key that holds all of the constructors that dojo inherits from (that is, the "this_variables" of another function)
	{
		"variables": [
			"variable",
			"variable"
		],
		"inherits": [
			"method",
			"method"
		],
		"this_variables": [
			"variable",
			"variable"
		],
		"this_inherits": [
			"method"
		]
	}

Searching docs
--------------

Searching docs requires the following options:

* Search Box
* Hostenv
* Extra environmental options

Search Box
----------

This is an autocompleting search box. The values used for autocomplete are found in the "function_name" JSON object in the second level of the object. (eg the values of each value, the methods). As the user types, as long as the entered text matches "dojo." then we limit the autocomplete to functions beginning with that. If this is not true, it searches the entire list.

Hostenv Options
---------------

A dropdown with hostenvs

Extra environmental options
---------------------------

The options that aren't set by hostenv (eg "browser" hostenv implies "html" as an option) can be chosen here (eg svg).

Results for dojo.package.* search
---------------------------------

* Load the package metadata from the pkg_meta directory.
* Find all function signatures by loading the current file and all packages that are required, paying attention to hostenv.

Results for an exact method match
---------------------------------

* Load package metadata from the pkg_meta directory. Several things can happen here:
** If the method has an "is" key, then we need to redirect them to that method.
** If the method has multiple signatures (more than just the "default" id) then have them choose from a list of methods.
** If the method has a single signature, go to the method display page.

Results for a match with multiple method matches
------------------------------------------------

* Go through each matching method in the list, load the pkg_meta for each package and display function signatures and descriptions for all matching methods. Allow the user to click each method.

Method Display Page
-------------------

The focal point of this page is the source code. Eventually, it will have syntax highlighting. The function signature must be used since the source has none of its own.
	
Take a look at the JSON object for method metadata. It holds a lot of the information concerning public variables and inheritance. Public variables are a combination of "this_variables" and "variables". "this_inherits" only inherits variables set by the "this_variables" of the corresponding method.
	
From this, build a JavaDoc style layout of inheritance and variables using all the information aggregated so far.

In the near future, even more information will be loaded from a jot site. Also, editing by administrators and comment submission by users will be added. Flagging, etc after that.