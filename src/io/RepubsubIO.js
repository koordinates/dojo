repubsub = new function(){
	this.peerAware = false;
	this.initDoc = "init.html";
	this.isInitialized = false;
	this.subscriptionBacklog = [];
	this.debug = true;
	this.rcvNodeName = null;
	this.sndNodeName = null;
	this.rcvNode = null;
	this.sndNode = null;
	this.canRcv = false;
	this.canSnd = false;
	this.canLog = false;
	this.sndTimer = null;
	this.hasPeers = false;
	this.peerRef = null; 		// our transmission peer...
	this.peerWindowRef = null; 	// ...and its owner window
	this.dependants = []; 		// those who view us as their transmission peer
	this.windowRef = window; // FIXME: can/should this be dj_global?
	this.backlog = [];
	this.tunnelInitCount = 0;
	this.tunnelFrameKey = "tunnel_frame";
	this.serverBaseURL = location.protocol+"//"+location.host+location.pathname;
	this.logBacklog = [];
	this.getRandStr = function(){
		return Math.random().toString().substring(2, 10);
	}
	this.userid = "guest";
	this.tunnelID = this.getRandStr();
	this.attachPathList = [];
	this.topics = []; // list of topics we have listeners to

	// actually, now that I think about it a little bit more, it would sure be
	// useful to parse out the <script> src attributes. We're looking for
	// something with a "do_method=lib", since that's what would have included
	// us in the first place (in the common case).
	this.parseGetStr = function(){
		var baseUrl = document.location.toString();
		var params = baseUrl.split("?", 2);
		if(params.length > 1){
			var paramStr = params[1];
			var pairs = paramStr.split("&");
			var opts = [];
			for(var x in pairs){
				var sp = pairs[x].split("=");
				// FIXME: is this eval dangerous?
				try{
					opts[sp[0]]=eval(sp[1]);
				}catch(e){
					opts[sp[0]]=sp[1];
				}
			}
			return opts;
		}else{
			return [];
		}
	}

	// parse URL params and use them as default vals
	var getOpts = this.parseGetStr();
	for(var x in getOpts){
		// FIXME: should I be checking for undefined here before setting? Does
		//        that buy me anything?
		this[x] = getOpts[x];
	}

	if(!this["tunnelURI"]){
		this.tunnelURI = [	"/who/", escape(this.userid), "/s/", 
							this.getRandStr(), "/kn_journal"].join("");
		// this.tunnelURI = this.absoluteTopicURI(this.tunnelURI);
	}

	/*
	if (self.kn_tunnelID) kn.tunnelID = self.kn_tunnelID; // the server says
	if (kn._argv.kn_tunnelID) kn.tunnelID = kn._argv.kn_tunnelID; // the url says
	*/

	// check the options object if it exists and use its properties as an
	// over-ride
	if(window["repubsubOpts"]||window["rpsOpts"]){
		var optObj = window["repubsubOpts"]||window["rpsOpts"];
		for(var x in optObj){
			this[x] = optObj[x]; // copy the option object properties
		}
	}

	/*
	if((getOpts["allowExceptions"])||(this["allowExceptions"])){
		__sig__.squelchSlotExceptions = false;
	}
	*/

	// things that get called directly from our iframe to inform us of events
	this.tunnelCloseCallback = function(){
		// when we get this callback, we should immediately attempt to re-start
		// our tunnel connection
		this.setIFrameSRC(this.rcvNode, this.initDoc+"?callback=repubsub.rcvNodeReady&domain="+document.domain);
	}

	this.receiveEventFromTunnel = function(evt, srcWindow){
		// we should never be getting events from windows we didn't create
		// NOTE: events sourced from the local window are also supported for
		// 		 debugging purposes

		// any event object MUST have a an "elements" property
		if(!evt["elements"]){
			this.log("bailing! event received without elements!", "error");
			return;
		}

		// if the event passes some minimal sanity tests, we need to attempt to
		// dispatch it!

		// first, it seems we have to munge the event object a bit
		var e = {};
		for(var i=0; i<evt.elements.length; i++){
			var ee = evt.elements[i];
			e[ee.name||ee.nameU] = (ee.value||ee.valueU);
			// FIXME: need to enable this only in some extreme debugging mode!
			this.log("[event]: "+(ee.name||ee.nameU)+": "+e[ee.name||ee.nameU]);
		}

		// NOTE: the previous version of this library put a bunch of code here
		// to manage state that tried to make sure that we never, ever, lost
		// any info about an event. If we unload RIGHT HERE, I don't think it's
		// going to make a huge difference one way or another. Time will tell.

		// and with THAT out of the way, dispatch it!
		this.dispatch(e);

		// TODO: remove the script block that created the event obj to save
		// memory, etc.
	}

	// FIXME: only define if NW is not available!!! Need to strip out at build
	//        time for NW-included blocks
	this.addNodeEvtHdlr = function(node, evtName, fp, capture){
		if(node.attachEvent){
			// NW_attachEvent_list.push([node, 'on' + evtName, fp]);
			node.attachEvent("on"+evtName, fp);
		}else if((node.addEventListener)&&(!dojo.render.html.khtml)){ 
			// Konq 3.1 tries to implement this, but it seems to be broken
			node.addEventListener(evtName, fp, capture);
			return true;
		}else{
			// NW_expando_list.push([node, 'on' + evtName]);

			// FIXME: this clobbers the event handler that's already set, is
			// there a way around it?
			node["on"+evtName]=fp;
			return true;
		}
	}

	this.widenDomain = function(domainStr){
		// the purpose of this is to set the most liberal domain policy
		// available
		var cd = domainStr||document.domain;
		if(cd.indexOf(".")==-1){ return; } // probably file:/// or localhost
		var dps = cd.split(".");
		if(dps.length<=2){ return; } // probably file:/// or an RFC 1918 address
		dps = dps.slice(dps.length-2);
		document.domain = dps.join(".");
	}

	this.parseCookie = function(){
		var cs = document.cookie;
		var keypairs = cs.split(";");
		for(var x=0; x<keypairs.length; x++){
			keypairs[x] = keypairs[x].split("=");
			if(x!=keypairs.length-1){ cs+=";"; }
		}
		return keypairs;
	}

	this.setCookie = function(keypairs, clobber){
		// NOTE: we want to only ever set session cookies, so never provide an
		// 		 expires date
		if((clobber)&&(clobber==true)){ document.cookie = ""; }
		var cs = "";
		for(var x=0; x<keypairs.length; x++){
			cs += keypairs[x][0]+"="+keypairs[x][1];
			if(x!=keypairs.length-1){ cs+=";"; }
		}
		document.cookie = cs;
	}

	this.findPeers = function(){
		this.hasPeers = false; 
		if(!this.peerAware){ 
			return this.hasPeers;
		}
		var kps = this.parseCookie();
		this.log(kps);
		var openTries = 0;
		for(var x=0; x<kps.length; x++){
			if(kps[x][0].toLowerCase()==this.tunnelFrameKey.toLowerCase()){
				if(kps[x][1].toLowerCase()!="closed"){
					openTries++;
					// if we have peers, we need to figure out how to
					// communicate with other instances

					// Sane browsers allow us to get direct references to
					// the window objects of the other frames (huzzah!) and
					// even do something with them if they're in the same
					// security domain.

					// FIXME: it seems that Safari gets very picky here. It'll
					// 		  give us a reference to the peer object, but
					// 		  accessing its window seems strictly verboten.
					// 		  Weird.

					// grab the window name from the cookie and get a ref to
					// that transit frame
					try{
						var tfref = window.open("", kps[x][1]);
						// var tfref = window.open("about:blank", kps[x][1]);

						this.peerWindowRef = tfref.parent;
						this.peerRef = tfref.parent["repubsub"];
						if(!this.peerRef){ // failure! keep looking.
							//odds are pretty high that this opened a new window, so clobber it
							try{ tfref.close(); }catch(e){} 
							continue; 
						}
						this.hasPeers = true;
						this.peerRef.learnPeer(this);
						this.log(this.peerRef.dependants.length);
						// this.log(kps[x][1]+" "+tfref+" "+this.peerRef.dependants.length);
						break;
					}catch(e){ 
						this.hasPeers = false;
						continue; 
					}
				}
			}
		}
		return this.hasPeers;
	}

	// only the window with the comm iframes open ever needs to know
	this.learnPeer = function(peerObj){
		// first, check to make sure we don't already have one of these as a
		// member
		for(var x=0; x<this.dependants.length; x++){ // O(n) time
			if(peerObj===this.dependants[x]){
				return x;
			}
		}

		this.dependants.push(peerObj);
		this.log(this.dependants.length);
		return this.dependants.length-1;

		// when we learn, we also need to make sure we clear out deadwood
		// this.clobberDeadDependants();
	}

	this.clobberDeadDependants = function(){
		for(var x=0; x<this.dependants.length; x++){
			if(typeof this.dependants[x] != "object"){
				delete this.dependants[x];	
			}
		}
	}

	this.informPeersOfDemise = function(){
		if(this.rcvNode){
			this.informPeersOfDemiseAsLeader();
		}else{
			this.informPeersOfDemiseAsDependant();
		}
	}

	this.informPeersOfDemiseAsDependant = function(){
		// FIXME: do we really need to do anything here?
		this.peerRef.clobberDeadDependants();
	}

	this.informPeersOfDemiseAsLeader = function(){
		// first, we have to tell one of the peers to take over and give it
		// enough context to do that.

		// Q: could we hit a race condition with window closure for our iframes
		// 	  vs. path queue requests through a new iframe comm layer? How does
		// 	  that hurt the session concept?

		var electee = null;
		while((!electee)&&(this.dependants.length)){
			electee = this.dependants.shift();
		}

		// TODO: determine what happens when I have a leader in one tab, a
		// 		 follower in another, and a second follower in a new window and
		// 		 I close the window containing the leader and the first
		// 		 follower. Will we "bounce" twice correctly?
		var dl = [];
		while(this.dependants.length){
			this.log(this.dependants.length);
			var td = this.dependants.shift();
			if(td){
				dl.push(td);
			}
		}

		// now that we've got a reasonable target, lets prune the list for
		// passing
		if((electee)&&(electee["initOnDemise"])){
			electee.initOnDemise(dl, this.backlog, this.topics);
		}
	}

	this.log = function(str, lvl){
		if(!this.debug){ return; } // we of course only care if we're in debug mode
		while(this.logBacklog.length>0){
			if(!this.canLog){ break; }
			var blo = this.logBacklog.shift();
			this.writeLog("["+blo[0]+"]: "+blo[1], blo[2]);
		}
		// FIXME: make this async and run off a timer!
		this.writeLog(str, lvl);
	}

	this.writeLog = function(str, lvl){
		// use __log__ if available
		if(!window["__log__"]){
			var tc = (new Date()).toLocaleTimeString();
			try{
				with(document){
					body.appendChild(createElement("br"));
					body.appendChild(createTextNode(tc+": "+str));
				}
				this.canLog = true;
			}catch(e){
				this.canLog = false;
				this.logBacklog.push([tc, str, lvl]);
			}
		}else{
			this.canLog = true;
			// FIXME: is this the right log level?
			if(!lvl){ lvl = "info"; }
			__log__[lvl](str);
			// __log__.info(str);
		}
	}

	this.init = function(){
		// FIXME: need to determine some way of determining other windows which
		//        may be open and getting a reference to them.
		// FIXME: need to register an onunload handler to pass this object
		//        around to the "survivor" window should this one go away.
		this.widenDomain();
		this.findPeers();
		if(!this.hasPeers){
			this.log("didn't find peers!");
			this.openTunnel();
		}
		this.isInitialized = true;
		while(this.subscriptionBacklog.length){
			this.subscribe.apply(this, this.subscriptionBacklog.shift());
		}
	}

	// the previously used comm window is about to up-and-die, and it's trying
	// to tell us about it. Pay attention, and open a new set of comm channels.
	// FIXME: need a way to handle the un-received responses to questions the
	// 		  closing window has pushed down. We'd want to transfer the request
	// 		  queue objects over to this new comm channel and we'll need to
	// 		  deal with the situation where a response might be in-progress but
	// 		  hasn't been dispatched yet. Does the protocol support querying
	// 		  listeners for this kind of info?
	this.initOnDemise = function(dependantList, backlog, subdTopics){
		this.peerRef = null;
		this.openTunnel();
		this.dependants = this.dependants.concat(dependantList);
		this.isInitialized = true;
		for(var x=0; x<this.dependants.length; x++){
			if(this.dependants[x]){
				try{
					this.dependants[x].learnNewPeerLeader(this);
				}catch(e){ /* IE requires that we squelch here */ }
			}
		}

		for(var x=0; x<backlog.length; x++){
			this.backlog.push(backlog[x]);
		}

		// we need to re-subscribe ourselves to the topics that:
		//		a.) we might already have local listeners for
		//		b.) our dying peer had subscriptions for
		for(var x=0; x<sudbTopics.length; x++){
			var topic = subdTopics[x];
			var subMe = true;
			for(var y=0; y<this.topics.length; y++){
				if(topic == this.topics[y]){
					subMe = false;
				}
			}
			if(subMe){
				this.topics.push(topic);

			}
		}
		for(var x=0; x<this.topics.length; x++){
			var topic = this.topics[x];
			this.log("resubbing to: "+topic);
			if(!this.attachPathList[topic]){
				this.attachPathList[topic] = function(){ return true; }
			}
			var revt = new pubsubEvent(this.tunnelURI, topic, "route");
			var rstr = [this.serverBaseURL+"/kn", revt.toGetString()].join("");
			this.log(rstr);
			this.sendTopicSubToServer(topic, rstr);
		}

	}

	this.learnNewPeerLeader = function(obj){
		// FIXME: what if we get a non-repubsub object? What's a good failure
		// 		  mode here?
		// NOTE: got it! we should check the cookie for the window name and
		// 		 attempt to get a reference that way (since it should have
		// 		 happened already at this point). If it hasn't, then we're
		// 		 well-and-truly fucked and might as well assume that we can
		// 		 attempt to make our own tunnel.
		this.peerRef = obj;
		this.peerWindowRef = obj.winRef;
		
		// re-connect any of our listeners to server-sent events. Our local
		// listeners don't need to be modified, but topics themselves do need
		// to be reconnected.
		for(var x=0; x<this.topics.length; x++){
			var tt = this.topics[x];
			__sig__.connect(this.peerRef.attachPathList, tt,
							this.attachPathList, tt);
		}
	}

	this.clobber = function(){
		if(this.rcvNode){
			this.setCookie( [
					[this.tunnelFrameKey,"closed"],
					["path","/"]
				], false 
			);
		}
		if(this.peerAware){
			this.informPeersOfDemise();
		}
	}

	this.openTunnel = function(){
		// We create two iframes here:

		// one for getting data
		this.rcvNodeName = "rcvIFrame_"+this.getRandStr();
		// set cookie that can be used to find the receiving iframe
		this.setCookie( [
				[this.tunnelFrameKey,this.rcvNodeName],
				["path","/"]
			], false
		);

		this.rcvNode = this.createIFrame(this.rcvNodeName);
		// FIXME: set the src attribute here to the initialization URL
		this.setIFrameSRC(this.rcvNode, this.initDoc+"?callback=repubsub.rcvNodeReady&domain="+document.domain);

		// the other for posting data in reply

		// if(!window["__env__"]){ 
			// if netWindows is available, we will use addToPageQueue instead.
			this.sndNodeName = "sndIFrame_"+this.getRandStr();
			this.sndNode = this.createIFrame(this.sndNodeName);
			// FIXME: set the src attribute here to the initialization URL
			this.setIFrameSRC(this.sndNode, this.initDoc+"?callback=repubsub.sndNodeReady&domain="+document.domain);
		// }

	}

	this.rcvNodeReady = function(){
		// FIXME: why is this sequence number needed? Why isn't the UID gen
		// 		  function enough?
        var statusURI = [this.tunnelURI, '/kn_status/', this.getRandStr(), '_', 
						 String(this.tunnelInitCount++)].join(""); 
            // (kn._seqNum++); // FIXME: !!!!
		// this.canRcv = true;
		this.log("rcvNodeReady");
		// FIXME: initialize receiver and request the base topic
		// this.setIFrameSRC(this.rcvNode, this.serverBaseURL+"/kn?do_method=blank");
		var initURIArr = [	this.serverBaseURL, "/kn?kn_from=", escape(this.tunnelURI),
							"&kn_id=", escape(this.tunnelID), "&kn_status_from=", 
							escape(statusURI)];
		// FIXME: does the above really need a kn_response_flush? won't the
		// 		  server already know? If not, what good is it anyway?
		this.setIFrameSRC(this.rcvNode, initURIArr.join(""));

		// setup a status path listener, but don't tell the server about it,
		// since it already knows we're itnerested in our own tunnel status
		this.subscribe(statusURI, this, "statusListener", true);

		this.log(initURIArr.join(""));
	}

	this.sndNodeReady = function(){
		this.canSnd = true;
		this.log("sndNodeReady");
		this.log(this.backlog.length);
		// FIXME: handle any pent-up send commands
		if(this.backlog.length > 0){
			this.dequeueEvent();
		}
	}

	this.statusListener = function(evt){
		this.log("status listener called");
		this.log(evt.status, "info");
	}

	this.createIFrame = function(fname) {
		// FIXME: this is borken on IE 5.0 for the PC. What can we do with
		// XMLHTTP to solve this, since it blocks hard and incremental read is
		// difficult.?
		var cframe = document.createElement((((dojo.render.html.ie)&&(dojo.render.os.win)) ? "<iframe name="+fname+">" : "iframe"));
		with(cframe){
			name = fname;
			setAttribute("name", fname);
			id = fname;
		}
		// try to make the frame accessable through a top-level variable. Avoid
		// walking on other top-level variables.
		if(!window[fname]){
			window[fname] = cframe;
		}else{
			// FIXME: what do we want to do here?
		}
		document.body.appendChild(cframe);
		with(cframe.style){
			position = "absolute";
			left = top = "0px";
			height = width = "1px";
			visibility = "hidden";
			if(this.debug){
				position = "relative";
				height = "100px";
				width = "300px";
				visibility = "visible";
			}
		}
		
		__sig__.connect(cframe, "onload", this, "cancelDOMEvent");
		this.setIFrameSRC(cframe, "about:blank");
		return cframe;
	}

	this.setIFrameSRC = function(iframe, src){
		var _is = dojo.render.html;
		if(_is.khtml){
			iframe.setAttribute("src", src);
		}else if(_is.opera){
			iframe.location.replace(src);
		}else{
			iframe.contentWindow.location.replace(src);
		}
	}

	this.cancelDOMEvent = function(evt){
		if(!evt){ return false; }
		if(evt.preventDefault){
			evt.stopPropagation();
			evt.preventDefault();
		}else{
			if(window.event){
				window.event.cancelBubble = true;
				window.event.returnValue = false;
			}
		}
		return false;
	}

	this.parseEvent = function(event){
		return event;
	}

	// this handles local event propigation
	this.dispatch = function(evt){
		// figure out what topic it came from
		if(evt["to"]||evt["kn_routed_from"]){
			var rf = evt["to"]||evt["kn_routed_from"];
			// split off the base server URL
			var topic = rf.split(this.serverBaseURL, 2)[1];
			if(!topic){
				// FIXME: how do we recover when we don't get a sane "from"? Do
				// we try to route to it anyway?
				topic = rf;
			}
			this.log("[topic] "+topic);
			if(topic.length>3){
				if(topic.slice(0, 3)=="/kn"){
					topic = topic.slice(3);
				}
			}
			if(this.attachPathList[topic]){
				this.attachPathList[topic](evt);
			}
		}
	}

	this.subscribe = function(	topic /* kn_from in the old terminilogy */, 
								toObj, toFunc, dontTellServer){
		if(!this.isInitialized){
			this.subscriptionBacklog.push([topic, toObj, toFunc, dontTellServer]);
			return;
		}
		if(!this.attachPathList[topic]){
			this.attachPathList[topic] = function(){ return true; }
			this.log("subscribing to: "+topic);
			this.topics.push(topic);
		}
		var revt = new pubsubEvent(this.tunnelURI, topic, "route");
		var rstr = [this.serverBaseURL+"/kn", revt.toGetString()].join("");
		__sig__.connectOnceByName(this.attachPathList, topic, toObj, toFunc);
		// NOTE: the above is a local mapping, if we're not the leader, we
		// 		 should connect our mapping to the topic handler of the peer
		// 		 leader, this ensures that not matter what happens to the
		// 		 leader, we don't really loose our heads if/when the leader
		// 		 goes away.
		if((!this.rcvNode)&&(this.peerRef)){
			// FIXME: is __sig__ connecting here really sane?
			// FIXME: need to determine if there are funky inter-window
			// 		  dependencies here. I don't think there are
			// 		  (addBareSignalByName seems very well behaved from that
			// 		  standpoint), but we need to be absolutely sure.
			__sig__.connectOnceByName(this.peerRef.attachPathList, topic,
							this.attachPathList, topic);
			// FIXME: we should only enqueue if this is our first subscription!
			this.peerRef.sendTopicSubToServer(topic, rstr);
		}else{
			if(dontTellServer){
				return;
			}

			this.log("sending subscription to: "+topic);

			// if we still care, create a subscription event object and give it
			// all the props we need to updates on the specified topic

			// FIXME: we should only enqueue if this is our first subscription!
			this.sendTopicSubToServer(topic, rstr);
		}
	}

	this.sendTopicSubToServer = function(topic, str){
		if(!this.attachPathList[topic]["subscriptions"]){
			this.enqueueEventStr(str);
			this.attachPathList[topic].subscriptions = 0;
		}
		this.attachPathList[topic].subscriptions++;
	}

	/*--> 
	<methodsynopsis>
		&public; &void; <methodname>unSubscribe</methodname>
		<methodparam>&str; <parameter>topic</parameter></methodparam>
		<methodparam>&obj; <parameter>listenerObj</parameter></methodparam>
		<methodparam>&str; <parameter>listenerFunc</parameter></methodparam>
	</methodsynopsis>
	<para role="methodinfo">
		Does what you'd expect.
	</para>
	<!--*/
	this.unSubscribe = function(topic, toObj, toFunc){
		// first, locally disconnect
		__sig__.disconnect(this.attachPathList, topic, toObj, toFunc);
		
		// FIXME: figure out if there are any remaining listeners to the topic,
		// 		  and if not, inform the server of our desire not to be
		// 		  notified of updates to the topic
	}

	/*--> 
	<methodsynopsis>
		&public; &void; <methodname>publish</methodname>
		<methodparam>&str; <parameter>topic</parameter></methodparam>
		<methodparam>&obj; <parameter>event</parameter></methodparam>
	</methodsynopsis>
	<para role="methodinfo">
		Sends the event to the server.
	</para>
	<!--*/
	// the "publish" method is really a misnomer, since it really means "take
	// this event and send it to the server". Note that the "dispatch" method
	// handles local event promigulation, and therefore we emulate both sides
	// of a real event router without having to swallow all of the complexity.
	this.publish = function(topic, event){
		if(!this.peerRef){
			var evt = pubsubEvent.initFromProperties(event);
			// FIXME: need to make sure we have from and to set correctly
			// 		  before we serialize and send off to the great blue
			// 		  younder.
			evt.to = topic;
			// evt.from = this.tunnelURI;

			var evtURLParts = [];
			evtURLParts.push(this.serverBaseURL+"/kn");

			// serialize the event to a string and then post it to the correct
			// topic
			evtURLParts.push(evt.toGetString());
			this.enqueueEventStr(evtURLParts.join(""));
		}else{
			// otherwise, forward our publish request to our inestimable peer
			this.peerRef.publish(topic, event);
		}
	}

	this.enqueueEventStr = function(evtStr){
		if(this.peerRef){
			this.peerRef.enqueueEventStr(evtStr);
			return;
		}
		this.log("enqueueEventStr");
		this.backlog.push(evtStr);
		this.dequeueEvent();
	}

	this.dequeueEvent = function(force){
		this.log("dequeueEvent");
		if(this.backlog.length <= 0){ return; }
		if((this.canSnd)||(force)){
			this.setIFrameSRC(this.sndNode, this.backlog.shift()+"&callback=repubsub.sndNodeReady");
			this.canSnd = false;
		}else{
			this.log("sndNode not available yet!", "debug");
		}
	}
}

