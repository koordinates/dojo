/**
 * 
 */
package org.dojotoolkit.doc;

/**
 * Tests parsing function calls.
 * 
 * @author jkuhnert
 */
public class FunctionTest extends ParserTest {

  /**
   * Tests parsing a function call
   */
  public void testFunctionCallParse()
  {
    String input = "dojo.function.call(\"param1\");";
    String output = "<javascript>"
      + "<function name=\"dojo.function.call\" type=\"call\">"
      + "<parameters><parameter><string type=\"double\">param1</string></parameter>"
      + "</parameters>"
      + "</function></javascript>";
    assertXmlEquals(input, output);
  }
  
  /**
   * Tests parsing a function call
   */
  public void testFunctionCallMultiParamParse()
  {
    String input = "dojo.function.call(\"param1\", 'param2');";
    String output = "<javascript>"
      + "<function name=\"dojo.function.call\" type=\"call\">"
      + "<parameters><parameter><string type=\"double\">param1</string></parameter>"
      + "<parameter><string type=\"single\">param2</string></parameter>"
      + "</parameters>"
      + "</function></javascript>";
    assertXmlEquals(input, output);
  }
  
  /**
   * Tests parsing an empty function call
   */
  public void testFunctionCallEmptyParse()
  {
    String input = "dojo.function.call();";
    String output = "<javascript>"
      + "<function name=\"dojo.function.call\" type=\"call\"><parameters/></function></javascript>";
    assertXmlEquals(input, output);
  }
  
  /**
   * Tests parsing "standard" function declaration
   */
  public void testFunctionDeclareParse()
  {
    String input = "function name(){}";
    String output = "<javascript>" +
    "<function name=\"name\" type=\"declare\">" +
    "<parameters/><block/>" +
    "</function></javascript>";
    assertXmlEquals(input, output);
  }
  
  /**
   * Tests parsing function declaration with comment
   */
  public void testFunctionDeclareWithCommentParse()
  {
    String input = "function name(/*String*/){}";
    String output = "<javascript>" +
        "<function name=\"name\" type=\"declare\">" +
        "<parameters><parameter><comment type=\"block\">" +
        "String</comment></parameter></parameters><block/>" +
        "</function></javascript>";
    assertXmlEquals(input, output);
  }
  
  /**
   * Tests function object assignment
   */
  public void testFunctionObjectDeclareParse()
  {
    String input = "name = function(){}";
    String output = "<javascript>" +
    "<function name=\"name\" type=\"declare\">" +
    "<parameters/><block/>" +
    "</function></javascript>";
    assertXmlEquals(input, output);
  }
  
}
