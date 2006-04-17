/* Block.java
 * Created on Apr 16, 2006
 */
package org.dojotoolkit.doc.data;

import java.util.ArrayList;
import java.util.List;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

public class Block implements JsBlock {
  // containing blocks
  protected List<JsBlock> _blocks = new ArrayList<JsBlock>();
  
  /* start position taken from in original parse */
  protected int _startPosition;
  
  protected int _nextPosition;
  
  public Block(int startPosition, int nextPosition) {
    _startPosition = startPosition;
    _nextPosition = nextPosition;
  }
  
  public void setNextPosition(int nextPosition) {
    _nextPosition = nextPosition;
  }

  public void addBlock(JsBlock block) {
    _blocks.add(block);
  }

  public List<JsBlock> getBlocks() {
    return _blocks;
  }

  public void renderBlock(Element parent, Document doc) {
    Element block = doc.createElement("block");
    parent.appendChild(block);
  }

  public int getNextPosition() {
    return _nextPosition;
  }

  public boolean canAcceptBlock(JsBlock block) {
    return true;
  }

}
