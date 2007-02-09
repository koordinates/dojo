package org.moxie.sync;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public interface Item extends java.io.Serializable{
	public Integer getID();
	public Integer getOrigID();
	public long getTimestamp();
}