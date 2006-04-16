/**
 * 
 */
package org.dojotoolkit.doc;

import org.dojotoolkit.doc.data.JsObject;
import org.dojotoolkit.doc.data.MultiLineComment;
import org.w3c.dom.Document;

/**
 * Tests parsing of various types of comments.
 * 
 * @author jkuhnert
 */
public class CommentParserTest extends ParserTest {
	
	/**
	 * Tests parsing star <code>*</code> style comments.
	 */
	public void testMultiLineCommentParse()
	{
		String str = "/* This is comment data */";
    char[] input = str.toCharArray();
		
		JsParser parser = new JsParser();
		JsObject js = parser.parseContent(input);
		
		assertTrue(js.getBlocks().size() > 0);
		assertTrue(MultiLineComment.class.isInstance(js.getBlocks().get(0)));
		assertXmlEquals(js, "<javascript>"
				+ "<comment type=\"multi-line\">" 
				+ "This is comment data"
				+ "</comment></javascript>");
	}
	
	/**
	 * Tests parsing star <code>*</code> style comments.
	 */
	public void testMultiLineCommentParse2()
	{
		String str = "/*\n"
			+ " * This is the start of a complicated comment block.\n"
			+ " * I'm not sure what to expect from it.\n"
			+ " */";
    char[] input = str.toCharArray();
		
		JsParser parser = new JsParser();
		JsObject js = parser.parseContent(input);
		
		assertTrue(js.getBlocks().size() > 0);
		assertTrue(MultiLineComment.class.isInstance(js.getBlocks().get(0)));
		assertXmlEquals(js, "<javascript>"
				+ "<comment type=\"multi-line\">" 
				+ "* This is the start of a complicated comment block.\n"
				+ "* I'm not sure what to expect from it."
				+ "</comment></javascript>");
	}
}
