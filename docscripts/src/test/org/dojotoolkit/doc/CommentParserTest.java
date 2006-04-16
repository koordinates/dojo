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
		String str = "/** This is comment data */";
		
		JsParser parser = new JsParser();
		JsObject js = parser.parseContent(str.toCharArray());
		
		assert js.getBlocks().size() > 0;
		assert MultiLineComment.class.isInstance(js.getBlocks().get(0));
		
		Document doc = newDocument();
		js.renderXmlOutput(doc);
		
		assertOutput("<?xml version=\"1.0\" encoding=\"UTF-8\"?><javascript>"
				+ "<comment type=\"multi-line\">" 
				+ "This is comment data"
				+ "</comment></javascript>", js);
	}
	
	/**
	 * Tests parsing star <code>*</code> style comments.
	 */
	public void testMultiLineCommentParse2()
	{
		String str = "/**\n"
			+ " * This is the start of a complicated comment block.\n"
			+ " * I'm not sure what to expect from it.\n"
			+ " * @param value The value passed in \n"
			+ " */";
		
		JsParser parser = new JsParser();
		JsObject js = parser.parseContent(str.toCharArray());
		
		assert js.getBlocks().size() > 0;
		assert MultiLineComment.class.isInstance(js.getBlocks().get(0));
		
		Document doc = newDocument();
		js.renderXmlOutput(doc);
		
		assertOutput("<?xml version=\"1.0\" encoding=\"UTF-8\"?><javascript>"
				+ "<comment type=\"multi-line\">" 
				+ "This is the start of a complicated comment block.\n"
				+ "I'm not sure what to expect from it.\n"
				+ "@param value The value passed in"
				+ "</comment></javascript>", js);
	}
}
