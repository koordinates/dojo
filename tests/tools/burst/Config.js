/**
* @file Config.js
*
* Defines the class <var>burst.Config</var> and global <var>bu_Config</var> .
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

bu_require('burst.Config', ['burst.props.AbstractProperties', 'burst.reflect.PropertyDef']);

/**
This is an associative array from fully-qualified property names to values.
It is undefined unless the application defines it prior to library loading.
*/
//:GLVAR Object bu_AppConfig
// actually declared earlier
//var bu_AppConfig;

/**
* Singleton class for the global variable <var>bu_Config</var>, which holds configuration.
*/
//:CLBEGIN burst.Config extends burst.props.GroupProperties

/**
* Constructor.
 */
//:CLCONSTRUCT burst.Config()
burst.Config = function() {
  var instances = [];

  // if not disabled, it goes first, overriding any others
  var url_instance;
  if (!this.urlConfigDisabled() && typeof window != 'undefined') {
    var qs = window.location.search;
    url_instance = new burst.props.QueryStringProperties(qs);
    instances.push(url_instance);
  }

  var app_instance;
  if (typeof bu_AppConfig != 'undefined') {
    app_instance = new burst.props.MapProperties(bu_AppConfig);
    instances.push(app_instance);
  }
  bu_debug("calling burst.props.GroupProperties with instances: ", instances);
  burst.props.GroupProperties.call(this, instances);
}
burst.MOP.inherits(burst.Config, burst.props.GroupProperties);

function bu_app_config_is_true(propname) {
   return (typeof bu_AppConfig != 'undefined' && typeof bu_AppConfig[propname] != 'undefined' && 
      (bu_AppConfig[propname] == true || bu_AppConfig[propname] == 'true'));
}

burst.Config.prototype.allDisabled = function() {return bu_app_config_is_true('allDisabled')};
burst.Config.prototype.urlConfigDisabled = function() {return bu_app_config_is_true('urlConfigDisabled')};


burst.Config.PROP_DEFS = [
//:CPROPERTYDEFS
  new burst.reflect.PropertyDefBoolean({
    name: 'allDisabled',
    defaultValue: false,
    description: "Prevents any configuration or processing by the library." 
  }),
  new burst.reflect.PropertyDefBoolean({
    name: 'urlConfigDisabled',
    defaultValue: false,
    description: "Prevents reading any config from the window url"
  })
//:ENDPROPERTYDEFS
];

//:CLEND burst.Config

/**
The global variable bu_Config which is a burst.props.AbstractProperties instance.
It consists of these sources of global configuration:
- bu_AppConfig, a hash only used by the application, and must already be set.
- if not prohibited by bu_AppConfig['burst.Config.disableUrlConfig'], add any (prefixed) properties from the current url query string.
*/
//:GLVAR burst.Config bu_Config = new burst.Config()
var bu_Config = new burst.Config();

// notify all scripts that they can take their config now.
bu_ScriptLoader.setConfigEvent();

bu_loaded('burst.Config');
