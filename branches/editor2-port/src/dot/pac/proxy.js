function FindProxyForURL(url, host){
	if(shExpMatch(url, "http://www.codinginparadise.org*")
		|| shExpMatch(url, "http://codinginparadise.org*")){
		return "PROXY 127.0.0.1:8123";
	}else{
		return "DIRECT";
	}
}
