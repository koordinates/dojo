<?
        require_once("./JSON.php");
        require_once('File.php');

        $json = new Services_JSON;
        $fp = new File();

        $results = array();
        $results['error'] = null;

	$jsonRequest = file_get_contents('php://input');
//	$jsonRequest = '{"params":["Blah"],"method":"myecho","id":86}';


	$req = $json->decode($jsonRequest);

	include("./testClass.php");
	$testObject = new testClass();

	$method = $req->method;
	$ret = call_user_func_array(array($testObject,$method),$req->params);
        $results['id'] = $req->id;
        $results['result'] = $ret;

	$encoded = $json->encode($results);

	print $encoded;

?>
