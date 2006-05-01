/**
 * 
 */
package org.dojotoolkit.doc;

import java.util.Stack;

import org.dojotoolkit.doc.data.DoubleQuotedString;
import org.dojotoolkit.doc.data.JsBlock;
import org.dojotoolkit.doc.data.MultiLineComment;
import org.dojotoolkit.doc.data.SingleQuotedString;

/**
 * Parses strings that are double quoted.
 * 
 * @see {@link DoubleQuotedString}
 * @author jkuhnert
 */
public class DoubleQuotedStringParser implements BlockParser {
	
	/**
	 * {@inheritDoc}
	 */
	public JsBlock startsBlock(char[] data, int position, Stack<JsBlock> blocks) 
	{
		if (data[position] == '"' && !containsIgnorableBlock(blocks))
			return new DoubleQuotedString(position, position + 1);
		
		return null;
	}
	
	/**
	 * {@inheritDoc}
	 */
	public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks) 
	{
		if (data[position] == '"' && !containsIgnorableBlock(blocks)) {
			DoubleQuotedString string = (DoubleQuotedString)blocks.pop();
			
			string.setNextPosition(position + 1);
			
			string.setData(new String(data, string.getStartPosition() + 1,
					position - (string.getStartPosition() + 1)).trim());
			
			return string;
		}
		
		return null;
	}
	
	/**
	 * Checks for a containing ignorable block on the stack
	 * 
	 * @param blocks
	 * @return
	 */
	protected boolean containsIgnorableBlock(Stack<JsBlock> blocks)
	{
		if (blocks.size() <= 0) 
			return false;
		
		JsBlock parent = blocks.peek();
		if (SingleQuotedString.class.isInstance(parent) ||
				MultiLineComment.class.isInstance(parent))
			return true;
		
		return false;
	}
	
}
