package org.dojo.moxie.sync;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class SyncException extends Exception{
	public SyncException(){
		super();
	}
	
	public SyncException(String s){
		super(s);
	}
	
	public SyncException(String s, Throwable cause){
		super(s, cause);
	}
	
	public SyncException(Throwable cause){
		super(cause);
	}
}