dojo.provide("dojo.iCalendar");
dojo.require("dojo.text.textDirectory");
dojo.require("dojo.date");


dojo.iCalendar.fromText =  function (/* string */text) {
	// summary
	// Parse text of an iCalendar and return an array of iCalendar objects

	var properties = dojo.textDirectoryTokeniser.tokenise(text);
	var calendars = [];

	dojo.debug("Parsing iCal String");
	for (var i = 0, begun = false; i < properties.length; i++) {
		var prop = properties[i];
		//dojo.debug("Property Name: " + prop.name + " = " + prop.value);
		if (!begun) {
			if (prop.name == 'BEGIN' && prop.value == 'VCALENDAR') {
				begun = true;
				var calbody = [];
			}
		} else if (prop.name == 'END' && prop.value == 'VCALENDAR') {
			calendars.push(new dojo.iCalendar.VCalendar(calbody));
			begun = false;
		} else {
			calbody.push(prop);
		}
	}
	dojo.debug("Returning from fromText");
	return /* array */calendars;
}


dojo.iCalendar.Component = function (/* string */ body ) {
	// summary
	// A component is the basic container of all this stuff. 

	if (!this.name) {
		this.name = "COMPONENT"
	}

	this.properties = [];
	this.components = [];

	//dojo.debug("In dojo.iCalendar.Component");
	if (body) {
		for (var i = 0, context = ''; i < body.length; i++) {
			if (context == '') {
				if (body[i].name == 'BEGIN') {
					context = body[i].value;
					var childprops = [];
					dojo.debug("Context: " + context);
				} else {
					this.addProperty(new dojo.iCalendar.Property(body[i]));
				}
			} else if (body[i].name == 'END' && body[i].value == context) {
				if (context=="VEVENT") {
					this.addComponent(new dojo.iCalendar.VEvent(childprops));
				} else if (context=="VTIMEZONE") {
					this.addComponent(new dojo.iCalendar.VTimeZone(childprops));
				} else if (context=="VTODO") {
					this.addComponent(new dojo.iCalendar.VTodo(childprops));
				} else if (context=="VJOURNAL") {
					this.addComponent(new dojo.iCalendar.VJournal(childprops));
				} else if (context=="VFREEBUSY") {
					this.addComponent(new dojo.iCalendar.VFreeBusy(childprops));
				} else if (context=="STANDARD") {
					this.addComponent(new dojo.iCalendar.Standard(childprops));
				} else if (context=="DAYLIGHT") {
					this.addComponent(new dojo.iCalendar.Daylight(childprops));
				} else if (context=="VALARM") {
					this.addComponent(new dojo.iCalendar.VAlarm(childprops));
				}else {
					dojo.unimplemented("dojo.iCalendar." + context);
				}
				context = '';
			} else {
				childprops.push(body[i]);
			}
		}

		if (this._ValidProperties) {
			this.postCreate();
		}
	}
}

dojo.lang.extend(dojo.iCalendar.Component, {

	addProperty: function (prop) {
		// summary
		// push a new property onto a component.
		this.properties.push(prop);
		this[prop.name.toLowerCase()] = prop;
	},

	addComponent: function (prop) {
		// summary
		// add a component to this components list of children.
		this.components.push(prop);
	},

	postCreate: function() {
		//dojo.debug("Number of properties: " + this._ValidProperties.length);
		for (var x=0; x<this._ValidProperties.length; x++) {
			var evtProperty = this._ValidProperties[x];
			var found = false;
			//dojo.debug("Number of properties on this event: " + this.properties.length);
			for (var y=0; y<this.properties.length; y++) {	
				var prop = this.properties[y];
				if (dojo.lang.isArray(evtProperty)) {

					//dojo.debug("Evaluating: " + prop.name);
					//dojo.debug("This evtProperty can be one of " + evtProperty.length + " things");
					var alreadySet = false;
					for (var z=0; z<evtProperty.length; z++) {
						//dojo.debug("Checking for existsance of this." + evtProperty[z].name.toLowerCase());
						//if((this[evtProperty[z].name.toLowerCase()])  && (evtProperty[z].name.toLowerCase() != prop.name.toLowerCase())) {
						if(this[evtProperty[z].name.toLowerCase()]) {
							alreadySet=true;
							//dojo.debug(prop.name.toLowerCase() + " cannot be set because " + evtProperty[z].name.toLowerCase() + " is already set.");
						} 
					}
					if (!alreadySet) {
						this[prop.name.toLowerCase()] = prop;
						dojo.debug("Setting this." + prop.name.toLowerCase() + " to " + prop.value);
					}
				} else {
					//dojo.debug("here3: " + evtPropert + " " + prop.name.toLowerCase());
					if (prop.name.toLowerCase() == evtProperty.name.toLowerCase()) {
						found = true;
						if (evtProperty.occurance == 1){
							this[prop.name.toLowerCase()] = prop;
							dojo.debug("Setting this." + prop.name.toLowerCase() + " to " + prop.value);
						} else {
							found = true;
							if (!dojo.lang.isArray(this[prop.name.toLowerCase()])) {
							 	this[prop.name.toLowerCase()] = [];
							}
							//dojo.debug("propname: " + prop.name.toLowerCase());
							this[prop.name.toLowerCase()].push(prop);
							dojo.debug("Adding." + prop.name.toLowerCase() + " to " + prop.value );
						}
					}
				}
			}

			if (evtProperty.required && !found) {	
				dojo.debug("iCalendar - " + this.name + ": Required Property not found: " + evtProperty.name);
			}
		}
	}, 

	toString: function () {
		// summary
		// output a string representation of this component.
		return "[iCalendar.Component; " + this.name + ", " + this.properties.length +
			" properties, " + this.components.length + " components]";
	}
});

