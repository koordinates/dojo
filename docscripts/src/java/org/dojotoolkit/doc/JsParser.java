/**
 * 
 */
package org.dojotoolkit.doc;

import java.util.ArrayList;
import java.util.List;
import java.util.Stack;

import org.dojotoolkit.doc.data.JsBlock;
import org.dojotoolkit.doc.data.JsObject;

/**
 * Parses javascript content into an object structure.
 * 
 * @author jkuhnert
 */
public class JsParser {
	
	/* the current position of the data being parsed */
	protected int _cursor;
	/* the data being parsed */
	protected char[] _data;
	
	/* the object being created */
	protected JsObject _js;
	
	/* holds references to blocks as they are parsed */
	protected Stack<JsBlock> _blocks = new Stack<JsBlock>();
	
	// Various pre-configured block parsers, each one handles
	// a different type of block, like comments, functions, etc..
  // They must be in their nesting order.
	protected static List<BlockParser> _blockParsers;
	static {
		_blockParsers = new ArrayList<BlockParser>();
		_blockParsers.add(new MultiLineCommentParser());
    _blockParsers.add(new SingleLineCommentParser());
		_blockParsers.add(new QuotedStringParser());
    _blockParsers.add(new FunctionCallParser());
    _blockParsers.add(new ParameterParser());
	}
	
	// Whether or not we have started a block
	private boolean _blockOpen = false;
	
	/* does nothing */
	public JsParser() { }
	
	/**
	 * Parses the incoming content into a usable {@link JsOBject}.
	 * @param is
	 * 			The data to read in.
	 * @return
	 * 			A {@link JsObject} that represents the content read.
	 */
	public JsObject parseContent(char[] data)
	{
		if (data == null || data.length <= 0)
			throw new IllegalArgumentException("Data was null or empty.");
		
    _data = new char[data.length + 1];
		_cursor = 0;
		_js = new JsObject();
		int length = _data.length;

    for (int i = 0; i < data.length; i++) {
      _data[i] = data[i];
    }
    _data[data.length] = 4;
    
		while (_cursor < length) {
     
			// skip any whitespace
			if (Character.isSpaceChar(_data[_cursor])) {
				_cursor++;
				continue;
			}
			
			// checks for any block closures, and closes them
			if (_blocks.size() > 0 && closeBlock()) continue;
			
			// the start of some kind of block
			startBlock();
		}
	
		return _js;
	}
	
	/**
	 * Looks for the start of one of the javascript
	 * block types we support, like functions/members/etc.
	 */
	protected void startBlock()
	{
		int length = _data.length;
		JsBlock block = null;
		
		while (_cursor < length) {
			
			// ignore whitespace
			if (Character.isSpaceChar(_data[_cursor])) {
				_cursor++;
				continue;
			}
			
			for (BlockParser parser : _blockParsers) {
				block = parser.startsBlock(_data, _cursor, _blocks);
				if (block != null) {
          if (!_blocks.isEmpty()) {
            JsBlock parent = _blocks.peek();
            if(!parent.allowedChild(block)) {
              continue;
            }
          }
					_blocks.add(block);
					_cursor = block.getNextPosition();
					_blockOpen = true;
					break;
				}
			}
			
			_cursor++;
			break;
		}
	}
	
	/**
	 * Checks for any block closures in current _cursor position and
	 * closes them.
	 * 
	 * @return True, if a block closure was found.
	 */
	protected boolean closeBlock()
	{
		if (!_blockOpen) return false;
		
		JsBlock block = null;
		
		for (BlockParser parser : _blockParsers) {
			block = parser.endsBlock(_data, _cursor, _blocks);
			
			if (block != null) {
				_cursor = block.getNextPosition();
				
				// add to containing block, if any
				if (_blocks.size() > 0)
					_blocks.peek().addBlock(block);
				else {
					
					_js.addBlock(block);
					
					_blockOpen = false;
				}
				
				return true;
			}
		}
		
		return false;
	}
}
