package org.dojo.moxie.sync;

import java.util.*;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class Syncer{
	protected static Map<String, ItemSyncer> itemSyncers = 
									new HashMap<String, ItemSyncer>();

	public static void registerItemSyncer(String itemType, ItemSyncer itemSyncer){
		itemSyncers.put(itemType, itemSyncer);
	}
	
	public static ItemSyncer getItemSyncer(String itemType){
		return itemSyncers.get(itemType);
	}
	
	public void doSync() throws SyncException{
	}
	
	public SyncResponse getSyncResponse(){
		return null;
	}
}