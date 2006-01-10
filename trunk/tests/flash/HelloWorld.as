import DojoExternalInterface;

class HelloWorld{
	public function HelloWorld(){
		DojoExternalInterface.initialize();
		DojoExternalInterface.addCallback("sayHello", this, sayHello);
	}
	
	public function sayHello(msg){
		msg = "Hello World! message=" + msg;
		getURL("javascript:alert('" + msg + "');");
		
		return "Goodbye cruel world!";
	}
	
	static function main(mc){
		getURL("javascript:alert('main method of flash')");
		_root.helloWorld = new HelloWorld();
	}
}
