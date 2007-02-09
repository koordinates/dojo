package org.dojo.moxie.sync;

import java.util.*;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class CommandLog 
				extends java.util.ArrayList<Command>{
	public void replay(SyncRequest syncRequest, SyncResponse syncResponse) 
							throws SyncException{
		Iterator<Command> iter = this.iterator();
		while(iter.hasNext()){
			Command c = iter.next();
			
			// get the correct application sync
			// handler for this item type
			String itemType = c.getItemType();
			ItemSyncer itemSyncer = Syncer.getItemSyncer(itemType);
			
			// determine the right ItemSync callback
			String name = c.getName();
			if(name.equals(Command.CREATE)){
				itemSyncer.onCreateCommand(c, syncRequest, syncResponse);
			}else if(name.equals(Command.UPDATE)){
				itemSyncer.onUpdateCommand(c, syncRequest, syncResponse);
			}else if(name.equals(Command.DELETE)){
				itemSyncer.onDeleteCommand(c, syncRequest, syncResponse);
			}else{
				itemSyncer.onOtherCommand(c, syncRequest, syncResponse);
			}
		}
	}
	/*
	public String toJSON(){
		StringBuffer results = new StringBuffer();
		results.append("[");
		
		Iterator<Command> iter = this.iterator();
		while(iter.hasNext()){
			Command c = iter.next();
			results.append(c.toJSON());
			if(iter.hasNext()){
				results.append(", ");
			}
		}
		
		results.append("]");
	}*/
}