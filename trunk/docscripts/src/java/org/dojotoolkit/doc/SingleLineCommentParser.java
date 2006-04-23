/* SingleLineCommentParser.java
 * Created on Apr 16, 2006
 */
package org.dojotoolkit.doc;

import java.util.Stack;
import org.dojotoolkit.doc.data.JsBlock;
import org.dojotoolkit.doc.data.Comment;

/**
 * Handles comments that span a single line
 * 
 * @see Comment
 * @author neildogg
 */
public class SingleLineCommentParser implements JsBlockParser {

  public boolean canStartWithBlock(JsBlock block)
  {
    return true;
  }
  
  /** 
   * {@inheritDoc}
   */
  public JsBlock startsBlock(char[] data, int position, Stack<JsBlock> blocks) {
    if (data[position] == '/' && (position + 1) < data.length && data[position + 1] == '/') {
      Comment comment = new Comment();
      comment.setStartPosition(position);
      comment.setNextPosition(position + 2);
      comment.setType("line");
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
  public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks) {
    Comment comment = (Comment)blocks.peek();
    if (comment.getType() == "line" && (data[position] == '\n' || data[position] == EOT)) {
        blocks.pop();

        StringBuffer str = new StringBuffer();
        int i = comment.getStartPosition()+2;
        while (i < data.length && data[i] != '\n') {
          str.append(data[i]);
          i++;
        }

        comment.setData(str.toString().trim());

        comment.setNextPosition(position + 1);

        return comment;
      }
    
    return null;
  }

}
