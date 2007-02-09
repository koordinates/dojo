package org.dojo.moxie.sync;

import java.util.*;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class Syncer{
	protected SyncRequest syncRequest;
	protected SyncResponse syncResponse = new SyncResponse();
	
	public Syncer(SyncRequest syncRequest){
		this.syncRequest = syncRequest;
	}

	protected static Map<String, ItemSyncer> itemSyncers = 
									new HashMap<String, ItemSyncer>();

	public static void registerItemSyncer(String itemType, ItemSyncer itemSyncer){
		itemSyncers.put(itemType, itemSyncer);
	}
	
	public static ItemSyncer getItemSyncer(String itemType){
		return itemSyncers.get(itemType);
	}
	
	public void doSync() throws SyncException{
		syncRequest.log.replay(syncRequest, syncResponse);
	}
	
	public SyncResponse getSyncResponse(){
		return this.syncResponse;
	}
}