package org.dojo.moxie.sync;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public interface Item{
	public Integer getId();
	public Integer getOrigId();
	public long getCreatedOn();
	public long getLastUpdated();
}