package org.dojo.moxie.sync;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public interface ItemSyncer{
	public void onCommand(Command c, CommandLog requestLog, 
							CommandLog responseLog)
								throws SyncException;
}