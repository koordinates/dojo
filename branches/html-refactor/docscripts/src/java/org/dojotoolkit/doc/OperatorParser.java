/* OperatorParser.java
 * Created on Apr 23, 2006
 */
package org.dojotoolkit.doc;

import java.util.Stack;

import org.dojotoolkit.doc.data.JsBlock;
import org.dojotoolkit.doc.data.Operator;

public class OperatorParser implements JsBlockParser {

  public JsBlock startsBlock(char[] data, int position, Stack<JsBlock> blocks) {
    if (data[position] == 'v' && position + 4 < data.length) {
      if (data[position + 3] != '.' && !Character.isJavaIdentifierPart(data[position + 3]) && new String(data, position, 3).equals("var")) {
        Operator operator = new Operator();
        operator.setStartPosition(position);
        operator.setNextPosition(position + 4);
        operator.setName("var");
        return operator;
      }
    }
    return null;
  }

  public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks) {
    if (data[position] == ';' || data[position] == '\n' || data[position] == EOT) {
      JsBlock block = blocks.pop();
      block.setNextPosition(position);
      return block;
    }
    return null;
  }

  public boolean canStartWithBlock(JsBlock block) {
    return true;
  }

  public boolean canEndWithBlock(JsBlock block) {
    if (Operator.class.isInstance(block)) {
      return true;
    }
    return false;
  }

}
