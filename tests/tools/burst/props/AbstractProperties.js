/**
* @file AbstractProperties.js
* Defines burst.props.AbstractProperties and various subclasses.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

bu_require('burst.props.AbstractProperties', ['burst.MOP']);

//=java package burst.props;

/**
Abstract base class for anything that can hold named values.
Possible such sources of values are:
- a URL query string
- a DOM node's attributes
- an ECMAScript object acting as an associative array

There are many antecedants for such an interface.
Java alone seems to include yet another similar interface in every release
(java.util.Properties, java.util.prefs, javax.naming, etc.)

This interface has several deliberate decisions reflected in it:
<ul>
<li>It is a mapping from String names to String values. This differs from JNDI, which can lookup Object values.

<li>The getProperty() function is guaranteed to either return a non-empty trimmed String, or undefined.
It should never return null, '', or an all-white string.
This differs from some other systems that do not provide trimming guarantees, or that attempt
to distinguish an empty value from no value.

<li>It supports a naming hierarchy, but only a very simple one.
A <code>getSubProperty(prefix, name)</code> just does a <code>getProperty(prefix + '.' + name)</code>
(at least if the base class is not overridden).

<li>We do not mandate an iterator ability.

<li>Unless otherwise specified, name lookup is always case-sensitive.
</ul>

<p>
This class is designed to work with burst.reflect.PropertyDef, which can be used to convert a String
value from a AbstractProperties instance into some Object value.
It is possible to also use a AbstractProperties without burst.reflect.PropertyDef.

*/

//=java class AbstractProperties {

/** 
* protected constructor, only for use by subclasses.
* If an implicit_prefix is specified, then all names looked up via getPropertyImpl
* must have that prefix removed, and any name not starting with that prefix are
* not in this instance. If specified, this must typically have a trailing '.' in it.
* @param implicit_prefix Optional. If specified, the implicit prefix.
*/
//=java public AbstractProperties(String implicit_prefix) {}
burst.props.AbstractProperties = function(implicit_prefix) {
  this.implicit_prefix_ = typeof implicit_prefix == 'undefined' ? null : implicit_prefix;
}

/** 
 * Given a property name, returns either a non-empty trimmed String, or undefined.
 */
//=java public String getProperty(String name) {}
burst.props.AbstractProperties.prototype.getProperty = function(name) {
    if (this.implicit_prefix_) {
      if (burst.Text.startsWith(name, this.implicit_prefix_)) {
        name = name.substring(this.implicit_prefix_.length);
      }
      else {return BU_UNDEFINED;}
    }
    var s = this.getPropertyImpl(name);
    if (burst.Text.isWhite(s)) return BU_UNDEFINED;
    return burst.Text.trim(s);
}

/**
 * Same as <code>getProperty(prefix + '.' + name)</code> .
 */
//=java public String getSubProperty(String prefix, String name) {}
burst.props.AbstractProperties.prototype.getSubProperty = function(prefix, name) {
    return this.getProperty(prefix + '.' + name);
}

/**
 * A convenience to lookup a property string and parse it in one step.
 * First calls <code>str = getProperty(propdef.name)</code>.
 * Then it returns propdef.parse(str, dflt).
 *
 * @param propdef The property definition
 * @param dflt optional, defaults to undefined.
 * @return Same as burst.reflect.PropertyDef.parse
 * @throws burst.props.PropertyError
 */
//=java public Object getValue(burst.reflect.PropertyDef propdef, Object dflt) {}
burst.props.AbstractProperties.prototype.getValue = function(propdef, dflt) {
    return propdef.parse(this.getProperty(propdef.name), dflt);
}

/**
 * Like getValue, but uses getSubProperty.
 */
//=java public Object getSubValue(String prefix, burst.reflect.PropertyDef propdef, Object dflt) {}
burst.props.AbstractProperties.prototype.getSubValue = function(prefix, propdef, dflt) {
    return propdef.parse(this.getSubProperty(prefix, propdef.name), dflt);
}

/**
 * Convenience to set a member of some object from this burst.props.AbstractProperties source.
 * If the property is already defined in the destination object, 
 * then nothing is done and false is returned.
 * Otherwise getValue(propdef) is called. If it returns undefined, nothing
 * is done, and false is returned.
 * Else obj[name] is set to the result, and true is returned.
 *
 * Note that no defaulting is done with this function, either from a passed
 * in default value, or a static default from propdef.
 *
 * @param obj The object to set values in.
 * @param propdef The burst.reflect.PropertyDef defining the property in question.
 * @param prefix Optional. If specified, getSubValue is used instead of getValue.
 * @return true if a value was set.
 * @throws burst.props.PropertyError If the property string is not valid.
 */
//=java public Boolean setObjectValue(Object obj, burst.reflect.PropertyDef propdef, String prefix) {}
burst.props.AbstractProperties.prototype.setObjectValue = function(obj, propdef, prefix) {
   var name = propdef.name;
   if (typeof obj[name] != 'undefined') {
     bu_debug("(AbstractProperties.js) object already has a value for ", name, ": ", obj[name]);
     return false;
   }
   var v = (arguments.length > 2 && burst.Lang.isSpecified(prefix)) ? 
      this.getSubValue(prefix, propdef) : 
      this.getValue(propdef);
   if (typeof v == 'undefined') {
      bu_debug("(AbstractProperties.js) i have no value for ", name);
      return false;
   }
   bu_debug("(AbstractProperties.js) setting value for ", name, " to ", v);
   obj[name] = v;
   return true;
}

/**
 * Calls setObjectValue for each of the burst.reflect.PropertyDef in the Array.
 * Optionally, as a convenience, this function can also set any static
 * defaults (suitable if there are no more sources for dynamic values),
 * and/or can validate that the object has values for all mandatory  properties.
 * If prefix is specified, it is prepended to each property name in propdefs
 * prior looking up in this burst.props.AbstractProperties instance. Note that the prefix is not used when setting values
 *
 * @param obj The object to set.
 * @param propdefs The Array of burst.reflect.PropertyDef instances
 * @param prefix The prefix to use in front of each property name before looking up each value.
 * @param do_defaults optional. If true, also call burst.reflect.PropertyDef.setDefaultEach
 * @param do_mandatory optioal. If true, also call burst.reflect.PropertyDef.checkMandatoryEach
 * @return the obj argument
 * @throws burst.props.PropertyError If any property string used is not valid.
 */
//=java public Object setObjectValues(Object obj, Array propdefs, String prefix, Boolean do_defaults, Boolean do_mandatory);
burst.props.AbstractProperties.prototype.setObjectValues = function(obj, propdefs, prefix, do_defaults, do_mandatory) {
   bu_debug("in burst.props.AbstractProperties.prototype.setObjectValues(", " prefix=", prefix, " do_defaults=", do_defaults, " do_mandatory=", do_mandatory,")");
   var this_ = this;
   burst.Alg.for_each(propdefs, function(propdef) {
       this_.setObjectValue(obj, propdef, prefix)
   });
   if (do_defaults) burst.reflect.PropertyDef.setDefaultEach(obj, propdefs);
   if (do_mandatory) burst.reflect.PropertyDef.checkMandatoryEach(obj, propdefs);
   return obj;
}

/**
 * must be overridden by subclass.
 * Need not worry about trimming etc, as getProperty does that.
 */
//=java public abstract String getPropertyImpl(String name);


//:CLEND burst.props.AbstractProperties
//:NSEND



/**
 * Subclass of AbstractProperties that wraps a provided Object acting
 * as an associative array.
 */
//:CLBEGIN MapProperties extends AbstractProperties

/**
 * @param map the associative array, from name to value.
 * @param implicit_prefix Optional. If specified, the implicit prefix.
 */