function pubsubEvent(to, from, method, id, routeURI, payload, dispname, uid){
	this.to = to;
	this.from = from;
	this.method = method||"route";
	this.id = id||repubsub.getRandStr();
	this.uri = routeURI;
	this.displayname = dispname||repubsub.displayname;
	this.userid = uid||repubsub.userid;
	this.payload = payload||"";
	this.flushChars = 4096;
}

pubsubEvent.prototype.properties = [["from", "kn_from"], ["to", "kn_to"], 
									["method", "do_method"], ["id", "kn_id"], 
									["uri", "kn_uri"], 
									["displayname", "kn_displayname"], 
									["userid", "kn_userid"], 
									["payload", "kn_payload"],
									["flushChars", "kn_response_flush"],
									["responseFormat", "kn_response_format"] ];

// maps properties from their old names to their new names...
pubsubEvent.prototype.forwardPropertiesMap = {};
// ...and vice versa...
pubsubEvent.prototype.reversePropertiesMap = {};

// and we then populate them both from the properties list
for(var x=0; x<pubsubEvent.prototype.properties.length; x++){
	var tp = pubsubEvent.prototype.properties[x];
	pubsubEvent.prototype.reversePropertiesMap[tp[0]] = tp[1];
	pubsubEvent.prototype.forwardPropertiesMap[tp[1]] = tp[0];
}

