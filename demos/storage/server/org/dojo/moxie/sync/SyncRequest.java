package org.dojo.moxie.sync;

import java.io.*;
import java.util.*;
import net.sf.json.*;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class SyncRequest{
	protected long lastSync;
	protected CommandLog log = new CommandLog();
	
	public SyncRequest(){}
	
	public static SyncRequest fromJSON(String content)
									throws SyncException{
		try{
			SyncRequest syncRequest = new SyncRequest();
		
			// turn the string into objects we can work with
			JSONObject jsonObj = JSONObject.fromString(content);
			
			// get our timestamp for when the client last updated
			long lastSync = jsonObj.getLong("lastSync");
			syncRequest.setLastSync(lastSync);
			
			// get our list of commands for our CommandLog
			JSONArray log = jsonObj.getJSONArray("log");
			Iterator logIter = log.iterator();
			while(logIter.hasNext()){
				JSONObject commandObj = (JSONObject)logIter.next();
				Command c = new Command();
				
				String name = commandObj.getString("name");
				c.setName(name);
				
				String itemType = commandObj.getString("itemType"); 
				c.setItemType(itemType);
				
				long timeoffset = commandObj.getLong("timeoffset");
				long timestamp = lastSync + timeoffset;
				c.setTimestamp(new Long(timestamp));
				
				// transform our Item JSON string into an 
				// actual object -- have this application figure
				// out how to transform this JSON item into an 
				// actual object
				ItemSyncer itemSyncer = Syncer.getItemSyncer(itemType);
				JSONObject jsonItem = commandObj.getJSONObject("item");
				Item item = itemSyncer.onItem(c, jsonItem, syncRequest);
				c.setItem(item);
				
				// add this new command to our log
				syncRequest.getCommandLog().add(c);
			}
			
			return syncRequest;
		}catch(Exception e){
			throw new SyncException(e);
		}
	}
	
	public long getLastSync(){
		return this.lastSync;
	}
	
	public void setLastSync(long lastSync){
		this.lastSync = lastSync;
	}
	
	public CommandLog getCommandLog(){
		return this.log;
	}
	
	public String toString(){
		StringBuffer results = new StringBuffer();
		
		results.append("{\n");
		results.append("lastSync: " + this.lastSync + ",\n");
		results.append("log: " + this.log);
		results.append("\n}");
		
		return results.toString();
	}
}
