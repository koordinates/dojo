/**
 * 
 */
package org.dojotoolkit.doc.data;

import java.util.ArrayList;
import java.util.List;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 * Represents a function parameter.
 * 
 * @author jkuhnert
 */
public class Parameter implements JsBlock {
  // containing blocks
  protected List<JsBlock> _blocks = new ArrayList<JsBlock>();
  
	/* start position taken from in original parse */
	protected int _startPosition;
	
	protected int _nextPosition;
	
	/* does nothing */
	public Parameter() { }
	
	/**
	 * Creates a new parameter.
	 * 
	 * @param startPosition
	 */
	public Parameter(int startPosition, int nextPosition)
	{
		_startPosition = startPosition;
		_nextPosition = nextPosition;
	}
	
	public void setStartPosition(int position)
	{
		_startPosition = position;
	}
	
	public int getStartPosition()
	{
		return _startPosition;
	}
	
	public void setNextPosition(int position)
	{
		_nextPosition = position;
	}
	
	/**
	 * {@inheritDoc}
	 */
	public int getNextPosition()
	{
		return _nextPosition;
	}
	
	/**
	 * {@inheritDoc}
	 */
	public void addBlock(JsBlock block) 
	{
		_blocks.add(block);
	}
	
	/**
	 * {@inheritDoc}
	 */
	public List<JsBlock> getBlocks() 
	{
		return _blocks;
	}
	
	/**
	 * {@inheritDoc}
	 */
	public void renderBlock(Element parent, Document doc) 
	{
		Element parm = doc.createElement("parameter");
		parent.appendChild(parm);
    
    for (JsBlock block : _blocks) {
      block.renderBlock(parm, doc);
    }
	}
  
  /**
   * {@inheritDoc}
   */
  public boolean allowedChild(JsBlock block)
  {
    return true;
  }
}
