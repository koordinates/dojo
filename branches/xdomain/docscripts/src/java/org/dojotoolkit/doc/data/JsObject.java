/**
 * 
 */
package org.dojotoolkit.doc.data;

import java.util.ArrayList;
import java.util.List;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 * The top level representation of all javascript content. This
 * might represent a single function or an entire .js file.
 * 
 * @author jkuhnert
 */
public class JsObject implements JsBlock {
	
	protected List<JsBlock> _blocks = new ArrayList<JsBlock>();
	
	/* does nothing */
	public JsObject() { }
	
	/**
	 * {@inheritDoc}
	 */
	public int getNextPosition()
	{
		throw new UnsupportedOperationException("JsObject shouldn't be a parsed object.");
	}
	
	/**
	 * Adds a new block to this structure.
	 * @param block
	 */
	public void addBlock(JsBlock block)
	{
		_blocks.add(block);
	}
	
	/**
	 * 
	 * @return The list of all blocks encapsulated by this
	 * 			structure, in the order in which they were found.
	 */
	public List<JsBlock> getBlocks()
	{
		return _blocks;
	}
	
	/**
	 * Renders the contents of the blocks contained into 
	 * an xml document.
	 * @param doc
	 * 			The xml document to render blocks to.
	 */
	public void renderXmlOutput(Document doc)
	{
		Element root = doc.createElement("javascript");
		doc.appendChild(root);
		
		renderBlock(root, doc);
	}
	
	/**
	 * {@inheritDoc}
	 */
	public void renderBlock(Element parent, Document doc)
	{
		for (JsBlock block : _blocks)
			block.renderBlock(parent, doc);
	}
}
