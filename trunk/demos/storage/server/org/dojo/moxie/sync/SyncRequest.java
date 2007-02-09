package org.dojo.moxie.sync;

import java.io.*;
import java.util.*;
import net.sf.json.*;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class SyncRequest{
	protected long timestamp;
	protected CommandLog log = new CommandLog();
	
	public SyncRequest(){}
	
	public static SyncRequest fromJSON(String content)
									throws SyncException{
		try{
			SyncRequest syncRequest = new SyncRequest();
		
			// turn the string into objects we can work with
			JSONObject jsonObj = JSONObject.fromString(content);
			System.out.println("jsonObj="+jsonObj);
			// get our timestamp for when the client last updated
			long timestamp = jsonObj.getLong("timestamp");
			syncRequest.setTimestamp(timestamp);
			System.out.println("timestamp="+timestamp);
			// get our list of commands for our CommandLog
			JSONArray log = jsonObj.getJSONArray("log");
			System.out.println("log="+log);
			Iterator logIter = log.iterator();
			while(logIter.hasNext()){
				JSONObject commandObj = (JSONObject)logIter.next();
				System.out.println("commandObj="+commandObj);
				Command c = new Command();
				
				String name = commandObj.getString("name");
				System.out.println("name="+name);
				c.setName(name);
				
				String itemType = commandObj.getString("itemType"); 
				c.setItemType(itemType);
				System.out.println("itemType="+itemType);
				
				// transform our Item JSON string into an 
				// actual object -- have this application figure
				// out how to transform this JSON item into an 
				// actual object
				ItemSyncer itemSyncer = Syncer.getItemSyncer(itemType);
				System.out.println("itemSyncer="+itemSyncer);
				JSONObject jsonItem = commandObj.getJSONObject("item");
				System.out.println("jsonItem="+jsonItem);
				Item item = itemSyncer.onItem(c, jsonItem, syncRequest);
				System.out.println("item="+item);
				
				// add this new command to our log
				syncRequest.getCommandLog().add(c);
			}
			
			return syncRequest;
		}catch(Exception e){
			throw new SyncException(e);
		}
	}
	
	public long getTimestamp(){
		return this.timestamp;
	}
	
	public void setTimestamp(long timestamp){
		this.timestamp = timestamp;
	}
	
	public CommandLog getCommandLog(){
		return this.log;
	}
	
	public String toString(){
		StringBuffer results = new StringBuffer();
		
		results.append("{");
		results.append("timestamp: " + this.timestamp + ", ");
		results.append("log: " + this.log);
		results.append("}");
		
		return results.toString();
	}
}
