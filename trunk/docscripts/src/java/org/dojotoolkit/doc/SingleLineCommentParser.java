/* SingleLineCommentParser.java
 * Created on Apr 16, 2006
 */
package org.dojotoolkit.doc;

import java.util.Stack;
import org.dojotoolkit.doc.data.JsBlock;
import org.dojotoolkit.doc.data.MultiLineComment;
import org.dojotoolkit.doc.data.SingleLineComment;

/**
 * Handles comments that span a single line
 * 
 * @author neildogg
 */
public class SingleLineCommentParser implements BlockParser {

  /** 
   * {@inheritDoc}
   */
  public JsBlock startsBlock(char[] data, int position, Stack<JsBlock> blocks) {
    if (data[position] == '/' && (position + 1) < data.length && data[position + 1] == '/') {
      return new SingleLineComment(position, position + 2);
    }

    return null;
  }

  /**
   * {@inheritDoc}
   */
  public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks) {
    if ((data[position] == '\n' || data[position] == EOT) && SingleLineComment.class.isInstance(blocks.peek())) {

        SingleLineComment comment = (SingleLineComment)blocks.pop();

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
