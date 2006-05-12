/**
 * 
 */
package org.dojotoolkit.doc;

/**
 * Tests parsing of various types of comments.
 * 
 * @author jkuhnert
 */
public class CommentTest extends ParserTest {
	
	/**
	 * Tests parsing star <code>/*</code> style comments.
	 */
	public void testMultiLineCommentParse()
	{
		String input = "/* This is comment data */";
    String output = "<javascript>"
      + "<comment type=\"block\">" 
      + " This is comment data "
      + "</comment></javascript>";
		assertXmlEquals(input, output);
	}
  
  /**
   * Tests parsing <code>//</code> style comments
   */
  public void testSingleLineCommentParse()
  {
    String input = "// This is comment data\n" +
        "// and EOT comment data";
    String output = "<javascript>"
      + "<comment type=\"line\">"
      + "This is comment data"
      + "</comment><comment type=\"line\">"
      + "and EOT comment data"
      + "</comment></javascript>";
    assertXmlEquals(input, output);
  }
	
	/**
	 * Tests parsing <code>/*</code> style comments.
	 */
	public void testMultiLineCommentParse2()
	{
		String input = "/*\n"
			+ " * This is the start of a complicated comment block.\n"
			+ " * I'm not sure what to expect from it.\n"
			+ " */";
    String output = "<javascript>"
      + "<comment type=\"block\">\n" 
      + " * This is the start of a complicated comment block.\n"
      + " * I'm not sure what to expect from it.\n"
      + " </comment></javascript>";
		assertXmlEquals(input, output);
	}
}
