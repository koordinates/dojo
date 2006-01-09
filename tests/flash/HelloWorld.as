
class HelloWorld{
	public function HelloWorld(){
	}
	
	public function sayHello(msg){
		msg = "Hello World! message=" + msg;
		getURL("javascript:alert('" + msg + "');");
		
		return "Goodbye cruel world!";
	}
}
