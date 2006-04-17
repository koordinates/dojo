/**
 * 
 */
package org.dojotoolkit.doc;

import java.util.Stack;

import org.dojotoolkit.doc.data.Function;
import org.dojotoolkit.doc.data.JsBlock;

/**
 * Parses function calls.
 * 
 * @author jkuhnert
 */
public class FunctionParser implements JsBlockParser {
	
	/**
	 * {@inheritDoc}
	 */
	public JsBlock startsBlock(char[] data, int position, Stack<JsBlock> blocks)
	{	
    if (!blocks.isEmpty() && Function.class.isInstance(blocks.peek())) return null;

		if (data[position] == '(') {
			// now need to seek to start of call position
      boolean started = false;
			for (int j, i = (position - 1); i > -1; i--) {
        if (!started && Character.isWhitespace(data[i])) {
          continue;
        }
        started = true;

        if (!Character.isLetterOrDigit(data[i]) &&	data[i] != '_' && data[i] != '.') {
          Function fun = new Function(position, i, position-1);
          String name = new String(data, i + 1, position - i - 1);
          fun.setName(name);

          StringBuffer str = new StringBuffer();
          started = false;
				  for (j = i; j > -1; j--) {
            if (!started && Character.isWhitespace(data[j]) || data[j] == '=') {
              i = j;
              continue;
            }
            started = true;

            if ("function".equals(name)) {
              fun.setType("declare");
              if (!Character.isLetterOrDigit(data[j]) &&  data[j] != '_' && data[j] != '.') {
                fun.setName(new String(data, j + 1, i - j - 1));
                return fun;
              }
            }
            else {
              if (!Character.isLetter(data[j])) break;
              
              str.insert(0, data[j]);
              if (data[j] == 'f') {
                if ("function".equals(str.toString().trim())) {
                  fun.setType("declare");
                }
              }
            }
				  }
          
          if ("function".equals(name)) {
            fun.setName(new String(data, j + 1, i - j - 1));
          }
          
				  return fun;
				}
			}
			
			//if we get here then there wasn't anything else to parse (beginning of file)
			Function fun = new Function(position, 0, position-1);
      fun.setName(new String(data, 0, position));
      return fun;
		}

		return null;
	}
	
	/**
	 * {@inheritDoc}
	 */
	public JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks)
	{	
    if (!Function.class.isInstance(blocks.peek())) return null;

    Function fun = (Function)blocks.peek();
    
    if (data[position] == EOT || data[position] == ')') {
      if ("declare".equals(fun.getType())) {
        for (int i = position; i < data.length; i++) {
          if (Character.isSpaceChar(data[i]) || data[i] == ')') continue;
          if (data[i] != '{') break;
          return null;
        }
      }

			blocks.pop();
      if (data[position] == EOT) {
        fun.setNextPosition(position);
      }
      else {
        fun.setNextPosition(position + 1);
      }
			
			return fun;
		}
		
		return null;
	}

}
