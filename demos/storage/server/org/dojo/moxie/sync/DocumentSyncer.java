package org.dojo.moxie.sync;

import java.io.*;
import java.util.*;
import net.sf.json.*;

import org.dojo.moxie.*;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class DocumentSyncer implements ItemSyncer{
	public void onCreateCommand(Command c, SyncRequest syncRequest,
									SyncResponse syncResponse)
										throws SyncException{
		try{
			Document newDoc = (Document)c.getItem();
			String status = null;
			
			// see if a document with this file name already exists;
			// if it does, keep adding a number to the end until we
			// create a filename that doesn't exist
			String fileName = newDoc.getFileName();
			int counter = 1;
			boolean renamed = false;
			while(Documents.exists(fileName) == true){
				fileName = newDoc.getFileName() + counter;
				counter++;
				renamed = true;
			}
			
			if(renamed == true){
				status = "A document with the file name '" 
							+ newDoc.getFileName() + "' already exists -- "
							+ "your document was saved as "
							+ "'" + fileName + "'";
				newDoc.setFileName(fileName);
			}
			
			// save this document
			Integer origId = newDoc.getId();
			Documents.newItem(newDoc);
			newDoc = Documents.findByFileName(newDoc.getFileName());
			newDoc.setOrigId(origId);
			
			// create a command entry for this
			Command result = new Command();
			result.setItemType("documents");
			result.setName(Command.CREATED);
			result.setStatus(status);
			result.setItem(newDoc);
			
			syncResponse.getCommandLog().add(result);
			
		}catch(MoxieException e){
			throw new SyncException(e);
		}
	}
								
	public void onDeleteCommand(Command c, SyncRequest syncRequest,
									SyncResponse syncResponse)
										throws SyncException{
		// Moxie doesn't currently expose deletes through it's
		// UI - not supported
	}

	public void onUpdateCommand(Command c, SyncRequest syncRequest,
									SyncResponse syncResponse)
										throws SyncException{
								System.out.println("onUpdateCommand");
		try{
			Document updatedDoc = (Document)c.getItem();
			String status = null;
			
			// get the original document
			Document origDoc = Documents.findByID(updatedDoc.getId());
			
			// determine if the original document has had updates
			// that the updatedDoc doesn't know about
			if(updatedDoc.getLastUpdated() > origDoc.getLastUpdated()){
				// no updates happened to the original document while
				// we were away from the network
			}else{
				// updates happened to the original document while we
				// were away from the network!
				
				// see which is newer -- the original document which was
				// modified after we synced, or our updated document
				// FIXME: Do an actual merge of these two documents
				if(origDoc.getLastUpdated() > c.getTimestamp().longValue()){
					updatedDoc = origDoc;
					status = "The document '" + updatedDoc.getFileName() + "' "
								+ "was modified while you were away from the "
								+ "network and has newer data -- the server's "
								+ "version was chosen";
				}
			}
			
			// update this item, then get its newer value
			Documents.updateItem(updatedDoc);
			updatedDoc = Documents.findByID(updatedDoc.getId());
			
			// generate information on this update
			Command result = new Command();
			result.setItemType("documents");
			result.setName(Command.UPDATED);
			result.setStatus(status);
			result.setItem(updatedDoc);
			
			syncResponse.getCommandLog().add(result);
		}catch(MoxieException e){
			throw new SyncException(e);
		}
	}

	public void onOtherCommand(Command c, SyncRequest syncRequest,
									SyncResponse syncResponse)
										throws SyncException{
		// Moxie doesn't currently support other, non-standard
		// command types
	}

								
	public Item onItem(Command c, JSONObject obj, 
						SyncRequest syncRequest)
								throws SyncException{
		try{
			Integer id = obj.getInt("id");
			String fileName = obj.getString("fileName");
			long lastUpdatedTime = obj.getLong("lastUpdated");
			long createdOnTime = obj.getLong("createdOn");
			String content = obj.getString("content");
			
			// create the Document representing the item payload
			// in this item
			Document doc = new Document(id, fileName, createdOnTime,
										lastUpdatedTime, content);
										
			return (Item)doc;
		}catch(MoxieException e){
			throw new SyncException(e);
		}
	}
}