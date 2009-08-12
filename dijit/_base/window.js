dojo.provide("dijit._base.window");

// TODO: remove this in 2.0, it's not used anymore, or at least not internally
// NOTE: It is used by Dijit internally (e.g. menus)

// NOTE: move to core

dijit.getDocumentWindow = (function() {
	var propName, doc = window.document;

	if (dojo.isHostObjectProperty(doc, 'parentWindow')) {
		propName = 'parentWindow';
	} else if (dojo.isHostObjectProperty(doc, 'defaultView') && doc.defaultView == this) { // defaultView is not always window/global object (e.g. IceBrowser, Safari 2)
		propName = 'defaultView';
	} else if (dojo.isHostObjectProperty(doc, '__parent__')) { // IceBrowser
		propName = '__parent__';
	}
	return function(docNode) {
		return docNode[propName] || null;
	};
})();

dojo.provided("dijit._base.window");