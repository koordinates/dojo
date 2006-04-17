/**
 * 
 */
package org.dojotoolkit.doc;

import java.util.Stack;
import org.dojotoolkit.doc.data.JsBlock;
import org.dojotoolkit.doc.data.Comment;

/**
 * Handles comments that extend multiple lines. 
 * 
 * @see Comment
 * @author jkuhnert
 */
public class MultiLineCommentParser implements JsBlockParser {

	/**
	 * {@inheritDoc}
	 */
	public JsBlock startsBlock(char[] data, int position, Stack<JsBlock> blocks)
	{	
		if (data[position] == '/' && (position + 1) < data.length && data[position + 1] == '*') { 
		    Comment comment = new Comment(position, position + 2);
        comment.setType("multi-line");
        return comment;
    }
		
		return null;
	}
	
	/**
	 * {@inheritDoc}
	 */
	public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks)
	{	
    if(!Comment.class.isInstance(blocks.peek())) return null;
    
    Comment comment = (Comment)blocks.peek();
		if (comment.getType() == "multi-line" && data[position] == '/' 	&& (position - 1) >= 0 && data[position - 1] == '*') {
				blocks.pop();
				
        StringBuffer str = new StringBuffer();
        for (int i = comment.getStartPosition()+2; i < position - 2; i++) {
          str.append(data[i]);
        }
				
				comment.setData(str.toString());
				
				comment.setNextPosition(position + 1);
				
				return comment;
			}
		
		return null;
	}
	
}
