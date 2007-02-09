package org.dojo.moxie.sync;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class SyncResponse{
	protected SyncDate epoch;
	protected CommandLog log;
	
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