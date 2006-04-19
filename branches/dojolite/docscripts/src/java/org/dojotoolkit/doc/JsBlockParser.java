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
 * <p>These must be added to the {@link org.dojotoolkit.doc.JsParser#_blockParsers _blockParsers}
 * List.</p>
 * 
 * <p>Each class has its {@link #endsBlock(char[], int, Stack) endsBlock} method called
 * to check to see if there is a valid point to end at. If there isn't, it checks
 * the {@link #startsBlock(char[], int, Stack) startsBlock} method to see if there
 * is a valid point to begin at.</p>
 * 
 * <p>Both of these methods return a {@link org.dojotoolkit.doc.data.JsBlock JsBlock}
 * object. In the case of startsBlock, it returns a new object. In the case of endsBlock,
 * it returns an existing object from the current stack of blocks.</p>
 * 
 * <p>In each case, the returned object will have its
 * {@link org.dojotoolkit.doc.data.JsBlock#getNextPosition() getNextPosition}
 * method called. This is where the next loop will take place. Any time an object is
 * returned, we start looping through the objects again at this new position.</p>
 * 
 * <p>Note: If we find a new block, we pass the new item to the
 * {@link org.dojotoolkit.doc.data.JsBlock#canAcceptBlock(JsBlock) canAcceptBlock}
 * method of the last item in the stack. If it cannot accept the block, we ignore
 * it.</p>
 * 
 * @author jkuhnert
 */
public interface JsBlockParser {
  /**
   * End of Text/Transmission (passed at the end of the parse data)
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
	 * 		If a block was started, a non null object
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
	 * 		 If a block was started, a non null object
	 */
	JsBlock endsBlock(char[] data, int position, Stack<JsBlock> blocks);
}
