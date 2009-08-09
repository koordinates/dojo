dojo.provide("dojox.tests.module");

try {
	dojo.require("dojox.atom.tests.io.module");
	dojo.require("dojox.charting.tests.charting");
	dojo.require("dojox.collections.tests.collections");
	dojo.require("dojox.color.tests.color");
	dojo.require("dojox.cometd.tests.all");
	dojo.require("dojox.data.tests.module");
	dojo.require("dojox.date.tests.module");
	dojo.require("dojox.dtl.tests.module");
	dojo.require("dojox.encoding.tests.encoding");
	dojo.require("dojox.fx.tests._base");
	dojo.require("dojox.gfx.tests.module");
	dojo.require("dojox.highlight.tests.module");
	dojo.require("dojox.json.tests.module");
	dojo.require("dojox.jsonPath.tests.module");
	dojo.require("dojox.lang.tests.main"); 
	dojo.require("dojox.math.tests.main");
	dojo.require("dojox.robot.tests.module");
	//dojo.require("dojox.rpc.tests.module");
	dojo.require("dojox.rpc.tests.libraryTests");
	dojo.require("dojox.string.tests.string");
	dojo.require("dojox.testing.tests.module");
	dojo.require("dojox.uuid.tests.uuid");
	dojo.require("dojox.wire.tests.module");
	dojo.require("dojox.xml.tests.module");

}catch(e){
	doh.debug(e);
}