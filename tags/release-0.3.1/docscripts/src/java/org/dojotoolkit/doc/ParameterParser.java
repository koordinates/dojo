/**
 * 
 */
package org.dojotoolkit.doc;

import java.util.Stack;

import org.dojotoolkit.doc.data.Function;
import org.dojotoolkit.doc.data.JsBlock;
import org.dojotoolkit.doc.data.Parameter;

/**
 * Parses function parameters.
 * 
 * @see Parameter
 * @author jkuhnert
 */
public class ParameterParser implements JsBlockParser {
	
  public boolean canStartWithBlock(JsBlock block)
  {
    if (Function.class.isInstance(block)) {
      return true;
    }
    return false;
  }
  
	/**
	 * {@inheritDoc}
	 */
	public JsBlock startsBlock(char[] data, int position, Stack<JsBlock> blocks)
	{	
		if (data[position] == '(' || data[position] == ',') {
				JsBlock parameter = new Parameter();
        parameter.setStartPosition(position);
        parameter.setNextPosition(position + 1);
        return parameter;
		}

		return null;
	}
	
  public boolean canEndWithBlock(JsBlock block)
  {
    if (Parameter.class.isInstance(block)) {
      return true;
    }
    return false;
  }
  
	/**
	 * {@inheritDoc}
	 */
	public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks)
	{
    if (data[position] == ',' || data[position] == ')') {
      Parameter parm = (Parameter)blocks.pop();
      parm.setNextPosition(position);
      return parm;
    }
    return null;
  }
}
