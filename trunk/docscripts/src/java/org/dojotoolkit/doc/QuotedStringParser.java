/**
 * 
 */
package org.dojotoolkit.doc;

import java.util.Stack;

import org.dojotoolkit.doc.data.QuotedString;
import org.dojotoolkit.doc.data.JsBlock;

/**
 * Parses strings that are double quoted.
 * 
 * @see {@link QuotedString}
 * @author jkuhnert
 */
public class QuotedStringParser implements BlockParser {
	
	/**
	 * {@inheritDoc}
	 */
	public JsBlock startsBlock(char[] data, int position, Stack<JsBlock> blocks) 
	{
		if (data[position] == '"' || data[position] == '\'') {
			QuotedString qs = new QuotedString(position, position + 1);
      if(data[position] == '"') {
        qs.setType("double");
      }
      else {
        qs.setType("single");
      }
      return qs;
    }
		
		return null;
	}
	
	/**
	 * {@inheritDoc}
	 */
	public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks) 
	{
    if (!QuotedString.class.isInstance(blocks.peek())) return null;
    
    QuotedString string = (QuotedString)blocks.peek();
    if (("double".equals(string.getType()) && data[position] == '"') || ("single".equals(string.getType()) && data[position] == '\'')) {
			blocks.pop();
			
			string.setNextPosition(position + 1);
			
			string.setData(new String(data, string.getStartPosition() + 1,
					position - (string.getStartPosition() + 1)).trim());
			
			return string;
		}
		
		return null;
	}

}
