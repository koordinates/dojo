package org.dojotoolkit.doc;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import javax.xml.transform.Transformer; 
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

public class JsToXml
{
  protected BufferedReader file = null;
  protected DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
  protected DocumentBuilder builder;
  protected Document xml = null;
  protected Node last = null;
  protected StringBuffer buffer = new StringBuffer();
  protected HashMap fallbacks = new HashMap();
  protected int[] balance = new int[128];
  
  public JsToXml(String fileName) {
    try {
      this.file = new BufferedReader(new FileReader(fileName));
    }
    catch (FileNotFoundException e) {
      System.out.println(fileName + " not found");
    }
  }
  
  public Document parse() {
    if (this.file != null) {
      try {
        this.builder = factory.newDocumentBuilder();
        this.xml = builder.newDocument();
      }
      catch (Exception e) {
        System.out.println("Error creating DOM structure");
      }

      try {
        int i;
        Element child = this.xml.createElement("javascript");
        this.last = this.xml.appendChild(child);

        while ((i = this.file.read()) != -1) {
          char iChar = (char)i;
          if (i == 10) {
            continue;
          }
          else if (iChar == '*') { // Let's start looking for a multiline comment
            if(this.buffer.toString().equals("/")) {
              this.buffer.setLength(0);
              while ((i = this.file.read()) != -1) {
                iChar = (char)i;
                if (iChar == '*') {
                  i = this.file.read();
                  iChar = (char)i;
                  if (iChar == '/') {
                    child = this.xml.createElement("comment");
                    child.setAttribute("type", "multi-line");
                    child.appendChild(this.xml.createTextNode(this.buffer.toString().trim()));
                    this.last.appendChild(child);
                    this.buffer.setLength(0);
                    break;
                  }
                  else {
                    buffer.append(iChar);
                  }
                }
                else if (i != 13) {
                  buffer.append(iChar);
                }
              }
            }
          }
          else if (iChar == '"') { // Deal with the double quote
            while ((i = this.file.read()) != -1) {
              iChar = (char)i;
              if (iChar == '\\') {
                this.buffer.append((char)this.file.read());
              }
              else if (iChar == '"') {
                child = this.xml.createElement("string");
                child.setAttribute("type", "double");
                child.appendChild(this.xml.createTextNode(this.buffer.toString()));
                this.last.appendChild(child);
                this.buffer.setLength(0);
                break;
              }
              else {
                buffer.append(iChar);
              }
            }
          }
          else if(iChar == '\'') { // Deal with the single quote
            while ((i = this.file.read()) != -1) {
              iChar = (char)i;
              if (iChar == '\\') {
                this.buffer.append((char)this.file.read());
              }
              else if (iChar == '\'') {
                child = this.xml.createElement("string");
                child.setAttribute("type", "single");
                child.appendChild(this.xml.createTextNode(this.buffer.toString()));
                this.last.appendChild(child);
                this.buffer.setLength(0);
                break;
              }
              else {
                buffer.append(iChar);
              }
            }
          }
          else if (iChar == '(') {
            child = this.xml.createElement("function");
            child.setAttribute("type", "call");
            child.setAttribute("name", this.buffer.toString());
            this.buffer.setLength(0);
            this.last = this.last.appendChild(child);
            this.fallbacks.put("function/call/" + this.balance[')'], this.last.getParentNode());
            this.last = this.last.appendChild(this.xml.createElement("parameters"));
            ++this.balance[')'];
          }
          else if (iChar == ')') {
            --this.balance[')'];
            if(this.fallbacks.containsKey("function/call/" + this.balance[')'])) {
              this.last = (Node)this.fallbacks.remove("function/call/" + this.balance[')']);
            }
          }
          else if (i != 13 && iChar != ';'){
            this.buffer.append(iChar);
          }
        }
      }
      catch (IOException e) {
        System.out.println("Unable to open file");
      }
    }
    return this.xml;
  }
  
  public void println (Document doc) {
    Transformer transformer = null;
    try {
      transformer = TransformerFactory.newInstance().newTransformer();
    }
    catch (Exception e) {}
    try {
      transformer.transform(new DOMSource(doc), new StreamResult(System.out));
    }
    catch (TransformerException e) {
      e.printStackTrace();
    }
  }
  
  public static void main( String args[] )
  {
    JsToXml xml = new JsToXml("C:\\eclipse-workspace\\dojo\\src\\animation\\Animation.js");
    xml.println(xml.parse());
  }
}