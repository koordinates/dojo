dojo.provide("dojo.validate.us");
dojo.require("dojo.validate.common");

/**
  Validates German currency.

  @param value  A string.
  @return  true or false.
*/
dojo.validate.isGermanCurrency = function(value) {
	flags = {
		symbol: "�",
		placement: "after",
		decimal: ",",
		separator: "."
	};
	return dojo.validate.isCurrency(value, flags);
}


