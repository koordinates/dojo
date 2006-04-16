/* AllParserTests.java
 * Created on Apr 16, 2006
 */
package org.dojotoolkit.doc;

import junit.framework.Test;
import junit.framework.TestSuite;

public class AllParserTests {

  public static Test suite() {
    TestSuite suite = new TestSuite("Test for org.dojotoolkit.doc");
    //$JUnit-BEGIN$
    suite.addTestSuite(StringParserTest.class);
    suite.addTestSuite(FunctionCallParserTest.class);
    suite.addTestSuite(CommentParserTest.class);
    //$JUnit-END$
    return suite;
  }

}
