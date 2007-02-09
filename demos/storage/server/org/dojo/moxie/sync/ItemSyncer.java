package org.dojo.moxie.sync;

import net.sf.json.*;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public interface ItemSyncer{
	public void onCreateCommand(Command c, SyncRequest syncRequest,
							SyncResponse syncResponse)
								throws SyncException;
								
	public void onDeleteCommand(Command c, SyncRequest syncRequest,
							SyncResponse syncResponse)
								throws SyncException;

	public void onUpdateCommand(Command c, SyncRequest syncRequest,
							SyncResponse syncResponse)
								throws SyncException;

	public void onOtherCommand(Command c, SyncRequest syncRequest,
							SyncResponse syncResponse)
								throws SyncException;
								
	public Item onItem(Command c, JSONObject obj, 
						SyncRequest syncRequest)
								throws SyncException;
}