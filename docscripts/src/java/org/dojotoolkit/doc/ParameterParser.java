/**
 * 
 */
package org.dojotoolkit.doc;

import java.util.Stack;

import org.dojotoolkit.doc.data.FunctionCall;
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
		if (blocks.size() > 0) {
			
			if (FunctionCall.class.isInstance(blocks.peek())) {
				System.out.println("Setting parameter start char to: " + data[position]);
				return new Parameter(position, position + 1);
			}
		}
		
		return null;
	}
	
	/**
	 * {@inheritDoc}
	 */
	public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks)
	{	
		if (!Parameter.class.isInstance(blocks.peek())) return null;
		
		Parameter parm = (Parameter)blocks.pop();
		
		if (data[position] == ',')
			return setParmData(parm, data, position, position + 1);
		
		// we need to find the end
		
		int cursor = position;
		while (cursor < data.length) {
			if (Character.isWhitespace(data[cursor])) {
				cursor++;
				continue;
			}
			
			if (data[cursor] == ',')
				return setParmData(parm, data, cursor, cursor + 1);
			
			if (data[cursor] == ')')
				return setParmData(parm, data, cursor, cursor);
			
			cursor++;
		}
		
		return null;
	}
	
	protected Parameter setParmData(Parameter parm, char[] data, 
			int endPosition, int nextPosition)
	{
		parm.setName(new String(data, parm.getStartPosition(),
				endPosition - parm.getStartPosition()));
		
		parm.setNextPosition(nextPosition);
		
		return parm;
	}
}
