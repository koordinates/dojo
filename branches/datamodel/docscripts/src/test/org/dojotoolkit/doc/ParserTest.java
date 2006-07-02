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

  public void assertXmlEquals(String input, String output)
  {
    JsParser parser = new JsParser();
    JsObject js = parser.parseContent(input.toCharArray());
    
    assertTrue(js.getBlocks().size() > 0);
    assertXmlEquals(js, output);
  }
  
  public void assertXmlEquals(String expected, JsObject js)
  {
    Document doc = newDocument();
    js.renderXmlOutput(doc);
    
    assertXmlEquals(expected, doc);
  }
  
  public void assertXmlEquals(JsObject js, String expected)
  {
    assertXmlEquals(expected, js);
  }
  
  public void assertXmlEquals(Document doc, String expected)
  {
    assertXmlEquals(expected, doc);
  }
  
  /**
   * Convenience method to check the xml output from a document.
   * @param expected
   * @param doc
   */
  public void assertXmlEquals(String expected, Document doc)
  {
    StringWriter output = new StringWriter();
    expected = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + expected;
    
    try {
      
      Transformer transformer = TransformerFactory.newInstance().newTransformer();
      transformer.transform(new DOMSource(doc), new StreamResult(output));
      
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
    
    assertEquals(expected, output.toString());
  }
  
  /**
   * Creates xml documents.
   * @return A new document
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
