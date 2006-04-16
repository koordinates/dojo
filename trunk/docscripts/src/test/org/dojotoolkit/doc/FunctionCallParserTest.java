/**
 * 
 */
package org.dojotoolkit.doc;

import org.dojotoolkit.doc.data.FunctionCall;
import org.dojotoolkit.doc.data.JsObject;

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
    String str = "dojo.function.call(\"param1\");";
    char[] input = str.toCharArray();
    
    JsParser parser = new JsParser();
    JsObject js = parser.parseContent(input);
    
    assertTrue(js.getBlocks().size() > 0);
    assertTrue(FunctionCall.class.isInstance(js.getBlocks().get(0)));
    assertXmlEquals(js, "<javascript>"
        + "<function name=\"dojo.function.call\" type=\"call\">"
        + "<parameters><parameter><string type=\"double\">param1</string></parameter>"
        + "</parameters>"
        + "</function></javascript>");
  }
  
  /**
   * Tests parsing a function call
   */
  public void testFunctionCallMultiParamParse()
  {
    String str = "dojo.function.call(\"param1\", 'param2');";
    char[] input = str.toCharArray();
    
    JsParser parser = new JsParser();
    JsObject js = parser.parseContent(input);
    
    assertTrue(js.getBlocks().size() > 0);
    assertTrue(FunctionCall.class.isInstance(js.getBlocks().get(0)));
    assertXmlEquals(js, "<javascript>"
        + "<function name=\"dojo.function.call\" type=\"call\">"
        + "<parameters><parameter><string type=\"double\">param1</string></parameter>"
        + "<parameter><string type=\"single\">param2</string></parameter>"
        + "</parameters>"
        + "</function></javascript>");
  }

}
