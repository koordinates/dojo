dojo.require("dojo.logging.Logger");

function test_loader_AbsolutePaths(){
	var path=new java.io.File("../tests").getAbsolutePath();
	dojo.registerModulePath("tests", path);
	
	dojo.debug("Registered tests path with: " + path);
	
	dojo.hostenv.loadModule("tests.loader.custom");
}
