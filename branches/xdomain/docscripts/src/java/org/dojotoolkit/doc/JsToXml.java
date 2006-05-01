package org.dojotoolkit.doc;

import java.io.BufferedReader;
import java.io.FileReader;
import java.util.HashMap;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

/**
 * Takes an incoming javascript file and converts it into an xml 
 * file output that can then be used for other purposes.
 * 
 * @author PottedMeat 
 */
public class JsToXml {
	
	protected BufferedReader _buf = null;
	protected DocumentBuilderFactory factory = DocumentBuilderFactory
			.newInstance();
	
	/**
	 * Creates a new instance that will create a buffer around
	 * the file specified by the incoming file path
	 * 
	 * @param fileName 
	 * 			Path to the file to be proccessed
	 * @throws Exception 
	 * 			If there is an error reading the file
	 */
	public JsToXml(String fileName)
	throws Exception
	{
		_buf = new BufferedReader(new FileReader(fileName));
	}
	
	/**
	 * Parses the document referenced from the constructor.
	 * 
	 * @return A validly parsed XML document
	 * @throws Exception
	 * 			If an error happens creating the document
	 */
	public Document parse() 
	throws Exception
	{
		if (_buf == null)
			throw new IllegalArgumentException("No valid file buffer exists, can't parse.");
		
		DocumentBuilder builder = factory.newDocumentBuilder();
		Document xml = builder.newDocument();
		Node last = null;
		StringBuffer buffer = new StringBuffer();
		HashMap fallbacks = new HashMap();
		int[] balance = new int[128];
		
		int i;
		Element child = xml.createElement("javascript");
		last = xml.appendChild(child);
		
		while ((i = this._buf.read()) != -1) {
			char iChar = (char) i;
			if (i == 10) {
				continue;
			} else if (iChar == '*') { // Let's start looking for a
				// multiline comment
				if (buffer.toString().equals("/")) {
					buffer.setLength(0);
					while ((i = this._buf.read()) != -1) {
						iChar = (char) i;
						if (iChar == '*') {
							i = this._buf.read();
							iChar = (char) i;
							if (iChar == '/') {
								child = xml
								.createElement("comment");
								child
								.setAttribute("type",
								"multi-line");
								child.appendChild(xml
										.createTextNode(buffer
												.toString().trim()));
								last.appendChild(child);
								buffer.setLength(0);
								break;
							} else {
								buffer.append(iChar);
							}
						} else if (i != 13) {
							buffer.append(iChar);
						}
					}
				}
			} else if (iChar == '"') { // Deal with the double quote
				while ((i = this._buf.read()) != -1) {
					iChar = (char) i;
					if (iChar == '\\') {
						buffer.append((char) this._buf.read());
					} else if (iChar == '"') {
						child = xml.createElement("string");
						child.setAttribute("type", "double");
						child
						.appendChild(xml
								.createTextNode(buffer
										.toString()));
						last.appendChild(child);
						buffer.setLength(0);
						break;
					} else {
						buffer.append(iChar);
					}
				}
			} else if (iChar == '\'') { // Deal with the single quote
				while ((i = this._buf.read()) != -1) {
					iChar = (char) i;
					if (iChar == '\\') {
						buffer.append((char) this._buf.read());
					} else if (iChar == '\'') {
						child = xml.createElement("string");
						child.setAttribute("type", "single");
						child
						.appendChild(xml
								.createTextNode(buffer
										.toString()));
						last.appendChild(child);
						buffer.setLength(0);
						break;
					} else {
						buffer.append(iChar);
					}
				}
			} else if (iChar == '(') {
				child = xml.createElement("function");
				child.setAttribute("type", "call");
				child.setAttribute("name", buffer.toString());
				buffer.setLength(0);
				last = last.appendChild(child);
				fallbacks.put(
						"function/call/" + balance[')'], last
						.getParentNode());
				last = last.appendChild(xml
						.createElement("parameters"));
				++balance[')'];
			} else if (iChar == ')') {
				--balance[')'];
				if (fallbacks.containsKey("function/call/"
						+ balance[')'])) {
					last = (Node) fallbacks
					.remove("function/call/"
							+ balance[')']);
				}
			} else if (i != 13 && iChar != ';') {
				buffer.append(iChar);
			}
		}
		
		return xml;
	}
	
	/**
	 * Prints the document structure to System.out
	 * @param doc The XML document to print
	 * @throws Exception
	 * 			On error
	 */
	public void println(Document doc)
	throws Exception
	{
		Transformer transformer = TransformerFactory.newInstance().newTransformer();
		transformer.transform(new DOMSource(doc), new StreamResult(
				System.out));
	}
	
	/**
	 * Invoked from command line
	 * @param args
	 * @throws Exception
	 */
	public static void main(String args[])
	throws Exception 
	{
		if (args.length != 1) {
			System.err.println("Usage: JsToXml <javascript file to proceass>");
				System.exit(-1);
		}
		
		JsToXml xml = new JsToXml(args[0]);
		xml.println(xml.parse());
	}
}