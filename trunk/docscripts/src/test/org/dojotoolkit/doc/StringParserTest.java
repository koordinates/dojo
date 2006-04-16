/**
 * 
 */
package org.dojotoolkit.doc;

import org.dojotoolkit.doc.data.DoubleQuotedString;
import org.dojotoolkit.doc.data.JsObject;
import org.dojotoolkit.doc.data.SingleQuotedString;
import org.w3c.dom.Document;

/**
 * Tests parsing various types of strings.
 * 
 * @author jkuhnert
 */
public class StringParserTest extends ParserTest {
	
	/**
	 * Tests parsing single quoted strings.
	 */
	public void testSingleQuoteParse()
	{
		String str = "'single quoted string'";
		
		JsParser parser = new JsParser();
		JsObject js = parser.parseContent(str.toCharArray());
		
		assert js.getBlocks().size() > 0;
		assert SingleQuotedString.class.isInstance(js.getBlocks().get(0));
		
		Document doc = newDocument();
		js.renderXmlOutput(doc);
		
		assertOutput("<?xml version=\"1.0\" encoding=\"UTF-8\"?><javascript>"
				+ "<string type=\"single\">single quoted string</string></javascript>",
				js);
	}
	
	/**
	 * Tests parsing double quoted strings.
	 */
	public void testDoubleQuoteParse()
	{
		String str = "\"double quoted string\"";
		
		JsParser parser = new JsParser();
		JsObject js = parser.parseContent(str.toCharArray());
		
		assert js.getBlocks().size() > 0;
		assert DoubleQuotedString.class.isInstance(js.getBlocks().get(0));
		
		Document doc = newDocument();
		js.renderXmlOutput(doc);
		
		assertOutput("<?xml version=\"1.0\" encoding=\"UTF-8\"?><javascript>"
				+ "<string type=\"double\">double quoted string</string></javascript>",
				js);
	}
	
	/**
	 * Tests parsing strings with escape symbols
	 */
	public void testEscapeStringParse()
	{
		String str = "\"double 'quoted' string\"";
		
		JsParser parser = new JsParser();
		JsObject js = parser.parseContent(str.toCharArray());
		
		assert js.getBlocks().size() > 0;
		assert DoubleQuotedString.class.isInstance(js.getBlocks().get(0));
		
		Document doc = newDocument();
		js.renderXmlOutput(doc);
		
		assertOutput("<?xml version=\"1.0\" encoding=\"UTF-8\"?><javascript>"
				+ "<string type=\"double\">double 'quoted' string</string></javascript>",
				js);
	}
}
