package org.moxie.sync;

import java.io.*;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class SyncResponse implements java.io.Serializable{
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