/**
 * 
 */
package org.dojotoolkit.doc;

import org.dojotoolkit.doc.data.FunctionCall;
import org.dojotoolkit.doc.data.JsObject;
import org.w3c.dom.Document;

/**
 * Tests parsing function calls.
 * 
 * @author jkuhnert
 */
public class FunctionCallParserTest extends ParserTest {

	/**
	 * Tests parsing a function call
	 */
	public void testFunctionCallParse()
	{
		String str = "dojo.function.call(param1, param2);";
    char[] input = str.toCharArray();
		
		JsParser parser = new JsParser();
		JsObject js = parser.parseContent(input);
		
		assertTrue(js.getBlocks().size() > 0);
		assertTrue(FunctionCall.class.isInstance(js.getBlocks().get(0)));
		assertXmlEquals(js, "<javascript>"
				+ "<function name=\"dojo.function.call\" type=\"call\">"
				+ "<parameters><parameter name=\"param1\"/>"
				+ "<parameter name=\"param2\"/>"
				+ "</parameters>"
				+ "</function></javascript>");
	}
}
