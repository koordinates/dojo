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
 * @author neildogg
 */
public class SingleLineCommentParser implements JsBlockParser {

  /** 
   * {@inheritDoc}
   */
  public JsBlock startsBlock(char[] data, int position, Stack<JsBlock> blocks) {
    if (data[position] == '/' && (position + 1) < data.length && data[position + 1] == '/') {
      Comment comment = new Comment(position, position + 2);
      comment.setType("single-line");
      return comment;
    }

    return null;
  }

  /**
   * {@inheritDoc}
   */
  public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks) {
    if (!Comment.class.isInstance(blocks.peek())) return null;
    
    Comment comment = (Comment)blocks.peek();
    if (comment.getType() == "single-line" && (data[position] == '\n' || data[position] == EOT)) {
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
