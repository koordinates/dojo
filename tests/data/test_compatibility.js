dojo.require("dojo.data.core.Read");
dojo.require("dojo.data.core.Write");
dojo.require("dojo.data.core.Identity");
dojo.require("dojo.data.OpmlStore");
dojo.require("dojo.data.CsvStore");
dojo.require("dojo.data.YahooStore");
dojo.require("dojo.data.RdfStore");
dojo.require("dojo.data.JsonItemStore");
dojo.require("dojo.lang.type");
dojo.require("dojo.io.*");
dojo.require("dojo.lang.declare");

function test_data_compatibility() {
	// This 'datastoreTable' has entries for all the datastores that we will
	// test.  The datastoreTable includes all the information we need in order
	// to construct instances of the datastores.
	var datastoreTable = {
		'geography.opml': {
			constructor: dojo.data.OpmlStore, 
			constructorArg: {url:"geography.opml"},
			findQuery: null
		},
		'rss_feeds.opml': {
			constructor: dojo.data.OpmlStore, 
			constructorArg: {url:"rss_feeds.opml"},
			findQuery: null
		},
		'books.csv': {
			constructor: dojo.data.CsvStore, 
			constructorArg: {queryUrl:"books.csv"},
			findQuery: null
		},
		'movies.csv': {
			constructor: dojo.data.CsvStore, 
			constructorArg: {queryUrl:"movies.csv"},
			findQuery: null
		},
		'Yahoo creative commons': {
			constructor: dojo.data.CsvStore, 
			constructorArg: null,
			findQuery: "creative commons"
		},
		'Yahoo hobbit spock': {
			constructor: dojo.data.CsvStore, 
			constructorArg: null,
			findQuery: "hobbit spock"
		},
		'muppets.json': {
			constructor: dojo.data.JsonItemStore, 
			constructorArg: {url:"muppets.json"},
			findQuery: null
		},
		'states.json': {
			constructor: dojo.data.JsonItemStore, 
			constructorArg: {url:"countries.json"},
			findQuery: null
		}
		
	};

	// First create an "EmptyClass" using dojo.declare(), so that we can find 
	// out what properties even an empty class has.  An instance of EmptyClass
	// will have a property list that looks something like this:
	//   _getPropContext
	//   _contextMethod
	//   _inherited
	//   prototyping
	//   initializer
	//   declaredClass
	dojo.declare("tests.EmptyClass", null, null, null);
	var emptyInstance = new tests.EmptyClass();
	emptyInstance.prototyping = true; // explicitly add 'prototyping', because it may not be included 
	
	// Now create an instance of the dojo.data.core.Read API, in order to 
	// see what methods it defines.
	var readApi = new dojo.data.core.Read();
	var readApiMethods = [];
	for (var key in readApi) {
		if (emptyInstance[key]) {
			// do nothing -- if even an emptyInstance has this key, then this 
			// key is not actually part of the readApi
		} else {
			readApiMethods.push(key);
		}
	}
	
	// Now go through the whole datastoreTable, make an instance of each type
	// of datastore.
	for (var datastoreName in datastoreTable) {
		var datastoreSpec = datastoreTable[datastoreName];
		var store = new datastoreSpec.constructor(datastoreSpec.constructorArg);
		datastoreTable[datastoreName].instance = store;
	}

	// For each datastore instance, check to make sure that the datastore has  
	// all the methods that are defined on the dojo.data.core.Read API.
	for (datastoreName in datastoreTable) {
		store = datastoreTable[datastoreName].instance;
		for (var i = 0; i < readApiMethods.length; ++i) {
			key = readApiMethods[i];
			if (!store[key]) {
				jum.assertTrue(datastoreName + " datastore is missing " + (typeof readApi[key]) + " " + key, false);
			} else {
				if ((typeof readApi[key]) != (typeof store[key])) {
					jum.assertTrue(datastoreName + " datastore '" + key + "' should be a " + (typeof readApi[key]) + ", not a " + (typeof store[key]), false);
				}
			}
		}
	}
	
	// For each datastore instance, check to make sure that datastore has a 
	// getFeatures() method that includes 'dojo.data.core.Read' as a feature.
	for (var datastoreName in datastoreTable) {
		store = datastoreTable[datastoreName].instance;
		var features = store.getFeatures();
		jum.assertTrue("All datastores implement 'dojo.data.core.Read'", Boolean(features['dojo.data.core.Read']))
	}

}

