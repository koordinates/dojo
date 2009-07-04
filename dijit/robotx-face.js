dojo.provide("dijit.robotx-face");
dojo.required("dijit.robotx");

(function(){
	var __updateDocument = doh.robot._updateDocument;

	dojo.mixin(doh.robot,{
		_updateDocument: function(){
			__updateDocument();
			var win = dojo.global;
			if(win.dijit){
				dijit.registry = win.dijit.registry;
			}
		}
	});
})();
