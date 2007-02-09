package org.dojo.moxie.sync;

import java.io.*;

import net.sf.json.*;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class SyncRequest{
	protected SyncDate epoch;
	protected CommandLog log;
	
	public static SyncRequest fromJSON(String content)
									throws SyncException{
		try{
			// turn the string into objects we can work with
			JSONObject jsonObj = JSONObject.fromString(content);
			
			System.out.println("jsonObj="+jsonObj);
			
			return null;
		}catch(Exception e){
			throw new SyncException(e);
		}
	}
	
	public SyncDate getEpoch(){
		return this.epoch;
	}
	
	public void setEpoch(SyncDate epoch){
		this.epoch = epoch;
	}
	
	public CommandLog getCommandLog(){
		return this.log;
	}
}
