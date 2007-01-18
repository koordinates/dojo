import DojoExternalInterface;

class UnitTestsComm{
	private var values = new Object();
	
	public function UnitTestsComm(){
		DojoExternalInterface.initialize();
		DojoExternalInterface.addCallback("testString", this, testString);
		DojoExternalInterface.addCallback("setValue", this, setValue);
		DojoExternalInterface.addCallback("getValue", this, getValue);
		DojoExternalInterface.addCallback("testCallingJavaScript", this, 
																			testCallingJavaScript);
		DojoExternalInterface.loaded();
	}

	public function testString(inputStr : String) : String{
		//getURL("javascript:alert('inside flash, testString, inputStr="+inputStr+"')");
		return inputStr;
	}
	
	public function setValue(name : String, value : String) : Void{
		this.values[name] = value;
	}
	
	public function getValue(name : String) : String{
		return this.values[name];
	}

	public function testCallingJavaScript(inputStr : String) : Void{
		//getURL("javascript:dojo.debug('FLASH: testCallingJavaScript, inputStr="+inputStr+"')");
		var resultsReady = function(results){
			DojoExternalInterface.call("returnResults", null, results);
		}
		var results = DojoExternalInterface.call("testCallingJavaScript", resultsReady,
																						 inputStr);
	}
	
	static function main(mc){
		//getURL("javascript:alert('FLASH: TestFlash loaded')");
		_root.testFlash = new UnitTestsComm();
	}
}
