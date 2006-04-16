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
 * @author jkuhnert
 */
public class ParameterParser implements BlockParser {
	
	/**
	 * {@inheritDoc}
	 */
	public JsBlock startsBlock(char[] data, int position, Stack<JsBlock> blocks)
	{	
    if (blocks.isEmpty() || !Function.class.isInstance(blocks.peek())) return null;

		if (data[position] == '(' || data[position] == ',') {
				return new Parameter(position, position);
		}

		return null;
	}
	
	/**
	 * {@inheritDoc}
	 */
	public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks)
	{	
		if (!Parameter.class.isInstance(blocks.peek())) return null;

    if (data[position] == ',' || data[position] == ')') {
      Parameter parm = (Parameter)blocks.pop();
      parm.setNextPosition(position);
      return parm;
    }
    return null;
  }
}
