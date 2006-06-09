/* VariableTest.java
 * Created on Apr 23, 2006
 */
package org.dojotoolkit.doc;

public class VariableTest extends ParserTest {

  public void testBasicVariableParser()
  {
    String input = "simpleVar";
    String output = "<javascript><variable name=\"simpleVar\"/></javascript>";
    assertXmlEquals(input, output);
  }
  
  public void testVarOperatorConfusion()
  {
    String input = "var.confusion";
    String output = "<javascript><variable name=\"var.confusion\"/></javascript>";
    assertXmlEquals(input, output);
  }
  
  public void testVarOperatorConfusion2()
  {
    String input = "confusingVar ";
    String output = "<javascript><variable name=\"confusingVar\"/></javascript>";
    assertXmlEquals(input, output);
  }
  
}
