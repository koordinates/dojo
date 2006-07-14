dojo.require("dojo.io"); // io.js provides setIFrameSrc and the IO namespace
dojo.provide("dojo.io.cometd");
dojo.provide("cometd");
dojo.require("dojo.AdapterRegistry");
dojo.require("dojo.json");
dojo.require("dojo.io.BrowserIO"); // we need XHR for the handshake, etc.
// FIXME: determine if we can use XMLHTTP to make x-domain posts despite not
//        being able to hear back about the result
dojo.require("dojo.io.IframeIO"); // for posting across domains
dojo.require("dojo.io.cookie"); // for peering
dojo.require("dojo.event.*");
dojo.require("dojo.lang.*");

/*
 * this file defines Comet protocol client. Actual message transport is
 * deferred to one of several connection type implementations. The default is a
 * forever-frame implementation. A single global object named "cometd" is
 * used to mediate for these connection types in order to provide a stable
 * interface.
 */

// TODO: unlike repubsubio we don't handle any sort of connection
// subscription/publishing backlog. Should we?
// TODO: the auth handling in this file is a *mess*. It should probably live in
// the cometd object with the ability to mix in or call down to an auth-handler
// object, the prototypical variant of which is a no-op

cometd = new function(){

	this.initialized = false;
	this.connected = false;

	this.connectionTypes = new dojo.AdapterRegistry(true);

	this.version = 0.1;
	this.minimumVersion = 0.1;

	this.handshakeReturn = null;
	this.currentTransport = null;
	this.url = null;
	this.lastMessage = null;
	this.globalTopicChannels = {};

	this.tunnelInit = function(childLocation, childDomain){
		// placeholder
	}

	this.tunnelCollapse = function(){
		// placeholder
	}

	this.init = function(props, root){
		props = props||{};
		// go ask the short bus server what we can support
		props.version = this.version;
		props.minimumVersion = this.minimumVersion;
		props.channel = "/meta/handshake";
		// FIXME: do we just assume that the props knows
		// everything we care about WRT to auth? Should we be trying to
		// call back into it for subsequent auth actions? Should we fire
		// local auth functions to ask for/get auth data?

		// FIXME: what about ScriptSrcIO for x-domain comet?
		this.url = root||djConfig["cometdRoot"];
		if(!this.url){
			dojo.debug("no cometd root specified in djConfig.cometdRoot");
			return;
		}
		var bindArgs = {
			url: this.url,
			method: "POST",
			mimetype: "text/json",
			load: dojo.lang.hitch(this, "finishInit"),
			content: { "message": dojo.json.serialize(props) }
		};
		return dojo.io.bind(bindArgs);
	}

	this.finishInit = function(type, data, evt, request){
		this.handshakeReturn = data;
		// pick a transport
		if(data["authSuccessful"] == false){
			dojo.debug("cometd authentication failed");
			return;
		}
		if(data.version < this.minimumVersion){
			dojo.debug("cometd protocol version mismatch. We wanted", this.minimumVersion, "but got", data.version);
			return;
		}
		this.currentTransport = this.connectionTypes.match(
			data.supportedConnectionTypes,
			data.version
		);
		this.currentTransport.version = data.version;
		this.tunnelInit = dojo.lang.hitch(this.currentTransport, "tunnelInit");
		this.tunnelCollapse = dojo.lang.hitch(this.currentTransport, "tunnelCollapse");
		this.initialized = true;
		this.currentTransport.startup(data);
	}

	this.getRandStr = function(){
		return Math.random().toString().substring(2, 10);
	}

	// public API functions called by cometd or by the transport classes
	this.deliver = function(message){
		this.lastMessage = message;
		// dipatch events along the specified path
		if(!message["channel"]){
			dojo.debug("cometd error: no channel for message!");
			return;
		}
		// check to see if we got a /meta channel message that we care about
		if(	(message.channel.length > 5)&&
			(message.channel.substr(0, 5) == "/meta")){
			// check for various meta topic actions that we need to respond to
			switch(message.channel){
				case "/meta/subscribe":
					if(!message.successful){
						dojo.debug("cometd subscription error for channel", message.channel, ":", message.error);
						return;
					}
					this.subscribed(message.channel);
					break;
				case "/meta/unsubscribe":
					if(!message.successful){
						dojo.debug("cometd unsubscription error for channel", message.channel, ":", message.error);
						return;
					}
					this.subscribed(message.channel);
					break;
			}
		}
		// send the message down for processing by the transport
		this.currentTransport.deliver(message);

		// dispatch the message to any locally subscribed listeners
		var tname = (this.globalTopicChannels[message.channel]) ? message.channel : "/cometd"+message.channel;
		dojo.event.topic.publish(tname, message);
	}

	this.disconnect = function(){
		this.currentTransport.disconnect();
	}

	// public API functions called by end users
	this.publish = function(/*string*/channel, /*object*/data, /*object*/properties){
		// summary: 
		//		publishes the passed message to the cometd server for delivery
		//		on the specified topic
		// channel:
		//		the destination channel for the message
		// data:
		//		a JSON object containing the message "payload"
		// properties:
		//		Optional. Other meta-data to be mixed into the top-level of the
		//		message
		var message = {
			data: data,
			channel: channel
		};
		if(properties){
			dojo.lang.mixin(message, properties);
		}
		return this.currentTransport.sendMessage(message);
	}

	this.subscribe = function(	/*string*/				channel, 
								/*boolean, optional*/	useLocalTopics, 
								/*object, optional*/	objOrFunc, 
								/*string, optional*/	funcName){ // return: boolean
		// summary:
		//		inform the server of this client's interest in channel
		// channel:
		//		name of the cometd channel to subscribe to
		// useLocalTopics:
		//		Determines if up a local event topic subscription to the passed
		//		function using the channel name that was passed is constructed,
		//		or if the topic name will be prefixed with some other
		//		identifier for local message distribution. Setting this to
		//		"true" is a good way to hook up server-sent message delivery to
		//		pre-existing local topics.
		// objOrFunc:
		//		an object scope for funcName or the name or reference to a
		//		function to be called when messages are delivered to the
		//		channel
		// funcName:
		//		the second half of the objOrFunc/funcName pair for identifying
		//		a callback function to notifiy upon channel message delivery
		if(objOrFunc){
			var tname = (useLocalTopics) ? channel : "/cometd"+channel;
			dojo.event.topic.subscribe(tname, objOrFunc, funcName);
		}
		// FIXME: would we handle queuing of the subscription if not connected?
		// Or should the transport object?
		return this.currentTransport.sendMessage({
			channel: "/meta/subscribe",
			subscription: channel
		});
	}

	this.unsubscribe = function(/*string*/				channel, 
								/*boolean, optional*/	useLocalTopics, 
								/*object, optional*/	objOrFunc, 
								/*string, optional*/	funcName){ // return: boolean
		// summary:
		//		inform the server of this client's disinterest in channel
		// channel:
		//		name of the cometd channel to subscribe to
		// useLocalTopics:
		//		Determines if up a local event topic subscription to the passed
		//		function using the channel name that was passed is destroyed,
		//		or if the topic name will be prefixed with some other
		//		identifier for stopping message distribution.
		// objOrFunc:
		//		an object scope for funcName or the name or reference to a
		//		function to be called when messages are delivered to the
		//		channel
		// funcName:
		//		the second half of the objOrFunc/funcName pair for identifying
		//		a callback function to notifiy upon channel message delivery
		if(objOrFunc){
			// FIXME: should actual local topic unsubscription be delayed for
			// successful unsubcribe notices from the other end? (guessing "no")
			// FIXME: if useLocalTopics is false, should we go ahead and
			// destroy the local topic?
			var tname = (useLocalTopics) ? channel : "/cometd"+channel;
			dojo.event.topic.unsubscribe(tname, objOrFunc, funcName);
		}
		return this.currentTransport.sendMessage({
			channel: "/meta/unsubscribe",
			subscription: channel
		});
	}
}

