package org.dojo.moxie.sync;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public interface Item{
	public Integer getID();
	public Integer getOrigID();
	public long getCreatedOn();
	public long getLastUpdated();
}