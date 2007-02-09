package org.moxie.sync;

import java.util.*;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class Syncer{
	public void registerItemSyncer(String itemType, ItemSyncer itemSyncer){
	}
	
	public ItemSyncer getItemSyncer(String itemType){
		return null;
	}
	
	public void doSync() throws SyncException{
	}
	
	public SyncResponse getSyncResponse(){
		return null;
	}
}