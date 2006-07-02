/* VariableParser.java
 * Created on Apr 23, 2006
 */
package org.dojotoolkit.doc;

import java.util.Stack;

import org.dojotoolkit.doc.data.JsBlock;
import org.dojotoolkit.doc.data.Variable;

public class VariableParser implements JsBlockParser {

  public JsBlock startsBlock(char[] data, int position, Stack<JsBlock> blocks) {
    if ((position == 0 || !Character.isJavaIdentifierPart(data[position - 1])) && Character.isJavaIdentifierStart(data[position])) {
      int i;
      for (i = position; i < data.length; i++) {
        if (data[i] == EOT || (data[i] != '.' && !Character.isJavaIdentifierPart(data[i]))) {
          break;
        }
      }
      
      for (int j = i; j < data.length; j++) {
        if (data[j] == '(') {
          return null;
        }
        if (Character.isSpaceChar(data[j])) {
          continue;
        }
      }

      String found = new String(data, position, i - position);
      if (found.matches("[a-zA-Z0-9_$][\\w$]*(\\.[a-zA-Z0-9_$][\\w$]*)*")) {
        Variable variable = new Variable();
        variable.setStartPosition(position);
        variable.setNextPosition(i);
        variable.setName(found);
        return variable;
      }
    }
    return null;
  }

  public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks) {
    if (data[position] == ';' || data[position] == '\n' || data[position] == EOT) {
      return blocks.pop();
    }
    return null;
  }

  public boolean canStartWithBlock(JsBlock block) {
    return true;
  }

  public boolean canEndWithBlock(JsBlock block) {
    if (Variable.class.isInstance(block)) {
      return true;
    }
    return false;
  }

}
