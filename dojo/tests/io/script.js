define(["doh", "require"], function(doh, require){
	if(doh.isBrowser){
		doh.register("tests.io.script", require.nameToUrl("./script.html"));
	}
});
