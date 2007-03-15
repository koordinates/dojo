
/**
 * Tests existance/functionality of rhino's ecma-357 scripted xml support.
 * 
 * See http://www.mozilla.org/rhino/overview.html
 * and
 * http://www.ecma-international.org/publications/standards/Ecma-357.htm
 * 
 * This means we more or less have a super bad ass native xml object 
 * to play with. When I have time I plan on incorporating this into
 * our fake dom to provide "complete" dom support in tests...Which means we'll
 * be able to test anything a widget can do. (more or less)
 */
function test_xml_Present(){
	var xml = new XML("<span>This is text <b>in bold</b>!</span>");
	
	dojo.debug(xml.toXMLString());
}
