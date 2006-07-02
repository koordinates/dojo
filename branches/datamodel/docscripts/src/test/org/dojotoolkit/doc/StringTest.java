/**
 * 
 */
package org.dojotoolkit.doc;

/**
 * Tests parsing various types of strings.
 * 
 * @author jkuhnert
 */
public class StringTest extends ParserTest {
	
	/**
	 * Tests parsing single quoted strings.
	 */
	public void testSingleQuoteParse()
	{
		String input = "'single quoted string'";
    String output = "<javascript>"
      + "<string type=\"single\">single quoted string</string></javascript>";
    assertXmlEquals(input, output);
	}
 
	/**
	 * Tests parsing double quoted strings.
	 */
	public void testDoubleQuoteParse()
	{
		String input = "\"double quoted string\"";
    String output = "<javascript>"
      + "<string type=\"double\">double quoted string</string></javascript>";
		assertXmlEquals(input, output);
	}

	/**
	 * Tests parsing single quote within double quote
	 */
	public void testDoubleQuoteWithSingleQuote()
	{
		String input = "\"double quoted's string\"";
    String output = "<javascript>"
      + "<string type=\"double\">double quoted's string</string></javascript>";
		assertXmlEquals(input, output);
	}
  
  /**
   * Tests parsing double quote within single quote
   */
  public void testSingleQuoteWithDoubleQuote()
  {
    String input = "'single \"quoted\" string'";
    String output = "<javascript>"
      + "<string type=\"single\">single \"quoted\" string</string></javascript>";
    assertXmlEquals(input, output);
  }
  
  /**
   * Tests comment within a quoted string
   */
  public void testCommentWithinQuotes()
  {
    String input = "\"double /*quoted*/ string\"";
    String output = "<javascript>"
      + "<string type=\"double\">double /*quoted*/ string</string></javascript>";
    assertXmlEquals(input, output);
  }
  
}
