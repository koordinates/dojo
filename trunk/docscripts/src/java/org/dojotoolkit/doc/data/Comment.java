/* Comment.java
 * Created on Apr 16, 2006
 */
package org.dojotoolkit.doc.data;

import java.util.List;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

/**
 * Represents a single line comment block
 * 
 * @author neildogg
 */
public class Comment implements JsBlock {

  /* start position taken from in original parse */
  protected int _startPosition;
  
  protected int _nextPosition;
  
  /* The comments! */
  protected String _data;

  /* The type (multi-line, single-line)! */
  protected String _type;
  
  /**
   * Creates a new single line comment with a pre-configured start position,
   * mostly used in javascript parsing operations.
   * 
   * @param startPosition
   * @param nextPosition
   */
  public Comment(int startPosition, int nextPosition)
  {
    _startPosition = startPosition;
    _nextPosition = nextPosition;
  }
  
  public int getStartPosition()
  {
    return _startPosition;
  }
  
  /**
   * {@inheritDoc}
   */
  public void addBlock(JsBlock block) {

  }
  
  /**
   * Used by the Parser for rendering
   * 
   * @param data
   */
  public void setData(String data) {
    _data = data;
  }

  /**
   * {@inheritDoc}
   */
  public List<JsBlock> getBlocks() {
    return null;
  }

  /**
   * {@inheritDoc}
   */
  public void renderBlock(Element parent, Document doc) {
    Element comment = doc.createElement("comment");
    parent.appendChild(comment);
    
    comment.setAttribute("type", _type);
    comment.appendChild(doc.createTextNode(_data));
  }

  /**
   * {@inheritDoc}
   */
  public int getNextPosition() {
    return _nextPosition;
  }
  
  public void setNextPosition(int position) {
    _nextPosition = position;
  }

  /**
   * {@inheritDoc}
   */
  public boolean canAcceptBlock(JsBlock block) {
    return false;
  }

  public void setType(String type) {
    _type = type;
  }
  
  public String getType() {
    return _type;
  }

}
