import flash.external.ExternalInterface;

class DojoExternalInterface{
	public static available:Boolean;
	
	public static initialize(){
		this.available = ExternalInterface.available;
	}
	
	static addCallback(methodName:String, instance:Object, 
										 method:Function) : Boolean{
		return ExternalInterface.addCallback(methodName, instance, method);									 
	}
	
	static call(methodName:String) : Object{
		// we might have any number of optional arguments, so we have to 
		// pass them in dynamically
		ExternalInterface.call.apply(ExternalInterface, arguments);
	}
}