dojo.iCalendar.Property = function (prop) {
	// summary
	// A single property of a component.

	// unpack the values
	this.name = prop.name;
	this.group = prop.group;
	this.params = prop.params;
	this.value = prop.value;
}

dojo.lang.extend(dojo.iCalendar.Property, {
	toString: function () {	
		// summary
		// output a string reprensentation of this component.
		return "[iCalenday.Property; " + this.name + ": " + this.value + "]";
	}
});

// This is just a little helper function for the Component Properties
var _P = function (n, oc, req) {
	return {name: n, required: (req) ? true : false,
		occurance: (oc == '*' || !oc) ? -1 : oc}
}

/*
 * VCALENDAR
 */

dojo.iCalendar.VCalendar = function (/* string */ calbody) {
	// summary
	// VCALENDAR Component

	this.name = "VCALENDAR";
	dojo.iCalendar.Component.call(this, calbody);
}

dojo.inherits(dojo.iCalendar.VCalendar, dojo.iCalendar.Component);

dojo.lang.extend(dojo.iCalendar.VCalendar, {
	getEvents: function(/* Date */ date) {
		// summary
		// Gets all events occuring on a particular date
		month = date.getMonth() + 1;
		var tmp = date.getFullYear() + "-" + month + "-" + date.getDate();
		if (dojo.lang.isArray(this[tmp])) {
			return this[tmp];
		} 
		return null;			
	}
});



/*
 * STANDARD
 */

var StandardProperties = [
	_P("dtstart", 1, true), _P("tzoffsetto", 1, true), _P("tzoffsetfrom", 1, true),
	_P("comment"), _P("rdate"), _P("rrule"), _P("tzname")
];


dojo.iCalendar.Standard = function (/* string */ body) {
	// summary
	// STANDARD Component

	this.name = "STANDARD";
	this._ValidProperties = StandardProperties;
	dojo.iCalendar.Component.call(this, body);
}

dojo.inherits(dojo.iCalendar.Standard, dojo.iCalendar.Component);

/*
 * DAYLIGHT
 */

var DaylightProperties = [
	_P("dtstart", 1, true), _P("tzoffsetto", 1, true), _P("tzoffsetfrom", 1, true),
	_P("comment"), _P("rdate"), _P("rrule"), _P("tzname")
];

dojo.iCalendar.Daylight = function (/* string */ body) {
	// summary
	// Daylight Component
	this.name = "DAYLIGHT";
	this._ValidProperties = DaylightProperties;
	dojo.iCalendar.Component.call(this, body);
}

dojo.inherits(dojo.iCalendar.Daylight, dojo.iCalendar.Component);

/*
 * VEVENT
 */

var VEventProperties = [
	// these can occur once only
	_P("class", 1), _P("created", 1), _P("description", 1), _P("dtstart", 1),
	_P("geo", 1), _P("last-mod", 1), _P("location", 1), _P("organizer", 1),
	_P("priority", 1), _P("dtstamp", 1), _P("seq", 1), _P("status", 1),
	_P("summary", 1), _P("transp", 1), _P("uid", 1), _P("url", 1), _P("recurid", 1),
	// these two are exclusive
	[_P("dtend", 1), _P("duration", 1)],
	// these can occur many times over
	_P("attach"), _P("attendee"), _P("categories"), _P("comment"), _P("contact"),
	_P("exdate"), _P("exrule"), _P("rstatus"), _P("related"), _P("resources"),
	_P("rdate"), _P("rrule")
];

dojo.iCalendar.VEvent = function (/* string */ body) {
	// summary 
	// VEVENT Component
	this._ValidProperties = VEventProperties;
	this.name = "VEVENT";
	dojo.iCalendar.Component.call(this, body);
}

dojo.inherits(dojo.iCalendar.VEvent, dojo.iCalendar.Component);

dojo.lang.extend(dojo.iCalendar.VEvent, {
	addProperty: function(prop) {
		// summary
		// push a new property onto a component.

		this.properties.push(prop);
		this[prop.name.toLowerCase()] = prop;
	}
});

