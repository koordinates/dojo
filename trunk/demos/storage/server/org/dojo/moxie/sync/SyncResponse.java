package org.dojo.moxie.sync;

import java.util.*;
import net.sf.json.*;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class SyncResponse{
	protected long serverTime;
	protected CommandLog log = new CommandLog();
	
	public long getServerTime(){
		return this.serverTime;
	}
	
	public void setServerTime(long serverTime){
		this.serverTime = serverTime;
	}
	
	public CommandLog getCommandLog(){
		return this.log;
	}
	
	public String toString(){
		StringBuffer results = new StringBuffer();
		
		results.append("{\n");
		results.append("serverTime: " + this.serverTime + ",\n");
		results.append("log: " + this.log);
		results.append("\n}");
		
		return results.toString();
	}
	
	public String toJSON(){
		StringBuffer results = new StringBuffer();
		
		results.append("{\n");
		results.append("  serverTime: " + serverTime + ",\n");
		results.append("  commandLog: [\n");
		
		Iterator<Command> iter = log.iterator();
		while(iter.hasNext()){
			Command c = iter.next();
			// clean up JSON output - it incorrectly converts
			// nulls into empty strings and the number 0 in
			// some cases
			// FIXME: Fix this bug inside the JSON-Lib library
			// itself
			JSONObject jsonCommand = JSONObject.fromObject(c);
			if(jsonCommand.has("status")
				&& jsonCommand.getString("status").equals("")){
				jsonCommand.remove("status");
			}
			
			if(jsonCommand.has("timeoffset")
				&& jsonCommand.getLong("timeoffset") == 0){
				jsonCommand.remove("timeoffset");
			}
			
			if(jsonCommand.has("timestamp")
				&& jsonCommand.getLong("timestamp") == 0){
				jsonCommand.remove("timestamp");
			}
			
			results.append(jsonCommand.toString());
			if(iter.hasNext()){
				results.append(", \n");
			}
		}
		
		results.append("  ]\n");
		
		results.append("}\n");
		
		return results.toString();
	}
}