//:CLCONSTRUCT burst.props.MapProperties(Object map, String implicit_prefix) : burst.props.AbstractProperties(implicit_prefix)
burst.props.MapProperties = function(map, implicit_prefix) {
    burst.props.AbstractProperties.call(this, implicit_prefix);
    this.map_ = map;
}

burst.MOP.inherits(burst.props.MapProperties, burst.props.AbstractProperties);

burst.props.MapProperties.prototype.getPropertyImpl = function(name) {
    return bu_get(this.map_, name);
}
//:CLEND burst.props.MapProperties


/**
 * Subclass of AbstractProperties that parses a URL-style query string.
 */
//:CLBEGIN QueryStringProperties extends AbstractProperties

/**
 * If the passed-in string starts with a '?' (as it might from window.location.search),
 * that is skipped.
 * @param qstring the query string
 * @param dup_handling Same interpretation as burst.URI.queryToMap
 * @param implicit_prefix Optional. If specified, the implicit prefix.
 */
//:CLCONSTRUCT burst.props.QueryStringProperties(String qstring, String dup_handling, String implicit_prefix) : burst.props.AbstractProperties(implicit_prefix)
burst.props.QueryStringProperties = function(qstring, dup_handling, implicit_prefix) {
    burst.props.AbstractProperties.call(this, implicit_prefix);
    if(!burst.Lang.isSpecified(qstring)) bu_throw("bad qstring: " + qstring);
    //if (qstring.length==0) bu_throw("empty qstring");
    if (qstring.length > 0 && qstring.charAt(0)=='?') qstring = qstring.substring(1);
    this.map_ = burst.URI.queryToMap(qstring, dup_handling);
}

burst.MOP.inherits(burst.props.QueryStringProperties, burst.props.AbstractProperties);

burst.props.QueryStringProperties.prototype.getPropertyImpl = function(name) {
   return bu_get(this.map_, name);
}
//:CLEND burst.props.QueryStringProperties


/**
 * Subclass of AbstractProperties that wraps a provided Array of other AbstractProperties instances.
 * It iterates through them, returning the first value found.
 */
//:CLBEGIN GroupProperties extends AbstractProperties

/**
 * @param instances the Array of instances
 * @param implicit_prefix Optional. If specified, the implicit prefix.
 */
//:CLCONSTRUCT burst.props.GroupProperties(Array instances, String implicit_prefix) : burst.props.AbstractProperties(implicit_prefix)
burst.props.GroupProperties = function(instances, implicit_prefix) {
    if (arguments.length == 0) return;
    burst.props.AbstractProperties.call(this, implicit_prefix);
    if (!burst.Lang.isSpecified(instances)) bu_throw("(AbstractProperties.js) no instances: " + instances);
    bu_debug("(AbstractProperties.js) burst.props.GroupProperties constructor with ", instances.length, " instances");
    this.instances_ = instances;
}

burst.MOP.inherits(burst.props.GroupProperties, burst.props.AbstractProperties);

burst.props.GroupProperties.prototype.getPropertyImpl = function(name) {
    // note that this uses getProperty, not getPropertyImpl
    // that means that the caller will redundantly clean up, but
    // it makes our logic much simpler.
    var i = 0;
    return burst.Alg.find_if_value(this.instances_, function(p) {
	bu_debug("(AbstractProperties.js) burst.props.GroupProperties.getPropertyImpl(", name, ") at i=", i++, " and value=", p.getProperty(name));
	return p.getProperty(name);
	});
}
//:CLEND burst.props.GroupProperties

/**
* Subclass of AbstractProperties that holds a subtree of another AbstractProperties instance
* starting with a specified prefix.
*/
//:CLBEGIN SubProperties extends AbstractProperties

