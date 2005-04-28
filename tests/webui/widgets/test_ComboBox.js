dojo.hostenv.loadModule("dojo.webui.widgets.ComboBox");

function test_combobox_ctor(){
	// jum.debug(dojo.webui.widgets.ComboBox);
	// jum.debug(typeof dojo.webui.widgets.ComboBox);
	// jum.debug(new dojo.webui.widgets.ComboBox);
	var b1 = new dojo.webui.widgets.ComboBox();

	jum.assertEquals("test10", typeof b1, "object");
	jum.assertEquals("test20", b1.widgetType, "ComboBox");
	jum.assertEquals("test21", typeof b1["attachProperty"], "undefined");
}

function test_combobox_dataprovider(){
	var box = new dojo.webui.widgets.ComboBox();

	jum.assertEquals("test30", typeof dojo.webui.widgets.ComboBoxDataProvider, "function");

	/*
	for(var x in dojo.webui.widgets){
		print(x);
	}
	print(dojo.webui.widgets.ComboBoxDataProvider);
	*/
	var provider = new dojo.webui.widgets.ComboBoxDataProvider();
	print(provider);
	provider.setData([
		["Alabama","AL"],
		["Alaska","AK"],
		["American Samoa","AS"],
		["Arizona","AZ"],
		["Arkansas","AR"],
		["Armed Forces Europe","AE"],
		["Armed Forces Pacific","AP"],
		["Armed Forces the Americas","AA"],
		["California","CA"],
		["Colorado","CO"],
		["Connecticut","CT"],
		["Delaware","DE"],
		["District of Columbia","DC"],
		["Federated States of Micronesia","FM"],
		["Florida","FL"],
		["Georgia","GA"],
		["Guam","GU"],
		["Hawaii","HI"],
		["Idaho","ID"],
		["Illinois","IL"],
		["Indiana","IN"],
		["Iowa","IA"],
		["Kansas","KS"],
		["Kentucky","KY"],
		["Louisiana","LA"],
		["Maine","ME"],
		["Marshall Islands","MH"],
		["Maryland","MD"],
		["Massachusetts","MA"],
		["Michigan","MI"],
		["Minnesota","MN"],
		["Mississippi","MS"],
		["Missouri","MO"],
		["Montana","MT"],
		["Nebraska","NE"],
		["Nevada","NV"],
		["New Hampshire","NH"],
		["New Jersey","NJ"],
		["New Mexico","NM"],
		["New York","NY"],
		["North Carolina","NC"],
		["North Dakota","ND"],
		["Northern Mariana Islands","MP"],
		["Ohio","OH"],
		["Oklahoma","OK"],
		["Oregon","OR"],
		["Pennsylvania","PA"],
		["Puerto Rico","PR"],
		["Rhode Island","RI"],
		["South Carolina","SC"],
		["South Dakota","SD"],
		["Tennessee","TN"],
		["Texas","TX"],
		["Utah","UT"],
		["Vermont","VT"],
		["Virgin Islands, U.S.","VI"],
		["Virginia","VA"],
		["Washington","WA"],
		["West Virginia","WV"],
		["Wisconsin","WI"],
		["Wyoming","WY"]
	]);

	// test the results of our search
	var searchTester = function(data){
		jum.debug(data.length);
		for(var x=0; x<data.length; x++){
			jum.debug(data[x][0]);
		}
	}

	print(searchTester);
	dojo.event.connect(provider, "provideSearchResults", searchTester);
	provider.startSearch("W");
}
