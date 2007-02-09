package org.dojo.moxie.sync;

import java.io.*;
import java.util.*;
import net.sf.json.*;

import org.dojo.moxie.*;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class DocumentSyncer implements ItemSyncer{
	public void onCommand(Command c, CommandLog requestLog, 
							CommandLog responseLog)
								throws SyncException{
	}
								
	public Item onItem(Command c, JSONObject obj, 
						SyncRequest syncRequest)
								throws SyncException{
		try{
			Integer id = obj.getInt("id");
			long timestamp = obj.getLong("timestamp");
			String fileName = obj.getString("fileName");
			long createdOnTime = obj.getLong("createdOn");
			String content = obj.getString("content");
			
			// determine when this command occurred and when
			// it was created
			timestamp = syncRequest.getTimestamp() + timestamp;
			Date lastUpdated = new Date();
			lastUpdated.setTime(timestamp);
			Date createdOn = new Date();
			createdOn.setTime(createdOnTime);
			
			// create the Document representing the item payload
			// in this item
			Document doc = new Document(id, fileName, createdOn,
										lastUpdated, content);
			return (Item)doc;
		}catch(MoxieException e){
			throw new SyncException(e);
		}
	}
}