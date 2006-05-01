/**
 * 
 */
package org.dojotoolkit.doc;

import java.io.StringWriter;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.dojotoolkit.doc.data.JsObject;
import org.w3c.dom.Document;
import junit.framework.TestCase;

/**
 * Provides convenience methods for js parsing tests.
 * 
 * @author jkuhnert
 */
public class ParserTest extends TestCase {

  public void assertOutput(String expected, JsObject js)
  {
    Document doc = newDocument();
    js.renderXmlOutput(doc);
    
    assertOutput(expected, doc);
  }
  
  /**
   * Convenience method to check the xml output from a document.
   * @param expected
   * @param doc
   */
  public void assertOutput(String expected, Document doc)
  {
    StringWriter output = new StringWriter();
    
    try {
      
      Transformer transformer = TransformerFactory.newInstance().newTransformer();
      transformer.transform(new DOMSource(doc), new StreamResult(output));
      
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
    
    assert output.toString().equals(expected) :
      "Expected output of [ " + expected + " ] but found [ " + output.toString() + " ]";
  }
  
  /**
   * Creates xml documents.
   * @return
   */
  public Document newDocument()
  {
    try {
      
      DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
      DocumentBuilder builder = factory.newDocumentBuilder();
      
      return builder.newDocument();
      
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}
