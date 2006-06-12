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

  public boolean canStartWithBlock(JsBlock block)
  {
    return true;
  }
  
	/**
	 * {@inheritDoc}
	 */
	public JsBlock startsBlock(char[] data, int position, Stack<JsBlock> blocks)
	{	
		if (data[position] == '/' && (position + 1) < data.length && data[position + 1] == '*') { 
		    Comment comment = new Comment();
        comment.setStartPosition(position);
        comment.setNextPosition(position + 2);
        comment.setType("block");
        return comment;
    }
		
		return null;
	}

  public boolean canEndWithBlock(JsBlock block) {
    if (Comment.class.isInstance(block)) {
      return true;
    }
    return false;
  }
  
	/**
	 * {@inheritDoc}
	 */
	public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks)
	{	
    Comment comment = (Comment)blocks.peek();
		if (comment.getType() == "block" && data[position] == '/' 	&& (position - 1) >= 0 && data[position - 1] == '*') {
				blocks.pop();
				
        String str = new String(data, comment.getStartPosition() + 2, position - comment.getStartPosition() - 3);
				
				comment.setData(str);
				
				comment.setNextPosition(position + 1);
				
				return comment;
			}
		
		return null;
	}
	
}
