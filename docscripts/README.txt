How the dojo-driven Doc Tool Will Work
======================================

This is only for starters, to give you a good idea of how things are going down, and to give me a good idea of building practical JSON objects. Enjoy!

JSON Objects
------------

In all of the following examples, a key with "" around it means that it is a text link. That is, it does not change.
	
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

This object is found in json/pkg_meta/[package] and is a list of all package metadata. It uses the following keys and variables:
* "requires": A key that holds the *hostenv* and *package* values.
* hostenv: The environmental variables (browser, html, svg, etc)
* "package": The name of the dojo package (is limited to child packages)
* method: The name of the dojo method
* "is": A key that holds a pointer to another method
* id: The id of the polymorphic sygnature (default is "default")
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
		method: {
			id: {
				signature: "summary"
			}
		}
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

* If source exists in the fnc_src directory, go to the method display page.
* Otherwise, load package metadata from the pkg_meta directory. Several things can happen here:
** If the method has an "is" key, then we need to redirect them to that method.
** If the method has multiple signatures (more than just the "default" id) then have them choose from a list of methods.
** If the method has a single signature, go to the method display page.

Results for a match with multiple method matches
------------------------------------------------

* Go through each matching method in the list, load the pkg_meta for each package and display function signatures and descriptions for all matching methods. Allow the user to click each method.

Method Display Page
-------------------

Descriptions to come. I still have to finalize the JSON breakdown