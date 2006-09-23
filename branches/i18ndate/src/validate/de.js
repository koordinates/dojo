dojo.provide("dojo.validate.de");
dojo.require("dojo.validate.common");

/**
  Validates German currency.

  @param value  A string.
  @return  true or false.
*/
dojo.validate.isGermanCurrency = function(value) {
	var flags = {
		symbol: "\u20AC",
		placement: "after",
		decimal: ",",
		separator: "."
	};
	return dojo.validate.isCurrency(value, flags);
}


