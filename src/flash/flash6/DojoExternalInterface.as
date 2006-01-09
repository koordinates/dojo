/** 
		An implementation of Flash 8's ExternalInterface that works with Flash 6
		and which is source-compatible with Flash 8. 
		
		@author Brad Neuberg, bkn3@columbia.edu 
*/

class DojoExternalInterface{
	public static var available:Boolean;
	
	public static function initialize(){
		// FIXME: Set available variable
		// indicate that our flash is loaded
		DojoExternalInterface.call("dojo.flash.loaded");
	}
	
	public static function addCallback(methodName:String, instance:Object, 
										 								 method:Function) : Boolean{
		// FIXME: Add a callback								 
		return false;
	}
	
	public static function call(methodName:String) : Object{
		// FIXME: serialize the arguments better
		// FIXME: We only grab the first argument right now
		fscommand("call:"+methodName, arguments[1]);
		return false;
	}
}

// vim:ts=4:noet:tw=0:
