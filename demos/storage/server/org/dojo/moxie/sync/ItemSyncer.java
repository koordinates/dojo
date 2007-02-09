package org.dojo.moxie.sync;

import net.sf.json.*;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public interface ItemSyncer{
	public void onCommand(Command c, CommandLog requestLog, 
							CommandLog responseLog)
								throws SyncException;
								
	public Item onItem(Command c, JSONObject obj, 
						SyncRequest syncRequest)
								throws SyncException;
}