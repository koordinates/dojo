package org.dojo.moxie;

public class MoxieException extends Exception{
	public MoxieException(){
		super();
	}
	
	public MoxieException(String s){
		super(s);
	}
	
	public MoxieException(String s, Throwable cause){
		super(s, cause);
	}
	
	public MoxieException(Throwable cause){
		super(cause);
	}
}