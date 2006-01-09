import flash.external.ExternalInterface;

class DojoExternalInterface{
	public static var available:Boolean;
	
	public static function initialize(){
		DojoExternalInterface.available = ExternalInterface.available;
	}
	
	public static function addCallback(methodName:String, instance:Object, 
										 								 method:Function) : Boolean{
		return ExternalInterface.addCallback(methodName, instance, method);									 
	}
	
	public static function call(methodName:String) : Object{
		// we might have any number of optional arguments, so we have to 
		// pass them in dynamically
		return ExternalInterface.call.apply(ExternalInterface, arguments);
	}
}

// vim:ts=4:noet:tw=0:
