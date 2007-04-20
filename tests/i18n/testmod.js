dojo.provide("tests.i18n.testmod");
dojo.require('dojo.i18n.common');
dojo.requireLocalization("tests.i18n","salutations");

tests.i18n.testmod = {
	salutations: dojo.i18n.getLocalization("tests.i18n", "salutations") 
}

