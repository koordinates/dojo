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
		if (data[position] == '"')
			return new DoubleQuotedString(position, position + 1);
		
		return null;
	}
	
	/**
	 * {@inheritDoc}
	 */
	public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks) 
	{
		if (data[position] == '"' && DoubleQuotedString.class.isInstance(blocks.peek())) {
			DoubleQuotedString string = (DoubleQuotedString)blocks.pop();
			
			string.setNextPosition(position + 1);
			
			string.setData(new String(data, string.getStartPosition() + 1,
					position - (string.getStartPosition() + 1)).trim());
			
			return string;
		}
		
		return null;
	}

}
