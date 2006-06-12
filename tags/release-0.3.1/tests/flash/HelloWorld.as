import DojoExternalInterface;

class HelloWorld{
	public function HelloWorld(){
		DojoExternalInterface.initialize();
		DojoExternalInterface.addCallback("sayHello", this, sayHello);
		DojoExternalInterface.loaded();
	}
	
	public function sayHello(msg){
		return "FLASH: Message received from JavaScript was: " + msg;
	}
	
	static function main(mc){
		//getURL("javascript:dojo.debug('FLASH:main method of flash')");
		_root.helloWorld = new HelloWorld();
	}
}