/*
transport objects MUST expose the following methods:
	- check
	- startup
	- sendMessage
	- deliver
	- disconnect
optional, standard but transport dependent methods are:
	- tunnelCollapse
	- tunnelInit

Transports SHOULD be namespaced under the cometd object and transports MUST
register themselves with cometd.connectionTypes

here's a stub transport defintion:

cometd.blahTransport = new function(){
	this.connected = false;
	this.connectionId = null;
	this.clientId = null;
	this.authToken = null;
	this.lastTimestamp = null;
	this.lastId = null;

	this.check = function(types){
		// summary:
		//		determines whether or not this transport is suitable given a
		//		list of transport types that the server supports
		return dojo.lang.inArray(types, "blah");
	}

	this.startup = function(){
		if(this.connected){ return; }
		// FIXME: fill in startup routine here
		this.connected = true;
	}

	this.sendMessage = function(message){
		// FIXME: fill in message sending logic
	}

	this.deliver = function(message){
		if(message["timestamp"]){
			this.lastTimestamp = message.timestamp;
		}
		if(message["id"]){
			this.lastId = message.id;
		}
		if(	(message.channel.length > 5)&&
			(message.channel.substr(0, 5) == "/meta")){
			// check for various meta topic actions that we need to respond to
			// switch(message.channel){
			// 	case "/meta/connect":
			//		// FIXME: fill in logic here
			//		break;
			//	// case ...: ...
			//	}
		}
	}

	this.disconnect = function(){
		if(!this.connected){ return; }
		// FIXME: fill in shutdown routine here
		this.connected = false;
	}
}
cometd.connectionTypes.register("blah", cometd.blahTransport.check, cometd.blahTransport);
*/

