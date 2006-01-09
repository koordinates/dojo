/** 
		An implementation of Flash 8's ExternalInterface that works with Flash 6
		and which is source-compatible with Flash 8. 
		
		@author Brad Neuberg, bkn3@columbia.edu 
*/
		
class DojoExternalInterface{
	public static available:Boolean;
	
	public static initialize(){
		// indicate that our flash is loaded
		this.call("dojo.flash.loaded");
	}
	
	static addCallback(methodName:String, instance:Object, 
										 method:Function) : Boolean{
		return ExternalInterface.addCallback(methodName, instance, method);									 
	}
	
	static call(methodName:String) : Object{
		// FIXME: serialize the arguments better
		// FIXME: We only grab the first argument right now
		fscommand("call:"+methodName, arguments[1]);
	}
}
