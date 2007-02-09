package org.dojo.moxie.sync;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class SyncResponse{
	protected long serverTime;
	protected CommandLog log;
	
	public long getServerTime(){
		return this.serverTime;
	}
	
	public void setServerTime(long serverTime){
		this.serverTime = serverTime;
	}
	
	public CommandLog getCommandLog(){
		return this.log;
	}
}