cometd.iframeTransport = new function(){
	this.connected = false;
	this.connectionId = null;
	this.clientId = null;

	this.rcvNode = null;
	this.rcvNodeName = "";
	this.phonyForm = null;
	this.authToken = null;
	this.lastTimestamp = null;
	this.lastId = null;

	this.check = function(types){
		return dojo.lang.inArray(types, "iframe");
	}

	this.tunnelInit = function(){
		// we've gotten our initialization document back in the iframe, so
		// now open up a connection and start passing data!
		this.postToIframe({
			message: dojo.json.serialize({
				channel:	"/meta/connect",
				clientId:	this.clientId
				// FIXME: auth not passed here!
				// "authToken": this.authToken
			})
		});
	}

	this.tunnelCollapse = function(){
		if(this.connected){
			// try to restart the tunnel
			this.connected = false;

			this.postToIframe({
				message: dojo.json.serialize({
					channel:	"/meta/reconnect",
					clientId:	this.clientId,
					connectionId:	this.connectionId,
					timestamp:	this.lastTimestamp,
					id:			this.lastId
					// FIXME: no authToken provision!
				})
			});
		}
	}

	this.deliver = function(message){
		// handle delivery details that this transport particularly cares
		// about. Most functions of should be handled by the main cometd object
		// with only transport-specific details and state being tracked here.
		if(message["timestamp"]){
			this.lastTimestamp = message.timestamp;
		}
		if(message["id"]){
			this.lastId = message.id;
		}
		// check to see if we got a /meta channel message that we care about
		if(	(message.channel.length > 5)&&
			(message.channel.substr(0, 5) == "/meta")){
			// check for various meta topic actions that we need to respond to
			switch(message.channel){
				case "/meta/connect":
					if(!message.successful){
						dojo.debug("cometd connection error:", message.error);
						return;
					}
					this.connectionId = message.connectionId;
					this.connected = true;
					break;
				case "/meta/reconnect":
					if(!message.successful){
						dojo.debug("cometd reconnection error:", message.error);
						return;
					}
					this.connected = true;
					break;
				case "/meta/subscribe":
					if(!message.successful){
						dojo.debug("cometd subscription error for channel", message.channel, ":", message.error);
						return;
					}
					this.subscribed(message.channel);
					break;
			}
		}
	}

	this.widenDomain = function(domainStr){
		// allow us to make reqests to the TLD
		var cd = domainStr||document.domain;
		if(cd.indexOf(".")==-1){ return; } // probably file:/// or localhost
		var dps = cd.split(".");
		if(dps.length<=2){ return; } // probably file:/// or an RFC 1918 address
		dps = dps.slice(dps.length-2);
		document.domain = dps.join(".");
	}

	this.postToIframe = function(content, url){
		if(!this.phonyForm){
			if(dojo.render.html.ie){
				this.phonyForm = document.createElement("<form enctype='application/x-www-form-urlencoded' method='POST' style='display: none;'>");
				dojo.body().appendChild(this.phonyForm);
			}else{
				this.phonyForm = document.createElement("form");
				this.phonyForm.style.display = "none"; // FIXME: will this still work?
				dojo.body().appendChild(this.phonyForm);
				this.phonyForm.enctype = "application/x-www-form-urlencoded";
				this.phonyForm.method = "POST";
			}
		}

		this.phonyForm.action = url||cometd.url;
		this.phonyForm.target = this.rcvNodeName;
		this.phonyForm.setAttribute("target", this.rcvNodeName);

		while(this.phonyForm.firstChild){
			this.phonyForm.removeChild(this.phonyForm.firstChild);
		}

		for(var x in content){
			var tn;
			if(dojo.render.html.ie){
				tn = document.createElement("<input type='hidden' name='"+x+"' value='"+content[x]+"'>");
				this.phonyForm.appendChild(tn);
			}else{
				tn = document.createElement("input");
				this.phonyForm.appendChild(tn);
				tn.type = "hidden";
				tn.name = x;
				tn.value = content[x];
			}
		}
		this.phonyForm.submit();
	}

	this.sendMessage = function(message){
		// FIXME: what about auth fields?
		message.connectionId = this.connectionId;
		message.clientId = this.clientId;
		var bindArgs = {
			url: root||djConfig["cometdRoot"],
			method: "POST",
			mimetype: "text/json",
			content: { message: dojo.json.serialize(message) }
		};
		return dojo.io.bind(bindArgs);
	}

	this.startup = function(handshakeData){
		dojo.debug("startup!");
		dojo.debug(dojo.json.serialize(handshakeData));

		if(this.connected){ return; }

		this.widenDomain();

		// NOTE: we require the server to cooperate by hosting
		// cometdInit.html at the designated endpoint
		this.rcvNodeName = "cometdRcv_"+cometd.getRandStr();
		// the "forever frame" approach
		var initUrl = cometd.url+"/?tunnelInit=iframe&domain="+document.domain;
		if(false && dojo.render.html.ie){ // FIXME: DISALBED FOR NOW
			// use the "htmlfile hack" to prevent the background click junk
			this.rcvNode = new ActiveXObject("htmlfile");
			this.rcvNode.open();
			this.rcvNode.write("<html>");
			this.rcvNode.write("<script>document.domain = '"+document.domain+"'");
			this.rcvNode.write("</html>");
			this.rcvNode.close();

			var ifrDiv = this.rcvNode.createElement("div");
			this.rcvNode.appendChild(ifrDiv);
			this.rcvNode.parentWindow.dojo = dojo;
			ifrDiv.innerHTML = "<iframe src='"+initUrl+"'></iframe>"
		}else{
			this.rcvNode = dojo.io.createIFrame(this.rcvNodeName, "", initUrl);
			// dojo.io.setIFrameSrc(this.rcvNode, initUrl);
			// we're still waiting on the iframe to call back up to use and
			// advertise that it's been initialized via tunnelInit
		}
	}
}
cometd.connectionTypes.register("iframe", cometd.iframeTransport.check, cometd.iframeTransport);

// FIXME: need to implement long-poll, IE XML block, and the Moz/Safari multipart-replace transports
