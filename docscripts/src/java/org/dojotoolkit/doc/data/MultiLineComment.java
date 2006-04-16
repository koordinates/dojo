/**
 * 
 */
package org.dojotoolkit.doc.data;

import java.util.List;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 * Represents a mult-line comment data block.
 * 
 * @author jkuhnert
 */
public class MultiLineComment implements JsBlock {
	
	/* start position taken from in original parse */
	protected int _startPosition;
	
	protected int _nextPosition;
	
	/* The comments! */
	protected String _data;
	
	/* does nothing */
	public MultiLineComment() { }
	
	/**
	 * Creates a new comment with a pre-configured start position,
	 * mostly used in javascript parsing operations.
	 * 
	 * @param startPosition
	 */
	public MultiLineComment(int startPosition, int nextPosition)
	{
		_startPosition = startPosition;
		_nextPosition = nextPosition;
	}
	
	/**
	 * The textual comment data encapsulated by this class.
	 * @return The string value of the comment data.
	 */
	public String getData() 
	{
		return _data;
	}
	
	/**
	 * Sets the comment data.
	 * @param data Comment data being set.
	 */
	public void setData(String data)
	{
		_data = data;
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
	public void renderBlock(Element parent, Document doc) 
	{
		Element comment = doc.createElement("comment");
		parent.appendChild(comment);
		
		comment.setAttribute("type", "multi-line");
		comment.appendChild(doc.createTextNode(_data));
	}
	
	/**
	 * {@inheritDoc}
	 */
	public void addBlock(JsBlock block) 
	{
		throw new UnsupportedOperationException("Multi line comments don't contain blocks.");
	}
	
	/**
	 * {@inheritDoc}
	 */
	public List<JsBlock> getBlocks() 
	{
		throw new UnsupportedOperationException("Multi line comments don't contain blocks.");
	}
  
  /**
   * {@inheritDoc}
   */
  public boolean allowedChild(JsBlock block)
  {
    return false;
  }
}
