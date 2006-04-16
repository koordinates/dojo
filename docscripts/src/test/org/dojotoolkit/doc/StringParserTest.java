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
    char[] input = str.toCharArray();
		
		JsParser parser = new JsParser();
		JsObject js = parser.parseContent(input);
		
    assertTrue(js.getBlocks().size() > 0);
    assertTrue(SingleQuotedString.class.isInstance(js.getBlocks().get(0)));
		assertXmlEquals(js, "<javascript>"
				+ "<string type=\"single\">single quoted string</string></javascript>");
	}
 
	/**
	 * Tests parsing double quoted strings.
	 */
	public void testDoubleQuoteParse()
	{
		String str = "\"double quoted string\"";
    char[] input = str.toCharArray();
		
		JsParser parser = new JsParser();
		JsObject js = parser.parseContent(input);
		
		assertTrue(js.getBlocks().size() > 0);
		assertTrue(DoubleQuotedString.class.isInstance(js.getBlocks().get(0)));
		assertXmlEquals(js, "<javascript>"
				+ "<string type=\"double\">double quoted string</string></javascript>");
	}

	/**
	 * Tests parsing single quote within double quote
	 */
	public void testDoubleQuoteWithSingleQuote()
	{
		String str = "\"double quoted's string\"";
    char[] input = str.toCharArray();
		
		JsParser parser = new JsParser();
		JsObject js = parser.parseContent(input);
		
		assertTrue(js.getBlocks().size() > 0);
		assertTrue(DoubleQuotedString.class.isInstance(js.getBlocks().get(0)));
		assertXmlEquals(js, "<javascript>"
				+ "<string type=\"double\">double quoted's string</string></javascript>");
	}
  
  /**
   * Tests parsing double quote within single quote
   */
  public void testSingleQuoteWithDoubleQuote()
  {
    String str = "'single \"quoted\" string'";
    char[] input = str.toCharArray();
    
    JsParser parser = new JsParser();
    JsObject js = parser.parseContent(input);
    
    assertTrue(js.getBlocks().size() > 0);
    assertTrue(SingleQuotedString.class.isInstance(js.getBlocks().get(0)));
    assertXmlEquals(js, "<javascript>"
        + "<string type=\"single\">single \"quoted\" string</string></javascript>");
  }
  
  /**
   * Tests comment within a quoted string
   */
  public void testCommentWithinQuotes()
  {
    String str = "\"double /*quoted*/ string\"";
    char[] input = str.toCharArray();
    
    JsParser parser = new JsParser();
    JsObject js = parser.parseContent(input);
    
    assertTrue(js.getBlocks().size() > 0);
    assertTrue(DoubleQuotedString.class.isInstance(js.getBlocks().get(0)));
    assertXmlEquals(js, "<javascript>"
        + "<string type=\"double\">double /*quoted*/ string</string></javascript>");
  }
  
}
