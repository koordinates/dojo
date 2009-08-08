// This is an example of a bundle that eliminates the need for
// wrapping module code in - required - calls (and eliminates redundancy.)

// These three are currently required (using the - require - method) in the date and currency modules.
// Those should ultimately be changed to - required - calls (without the new function argument.)
// That will eliminate the extra - require - calls that currently log redundancy warnings in debug mode.

dojo.require('dojo.i18n');
dojo.require('dojo.string');
dojo.require('dojo.regexp');

// NOTE: dojo.date is loaded automatically

dojo.require('dojo.date.locale');

// NOTE: dojo.number is included with dojo.currency

dojo.require('dojo.currency');