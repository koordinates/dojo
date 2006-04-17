/**
 * 
 */
package org.dojotoolkit.doc.data;

import java.util.List;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 * Block of " or ' of quoted character string.
 * 
 * @see org.dojotoolkit.doc.QuotedStringParser
 * @author jkuhnert
 */
public class QuotedString implements JsBlock {
	
	/* start position taken from in original parse */
	protected int _startPosition;
	
	protected int _nextPosition;
	
	/* The comments! */
	protected String _data;
  
  /* The type (single, double)! */
  protected String _type;
	
	/* does nothing */
	public QuotedString() { }
	
	/**
	 * Creates a new string with a pre-configured start position,
	 * mostly used in javascript parsing operations.
	 * 
	 * @param startPosition
	 */
	public QuotedString(int startPosition, int nextPosition)
	{
		_startPosition = startPosition;
		_nextPosition = nextPosition;
	}
	
	/**
	 * The textual string data encapsulated by this class.
	 * @return The string value of the string data.
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
  
  public void setType(String type)
  {
    _type = type;
  }
  
  public String getType()
  {
    return _type;
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
		throw new UnsupportedOperationException("String quotes don't contain blocks.");
	}
	
	/**
	 * {@inheritDoc}
	 */
	public List<JsBlock> getBlocks() 
	{
		throw new UnsupportedOperationException("String quotes don't contain blocks.");
	}

	/**
	 * {@inheritDoc}
	 */
	public void renderBlock(Element parent, Document doc) 
	{
		Element node = doc.createElement("string");
		parent.appendChild(node);
		
		node.setAttribute("type", _type);
		node.appendChild(doc.createTextNode(_data));
	}
  
  /**
   * {@inheritDoc}
   */
  public boolean canAcceptBlock(JsBlock block)
  {
    return false;
  }
}
