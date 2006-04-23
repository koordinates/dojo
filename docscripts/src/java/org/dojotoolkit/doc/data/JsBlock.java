/**
 * 
 */
package org.dojotoolkit.doc.data;

import java.util.List;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 * Represents a block of javascript data.
 * 
 * <p>This could literally by
 * almost anything. Comments / variables / functions, you name it.</p>
 * 
 * <p>There are several important things that this class needs to keep track of.
 * For one, the parser will tie source code to each object, so each object needs
 * to have pointers to the beginning and end of its corresponding code. These are
 * represented by {@link #_startPosition _startPosition} and {@link #_endPosition}.</p>
 * 
 * <p>In the parser, when {@link org.dojotoolkit.doc.JsBlockParser#startsBlock(char[], int, Stack) startsBlock}
 * finds a new section of code that it needs to create an object
 * for, it will call one of these classes. The constructor should accept as many
 * of the Position variables as possible.</p>
 * 
 * <p>This object will then be returned by each parser class to the main
 * {@link org.dojotoolkit.doc.JsParser JsParser} object. The parser then calls
 * {@link #getNextPosition() getNextPosition} to move the cursor to the appropriate location. This will be
 * where the next cycle begins.</p>
 * 
 * <p>When {@link org.dojotoolkit.doc.JsBlockParser#endsBlock(char[], int, Stack) endsBlock}
 * finds a valid location to end the block, it returns this object again. Once again,
 * the {@link #getNextPosition() getNextPosition} function is how the parser
 * decides where to place the cursor for when the next cycle begins.</p>
 * 
 * <p>Note: This class should also hold any extra values such as name or type.
 * These should also match the attributes that will be set in XML using the
 * {@link #renderBlock(Element, Document) renderBlock} function.</p>
 * 
 * @author jkuhnert
 */
public interface JsBlock {
	
  /**
   * Position of the first character in
   * the source code representing where this block starts
   */
  public int _startPosition = 0;
  
  /**
   * Holds the cursor location that will be called
   * when a block is added or removed.
   */
  public int _nextPosition = 0;
  
  /**
   * Position of the last character in the source
   * code where this block ends.
   */
  public int _endPosition = 0;
  
	/**
	 * Adds a new block to this structure.
	 *
	 * @param block Another JsBlock to be added as a child
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
   * Should render not only itself, but any child blocks.
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
	 * has been started or ended.
	 * 
	 * @return The next good start position.
	 */
	int getNextPosition();
  
  /**
   * If this is a javascript parse, sets the next starting character
   * position that should be used to parse content after this block
   * has been started or ended.
   */
  void setNextPosition(int nextPosition);
  
  int getStartPosition();
  
  void setStartPosition(int startPosition);
  
  /**
   * Checks to see if the passed block is allowed to be added as a child of
   * the current block.
   * 
   * This should almost always be set to true/false and only be used
   * if you're unable to keep a child/parent relationship from happening
   * in any other way.
   * 
   * @param block
   *      The block to check
   * @return
   *      true if it's allowed
   */
  boolean canAcceptBlock(JsBlock block);

}
