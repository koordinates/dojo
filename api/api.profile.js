// pull in the dependency list and define it in the var "dependencies". This
// over-rides the default built into getDependencyList.js. The bootstrap and
// hostenv files are included by default and don't need to be included here,
// but you can change the hostenv file that's included by setting the value of
// the variable "hostenvType" (defaults to "browser").
var dependencies = [
		"api.ApiRef",
		"api.ProfileHelper",
		"dojo.widget.ComboBox",
		"dojo.widget.ContentPane",
		"dojo.widget.Menu2",
		"dojo.widget.SplitContainer"	
];

dependencies.prefixes=[["api","api"]];

// NOTE: this MUST be included or a list of files must be output via print()
// manually.
load("getDependencyList.js");
