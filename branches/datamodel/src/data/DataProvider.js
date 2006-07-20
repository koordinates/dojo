dojo.provide("dojo.data.DataProvider");
dojo.provide("dojo.data.Bind");
dojo.provide("dojo.data.IDataProvider");
dojo.require("dojo.widget.*"); // Yes, but only to allow us to use XML programming model for model and bind
dojo.require("dojo.lang.declare");

dojo.widget.manager.registerWidgetPackage("dojo.data");

dojo.widget.defineWidget("dojo.data.DataProvider",dojo.widget.DomWidget,{
	isContainer: true, // DataGrid can have child element widgets (eg. DataGridColumn)
	location: "",
	type: "",
	derivedAttributes: [],
	provider: null,
	postCreate: function(args, frag) {
		for(var i = 0; i < this.children.length; i++){
			this.addBinding(this.children[i].path, this.children[i].value);
		}
		//Create an XML Provider and set up the dynamic attributes
		this.init({location: this.location, type: this.type});
	},
	/**
	 * The following attributes should be used:
	 *  type:  The name of the data provider object
	 *  location:  URL to the data.  Can also be an anchor to the id of data within the document.
	 * 
	 * For the binders, attributes are:
	 * path: the path to bind to
	 * value: value bound to the path
	 * The types of values assigned to these attributes will depend greatly on the provider type
	 */
	init: function(keywordParameters){
		try {
			dojo.require(this.type);
			this.provider = eval("new " + this.type + "()");
		} catch (e) {
			dojo.debug("Could not instantiate data provider of type " + this.type + ".");
			throw e;
		}
		this.provider.init(keywordParameters, this.derivedAttributes);
	},
	
	addBinding: function(path, value){
		this.derivedAttributes.push({
			"path": path,
			"value": value
		});
	},
	
	fetchData: function(query) {
		return this.provider.fetchData(query);
	},
	
	getDataGridController: function() {
		return this.provider.getDataGridController();
	}
});

// DerivedAttributes can be declared as child elements inside a DataProvider.
// They represent attributes that are calculated from other data values or expressions.
dojo.widget.defineWidget("dojo.data.DerivedAttribute",dojo.widget.DomWidget,{
	path: "", 	// The path from the root of the data graph to an attribute that will be created
	value: "" 	// An expression (or function) that determines how the value of the new attribute
				// will be calculated.  When expressions are used, the expressions are relative to
				// the parent item that the attribute has been attached to.  In the case of a function
				// the parent item will be passed as the first argument of the function.
});

/**
 * The IDataProvider doesn't do anything, but it does give a good guide as to what sort of functions
 * a DataProvider will need to provider.
 * We should have DataProvider implement IDataProvider, 
 */
dojo.data.IDataProvider = function(){}
dojo.lang.extend(dojo.data.IDataProvider, {
		fetchData: null,	//fetch an array of DataObject from the provider.  These will generally correspond to rows in a table.
		init: null,			//This is the point in which the data provider is created using the values and the binders specified in the widget markup
		getTableAdapter: null	//should this be part of a data provider?  If not, who's responsible for mapping a provider to an adapter?
});
