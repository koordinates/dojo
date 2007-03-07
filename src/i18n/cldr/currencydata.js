dojo.provide("dojo.i18n.cldr.currencydata");

dojo.i18n.cldr.currencydata.getData = function(code){
// summary: A mapping of currency code to currency-specific formatting information. Returns an object with places and rounding.
// code: an iso4217 currency code

// from http://www.unicode.org/cldr/data/common/supplemental/supplementalData.xml:supplementalData/currencyData/fractions

	var placesData = {
		ADP:0,BHD:3,BIF:0,BYR:0,CLF:0,CLP:0,DJF:0,ESP:0,GNF:0,
		IQD:3,ITL:0,JOD:3,JPY:0,KMF:0,KRW:0,KWD:3,LUF:0,LYD:3,
		MGA:0,MGF:0,OMR:3,PYG:0,RWF:0,TND:3,TRL:0,VUV:0,XAF:0,
		XOF:0,XPF:0
	};

	var roundingData = {CHF:5};

	var places = placesData[code], rounding = roundingData[code];
	if (typeof places == "undefined"){ places = 2; }
	if (typeof rounding == "undefined"){ rounding = 0; }

	return {places: places, rounding: rounding}; // Object
};
