/**
 * 
 */
package org.dojotoolkit.doc.data;

import java.util.List;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 * Represents a block of javascript data. This could literally by
 * almost anything. Comments / variables / functions, you name it.
 * 
 * @author jkuhnert
 */
public interface JsBlock {
	
	/**
	 * Adds a new block to this structure.
	 * @param block
	 */
	public void addBlock(JsBlock block);
	
	/**
	 * 
	 * @return The list of all blocks encapsulated by this
	 * 			structure, in the order in which they were found.
	 */
	public List<JsBlock> getBlocks();
	
	/**
	 * Renders this blocks content into an XML document.
	 * 
	 * @param parent
	 * 			The direct containing parent node that this block should
	 * 			be added into.
	 * @param doc
	 * 			The root document node.
	 */
	void renderBlock(Element parent, Document doc);
	
	/**
	 * If this is a javascript parse, returns the next starting character
	 * position that should be used to parse content after this block
	 * has been started.
	 * 
	 * @return The next good start position.
	 */
	int getNextPosition();
  
  /**
   * Checks to see if the passed block is allowed to be added as a child of
   * the current block
   * 
   * @param block
   *      The block to check
   * @return
   *      If allowed
   */
  boolean allowedChild(JsBlock block);
}
