
dojo.provide( "dojo.widget.TreeDisableWrapExtension" );

dojo.require( "dojo.widget.HtmlWidget" );
dojo.require( "dojo.widget.TreeExtension" );

// selector extension to emphase node


dojo.widget.tags.addParseTreeHandler( "dojo:TreeDisableWrapExtension" );


dojo.widget.TreeDisableWrapExtension = function() {
	dojo.widget.TreeExtension.call( this );	
}

dojo.inherits( dojo.widget.TreeDisableWrapExtension, dojo.widget.TreeExtension );

/**
 * can't unlisten
 */
dojo.lang.extend( dojo.widget.TreeDisableWrapExtension, {
	widgetType: "TreeDisableWrapExtension",
	
	templateCssPath: dojo.uri.dojoUri( "src/widget/templates/TreeDisableWrap.css" ),
	
	
	listenTree: function(tree) {
		
		var wrappingDiv = document.createElement( "div" );
		var clazz = tree.classPrefix+"DisableWrap";
		if (dojo.render.html.ie) {
			clazz = clazz+' '+ tree.classPrefix+"IEDisableWrap";
		}
		dojo.html.setClass(wrappingDiv, clazz);
		
		var table = document.createElement( "table" );
		wrappingDiv.appendChild( table );
		
		var tbody = document.createElement( "tbody" );
		table.appendChild( tbody );
		
		var tr = document.createElement( "tr" );
		tbody.appendChild( tr );
		
		var td = document.createElement( "td" );
		tr.appendChild( td );
		
		if( tree.domNode.parentNode )
		{
			tree.domNode.parentNode.replaceChild( wrappingDiv, tree.domNode );
		}
		
		td.appendChild( tree.domNode );
		tree.domNode = wrappingDiv;
	}
});
