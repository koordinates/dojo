import DojoExternalInterface;

class HelloWorld{
	public function HelloWorld(){
		DojoExternalInterface.initialize();
		DojoExternalInterface.addCallback("sayHello", this, sayHello);
		DojoExternalInterface.loaded();
	}
	
	public function sayHello(msg){
		msg = "Hello World! message=" + msg;
		getURL("javascript:dojo.debug('FLASH: " + msg + "');");
		
		return "Goodbye cruel world!";
	}
	
	static function main(mc){
		getURL("javascript:dojo.debug('FLASH:main method of flash')");
		_root.helloWorld = new HelloWorld();
	}
}
