djConfig = { 
	isDebug: true,
	baseRelativePath: "../"
};

load([djConfig.baseRelativePath+"src/bootstrap1.js"]);
// FIXME: need a better way to determine which hostenv to load here!!!
load([djConfig.baseRelativePath+"src/hostenv_rhino.js"]);
load([djConfig.baseRelativePath+"src/bootstrap2.js"]);

// compat fixes for BUFakeDom.js and the JUM implementation:
var bu_alert = (typeof this.alert != 'undefined') ? this.alert : (this.load && this.print ? this.print : function() {});
