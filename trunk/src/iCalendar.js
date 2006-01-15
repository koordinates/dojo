dojo.provide("dojo.iCalendar");
dojo.provide("dojo.iCalendar.Component");
dojo.provide("dojo.iCalendar.Property");
dojo.require("dojo.text.textDirectory");

/* Dojo iCalendar support, adapted from Paul Sowden's icalendar work */

/** an iCalendar object */
dojo.iCalendar = function (calbody) {

	// ugly ugly way to inherit
	for (prop in dojo.iCalendar.Component.prototype) {
		this[prop] = dojo.iCalendar.Component.prototype[prop];
	}

	dojo.iCalendar.Component.call(this, "VCALENDAR", calbody);
}

dojo.iCalendar.Component = function (name, body) {
	this.name = name;
	this.properties = [];
	this.components = [];

	for (var i = 0, context = ''; i < body.length; i++) {
		if (context == '') {
			if (body[i].name == 'BEGIN') {
				context = body[i].value;
				var childprops = [];
			} else {
				this.addProperty(new dojo.iCalendar.Property(body[i]));
			}
		} else if (body[i].name == 'END' && body[i].value == context) {
			this.addComponent(new dojo.iCalendar.Component(context, childprops));
			context = '';
		} else {
			childprops.push(body[i]);
		}
	}
}

dojo.iCalendar.Component.prototype.addProperty = function (prop) {
	this.properties.push(prop);
	this[prop.name.toLowerCase()] = prop;
}

dojo.iCalendar.Component.prototype.addComponent = function (prop) {
	this.components.push(prop);
}

dojo.iCalendar.Component.prototype.toString = function () {
	return "[iCalendar.Component; " + this.name + ", " + this.properties.length +
		" properties, " + this.components.length + " components]";
}

dojo.iCalendar.Property = function (prop) {
	// unpack the values
	this.name = prop.name;
	this.group = prop.group;
	this.params = prop.params;
	this.value = prop.value;
}

dojo.iCalendar.Property.prototype.toString = function () {
	return "[iCalenday.Property; " + this.name + ": " + this.value + "]";
}

/** an iCalendar object is basically a Component */

/** read an iCal directory file */
dojo.iCalendar.fromText = function (text) {

	var properties = dojo.textDirectoryTokeniser.tokenise(text);
	var calendars = [];

	for (var i = 0, begun = false; i < properties.length; i++) {
		var prop = properties[i];
		//dojo.debug("Property Name: " + prop.name + " = " + prop.value);
		if (!begun) {
			if (prop.name == 'BEGIN' && prop.value == 'VCALENDAR') {
				begun = true;
				var calbody = [];
			}
		} else if (prop.name == 'END' && prop.value == 'VCALENDAR') {
			calendars.push(new dojo.iCalendar(calbody));
			begun = false;
		} else {
			calbody.push(prop);
		}
	}
	return calendars;
}

/*
 * Here is a whole load of stuff that could go towards making this
 * class validating, but right now I'm not caring
 */

/*


dojo.iCalendar.VEVENT = function () {}

dojo.iCalendar.VEVENT.prototype.addProperty = function (prop) {

}

dojo.iCalendar.VTODO = function () {}
dojo.iCalendar.VJOURNAL = function () {}
dojo.iCalendar.VFREEBUSY = function () {}
dojo.iCalendar.VTIMEZONE = function () {}

var _ = function (n, oc, req) {
	return {name: n, required: (req) ? true : false,
		occurance: (oc == '*' || !oc) ? -1 : oc}
}

var VEVENT = [
	// these can occur once only
	_("class", 1), _("created", 1), _("description", 1), _("dtstart", 1),
	_("geo", 1), _("last-mod", 1), _("location", 1), _("organizer", 1),
	_("priority", 1), _("dtstamp", 1), _("seq", 1), _("status", 1),
	_("summary", 1), _("transp", 1), _("uid", 1), _("url", 1), _("recurid", 1),
	// these two are exclusive
	[_("dtend", 1), _("duration", 1)],
	// these can occur many times over
	_("attach"), _("attendee"), _("categories"), _("comment"), _("contact"),
	_("exdate"), _("exrule"), _("rstatus"), _("related"), _("resources"),
	_("rdate"), _("rrule")
]


var VTODO = [
	// these can occur once only
	_("class", 1), _("completed", 1), _("created", 1), _("description", 1),
	_("dtstart", 1), _("geo", 1), _("last-mod", 1), _("location", 1),
	_("organizer", 1), _("percent", 1), _("priority", 1), _("dtstamp", 1),
	_("seq", 1), _("status", 1), _("summary", 1), _("uid", 1), _("url", 1),
	_("recurid", 1),
	// these two are exclusive
	[_("due", 1), _("duration", 1)],
	// these can occur many times over
	_("attach"), _("attendee"), _("categories"), _("comment"), _("contact"),
	_("exdate"), _("exrule"), _("rstatus"), _("related"), _("resources"),
	_("rdate"), _("rrule")
]

var VJOURNAL = [
	// these can occur once only
	_("class", 1), _("created", 1), _("description", 1), _("dtstart", 1),
	_("last-mod", 1), _("organizer", 1), _("dtstamp", 1), _("seq", 1),
	_("status", 1), _("summary", 1), _("uid", 1), _("url", 1), _("recurid", 1),
	// these can occur many times over
	_("attach"), _("attendee"), _("categories"), _("comment"), _("contact"),
	_("exdate"), _("exrule"), _("related"), _("rstatus"), _("rdate"), _("rrule")
]

var VFREEBUSY = [
	// these can occur once only
	_("contact"), _("dtstart", 1), _("dtend"), _("duration"),
	_("organizer", 1), _("dtstamp", 1), _("uid", 1), _("url", 1),
	// these can occur many times over
	_("attendee"), _("comment"), _("freebusy"), _("rstatus")
]

var VTIMEZONE = [
	_("tzid", 1, true), _("last-mod", 1), _("tzurl", 1)

	// one of 'standardc' or 'daylightc' must occur
	// and each may occur more than once.
]

var STANDARD = [
	_("dtstart", 1, true), _("tzoffsett", 1, true), _("tzoffsetfrom", 1, true),
	_("comment"), _("rdate"), _("rrule"), _("tzname")];
var daylight = standard;

var VALARM = [

[_("action", 1, true), _("trigger", 1, true), [_("duration", 1), _("repeat", 1)],
_("attach", 1)];
                
[_("action", 1, true), _("description", 1, true), _("trigger", 1, true),
[_("duration", 1), _("repeat", 1)]];

[_("action", 1, true), _("description", 1, true), _("trigger", 1, true),
_("summary", 1, true), _("attendee", "*", true),
[_("duration", 1), _("repeat", 1)],
_("attach", 1)];

[_("action", 1, true), _("attach", 1, true), _("trigger", 1, true),
[_("duration", 1), _("repeat", 1)],
_("description", 1)];

]*/
