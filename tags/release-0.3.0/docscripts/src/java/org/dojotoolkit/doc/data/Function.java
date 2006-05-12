/**
 * 
 */
package org.dojotoolkit.doc.data;

import java.util.ArrayList;
import java.util.List;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 * Represents a function.
 * 
 * @see org.dojotoolkit.doc.FunctionParser
 * @author jkuhnert
 */
public class Function implements JsBlock {
	
	// containing blocks
	protected List<JsBlock> _blocks = new ArrayList<JsBlock>();
  
  // parameters
  protected List<Parameter> _params = new ArrayList<Parameter>();
	
	// start position taken from in original parse 
	protected int _startPosition;
	protected int _callStartPosition;
	protected int _nextPosition;
	
	// function name
	protected String _name;

  private String _type = "call";
	
	public Function() {}
	
	/**
	 * 
	 * @return The start position of the "(" character for this function call
	 */
	public int getStartPosition()
	{
		return _startPosition;
	}
	
  public void setCallStartPosition(int callStartPosition)
  {
    _callStartPosition = callStartPosition;
  }
  
	/**
	 * 
	 * @return The start position of the complete function call.
	 */
	public int getCallStartPosition()
	{
		return _callStartPosition;
	}
	
	/**
	 * Sets this function call name
	 * @param name
	 */
	public void setName(String name)
	{
		_name = name;
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
    if (Parameter.class.isInstance(block)) {
      _params.add((Parameter)block);
    }
    else {
      _blocks.add(block);
    }
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
		Element func = doc.createElement("function");
		parent.appendChild(func);
		
		func.setAttribute("type", _type);
		func.setAttribute("name", _name);
		
		Element parms = doc.createElement("parameters");
		func.appendChild(parms);

    for (Parameter block : _params) {
      block.renderBlock(parms, doc);
    }
    
		for (JsBlock block : _blocks) {
			block.renderBlock(func, doc);
    }
	}
  
  public void setStartPosition(int startPosition)
  {
    _startPosition = startPosition;
  }
  
  /**
   * {@inheritDoc}
   */
  public boolean canAcceptBlock(JsBlock block)
  {
    return true;
  }

  public void setType(String type) {
    _type = type;
  }

  public String getType() {
    return _type;
  }
}
