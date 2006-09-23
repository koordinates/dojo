dojo.provide("dojo.debug.Opera");

if (dojo.render.html.opera) {
	if (opera && opera.postError) {
		dojo.hostenv.println=opera.postError;
	} else {
		dojo.debug("dojo.debug.Opera requires Opera > 8.0");
	}
}