/*
 * VTIMEZONE
 */

var VTimeZoneProperties = [
	_P("tzid", 1, true), _P("last-mod", 1), _P("tzurl", 1)

	// one of 'standardc' or 'daylightc' must occur
	// and each may occur more than once.
];

dojo.iCalendar.VTimeZone = function (/* string */ body) {
	// summary
	// VTIMEZONE Component
	this.name = "VTIMEZONE";
	this._ValidProperties = VTimeZoneProperties;
	dojo.iCalendar.Component.call(this, body);
}

dojo.inherits(dojo.iCalendar.VTimeZone, dojo.iCalendar.Component);

/*
 * VTODO
 */

var VTodoProperties = [
	// these can occur once only
	_P("class", 1), _P("completed", 1), _P("created", 1), _P("description", 1),
	_P("dtstart", 1), _P("geo", 1), _P("last-mod", 1), _P("location", 1),
	_P("organizer", 1), _P("percent", 1), _P("priority", 1), _P("dtstamp", 1),
	_P("seq", 1), _P("status", 1), _P("summary", 1), _("uid", 1), _P("url", 1),
	_P("recurid", 1),
	// these two are exclusive
	[_P("due", 1), _P("duration", 1)],
	// these can occur many times over
	_P("attach"), _P("attendee"), _P("categories"), _P("comment"), _P("contact"),
	_P("exdate"), _P("exrule"), _P("rstatus"), _P("related"), _P("resources"),
	_P("rdate"), _P("rrule")
];

dojo.iCalendar.VTodo= function (/* string */ body) {
	// summary
	// VTODO Componenet
	this.name = "VTODO";
	this._ValidProperties = VTodoProperties;
	dojo.iCalendar.Component.call(this, body);
}

dojo.inherits(dojo.iCalendar.VTodo, dojo.iCalendar.Component);

/*
 * VJOURNAL
 */

var VJournalProperties = [
	// these can occur once only
	_P("class", 1), _P("created", 1), _P("description", 1), _P("dtstart", 1),
	_P("last-mod", 1), _P("organizer", 1), _P("dtstamp", 1), _P("seq", 1),
	_P("status", 1), _P("summary", 1), _P("uid", 1), _P("url", 1), _P("recurid", 1),
	// these can occur many times over
	_P("attach"), _P("attendee"), _P("categories"), _P("comment"), _P("contact"),
	_P("exdate"), _P("exrule"), _P("related"), _P("rstatus"), _P("rdate"), _P("rrule")
];

dojo.iCalendar.VJournal= function (/* string */ body) {
	// summary
	// VJOURNAL Component
	this.name = "VJOURNAL";
	this._ValidProperties = VJournalProperties;
	dojo.iCalendar.Component.call(this, body);
}

dojo.inherits(dojo.iCalendar.VJournal, dojo.iCalendar.Component);

/*
 * VFREEBUSY
 */

var VFreeBusyProperties = [
	// these can occur once only
	_P("contact"), _P("dtstart", 1), _P("dtend"), _P("duration"),
	_P("organizer", 1), _P("dtstamp", 1), _P("uid", 1), _P("url", 1),
	// these can occur many times over
	_P("attendee"), _P("comment"), _P("freebusy"), _P("rstatus")
];

dojo.iCalendar.VFreeBusy= function (/* string */ body) {
	// summary
	// VFREEBUSY Component
	this.name = "VFREEBUSY";
	this._ValidProperties = VFreeBusyProperties;
	dojo.iCalendar.Component.call(this, body);
}

dojo.inherits(dojo.iCalendar.VFreeBusy, dojo.iCalendar.Component);

/*
 * VALARM
 */

var VAlarmProperties = [
	[_P("action", 1, true), _P("trigger", 1, true), [_P("duration", 1), _P("repeat", 1)],
	_P("attach", 1)],

	[_P("action", 1, true), _P("description", 1, true), _P("trigger", 1, true),
	[_P("duration", 1), _P("repeat", 1)]],

	[_P("action", 1, true), _P("description", 1, true), _P("trigger", 1, true),
	_P("summary", 1, true), _P("attendee", "*", true),
	[_P("duration", 1), _P("repeat", 1)],
	_P("attach", 1)],

	[_P("action", 1, true), _P("attach", 1, true), _P("trigger", 1, true),
	[_P("duration", 1), _P("repeat", 1)],
	_P("description", 1)],
];

dojo.iCalendar.VAlarm= function (/* string */ body) {
	// summary
	// VALARM Component
	this.name = "VALARM";
	this._ValidProperties = VAlarmProperties;
	dojo.iCalendar.Component.call(this, body);
	dojo.debug(this.summary.value);
}

dojo.inherits(dojo.iCalendar.VAlarm, dojo.iCalendar.Component);

