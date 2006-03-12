dojo.require("dojo.widget.html.DocComboBox");

dojo.doc.getMeta(_result, "dojo.animation.Animation");
dojo.doc.getSrc(_result, "dojo.animation.Animation");
dojo.doc.getDoc(_docResult, "dojo.animation.Animation.play");
//dojo.doc.getDoc("dojo.animation.Animation.play");

var docCount = 0;

function _docResult(input){
	dojo.debug("_docResult");
	var i = arguments.length;
	while(i-- > 0){
		dojo.debug(dojo.json.serialize(arguments[i]));
	}
}

function _result(input){
	if(dojo.lang.isObject(input)){
		dojo.debug(dojo.json.serialize(input));
	}else{
		dojo.debug(input);
	}
}

function docSubmit(){
	dojo.event.topic.publish("docSearch", {selectKey: ++docCount, name: dojo.widget.byId("search").domNode.getElementsByTagName("input")[2].value});
	return false;
}

function docResults(/*Object*/ input){
	dojo.debug(dojo.json.serialize(input));
}

dojo.event.topic.subscribe("docResults", docResults);