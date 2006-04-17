/* BlockParser.java
 * Created on Apr 16, 2006
 */
package org.dojotoolkit.doc;

import java.util.Stack;

import org.dojotoolkit.doc.data.Block;
import org.dojotoolkit.doc.data.Function;
import org.dojotoolkit.doc.data.JsBlock;

public class BlockParser implements JsBlockParser {

  public JsBlock startsBlock(char[] data, int position, Stack<JsBlock> blocks) {
    if (blocks.isEmpty() || !Function.class.isInstance(blocks.peek())) return null;
    
    if (data[position] == '{') {
      return new Block(position, position);
    }

    return null;
  }

  public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks) {
    if (!blocks.isEmpty() && !Block.class.isInstance(blocks.peek())) return null;
    
    if (data[position] == '}') {
      Block block = (Block)blocks.pop();
      block.setNextPosition(position + 1);
      return block;
    }
    return null;
  }

}
