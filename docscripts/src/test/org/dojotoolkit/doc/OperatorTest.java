/* OperatorTest.java
 * Created on Apr 23, 2006
 */
package org.dojotoolkit.doc;

public class OperatorTest extends ParserTest {
  
  public void testVarOperator()
  {
    String input = "var block;";
    String output = "<javascript>" +
        "<operator name=\"var\"><variable name=\"block\"/></operator>" +
        "</javascript>";
    assertXmlEquals(input, output);
  }
}
