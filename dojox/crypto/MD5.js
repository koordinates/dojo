dojo.provide("dojox.crypto.MD5");
dojo.require("dojox.encoding.digests.MD5");

dojo.deprecated("dojox.crypto.MD5.compute", "DojoX cryptography has been merged into DojoX Encoding. To use MD5, include dojox.encoding.digests.MD5.", "1.2");

dojox.crypto.MD5.compute=dojox.encoding.digests.MD5;
