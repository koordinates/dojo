/**
* @file AppenderBuffer.js
*
* Defines burst.logging.AppenderBuffer, an instance of burst.logging.Appender .
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

//=java package burst.logging;

/**
* Subclass of Appender which is implemented as a a circular Array buffer of specified size, to hold log messages.
*/
//=java public class AppenderBuffer extends Appender {
/**
Constructor.
@param size The size of the circular array of log lines.
*/
//=java public AppenderBuffer(Number size) {super();}

burst.logging.AppenderBuffer = function(size) {
  this.size_ = size;
  this.buffer_ = new Array(size);
  this.count_ = 0;
/*
  this.format = function(logger, levelobj, mess, stack_start) {
    var line = BU_Log.format(logger, levelobj, mess, 1 + stack_start);
  }
*/
  this.appendl = function(line) {
    var index = this.count_ % this.size_;
    bu_dbgdbg("buffering line[" + index + "]=" + line);
    this.buffer_[index] = line;
    this.count_++;
  }
  this.for_lines = function(func) {
    var index = this.count_ % this.size_;
    var i;
    // count exceeds size, so it wrapped. start from index, which is earliest.
    // then start from 0 and go to index.
    if (this.count_ > this.size_) {
      for(i=index;i<this.size_;++i) func(this.buffer_[i]);
    }
    for(i=0;i<index;++i) func(this.buffer_[i]);
  }
}

bu_inherits(burst.logging.AppenderBuffer, burst.logging.Appender);

//=java } // class AppenderBuffer

