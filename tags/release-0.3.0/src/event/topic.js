dojo.require("dojo.event");
dojo.provide("dojo.event.topic");

dojo.event.topic = new function(){
	this.topics = {};

	this.getTopic = function(topicName){
		if(!this.topics[topicName]){
			this.topics[topicName] = new this.TopicImpl(topicName);
		}
		return this.topics[topicName];
	}

	this.registerPublisher = function(topic, obj, funcName){
		var topic = this.getTopic(topic);
		topic.registerPublisher(obj, funcName);
	}

	this.subscribe = function(topic, obj, funcName){
		var topic = this.getTopic(topic);
		topic.subscribe(obj, funcName);
	}

	this.unsubscribe = function(topic, obj, funcName){
		var topic = this.getTopic(topic);
		topic.unsubscribe(obj, funcName);
	}

	this.destroy = function(topic){
		this.getTopic(topic).destroy();
		delete this.topics[topic];
	}

	this.publish = function(topic, message){
		var topic = this.getTopic(topic);
		// if message is an array, we treat it as a set of arguments,
		// otherwise, we just pass on the arguments passed in as-is
		var args = [];
		if(arguments.length == 2 && (dojo.lang.isArray(message) || message.callee)){
			args = message;
		}else{
			var args = [];
			for(var x=1; x<arguments.length; x++){
				args.push(arguments[x]);
			}
		}
		topic.sendMessage.apply(topic, args);
	}
}

dojo.event.topic.TopicImpl = function(topicName){
	this.topicName = topicName;

	this.subscribe = function(listenerObject, listenerMethod){
		var tf = listenerMethod||listenerObject;
		var to = (!listenerMethod) ? dj_global : listenerObject;
		dojo.event.kwConnect({
			srcObj:		this, 
			srcFunc:	"sendMessage", 
			adviceObj:	to,
			adviceFunc: tf
		});
	}

	this.unsubscribe = function(listenerObject, listenerMethod){
		var tf = (!listenerMethod) ? listenerObject : listenerMethod;
		var to = (!listenerMethod) ? null : listenerObject;
		dojo.event.kwDisconnect({
			srcObj:		this, 
			srcFunc:	"sendMessage", 
			adviceObj:	to,
			adviceFunc: tf
		});
	}

	this.destroy = function(){
		dojo.event.MethodJoinPoint.getForMethod(this, "sendMessage").disconnect();
	}

	this.registerPublisher = function(publisherObject, publisherMethod){
		dojo.event.connect(publisherObject, publisherMethod, this, "sendMessage");
	}

	this.sendMessage = function(message){
		// The message has been propagated
	}
}

