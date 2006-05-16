dojo.provide("dojo.validate.us");
dojo.require("dojo.regexp");

/**
  Validates U.S. currency.

  @param value  A string.
  @param flags  An object.
    flags in validate.isCurrency can be applied.
  @return  true or false.
*/
dojo.validate.us.isCurrency = function(value, flags) {
	return dojo.validate.isCurrency(value, flags);
}
