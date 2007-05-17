dojo.provide("dojo.widget.YahooMap");
dojo.provide("dojo.widget.YahooMap.Controls");
dojo.require("dojo.widget.*");

dojo.widget.defineWidget(
	"dojo.widget.YahooMap",
	dojo.widget.Widget,
	{ isContainer: false }
);

dojo.widget.YahooMap.Controls={
	MapType:"maptype",
	Pan:"pan",
	ZoomLong:"zoomlong",
	ZoomShort:"zoomshort"
};
dojo.requireAfterIf("html", "dojo.widget.html.YahooMap");
