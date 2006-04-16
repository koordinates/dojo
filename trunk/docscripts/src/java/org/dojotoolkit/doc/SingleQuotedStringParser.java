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
 * Parses strings that are single quoted.
 * 
 * @see {@link SingleQuotedString}
 * @author jkuhnert
 */
public class SingleQuotedStringParser implements BlockParser {
	
	/**
	 * {@inheritDoc}
	 */
	public JsBlock startsBlock(char[] data, int position, Stack<JsBlock> blocks) 
	{
		if (data[position] == '\'')
			return new SingleQuotedString(position, position + 1);
		
		return null;
	}
	
	/**
	 * {@inheritDoc}
	 */
	public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks) 
	{
		if (data[position] == '\'' && SingleQuotedString.class.isInstance(blocks.peek())) {
			
			SingleQuotedString string = (SingleQuotedString)blocks.pop();
			
			string.setData(new String(data, string.getStartPosition() + 1,
					position - (string.getStartPosition() + 1)).trim());
			
			string.setNextPosition(position + 1);
			
			return string;
		}
		
		return null;
	}

}
