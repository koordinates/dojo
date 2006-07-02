Data Model Requirements & Issues
     SDO v XML v EMF v JSON
     
     
     
SDO in JS needs to be like SDO in PHP.  PHP uses PHP objects,
whereas in SDO Java Binding, EObject inserts itself into the picture.

One thought is that maybe we can use dojo "mixin" capabilities to add the EObject
functionality via mixin multiple inheritance to JS (includes JSON) structures.

EMF is a good way of describing instances and meta model information
Sometimes we would like the structural constraints defined within a metamodel
to be handled for us.  One example of when this automatic support is nice is containment
relationships.  Enforcing a type system is another example (although this is not always desireable).

There are other scenarios where we just have object structures, and don't really want the
framework to enforce model constraints.  In these cases, you don't necessarily want exceptions to
occur when adding structural features to an object that are not yet defined in the metamodel.

There will be two separate data object implementations, one for JS/JSON data that
can also be used for non-XML datastreams, and another which is for XML data and is
optimized by making use of built-in XML support of the browser platform.
For browser platforms which do not have decent support XML we may also add 
XML loaders for the JS/JSON based data object implementation in the future.


