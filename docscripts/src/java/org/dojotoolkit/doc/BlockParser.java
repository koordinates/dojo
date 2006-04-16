/**
 * 
 */
package org.dojotoolkit.doc;

import java.util.Stack;

import org.dojotoolkit.doc.data.JsBlock;

/**
 * Represents a class that handles parsing of a particular
 * kind of block. Like comments,functions, parameters, etc..
 * 
 * @author jkuhnert
 */
public interface BlockParser {
  /**
   * End of Text/Transmission
   */
  char EOT = 4;
  
	/**
	 * Checks if the character position passed in starts a block handled
	 * by this parser.
	 * 
	 * @param data
	 * 			The data this character was found in.
	 * @param position
	 * 			The current position in data that this character was found in.
	 * @param blocks
	 * 			The current block stack.
	 * @return 
	 * 		If a block was started a non null object
	 */
	JsBlock startsBlock(char[] data, int position, Stack<JsBlock> blocks);
	
	/**
	 * Checks if the current position in the data array ends this
	 * parsers block of content.
	 * 
	 * @param data
	 * 			The data to check.
	 * @param position
	 * 			The current position to check for a block end in.
	 * @param blocks
	 * 			The current block stack.
	 * @return
	 * 		 @return >= 0 If this block was ended, the number indicating the new position
	 * 				for the cursor to be set to, only if the value returned >= 0.
	 */
	JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks);
}
