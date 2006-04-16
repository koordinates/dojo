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
		
		JsParser parser = new JsParser();
		JsObject js = parser.parseContent(str.toCharArray());
		
		assert js.getBlocks().size() > 0;
		assert FunctionCall.class.isInstance(js.getBlocks().get(0));
		
		Document doc = newDocument();
		js.renderXmlOutput(doc);
		
		assertOutput("<?xml version=\"1.0\" encoding=\"UTF-8\"?><javascript>"
				+ "<function name=\"dojo.function.call\" type=\"call\">"
				+ "<parameters><parameter name=\"param1\"/>"
				+ "<parameter name=\"param2\"/>"
				+ "</parameters>"
				+ "</function></javascript>",
				js);
	}
}