/**
* @param parent_instance The instance to take a subtree of
* @param implicit_prefix The implicit prefix which is prepended before looking up in the wrapped instance.
*/
//:CLCONSTRUCT burst.props.SubProperties(burst.props.AbstractProperties parent_instance, String implicit_prefix) : burst.props.AbstractProperties(implicit_prefix)
burst.props.SubProperties = function(parent_instance, implicit_prefix) {
  if (arguments.length < 2 || !implicit_prefix) bu_throw("implicit_prefix must be specified");
  burst.props.AbstractProperties.call(this, implicit_prefix);
  this.parent_instance_ = instance;
}

burst.MOP.inherits(burst.props.SubProperties, burst.props.AbstractProperties);

burst.props.SubProperties.prototype.getPropertyImpl = function(name) {
  // superclass already prepended the implicit_prefix
  return this.parent_instance_.getPropertyImpl(name);
}

//:CLEND burst.props.SubProperties

/**
* Subclass of AbstractProperties that parses a string that mimics the syntax
* of a style attribute or CSS declaration body.
* For example: <pre>"fooBar: 1; title: 'some title'"</pre>
*/
//:CLBEGIN StyleProperties extends AbstractProperties

/**
 * @param csstext the string to parse.
 * @param implicit_prefix Optional. If specified, the implicit prefix.
 */
//:CLCONSTRUCT burst.props.StyleProperties(String csstext, String implicit_prefix) : burst.props.AbstractProperties(implicit_prefix)
burst.props.StyleProperties = function(csstext) {
    burst.props.AbstractProperties.call(this, implicit_prefix);
    this.map_ = burst.xml.HtmlUtil.parseStyle(csstext);
}

burst.MOP.inherits(burst.props.StyleProperties, burst.props.AbstractProperties);

burst.props.StyleProperties.prototype.getPropertyImpl = function(name) {
    return this.map_[name];
}
//:CLEND burst.props.StyleProperties





/**
 * Subclass of AbstractProperties that wraps a DOM Node's attributes.
 */
//:CLBEGIN NodeAttributesProperties extends AbstractProperties

/*
 * Note that either property source or property definitions could be in the
 * outer loop.
 * 1. loop through attributes, setting any matching a name.
 * 2. loop through properties, checking to see if each exists as an attribute.
 * There are likely fewer attributes than defined properties,
 * But fetching the attributes collection is likely expensive and has
 * more spotty support than getAttribute.
 *
 * The approach 1 would have some idiom like:
 *    this.prop_defs_by_name_ = burst.Alg.toMap(prop_defs_, function(o) {o.name_});
 */

/**
 * constructor
 * @param node the Node in question.
 * @param nsuri optional. If specified, it will check with getAttributeNS in addition to global attributes (null namespace)
 * @param implicit_prefix Optional. If specified, the implicit prefix.
 */
//:CLCONSTRUCT burst.props.NodeAttributesProperties(Node node, String nsuri, String implicit_prefix) : burst.props.AbstractProperties(implicit_prefix)
burst.props.NodeAttributesProperties = function(node, nsuri, implicit_prefix) {
    bu_debug("(AbstractProperties.js) burst.props.NodeAttributesProperties constructor with ", (node.attributes ? node.attributes.length : 0), " attributes");
    burst.props.AbstractProperties.call(this, implicit_prefix);
    this.node_ = node;
    this.nsuri_ = nsuri;
}

burst.MOP.inherits(burst.props.NodeAttributesProperties, burst.props.AbstractProperties);

burst.props.NodeAttributesProperties.prototype.getPropertyImpl = function(name) {
  var v = burst.xml.DomUtil.getAttribute(this.node_, name);
  if (!v && this.nsuri_) {
      v = this.node_.getAttributeNS(nsuri, name);
  }
  bu_debug("(AbstractProperties.js) burst.props.NodeAttributesProperties.getPropertyImpl(", name, ") returning ", v);
  return v;
}
//:CLEND burst.props.NodeAttributesProperties

bu_loaded('burst.props.AbstractProperties', ['burst.Text','burst.URI', 'burst.Alg', 'burst.reflect.PropertyDef', 'burst.Lang', 'burst.xml.HtmlUtil', 'burst.xml.DomUtil']);
