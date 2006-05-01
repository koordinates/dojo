/**
 * 
 */
package org.dojotoolkit.doc;

import java.util.Stack;

import org.dojotoolkit.doc.data.FunctionCall;
import org.dojotoolkit.doc.data.JsBlock;

/**
 * Parses function calls.
 * 
 * @author jkuhnert
 */
public class FunctionCallParser implements BlockParser {
	
	/**
	 * {@inheritDoc}
	 */
	public JsBlock startsBlock(char[] data, int position, Stack<JsBlock> blocks)
	{	
		if (data[position] == '(') {
			// now need to seek to start of call position
			for (int cursor=(position - 1); cursor > -1; cursor--) {
				if (!Character.isLetterOrDigit(data[cursor]) &&
						data[cursor] != '_' && data[cursor] != '.') {
					return new FunctionCall(position, cursor, position);
				}
			}
			
			//if we get here then there wasn't anything else to parse
			return new FunctionCall(position, 0, position);
		}
		
		return null;
	}
	
	/**
	 * {@inheritDoc}
	 */
	public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks)
	{	
		if (data[position] == ')') {
			FunctionCall func = (FunctionCall)blocks.pop();
			
			func.setName(new String(data, func.getCallStartPosition(), 
					func.getStartPosition() - func.getCallStartPosition()).trim());
			func.setNextPosition(position + 1);
			
			return func;
		}
		
		return null;
	}
}
