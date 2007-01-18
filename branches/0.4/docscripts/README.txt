How the dojo-driven Doc Tool Will Work
======================================

The various pieces
------------------

* docparser.php runs through all of the files and searches for patterns. It can do all basic functionality.
* inc/helpers.inc writeToDisc creates a bunch of JSON files (stored in the json directory)
* dojo.doc has four important functions:
** functionNames loads the list function names from the function_names object
** getMeta grabs the meta information for a function from a JSON object
** getSrc grabs the source from a stored file
** getDoc goes out to http://manual.dojotoolkit.org and grabs external documentation
* dojo.widget.ComboBox provides a search interface to dojo.docs. Right now, we're just replacing a function on initialization. It might be worth extending ComboBox later, though it seems like overkill. Maybe move this to DocPane.
* dojo.widget.DocPane gives a front end to displaying search results, package, and function information

There will be a bunch of topic events that get thrown around. This is basically how they will interact:

* dojo.docs.functionNames gets called and its values are set with ComboBox.dataProvider.setData() to create the ComboBox drop down
* When the search is executed, it sends a topic event ("/docs/search") with the current text
* dojo.docs._onDocSearch responds to that event by returning a topic event ("/docs/function/results" or "/docs/package/results")
* dojo.widget.DocPane
* If there is only one result, it throws back a topic event ("/docs/function/select") with that one result
* If there is more than one result, it displays the search results. Clicking on a search result throws the topic event ("/docs/function/select") with the row's result
* dojo.docs._onDocSelectFunction catches and responds to that event by throwing a topic event ("/docs/function/detail")
* dojo.widget.DocPane responds to that event by displaying the method details
* If a package is found, it throws back ("/docs/package/detail")
* dojo.widget.DocPane catches it and displays the package details.

The topic registry
------------------

*publisher*: the expected widgets or code that are typically expected to publish data on that topic.
(of course anyone is free to publish on any topic at any time)
*subscriber*: types of widgets or code that are expected to subscribe to this topic
*message*: the format of that particular topics message:
*returns*: what the object returns

"/docs/search": 
	publisher: any widget or code that wishes to search for documents
	subscriber: dojo.docs
	messsage: {
		selectKey: id of the docSearch request,
		name: string containing function to search for
	}

"/docs/function/select":
	publisher: any widget that can select a function
	subscriber: dojo.docs and any other widget that wishes to be aware of a selection
	message: {
		selectKey: identifier (optional),
		pkg: The package the method is in (optional)
		name: string with name of the function,
		id: the polymorphic id of the function (maybe be blank, or undefined if the default)
	}
	
"/docs/package/select":
	publisher: any widget that can select a function
	subscriber: dojo.docs and any other widget that wishes to be aware of a selection
	message: {
		selectKey: identifier (optional),
		pkg: The package to select (use either this or name)
		name: The package to select (use either this or pkg)
	}

"/docs/function/results":
	publisher: dojo.docs
	subscriber: any widget or code that wishes to see the results of current doc searches
	message: [{
			package: string with the package (require statement) containing the function
			name: string with name of function,
			id: the polymorphic id of the function (may be blank if the default),
			summary: string containing one line summary of the function,
	}]

"/docs/function/detail":
	publisher: dojo.docs
	subscriber: Any widget that wishes to be aware of a selection's details
	message: {
			selectKey: identifier
			pkg: The package of the function
			name: The function name
			id: If this has a polymorphic ID, here it is
			meta: object of the metadata (as shown in the meta JSON object),
			doc: docs (TBD: Things like parameter descriptions, extended description, return description)
			sig: Function signature
	}
	
"/docs/package/detail":
	publisher: dojo.docs
	subscriber: Any widget that wishes to be aware of a selection's details
	message: {
			selectKey: identifier
			pkg: The package of the function
			name: The function name
			id: If this has a polymorphic ID, here it is
			meta: object of the metadata (as shown in the meta JSON object),
			doc: docs (TBD: Things like parameter descriptions, extended description, return description)
			sig: Function signature
	}

Note: docSelectionFunction can return the exact result as returned by docResults. That means that you can do something like

onDocResults: function(result){ if(result.docResults.length == 1){ dojo.event.topic.publish("docFunctionDetail", result.DocResults[0])}}

and expect proper results

Topic Registry
--------------

dojo.event.topic.registerPublisher("/doc/search");  	
dojo.event.topic.registerPublisher("/doc/results");  	
dojo.event.topic.registerPublisher("/doc/function/select");  	
dojo.event.topic.registerPublisher("/doc/function/details");  	

dojo.event.topic.subscribe("/doc/search", dojo.doc, "_onDocSearch");
dojo.event.topic.subscribe("/doc/function/select", dojo.doc, "_onDocSelectFunction");

In the init of an application that uses dojo.doc and some widgets:

	dojo.addOnLoad(function() {
		var searchWidget = dojo.widget.byId("SearchWidget");
    dojo.event.topic.subscribe("docResults", searchWidget, "_onDocResults"); 
 
  	var detailWidget= dojo.widget.byId("detailWidget");
  	dojo.event.topic.subscribe("docFunctionDetail",detailWidget,"_onDocFunctionDetail"); 
	});

Any widget or code can publish to any of these topics at any time like this:

dojo.event.topic.publish("docSearch",message); 	

JSON Objects
------------

In all of the following examples, a key with "" around it means that it is a text link. That is, it does not change.

This is the full Object structure. *asterisks* indicate that the following is in that file. _underscores_ indicate that the following are skipped on the file system.

*function_names*: {
	package: {
		[
			function
		]
	}
},
package: {
	_meta_: {
		*description*: "description", (from comment block)
		_functions_: {
			name: {
				id: {
					_meta_: {
						summary: "summary", (Actually saved in the package-level *meta*)
						*description*: "description",
						*src*: "source code"
					},
					*meta*: {
						this: "function",
						inherits: [
							"package"
						],
						this_inherits: [
							"package"
						],
						object_inherits: [
							"package"
						],
						parameters: {
							name: {
								type: "type",
								description: "description" (in local version)
							}
						},
						returns: {
							type: "type",
							description: "description" (in local version)
						}
					}
				}
			}
		}
	},
	*meta*: {
		description: "description", (from wiki, only in local version)
		variables: [
			variable: "description", (in local version)
		],
		protovariables: [
			variable: "description", (in local version)
		],
		requires: {
			environment: [
				"require"
			]
		}
	}
}

The wiki
--------

http://manual.dojotoolkit.org/_/cmd/admin.exportZip?mode=xml&includeRevisions=false

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