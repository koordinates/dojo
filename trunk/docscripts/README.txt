How the dojo-driven Doc Tool Will Work
======================================

The various pieces
------------------

* parser.php runs through all of the files and searches for patterns. It can do all basic functionality.
* parser.php creates a bunch of JSON files (stored in the json directory)
* dojo.doc has four important functions
** functionNames loads the list function names from the function_names object
** getMeta grabs the meta information for a function from a JSON object
** getSrc grabs the source from a stored file
** getDoc goes out to http://manual.dojotoolkit.org and grabs external documentation
* dojo.widget.html.DocComboBox provides a search interface to dojo.doc
* dojo.widget.html.DocDetail gives a front end to displaying search results, package, and function information

There will be a bunch of topic events that get thrown around. This is basically how they will interact:

* dojo.widget.html.DocComboBox calls dojo.doc.functionNames to create its drop down
* When the search is executed, it sends a topic event ("docSearch") with the current item
* dojo.doc.search responds to that event by returning a topic event ("docResults")
* dojo.widget.html.DocDetail listens for that event
* If there is only one result, it throws a topic event ("docSelFunction") with the result
* If there is more than one result, it displays the search results. Clicking on a search result throws the topic event ("docSelFunction") with the row's result
* dojo.doc.selectFunction responds to that event by throwing a topic event ("docFunctionDetail")
* dojo.widget.html.DocDetail responds to that event by displaying the method details

The topic registry
------------------

*publisher*: the expected widgets or code that are typically expected to publish data on that topic.
(of course anyone is free to publish on any topic at any time)
*subscriber*: types of widgets or code that are expected to subscribe to this topic
*message*: the format of that particular topics message:
*returns*: what the object returns

"docSearch": 
	publisher: any widget or code that wishes to search for documents
	subscriber: dojo.doc
	messsage: {
		selectKey: id of the docSearch request,
		name: string containing function to search for
	}

"docResults":
	publisher: dojo.doc
	subscriber: any widget or code that wishes to see the results of current docSearches
	message: {
		selectKey: id of the docSearch request,
		docResults: [{
			pkg: string with the package (require statement) containing the function
			name: string with name of function,
			id: the polymorphic id of the function (may be blank if the default),
			summary: string containing one line summary of the function,
		}]
	}

"docSelectFunction":
	publisher: any widget that can select a function
	subscriber: dojo.doc and any other widget that wishes to be aware of a selection
	message: {
		selectKey: id of the docSelectFunction request,
		name: string with name of the function,
		id: the polymorphic id of the function (maybe be blank, or undefined if the default)
	}

"docFunctionDetail":
	publisher: dojo.doc
	subscriber: any widget that wishes to be aware of a selection's details
	message:
			selectKey: id indentifying selection
			pkg: The package of the function
			name: The function name
			id: If this has a polymorphic ID, here it is
			meta: object of the metadata (as shown in the meta JSON object),
			src: source
			doc: docs (TBD: Things like parameter descriptions, extended description, return description)
			sig: Function signature

Note: docSelectionFunction can return the exact result as returned by docResults. That means that you can do something like

onDocResults: function(result){ if(result.docResults.length == 1){ dojo.event.topic.publish("docFunctionDetail", result.DocResults[0])}}

and expect proper results

Topic Registry
--------------

dojo.event.topic.registerPublisher("docSearch");  	
dojo.event.topic.registerPublisher("docResults");  	
dojo.event.topic.registerPublisher("docSelectFunction");  	
dojo.event.topic.registerPublisher("docFunctionDetail");  	

dojo.event.topic.subscribe("docSearch", dojo.doc, "_onDocSearch");
dojo.event.topic.subscribe("docSelectFunction", dojo.doc, "_onDocSelectFunction");

In the init of an application that uses dojo.doc and some widgets:

	dojo.addOnLoad(function() {
		var searchWidget = dojo.widget.byId("SearchWidget");
    dojo.event.topic.subscribe("docResults", searchWidget, "_onDocResults"); 
 
  	var detailWidget= dojo.widget.byId("detailWidget");
  	dojo.event.topic.subscribe("docFunctionDetail",detailWidget,"_onDocFunctionDetail"); 
	});

Any widget or code can publish to any of these topics at any time like this:

dojo.event.topic.publish("docSearch",message); 	

Where I need your help
----------------------

Much of the help I need is theoretical, I guess.

What really needs work right now is getting the stuff in place to bounce the topics back and forth. I guess a lot of this can be emulated and I'll fill in the blanks as we go along. Please look through dojo.doc to get an idea of what's involved. There's a steep learning curve, but I'd be glad to answer any questions.

JSON Objects
------------

In all of the following examples, a key with "" around it means that it is a text link. That is, it does not change.

Also, it is assumed that if anything begins with a _, then it is replaced by its parents. It should be intuitive after looking at the functions.

Examples:

* function_names packages have "dojo" as their parent
* function_names functions have package as their parent
* etc

Directory structure (default polymorphic signature is "_"):

package/
	"meta"
	function/
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

The next object is found in json/*package*/meta and is a list of all package metadata. Note: Windows can't take the * character, so it is replaced with _. It uses the following keys and variables:
* "requires": A key that holds the *packages* in each *hostenv*.
* hostenv: The environmental variables (browser, html, svg, etc)
* "package": The name of the dojo package (is limited to child packages)
* "methods": A key that holds the *methods*
* method: The name of the dojo method
* "is": A key that holds a pointer to another method (dojo.requireAfterIf "is" dojo.requireIf)
* id: The id of the polymorphic signature. Default signature is "_"
* "sig": A key that holds the function signature
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
		"methods": {
			method: {
				"is": "method"
			},
			method: {
				"_": {
					"summary": summary
				}
				id: {
					"sig": signature
				},
				id: {
					"sig": signature
				}
			}
		}
	}
	
The next object is found in json/*package*/*method*/*id*/src and is the source code for each method. It is plain text.
	
The next object is found in json/*package*/*method*/*id*/meta and is the metadata for each function. That means it contains things like parameters and return type. It uses the following keys and variables
* "inner": If this is declared inside of another function.
* "this": A key that signifies that this function is set by means of a this.variable
* "returns": A static key that holds the return type of the method
* "params": A static key that holds all the parameters this object uses
* type: The object type
* name: The param name
* "variables": A static key that holds all the publicly exposed variables.
* variable: The name of a publicly exposed variable
* "inherits": A static key that holds the methods that this function inherits from.
* method: A dojo method
* "this_variables": A static key that holds all variables set within the constructor
* "this_inherits": A static key that holds all of the constructors that dojo inherits from (that is, the "this_variables" of another function)
	{
		"inner": true,
		"this": true,
		"returns": type,
		"params": [
			[type, name],
			[type, name]
		],
		"variables": [
			variable,
			variable
		],
		"inherits": method,
		"this_variables": [
			variable,
			variable
		],
		"this_inherits": [
			method
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