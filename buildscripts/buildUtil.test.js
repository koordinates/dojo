load('buildUtil.js');
buildUtil.isDebug = true;

function printA(array) {
	print("  " + array.join("\n  "));
}

function test(deps) {
	print("Dependencies:");	
	printA(deps)
	print("Resolved:");
	printA(buildUtil.getDependencyList(deps));
	print("");	
}

test(['dojo.widget.html.Button2']);
test(['dojo.widget.html.Button2']);

print("")
print("Note : MISSING dojo.widget.html.Button2 from second run")

