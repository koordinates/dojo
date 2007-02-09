package org.dojo.moxie.sync;

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
}