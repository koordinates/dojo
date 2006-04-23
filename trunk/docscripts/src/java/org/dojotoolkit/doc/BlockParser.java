/* BlockParser.java
 * Created on Apr 16, 2006
 */
package org.dojotoolkit.doc;

import java.util.Stack;

import org.dojotoolkit.doc.data.Block;
import org.dojotoolkit.doc.data.Function;
import org.dojotoolkit.doc.data.JsBlock;

/**
 * Parses block calls
 * 
 * @see Block
 * @author nroberts
 */
public class BlockParser implements JsBlockParser {

  public boolean canStartWithBlock(JsBlock block) {
    if (Function.class.isInstance(block)) {
      return true;
    }
    return false;
  }
  
  public JsBlock startsBlock(char[] data, int position, Stack<JsBlock> blocks) {
    if (data[position] == '{') {
      JsBlock block = new Block();
      block.setStartPosition(position);
      block.setNextPosition(position);
      return block;
    }

    return null;
  }
  
  public boolean canEndWithBlock(JsBlock block) {
    if (Block.class.isInstance(block)) {
      return true;
    }
    return false;
  }

  public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks) {
    if (data[position] == '}') {
      Block block = (Block)blocks.pop();
      block.setNextPosition(position + 1);
      return block;
    }
    return null;
  }

}
