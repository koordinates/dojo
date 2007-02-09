package org.dojo.moxie.sync;

import java.util.*;

import org.dojo.moxie.*;

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
		// replay the client's uploads first
		syncRequest.log.replay(syncRequest, syncResponse);
		
		// now determine what to send back 
		determineResponse();
	}
	
	public SyncResponse getSyncResponse(){
		return this.syncResponse;
	}
	
	protected void determineResponse() throws SyncException{
		try{
			// send the time over to the client
			this.syncResponse.setServerTime(new Date().getTime());
		
			// keep the reponse log simple by simply clearing 
			// the client side first, then sending everything over
			Command clear = new Command();
			clear.setItemType("documents");
			clear.setName(Command.CLEAR);
			syncResponse.getCommandLog().add(clear);
			
			List<Document> allDocs = Documents.list();
			Iterator<Document> iter = allDocs.iterator();
			while(iter.hasNext()){
				Document doc = iter.next();
				Command create = new Command();
				create.setItemType("documents");
				create.setName(Command.CREATE);
				create.setItem(doc);
				
				syncResponse.getCommandLog().add(create);
			}
		}catch(MoxieException e){
			throw new SyncException(e);
		}
	}
}