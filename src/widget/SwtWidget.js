dojo.provide("dojo.widget.SwtWidget");

dojo.require("dojo.event.*");
dojo.require("dojo.widget.Widget");
dojo.require("dojo.uri.*");
dojo.require("dojo.lang.func");
dojo.require("dojo.lang.extras");

importPackage(Packages.org.eclipse.swt.widgets);

dojo.declare("dojo.widget.SwtWidget", dojo.widget.Widget, {
	initializer: function() {
		if((arguments.length>0)&&(typeof arguments[0] == "object")){
			this.create(arguments[0]);
		}
	},

	display: null,
	shell: null,

	show: function(){ },
	hide: function(){ },

	addChild: function(){ },
	registerChild: function(){ },
	addWidgetAsDirectChild: function(){ },
	removeChild: function(){ },
	cleanUp: function(){ },
	destroyRendering: function(){ },
	postInitialize: function(){ },
});

// initialize SWT runtime

dojo.widget.SwtWidget.prototype.display = new Display();
dojo.widget.SwtWidget.prototype.shell = new Shell(dojo.widget.SwtWidget.prototype.display);

(function(){
	var sh = dojo.widget.SwtWidget.prototype.shell;
	var d = dojo.widget.SwtWidget.prototype.display;
	sh.open();
	while(!sh.isDisposed()){
		if(!d.readAndDispatch()){
			d.sleep();
		}
	}
	d.dispose();
})();
