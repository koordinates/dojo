/* Operator.java
 * Created on Apr 23, 2006
 */
package org.dojotoolkit.doc.data;

import java.util.ArrayList;
import java.util.List;

import org.w3c.dom.Document;
import org.w3c.dom.Element;

public class Operator implements JsBlock {

  // start position taken from in original parse 
  protected int _startPosition;
  protected int _nextPosition;
  
  // containing blocks
  protected List<JsBlock> _blocks = new ArrayList<JsBlock>();

  protected String _name;
  
  public void addBlock(JsBlock block) {
    _blocks.add(block);
  }

  public List<JsBlock> getBlocks() {
    return _blocks;
  }

  public void renderBlock(Element parent, Document doc) {
    Element operator = doc.createElement("operator");
    operator.setAttribute("name", _name);
    parent.appendChild(operator);
    
    for (JsBlock block : _blocks) {
      block.renderBlock(operator, doc);
    }
  }

  public int getNextPosition() {
    return _nextPosition;
  }

  public void setNextPosition(int nextPosition) {
    _nextPosition = nextPosition;
  }

  public int getStartPosition() {
    return _startPosition;
  }

  public void setStartPosition(int startPosition) {
    _startPosition = startPosition;
  }

  public boolean canAcceptBlock(JsBlock block) {
    return true;
  }

  public void setName(String name) {
    _name = name;
  }

}
