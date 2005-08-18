Building is done for example by:
  cd buildscripts
  ant help

Notes:

* Because of security restrictions placed on XmlHttpRequest, Dojo examples will not work in IE unless you place the files under the docroot of a web server and view them using the http:// protocol.  (The web server can be running locally, of course.)

* The presence of "blank.html" may seem mysterious at first glance.  This empty file exists because an iframe is used in back-button management.  For https in IE, that iframe must have some content aside from "about:blank", or the user will see security warnings.  