pubsubEvent.prototype.initFromProperties = function(evt){
	if(evt.constructor = pubsubEvent){ 
		for(var x in evt){
			this[x] = evt[x];
		}
	}else{
		// we want to copy all the properties of the evt object, and transform
		// those that are "stock" properties of pubsubEvent. All others should
		// be copied as-is
		for(var x in evt){
			if(typeof this.forwardPropertiesMap[x] == "string"){
				this[this.forwardPropertiesMap[x]] = evt[x];
			}else{
				this[x] = evt[x];
			}
		}
		/*
		// this is the old way, which only copies known properties into the
		// event object. This is sub-optimal.
		for(var x=0; x<this.properties.length; x++){
			var tp = this.properties[x][0];
			if(evt[tp]){
				this[tp] = evt[tp];
			}
		}
		*/
	}
}

pubsubEvent.prototype.toGetString = function(noQmark){
	var qs = [ ((noQmark) ? "" : "?") ];
	for(var x=0; x<this.properties.length; x++){
		var tp = this.properties[x];
		if(this[tp[0]]){
			qs.push(tp[1]+"="+encodeURIComponent(String(this[tp[0]])));
		}
		// FIXME: we need to be able to serialize non-stock properties!!!
	}
	return qs.join("&");
}

// static version of initFromProperties, creates new event and object and
// returns it after init
pubsubEvent.initFromProperties = function(evt){
	var eventObj = new pubsubEvent();
	eventObj.initFromProperties(evt);
	return eventObj;
}

// initialize when we hit onload()
// FIXME: need to make this conditional on something or other
__sig__.connect(window, "onload", repubsub, "init");
__sig__.connect(window, "onunload", repubsub, "clobber");

