/**
 * 
 */
package org.dojotoolkit.doc.data;

import java.util.List;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 * Represents a function parameter.
 * 
 * @author jkuhnert
 */
public class Parameter implements JsBlock {
	
	/* start position taken from in original parse */
	protected int _startPosition;
	
	protected int _nextPosition;
	
	protected String _name;
	
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
	
	/**
	 * The name of the parameter.
	 * @return The name of the parameter.
	 */
	public String getName() 
	{
		return _name;
	}
	
	/**
	 * Sets the param name.
	 * @param name Parameter name
	 */
	public void setName(String name)
	{
		_name = name;
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
		Element node = doc.createElement("parameter");
		parent.appendChild(node);
		
		node.setAttribute("name", _name);
	}
}
