//This file is the command-line entry point for running the tests in
//Rhino and Spidermonkey.

// NOTE: Move this to tests/console.js?

/*=====
dojo.tests = {
	// summary: DOH Test files for Dojo unit testing.
};
=====*/

load("dojo.js");

// NOTE: Where is this file?

load("tests/runner.js");
tests.run();
