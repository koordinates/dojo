/**
	dojo.Convert and dojo.crypto taken from f(m)
	Thomas R. Trenka, Ph.D.
	v.1.0.0
	2005-01-11
	
	http://dojotoolkit.org
	http://fm.dept-z.com
	
*/
dojo.Convert = (new function(){
	toBase64 : function(data) {
		if (typeof(data) == "string") data = this.toByteArray(data) ;
		var base64Enc = [
			'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 
			'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
			'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
			'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
			'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
			'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
			'w', 'x', 'y', 'z', '0', '1', '2', '3',
			'4', '5', '6', '7', '8', '9', '+', '/', 
			'='
		];
		var PADDING_CHAR = 64;		// index of padding char
		var output = [] ;			// total output
		var oc = 0;					// index accumulator for output
		var len	= data.length;
		for (var i = 0; i < len; /* nothing */ ) {
			var now  = data[i++] << 16;	
			now |= data[i++] << 8;	
			now |= data[i++];	
			output[oc++] = base64Enc[now >>> 18 & 63]; 	// 23..18
			output[oc++] = base64Enc[now >>> 12 & 63]; 	// 17..12
			output[oc++] = base64Enc[now >>> 6  & 63]; 	// 11..6
			output[oc++] = base64Enc[now        & 63]; 	// 5..0
		}
		var padAmount = i - len;
		if (padAmount > 0)  oc -= padAmount; 
		padAmount = Math.abs(padAmount);	// how much to pad
		while (padAmount-- > 0) output[oc++] = base64Enc[PADDING_CHAR];
		return output.join("");
	} ,
	fromBase64 : function(data) {
		if (typeof(data) == "string") data = data.split("") ;
		var base64Dec = {
			'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7,
			 'I': 8, 'J': 9, 'K':10, 'L':11, 'M':12, 'N':13, 'O':14, 'P':15,
			 'Q':16, 'R':17, 'S':18, 'T':19, 'U':20, 'V':21, 'W':22, 'X':23,
			 'Y':24, 'Z':25, 'a':26, 'b':27, 'c':28, 'd':29, 'e':30, 'f':31,
			 'g':32, 'h':33, 'i':34, 'j':35, 'k':36, 'l':37, 'm':38, 'n':39,
			 'o':40, 'p':41, 'q':42, 'r':43, 's':44, 't':45, 'u':46, 'v':47,
			 'w':48, 'x':49, 'y':50, 'z':51, '0':52, '1':53, '2':54, '3':55,
			 '4':56, '5':57, '6':58, '7':59, '8':60, '9':61, '+':62, '/':63,
			 '=':64
		};

		var PADDING_CHAR = 64;		// index of padding char
		var output = [] ;			// total output
		var oc = 0;					// index accumulator for input
		var len = data.length;		// 0..len-1

		while (data[--len] == base64Dec[PADDING_CHAR]) { /* nothing */ };
		for (var i = 0; i < len; /* nothing */ ) {	
			var now = base64Dec[data[i++]] << 18;	// 23..18
			now    |= base64Dec[data[i++]] << 12;	// 17..12
			now    |= base64Dec[data[i++]] << 6;	// 11..5
			now    |= base64Dec[data[i++]];		// 5..0

			output[oc++] = now >>> 16 & 255; 	// 23..16
			output[oc++] = now >>> 8  & 255; 	// 15..8
			output[oc++] = now        & 255; 	// 7..0
		}
		return output ;
	} ,
	toBinHex : function(ba) {
		if (typeof(ba) == "string") ba = this.toByteArray(ba) ;
		var hex_tab = "0123456789abcdef";
		var s = "";
		for (var i = 0; i < ba.length * 4; i++) 
			s += hex_tab.charAt((ba[i>>2] >> ((i%4)*8+4)) & 0xF) + hex_tab.charAt((ba[i>>2] >> ((i%4)*8)) & 0xF) ;
		return s;
	} ,
	toByteArray : function(s) {
		var chrsz = 8 ;
		var bin = [] ;
		var mask = (1 << chrsz) - 1;
		for (var i = 0; i < s.length * chrsz; i += chrsz) 
			bin[i >> 5] |= (s.charCodeAt(i / chrsz) & mask) << (i % 32) ;
		return bin;
	} ,
	fromByteArray : function(ba) {
		var chrsz = 8 ;
		var arr = [] ;
		var mask = (1 << chrsz) - 1 ;
		for (var i = 0; i < ba.length * 32; i += chrsz) 
			arr.push(String.fromCharCode((ba[i >> 5] >>> (i % 32)) & mask)) ;
		return arr.join("") ;
	}
})() ;


dojo.crypto = {} ;
dojo.crypto.IAsymmetricProvider = function(){
	this.computeHash = function() { } ;
} ;
dojo.crypto.ISymmetricProvider = function() {
	this.decrypt = function() { } ;
	this.encrypt = function() { } ;
} ;
dojo.crypto.cipherMode = { CBC:0, CFB:1, CTS:2, ECB:3, OFB:4 } ;

dojo.crypto.MD5Provider = function() {
	dojo.crypto.IAsymmetricProvider.call(this) ;
	var chrsz = 8 ;
	function md5_cmn(q, a, b, x, s, t){ return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b); }
	function md5_ff(a, b, c, d, x, s, t){ return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t); }
	function md5_gg(a, b, c, d, x, s, t){ return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t); }
	function md5_hh(a, b, c, d, x, s, t){ return md5_cmn(b ^ c ^ d, a, b, x, s, t); }
	function md5_ii(a, b, c, d, x, s, t){ return md5_cmn(c ^ (b | (~d)), a, b, x, s, t); }
	function safe_add(x, y) {
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF) ;
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16) ;
	  return (msw << 16) | (lsw & 0xFFFF) ;
	}
	function bit_rol(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)); }

	this.computeHash = function(x, len) {
		if (!x) throw new Error("dojo.crypto.MD5Provider.computeHash(): no arguments passed.") ;
		if (x.length && isNaN(x[0])) throw new Error("dojo.crypto.MD5Provider.computeHash(): Array passed is not a byte array.") ; 
		if (typeof(x) == "string") x = dojo.Convert.toByteArray(x) ;
		if (!len) var len = x.length ;

		x[len >> 5] |= 0x80 << ((len) % 32) ;
		x[(((len + 64) >>> 9) << 4) + 14] = len ;
		var a =  1732584193 ;
		var b = -271733879 ;
		var c = -1732584194 ;
		var d =  271733878 ;
		for (var i = 0; i < x.length; i += 16) {
			var olda = a ;
			var oldb = b ;
			var oldc = c ;
			var oldd = d ;

			a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936) ;
			d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586) ;
			c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819) ;
			b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330) ;
			a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897) ;
			d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426) ;
			c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341) ;
			b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983) ;
			a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416) ;
			d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417) ;
			c = md5_ff(c, d, a, b, x[i+10], 17, -42063) ;
			b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162) ;
			a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682) ;
			d = md5_ff(d, a, b, c, x[i+13], 12, -40341101) ;
			c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290) ;
			b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329) ;

			a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510) ;
			d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632) ;
			c = md5_gg(c, d, a, b, x[i+11], 14,  643717713) ;
			b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302) ;
			a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691) ;
			d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083) ;
			c = md5_gg(c, d, a, b, x[i+15], 14, -660478335) ;
			b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848) ;
			a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438) ;
			d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690) ;
			c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961) ;
			b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501) ;
			a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467) ;
			d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784) ;
			c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473) ;
			b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734) ;

			a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558) ;
			d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463) ;
			c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562) ;
			b = md5_hh(b, c, d, a, x[i+14], 23, -35309556) ;
			a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060) ;
			d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353) ;
			c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632) ;
			b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640) ;
			a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174) ;
			d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222) ;
			c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979) ;
			b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189) ;
			a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487) ;
			d = md5_hh(d, a, b, c, x[i+12], 11, -421815835) ;
			c = md5_hh(c, d, a, b, x[i+15], 16,  530742520) ;
			b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651) ;

			a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844) ;
			d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415) ;
			c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905) ;
			b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055) ;
			a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571) ;
			d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606) ;
			c = md5_ii(c, d, a, b, x[i+10], 15, -1051523) ;
			b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799) ;
			a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359) ;
			d = md5_ii(d, a, b, c, x[i+15], 10, -30611744) ;
			c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380) ;
			b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649) ;
			a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070) ;
			d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379) ;
			c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259) ;
			b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551) ;

			a = safe_add(a, olda) ;
			b = safe_add(b, oldb) ;
			c = safe_add(c, oldc) ;
			d = safe_add(d, oldd) ;
		}
		return Array(a, b, c, d) ;
	} ;
} ;

dojo.crypto.DESProvider = function() {
	dojo.crypto.ISymmetricProvider.call(this) ;
	//	Key bytes
	var pc2bytes0  = [0,0x4,0x20000000,0x20000004,0x10000,0x10004,0x20010000,0x20010004,0x200,0x204,0x20000200,0x20000204,0x10200,0x10204,0x20010200,0x20010204];
	var pc2bytes1  = [0,0x1,0x100000,0x100001,0x4000000,0x4000001,0x4100000,0x4100001,0x100,0x101,0x100100,0x100101,0x4000100,0x4000101,0x4100100,0x4100101];
	var pc2bytes2  = [0,0x8,0x800,0x808,0x1000000,0x1000008,0x1000800,0x1000808,0,0x8,0x800,0x808,0x1000000,0x1000008,0x1000800,0x1000808];
	var pc2bytes3  = [0,0x200000,0x8000000,0x8200000,0x2000,0x202000,0x8002000,0x8202000,0x20000,0x220000,0x8020000,0x8220000,0x22000,0x222000,0x8022000,0x8222000];
	var pc2bytes4  = [0,0x40000,0x10,0x40010,0,0x40000,0x10,0x40010,0x1000,0x41000,0x1010,0x41010,0x1000,0x41000,0x1010,0x41010];
	var pc2bytes5  = [0,0x400,0x20,0x420,0,0x400,0x20,0x420,0x2000000,0x2000400,0x2000020,0x2000420,0x2000000,0x2000400,0x2000020,0x2000420];
	var pc2bytes6  = [0,0x10000000,0x80000,0x10080000,0x2,0x10000002,0x80002,0x10080002,0,0x10000000,0x80000,0x10080000,0x2,0x10000002,0x80002,0x10080002];
	var pc2bytes7  = [0,0x10000,0x800,0x10800,0x20000000,0x20010000,0x20000800,0x20010800,0x20000,0x30000,0x20800,0x30800,0x20020000,0x20030000,0x20020800,0x20030800];
	var pc2bytes8  = [0,0x40000,0,0x40000,0x2,0x40002,0x2,0x40002,0x2000000,0x2040000,0x2000000,0x2040000,0x2000002,0x2040002,0x2000002,0x2040002];
	var pc2bytes9  = [0,0x10000000,0x8,0x10000008,0,0x10000000,0x8,0x10000008,0x400,0x10000400,0x408,0x10000408,0x400,0x10000400,0x408,0x10000408];
	var pc2bytes10 = [0,0x20,0,0x20,0x100000,0x100020,0x100000,0x100020,0x2000,0x2020,0x2000,0x2020,0x102000,0x102020,0x102000,0x102020];
	var pc2bytes11 = [0,0x1000000,0x200,0x1000200,0x200000,0x1200000,0x200200,0x1200200,0x4000000,0x5000000,0x4000200,0x5000200,0x4200000,0x5200000,0x4200200,0x5200200];
	var pc2bytes12 = [0,0x1000,0x8000000,0x8001000,0x80000,0x81000,0x8080000,0x8081000,0x10,0x1010,0x8000010,0x8001010,0x80010,0x81010,0x8080010,0x8081010];
	var pc2bytes13 = [0,0x4,0x100,0x104,0,0x4,0x100,0x104,0x1,0x5,0x101,0x105,0x1,0x5,0x101,0x105];

	//	Message bytes
	var spfunction1 = [0x1010400,0,0x10000,0x1010404,0x1010004,0x10404,0x4,0x10000,0x400,0x1010400,0x1010404,0x400,0x1000404,0x1010004,0x1000000,0x4,0x404,0x1000400,0x1000400,0x10400,0x10400,0x1010000,0x1010000,0x1000404,0x10004,0x1000004,0x1000004,0x10004,0,0x404,0x10404,0x1000000,0x10000,0x1010404,0x4,0x1010000,0x1010400,0x1000000,0x1000000,0x400,0x1010004,0x10000,0x10400,0x1000004,0x400,0x4,0x1000404,0x10404,0x1010404,0x10004,0x1010000,0x1000404,0x1000004,0x404,0x10404,0x1010400,0x404,0x1000400,0x1000400,0,0x10004,0x10400,0,0x1010004] ;
	var spfunction2 = [0x80108020,0x80008000,0x8000,0x108020,0x100000,0x20,0x80100020,0x80008020,0x80000020,0x80108020,0x80108000,0x80000000,0x80008000,0x100000,0x20,0x80100020,0x108000,0x100020,0x80008020,0,0x80000000,0x8000,0x108020,0x80100000,0x100020,0x80000020,0,0x108000,0x8020,0x80108000,0x80100000,0x8020,0,0x108020,0x80100020,0x100000,0x80008020,0x80100000,0x80108000,0x8000,0x80100000,0x80008000,0x20,0x80108020,0x108020,0x20,0x8000,0x80000000,0x8020,0x80108000,0x100000,0x80000020,0x100020,0x80008020,0x80000020,0x100020,0x108000,0,0x80008000,0x8020,0x80000000,0x80100020,0x80108020,0x108000] ;
	var spfunction3 = [0x208,0x8020200,0,0x8020008,0x8000200,0,0x20208,0x8000200,0x20008,0x8000008,0x8000008,0x20000,0x8020208,0x20008,0x8020000,0x208,0x8000000,0x8,0x8020200,0x200,0x20200,0x8020000,0x8020008,0x20208,0x8000208,0x20200,0x20000,0x8000208,0x8,0x8020208,0x200,0x8000000,0x8020200,0x8000000,0x20008,0x208,0x20000,0x8020200,0x8000200,0,0x200,0x20008,0x8020208,0x8000200,0x8000008,0x200,0,0x8020008,0x8000208,0x20000,0x8000000,0x8020208,0x8,0x20208,0x20200,0x8000008,0x8020000,0x8000208,0x208,0x8020000,0x20208,0x8,0x8020008,0x20200] ;
	var spfunction4 = [0x802001,0x2081,0x2081,0x80,0x802080,0x800081,0x800001,0x2001,0,0x802000,0x802000,0x802081,0x81,0,0x800080,0x800001,0x1,0x2000,0x800000,0x802001,0x80,0x800000,0x2001,0x2080,0x800081,0x1,0x2080,0x800080,0x2000,0x802080,0x802081,0x81,0x800080,0x800001,0x802000,0x802081,0x81,0,0,0x802000,0x2080,0x800080,0x800081,0x1,0x802001,0x2081,0x2081,0x80,0x802081,0x81,0x1,0x2000,0x800001,0x2001,0x802080,0x800081,0x2001,0x2080,0x800000,0x802001,0x80,0x800000,0x2000,0x802080] ;
	var spfunction5 = [0x100,0x2080100,0x2080000,0x42000100,0x80000,0x100,0x40000000,0x2080000,0x40080100,0x80000,0x2000100,0x40080100,0x42000100,0x42080000,0x80100,0x40000000,0x2000000,0x40080000,0x40080000,0,0x40000100,0x42080100,0x42080100,0x2000100,0x42080000,0x40000100,0,0x42000000,0x2080100,0x2000000,0x42000000,0x80100,0x80000,0x42000100,0x100,0x2000000,0x40000000,0x2080000,0x42000100,0x40080100,0x2000100,0x40000000,0x42080000,0x2080100,0x40080100,0x100,0x2000000,0x42080000,0x42080100,0x80100,0x42000000,0x42080100,0x2080000,0,0x40080000,0x42000000,0x80100,0x2000100,0x40000100,0x80000,0,0x40080000,0x2080100,0x40000100] ;
	var spfunction6 = [0x20000010,0x20400000,0x4000,0x20404010,0x20400000,0x10,0x20404010,0x400000,0x20004000,0x404010,0x400000,0x20000010,0x400010,0x20004000,0x20000000,0x4010,0,0x400010,0x20004010,0x4000,0x404000,0x20004010,0x10,0x20400010,0x20400010,0,0x404010,0x20404000,0x4010,0x404000,0x20404000,0x20000000,0x20004000,0x10,0x20400010,0x404000,0x20404010,0x400000,0x4010,0x20000010,0x400000,0x20004000,0x20000000,0x4010,0x20000010,0x20404010,0x404000,0x20400000,0x404010,0x20404000,0,0x20400010,0x10,0x4000,0x20400000,0x404010,0x4000,0x400010,0x20004010,0,0x20404000,0x20000000,0x400010,0x20004010] ;
	var spfunction7 = [0x200000,0x4200002,0x4000802,0,0x800,0x4000802,0x200802,0x4200800,0x4200802,0x200000,0,0x4000002,0x2,0x4000000,0x4200002,0x802,0x4000800,0x200802,0x200002,0x4000800,0x4000002,0x4200000,0x4200800,0x200002,0x4200000,0x800,0x802,0x4200802,0x200800,0x2,0x4000000,0x200800,0x4000000,0x200800,0x200000,0x4000802,0x4000802,0x4200002,0x4200002,0x2,0x200002,0x4000000,0x4000800,0x200000,0x4200800,0x802,0x200802,0x4200800,0x802,0x4000002,0x4200802,0x4200000,0x200800,0,0x2,0x4200802,0,0x200802,0x4200000,0x800,0x4000002,0x4000800,0x800,0x200002] ;
	var spfunction8 = [0x10001040,0x1000,0x40000,0x10041040,0x10000000,0x10001040,0x40,0x10000000,0x40040,0x10040000,0x10041040,0x41000,0x10041000,0x41040,0x1000,0x40,0x10040000,0x10000040,0x10001000,0x1040,0x41000,0x40040,0x10040040,0x10041000,0x1040,0,0,0x10040040,0x10000040,0x10001000,0x41040,0x40000,0x41040,0x40000,0x10041000,0x1000,0x40,0x10040040,0x1000,0x41040,0x10001000,0x40,0x10000040,0x10040000,0x10040040,0x10000000,0x40000,0x10001040,0,0x10041040,0x40040,0x10000040,0x10040000,0x10001000,0x10001040,0,0x10041040,0x41000,0x41000,0x1040,0x1040,0x40040,0x10000000,0x10041000] ;

	function des_createKeys(key) {
		var iterations = 1;
		var keys = new Array (32 * iterations);
		var shifts = new Array (0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0);
		var lefttemp, righttemp, m=0, n=0, temp;

		for (var j=0; j < iterations; j++) {
			left = (key.charCodeAt(m++) << 24) | (key.charCodeAt(m++) << 16) | (key.charCodeAt(m++) << 8) | key.charCodeAt(m++);
			right = (key.charCodeAt(m++) << 24) | (key.charCodeAt(m++) << 16) | (key.charCodeAt(m++) << 8) | key.charCodeAt(m++);
			temp = ((left >>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);
			temp = ((right >>> -16) ^ left) & 0x0000ffff; left ^= temp; right ^= (temp << -16);
			temp = ((left >>> 2) ^ right) & 0x33333333; right ^= temp; left ^= (temp << 2);
			temp = ((right >>> -16) ^ left) & 0x0000ffff; left ^= temp; right ^= (temp << -16);
			temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);
			temp = ((right >>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
			temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);
			temp = (left << 8) | ((right >>> 20) & 0x000000f0);
			left = (right << 24) | ((right << 8) & 0xff0000) | ((right >>> 8) & 0xff00) | ((right >>> 24) & 0xf0);
			right = temp;
			for (var i = 0; i < shifts.length; i++) {
				if (shifts[i]) {
					left = (left << 2) | (left >>> 26); right = (right << 2) | (right >>> 26);
				} else {
					left = (left << 1) | (left >>> 27); right = (right << 1) | (right >>> 27);
				}
				left &= 0xfffffff0; right &= 0xfffffff0;
				lefttemp = pc2bytes0[left >>> 28] | pc2bytes1[(left >>> 24) & 0xf] | pc2bytes2[(left >>> 20) & 0xf] | pc2bytes3[(left >>> 16) & 0xf] | pc2bytes4[(left >>> 12) & 0xf] | pc2bytes5[(left >>> 8) & 0xf] | pc2bytes6[(left >>> 4) & 0xf];
				righttemp = pc2bytes7[right >>> 28] | pc2bytes8[(right >>> 24) & 0xf] | pc2bytes9[(right >>> 20) & 0xf] | pc2bytes10[(right >>> 16) & 0xf] | pc2bytes11[(right >>> 12) & 0xf] | pc2bytes12[(right >>> 8) & 0xf] | pc2bytes13[(right >>> 4) & 0xf];
				temp = ((righttemp >>> 16) ^ lefttemp) & 0x0000ffff; 
				keys[n++] = lefttemp ^ temp; keys[n++] = righttemp ^ (temp << 16);
			}
		}
		return keys;
	} 

	this.decrypt = function(key, message, iv, mode) {
		if (!mode) var mode = dojo.crypto.cipherMode.ECB ;
		var keys = des_createKeys(key) ;
		var m=0, i, j, temp, temp2, right1, right2, left, right, looping;
		var cbcleft, cbcleft2, cbcright, cbcright2
		var endloop, loopinc;
		var len = message.length;
		var chunk = 0;
		var iterations = 3 ; 
		looping = new Array (30, -2, -2);
		message += "\0\0\0\0\0\0\0\0"; //pad the message out with null bytes
		result = "";
		tempresult = "";
		if (mode == dojo.crypto.cipherMode.CBC) { //CBC mode
			cbcleft = (iv.charCodeAt(m++) << 24) | (iv.charCodeAt(m++) << 16) | (iv.charCodeAt(m++) << 8) | iv.charCodeAt(m++);
			cbcright = (iv.charCodeAt(m++) << 24) | (iv.charCodeAt(m++) << 16) | (iv.charCodeAt(m++) << 8) | iv.charCodeAt(m++);
			m=0;
		}

		while (m < len) {
			left = (message.charCodeAt(m++) << 24) | (message.charCodeAt(m++) << 16) | (message.charCodeAt(m++) << 8) | message.charCodeAt(m++);
			right = (message.charCodeAt(m++) << 24) | (message.charCodeAt(m++) << 16) | (message.charCodeAt(m++) << 8) | message.charCodeAt(m++);
			if (mode == dojo.crypto.cipherMode.CBC) { //CBC mode
				cbcleft2 = cbcleft; cbcright2 = cbcright; cbcleft = left; cbcright = right;
			}
			temp = ((left >>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);
			temp = ((left >>> 16) ^ right) & 0x0000ffff; right ^= temp; left ^= (temp << 16);
			temp = ((right >>> 2) ^ left) & 0x33333333; left ^= temp; right ^= (temp << 2);
			temp = ((right >>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
			temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);

			left = ((left << 1) | (left >>> 31)); 
			right = ((right << 1) | (right >>> 31)); 
			for (var j = 0; j < iterations; j+=3) {
				endloop = looping[j+1];
				loopinc = looping[j+2];
				for (var i = looping[j]; i!=endloop; i += loopinc) { //for efficiency
					right1 = right ^ keys[i]; 
					right2 = ((right >>> 4) | (right << 28)) ^ keys[i+1];
					temp = left;
					left = right;
					right = temp ^ (spfunction2[(right1 >>> 24) & 0x3f] | spfunction4[(right1 >>> 16) & 0x3f]
						| spfunction6[(right1 >>>  8) & 0x3f] | spfunction8[right1 & 0x3f]
						| spfunction1[(right2 >>> 24) & 0x3f] | spfunction3[(right2 >>> 16) & 0x3f]
						| spfunction5[(right2 >>>  8) & 0x3f] | spfunction7[right2 & 0x3f]);
				}
				temp = left; left = right; right = temp; //unreverse left and right
			}
			left = ((left >>> 1) | (left << 31)); 
			right = ((right >>> 1) | (right << 31)); 
			temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);
			temp = ((right >>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
			temp = ((right >>> 2) ^ left) & 0x33333333; left ^= temp; right ^= (temp << 2);
			temp = ((left >>> 16) ^ right) & 0x0000ffff; right ^= temp; left ^= (temp << 16);
			temp = ((left >>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);
			if (mode == dojo.crypto.cipherMode.CBC) { //CBC mode
				left ^= cbcleft2; 
				right ^= cbcright2;
			}
			tempresult += String.fromCharCode((left>>>24), ((left>>>16) & 0xff), ((left>>>8) & 0xff), (left & 0xff), (right>>>24), ((right>>>16) & 0xff), ((right>>>8) & 0xff), (right & 0xff));
			chunk += 8;
			if (chunk == 512) {
				result += tempresult; 
				tempresult = ""; 
				chunk = 0;
			}
		}
		return result + tempresult;
	} ;
	
	this.encrypt = function(key, message, iv, mode) {
		if (!mode) var mode = dojo.crypto.cipherMode.ECB ;
		var keys = des_createKeys(key) ;
		var m=0, i, j, temp, temp2, right1, right2, left, right, looping;
		var cbcleft, cbcleft2, cbcright, cbcright2
		var endloop, loopinc;
		var len = message.length;
		var chunk = 0;
		var iterations = 3 ;
		looping = new Array (0, 32, 2) ;
		message += "\0\0\0\0\0\0\0\0"; //pad the message out with null bytes
		result = "";
		tempresult = "";
		if (mode == dojo.crypto.cipherMode.CBC) { //CBC mode
			cbcleft = (iv.charCodeAt(m++) << 24) | (iv.charCodeAt(m++) << 16) | (iv.charCodeAt(m++) << 8) | iv.charCodeAt(m++);
			cbcright = (iv.charCodeAt(m++) << 24) | (iv.charCodeAt(m++) << 16) | (iv.charCodeAt(m++) << 8) | iv.charCodeAt(m++);
			m=0;
		}

		while (m < len) {
			left = (message.charCodeAt(m++) << 24) | (message.charCodeAt(m++) << 16) | (message.charCodeAt(m++) << 8) | message.charCodeAt(m++);
			right = (message.charCodeAt(m++) << 24) | (message.charCodeAt(m++) << 16) | (message.charCodeAt(m++) << 8) | message.charCodeAt(m++);
			if (mode == dojo.crypto.cipherMode.CBC) { //CBC mode
				left ^= cbcleft; right ^= cbcright;
			}
			temp = ((left >>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);
			temp = ((left >>> 16) ^ right) & 0x0000ffff; right ^= temp; left ^= (temp << 16);
			temp = ((right >>> 2) ^ left) & 0x33333333; left ^= temp; right ^= (temp << 2);
			temp = ((right >>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
			temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);

			left = ((left << 1) | (left >>> 31)); 
			right = ((right << 1) | (right >>> 31)); 
			for (var j = 0; j < iterations; j+=3) {
				endloop = looping[j+1];
				loopinc = looping[j+2];
				for (var i = looping[j]; i != endloop; i += loopinc) { //for efficiency
					right1 = right ^ keys[i]; 
					right2 = ((right >>> 4) | (right << 28)) ^ keys[i+1];
					temp = left;
					left = right;
					right = temp ^ (spfunction2[(right1 >>> 24) & 0x3f] | spfunction4[(right1 >>> 16) & 0x3f]
						| spfunction6[(right1 >>>  8) & 0x3f] | spfunction8[right1 & 0x3f]
						| spfunction1[(right2 >>> 24) & 0x3f] | spfunction3[(right2 >>> 16) & 0x3f]
						| spfunction5[(right2 >>>  8) & 0x3f] | spfunction7[right2 & 0x3f]);
				}
				temp = left; left = right; right = temp; //unreverse left and right
			}
			left = ((left >>> 1) | (left << 31)); 
			right = ((right >>> 1) | (right << 31)); 
			temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);
			temp = ((right >>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
			temp = ((right >>> 2) ^ left) & 0x33333333; left ^= temp; right ^= (temp << 2);
			temp = ((left >>> 16) ^ right) & 0x0000ffff; right ^= temp; left ^= (temp << 16);
			temp = ((left >>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);
			if (mode == dojo.crypto.cipherMode.CBC) { //CBC mode
				cbcleft = left; 
				cbcright = right;
			}
			tempresult += String.fromCharCode((left>>>24), ((left>>>16) & 0xff), ((left>>>8) & 0xff), (left & 0xff), (right>>>24), ((right>>>16) & 0xff), ((right>>>8) & 0xff), (right & 0xff));
			chunk += 8;
			if (chunk == 512) {
				result += tempresult; 
				tempresult = ""; 
				chunk = 0;
			}
		}
		return result + tempresult;
	} ;
} ;

dojo.crypto.TripleDESProvider = function() {
	dojo.crypto.ISymmetricProvider.call(this) ;
	//	Key bytes
	var pc2bytes0  = [0,0x4,0x20000000,0x20000004,0x10000,0x10004,0x20010000,0x20010004,0x200,0x204,0x20000200,0x20000204,0x10200,0x10204,0x20010200,0x20010204];
	var pc2bytes1  = [0,0x1,0x100000,0x100001,0x4000000,0x4000001,0x4100000,0x4100001,0x100,0x101,0x100100,0x100101,0x4000100,0x4000101,0x4100100,0x4100101];
	var pc2bytes2  = [0,0x8,0x800,0x808,0x1000000,0x1000008,0x1000800,0x1000808,0,0x8,0x800,0x808,0x1000000,0x1000008,0x1000800,0x1000808];
	var pc2bytes3  = [0,0x200000,0x8000000,0x8200000,0x2000,0x202000,0x8002000,0x8202000,0x20000,0x220000,0x8020000,0x8220000,0x22000,0x222000,0x8022000,0x8222000];
	var pc2bytes4  = [0,0x40000,0x10,0x40010,0,0x40000,0x10,0x40010,0x1000,0x41000,0x1010,0x41010,0x1000,0x41000,0x1010,0x41010];
	var pc2bytes5  = [0,0x400,0x20,0x420,0,0x400,0x20,0x420,0x2000000,0x2000400,0x2000020,0x2000420,0x2000000,0x2000400,0x2000020,0x2000420];
	var pc2bytes6  = [0,0x10000000,0x80000,0x10080000,0x2,0x10000002,0x80002,0x10080002,0,0x10000000,0x80000,0x10080000,0x2,0x10000002,0x80002,0x10080002];
	var pc2bytes7  = [0,0x10000,0x800,0x10800,0x20000000,0x20010000,0x20000800,0x20010800,0x20000,0x30000,0x20800,0x30800,0x20020000,0x20030000,0x20020800,0x20030800];
	var pc2bytes8  = [0,0x40000,0,0x40000,0x2,0x40002,0x2,0x40002,0x2000000,0x2040000,0x2000000,0x2040000,0x2000002,0x2040002,0x2000002,0x2040002];
	var pc2bytes9  = [0,0x10000000,0x8,0x10000008,0,0x10000000,0x8,0x10000008,0x400,0x10000400,0x408,0x10000408,0x400,0x10000400,0x408,0x10000408];
	var pc2bytes10 = [0,0x20,0,0x20,0x100000,0x100020,0x100000,0x100020,0x2000,0x2020,0x2000,0x2020,0x102000,0x102020,0x102000,0x102020];
	var pc2bytes11 = [0,0x1000000,0x200,0x1000200,0x200000,0x1200000,0x200200,0x1200200,0x4000000,0x5000000,0x4000200,0x5000200,0x4200000,0x5200000,0x4200200,0x5200200];
	var pc2bytes12 = [0,0x1000,0x8000000,0x8001000,0x80000,0x81000,0x8080000,0x8081000,0x10,0x1010,0x8000010,0x8001010,0x80010,0x81010,0x8080010,0x8081010];
	var pc2bytes13 = [0,0x4,0x100,0x104,0,0x4,0x100,0x104,0x1,0x5,0x101,0x105,0x1,0x5,0x101,0x105];

	//	Message bytes
	var spfunction1 = [0x1010400,0,0x10000,0x1010404,0x1010004,0x10404,0x4,0x10000,0x400,0x1010400,0x1010404,0x400,0x1000404,0x1010004,0x1000000,0x4,0x404,0x1000400,0x1000400,0x10400,0x10400,0x1010000,0x1010000,0x1000404,0x10004,0x1000004,0x1000004,0x10004,0,0x404,0x10404,0x1000000,0x10000,0x1010404,0x4,0x1010000,0x1010400,0x1000000,0x1000000,0x400,0x1010004,0x10000,0x10400,0x1000004,0x400,0x4,0x1000404,0x10404,0x1010404,0x10004,0x1010000,0x1000404,0x1000004,0x404,0x10404,0x1010400,0x404,0x1000400,0x1000400,0,0x10004,0x10400,0,0x1010004] ;
	var spfunction2 = [0x80108020,0x80008000,0x8000,0x108020,0x100000,0x20,0x80100020,0x80008020,0x80000020,0x80108020,0x80108000,0x80000000,0x80008000,0x100000,0x20,0x80100020,0x108000,0x100020,0x80008020,0,0x80000000,0x8000,0x108020,0x80100000,0x100020,0x80000020,0,0x108000,0x8020,0x80108000,0x80100000,0x8020,0,0x108020,0x80100020,0x100000,0x80008020,0x80100000,0x80108000,0x8000,0x80100000,0x80008000,0x20,0x80108020,0x108020,0x20,0x8000,0x80000000,0x8020,0x80108000,0x100000,0x80000020,0x100020,0x80008020,0x80000020,0x100020,0x108000,0,0x80008000,0x8020,0x80000000,0x80100020,0x80108020,0x108000] ;
	var spfunction3 = [0x208,0x8020200,0,0x8020008,0x8000200,0,0x20208,0x8000200,0x20008,0x8000008,0x8000008,0x20000,0x8020208,0x20008,0x8020000,0x208,0x8000000,0x8,0x8020200,0x200,0x20200,0x8020000,0x8020008,0x20208,0x8000208,0x20200,0x20000,0x8000208,0x8,0x8020208,0x200,0x8000000,0x8020200,0x8000000,0x20008,0x208,0x20000,0x8020200,0x8000200,0,0x200,0x20008,0x8020208,0x8000200,0x8000008,0x200,0,0x8020008,0x8000208,0x20000,0x8000000,0x8020208,0x8,0x20208,0x20200,0x8000008,0x8020000,0x8000208,0x208,0x8020000,0x20208,0x8,0x8020008,0x20200] ;
	var spfunction4 = [0x802001,0x2081,0x2081,0x80,0x802080,0x800081,0x800001,0x2001,0,0x802000,0x802000,0x802081,0x81,0,0x800080,0x800001,0x1,0x2000,0x800000,0x802001,0x80,0x800000,0x2001,0x2080,0x800081,0x1,0x2080,0x800080,0x2000,0x802080,0x802081,0x81,0x800080,0x800001,0x802000,0x802081,0x81,0,0,0x802000,0x2080,0x800080,0x800081,0x1,0x802001,0x2081,0x2081,0x80,0x802081,0x81,0x1,0x2000,0x800001,0x2001,0x802080,0x800081,0x2001,0x2080,0x800000,0x802001,0x80,0x800000,0x2000,0x802080] ;
	var spfunction5 = [0x100,0x2080100,0x2080000,0x42000100,0x80000,0x100,0x40000000,0x2080000,0x40080100,0x80000,0x2000100,0x40080100,0x42000100,0x42080000,0x80100,0x40000000,0x2000000,0x40080000,0x40080000,0,0x40000100,0x42080100,0x42080100,0x2000100,0x42080000,0x40000100,0,0x42000000,0x2080100,0x2000000,0x42000000,0x80100,0x80000,0x42000100,0x100,0x2000000,0x40000000,0x2080000,0x42000100,0x40080100,0x2000100,0x40000000,0x42080000,0x2080100,0x40080100,0x100,0x2000000,0x42080000,0x42080100,0x80100,0x42000000,0x42080100,0x2080000,0,0x40080000,0x42000000,0x80100,0x2000100,0x40000100,0x80000,0,0x40080000,0x2080100,0x40000100] ;
	var spfunction6 = [0x20000010,0x20400000,0x4000,0x20404010,0x20400000,0x10,0x20404010,0x400000,0x20004000,0x404010,0x400000,0x20000010,0x400010,0x20004000,0x20000000,0x4010,0,0x400010,0x20004010,0x4000,0x404000,0x20004010,0x10,0x20400010,0x20400010,0,0x404010,0x20404000,0x4010,0x404000,0x20404000,0x20000000,0x20004000,0x10,0x20400010,0x404000,0x20404010,0x400000,0x4010,0x20000010,0x400000,0x20004000,0x20000000,0x4010,0x20000010,0x20404010,0x404000,0x20400000,0x404010,0x20404000,0,0x20400010,0x10,0x4000,0x20400000,0x404010,0x4000,0x400010,0x20004010,0,0x20404000,0x20000000,0x400010,0x20004010] ;
	var spfunction7 = [0x200000,0x4200002,0x4000802,0,0x800,0x4000802,0x200802,0x4200800,0x4200802,0x200000,0,0x4000002,0x2,0x4000000,0x4200002,0x802,0x4000800,0x200802,0x200002,0x4000800,0x4000002,0x4200000,0x4200800,0x200002,0x4200000,0x800,0x802,0x4200802,0x200800,0x2,0x4000000,0x200800,0x4000000,0x200800,0x200000,0x4000802,0x4000802,0x4200002,0x4200002,0x2,0x200002,0x4000000,0x4000800,0x200000,0x4200800,0x802,0x200802,0x4200800,0x802,0x4000002,0x4200802,0x4200000,0x200800,0,0x2,0x4200802,0,0x200802,0x4200000,0x800,0x4000002,0x4000800,0x800,0x200002] ;
	var spfunction8 = [0x10001040,0x1000,0x40000,0x10041040,0x10000000,0x10001040,0x40,0x10000000,0x40040,0x10040000,0x10041040,0x41000,0x10041000,0x41040,0x1000,0x40,0x10040000,0x10000040,0x10001000,0x1040,0x41000,0x40040,0x10040040,0x10041000,0x1040,0,0,0x10040040,0x10000040,0x10001000,0x41040,0x40000,0x41040,0x40000,0x10041000,0x1000,0x40,0x10040040,0x1000,0x41040,0x10001000,0x40,0x10000040,0x10040000,0x10040040,0x10000000,0x40000,0x10001040,0,0x10041040,0x40040,0x10000040,0x10040000,0x10001000,0x10001040,0,0x10041040,0x41000,0x41000,0x1040,0x1040,0x40040,0x10000000,0x10041000] ;

	function des_createKeys(key) {
		var iterations = 3 ;
		var keys = new Array (32 * iterations);
		var shifts = new Array (0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0);
		var lefttemp, righttemp, m=0, n=0, temp;

		for (var j = 0; j < iterations; j++) { //either 1 or 3 iterations
			left = (key.charCodeAt(m++) << 24) | (key.charCodeAt(m++) << 16) | (key.charCodeAt(m++) << 8) | key.charCodeAt(m++);
			right = (key.charCodeAt(m++) << 24) | (key.charCodeAt(m++) << 16) | (key.charCodeAt(m++) << 8) | key.charCodeAt(m++);
			temp = ((left >>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);
			temp = ((right >>> -16) ^ left) & 0x0000ffff; left ^= temp; right ^= (temp << -16);
			temp = ((left >>> 2) ^ right) & 0x33333333; right ^= temp; left ^= (temp << 2);
			temp = ((right >>> -16) ^ left) & 0x0000ffff; left ^= temp; right ^= (temp << -16);
			temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);
			temp = ((right >>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
			temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);
			temp = (left << 8) | ((right >>> 20) & 0x000000f0);
			left = (right << 24) | ((right << 8) & 0xff0000) | ((right >>> 8) & 0xff00) | ((right >>> 24) & 0xf0);
			right = temp;
			for (i=0; i < shifts.length; i++) {
				if (shifts[i]) {
					left = (left << 2) | (left >>> 26); 
					right = (right << 2) | (right >>> 26);
				} else {
					left = (left << 1) | (left >>> 27); 
					right = (right << 1) | (right >>> 27);
				}
				left &= 0xfffffff0; 
				right &= 0xfffffff0;
				lefttemp = pc2bytes0[left >>> 28] | pc2bytes1[(left >>> 24) & 0xf]
						| pc2bytes2[(left >>> 20) & 0xf] | pc2bytes3[(left >>> 16) & 0xf]
						| pc2bytes4[(left >>> 12) & 0xf] | pc2bytes5[(left >>> 8) & 0xf]
						| pc2bytes6[(left >>> 4) & 0xf];
				righttemp = pc2bytes7[right >>> 28] | pc2bytes8[(right >>> 24) & 0xf]
						| pc2bytes9[(right >>> 20) & 0xf] | pc2bytes10[(right >>> 16) & 0xf]
						| pc2bytes11[(right >>> 12) & 0xf] | pc2bytes12[(right >>> 8) & 0xf]
						| pc2bytes13[(right >>> 4) & 0xf];
				temp = ((righttemp >>> 16) ^ lefttemp) & 0x0000ffff; 
				keys[n++] = lefttemp ^ temp; keys[n++] = righttemp ^ (temp << 16);
			}
		}
		return keys;
	} 

	this.decrypt = function(key, message, iv, mode) {
		if (!mode) var mode = dojo.crypto.cipherMode.ECB ;
		var keys = des_createKeys(key) ;
		var m=0, i, j, temp, temp2, right1, right2, left, right, looping;
		var cbcleft, cbcleft2, cbcright, cbcright2
		var endloop, loopinc;
		var len = message.length;
		var chunk = 0;
		var iterations = 9; //single or triple des
		looping = new Array (94, 62, -2, 32, 64, 2, 30, -2, -2);
		message += "\0\0\0\0\0\0\0\0"; //pad the message out with null bytes
		result = "";
		tempresult = "";
		if (mode == dojo.crypto.cipherMode.CBC) { //CBC mode
			cbcleft = (iv.charCodeAt(m++) << 24) | (iv.charCodeAt(m++) << 16) | (iv.charCodeAt(m++) << 8) | iv.charCodeAt(m++);
			cbcright = (iv.charCodeAt(m++) << 24) | (iv.charCodeAt(m++) << 16) | (iv.charCodeAt(m++) << 8) | iv.charCodeAt(m++);
			m=0;
		}

		while (m < len) {
			left = (message.charCodeAt(m++) << 24) | (message.charCodeAt(m++) << 16) | (message.charCodeAt(m++) << 8) | message.charCodeAt(m++);
			right = (message.charCodeAt(m++) << 24) | (message.charCodeAt(m++) << 16) | (message.charCodeAt(m++) << 8) | message.charCodeAt(m++);
			if (mode == dojo.crypto.cipherMode.CBC) { //CBC mode
				cbcleft2 = cbcleft; cbcright2 = cbcright; cbcleft = left; cbcright = right;
			}
			temp = ((left >>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);
			temp = ((left >>> 16) ^ right) & 0x0000ffff; right ^= temp; left ^= (temp << 16);
			temp = ((right >>> 2) ^ left) & 0x33333333; left ^= temp; right ^= (temp << 2);
			temp = ((right >>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
			temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);

			left = ((left << 1) | (left >>> 31)); 
			right = ((right << 1) | (right >>> 31)); 
			for (var j = 0; j < iterations; j+=3) {
				endloop = looping[j+1];
				loopinc = looping[j+2];
				for (var i = looping[j]; i != endloop; i+=loopinc) { //for efficiency
					right1 = right ^ keys[i]; 
					right2 = ((right >>> 4) | (right << 28)) ^ keys[i+1];
					temp = left;
					left = right;
					right = temp ^ (spfunction2[(right1 >>> 24) & 0x3f] | spfunction4[(right1 >>> 16) & 0x3f]
						| spfunction6[(right1 >>>  8) & 0x3f] | spfunction8[right1 & 0x3f]
						| spfunction1[(right2 >>> 24) & 0x3f] | spfunction3[(right2 >>> 16) & 0x3f]
						| spfunction5[(right2 >>>  8) & 0x3f] | spfunction7[right2 & 0x3f]);
				}
				temp = left; left = right; right = temp; //unreverse left and right
			}
			left = ((left >>> 1) | (left << 31)); 
			right = ((right >>> 1) | (right << 31)); 
			temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);
			temp = ((right >>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
			temp = ((right >>> 2) ^ left) & 0x33333333; left ^= temp; right ^= (temp << 2);
			temp = ((left >>> 16) ^ right) & 0x0000ffff; right ^= temp; left ^= (temp << 16);
			temp = ((left >>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);
			if (mode == dojo.crypto.cipherMode.CBC) { //CBC mode
				left ^= cbcleft2; 
				right ^= cbcright2;
			}
			tempresult += String.fromCharCode((left>>>24), ((left>>>16) & 0xff), ((left>>>8) & 0xff), (left & 0xff), (right>>>24), ((right>>>16) & 0xff), ((right>>>8) & 0xff), (right & 0xff));
			chunk += 8;
			if (chunk == 512) {
				result += tempresult; tempresult = ""; chunk = 0;
			}
		}
		return result + tempresult;
	} ;
	
	this.encrypt = function(key, message, iv, mode) {
		if (!mode) var mode = dojo.crypto.cipherMode.ECB ;
		var keys = des_createKeys(key) ;
		var m=0, i, j, temp, temp2, right1, right2, left, right, looping;
		var cbcleft, cbcleft2, cbcright, cbcright2
		var endloop, loopinc;
		var len = message.length;
		var chunk = 0;
		var iterations = 9; //single or triple des
		looping = new Array (0, 32, 2, 62, 30, -2, 64, 96, 2);
		message += "\0\0\0\0\0\0\0\0"; //pad the message out with null bytes
		result = "";
		tempresult = "";
		if (mode == dojo.crypto.cipherMode.CBC) { //CBC mode
			cbcleft = (iv.charCodeAt(m++) << 24) | (iv.charCodeAt(m++) << 16) | (iv.charCodeAt(m++) << 8) | iv.charCodeAt(m++);
			cbcright = (iv.charCodeAt(m++) << 24) | (iv.charCodeAt(m++) << 16) | (iv.charCodeAt(m++) << 8) | iv.charCodeAt(m++);
			m=0;
		}

		while (m < len) {
			left = (message.charCodeAt(m++) << 24) | (message.charCodeAt(m++) << 16) | (message.charCodeAt(m++) << 8) | message.charCodeAt(m++);
			right = (message.charCodeAt(m++) << 24) | (message.charCodeAt(m++) << 16) | (message.charCodeAt(m++) << 8) | message.charCodeAt(m++);
			if (mode == dojo.crypto.cipherMode.CBC) { //CBC mode
				left ^= cbcleft; right ^= cbcright;
			}
			temp = ((left >>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);
			temp = ((left >>> 16) ^ right) & 0x0000ffff; right ^= temp; left ^= (temp << 16);
			temp = ((right >>> 2) ^ left) & 0x33333333; left ^= temp; right ^= (temp << 2);
			temp = ((right >>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
			temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);

			left = ((left << 1) | (left >>> 31)); 
			right = ((right << 1) | (right >>> 31)); 
			for (j=0; j<iterations; j+=3) {
				endloop = looping[j+1];
				loopinc = looping[j+2];
				for (i=looping[j]; i!=endloop; i+=loopinc) { //for efficiency
					right1 = right ^ keys[i]; 
					right2 = ((right >>> 4) | (right << 28)) ^ keys[i+1];
					temp = left;
					left = right;
					right = temp ^ (spfunction2[(right1 >>> 24) & 0x3f] | spfunction4[(right1 >>> 16) & 0x3f]
						| spfunction6[(right1 >>>  8) & 0x3f] | spfunction8[right1 & 0x3f]
						| spfunction1[(right2 >>> 24) & 0x3f] | spfunction3[(right2 >>> 16) & 0x3f]
						| spfunction5[(right2 >>>  8) & 0x3f] | spfunction7[right2 & 0x3f]);
				}
				temp = left; left = right; right = temp; //unreverse left and right
			}
			left = ((left >>> 1) | (left << 31)); 
			right = ((right >>> 1) | (right << 31)); 
			temp = ((left >>> 1) ^ right) & 0x55555555; right ^= temp; left ^= (temp << 1);
			temp = ((right >>> 8) ^ left) & 0x00ff00ff; left ^= temp; right ^= (temp << 8);
			temp = ((right >>> 2) ^ left) & 0x33333333; left ^= temp; right ^= (temp << 2);
			temp = ((left >>> 16) ^ right) & 0x0000ffff; right ^= temp; left ^= (temp << 16);
			temp = ((left >>> 4) ^ right) & 0x0f0f0f0f; right ^= temp; left ^= (temp << 4);
			if (mode == dojo.crypto.cipherMode.CBC) { //CBC mode
				cbcleft = left; 
				cbcright = right;
			}
			tempresult += String.fromCharCode((left>>>24), ((left>>>16) & 0xff), ((left>>>8) & 0xff), (left & 0xff), (right>>>24), ((right>>>16) & 0xff), ((right>>>8) & 0xff), (right & 0xff));
			chunk += 8;
			if (chunk == 512) {
				result += tempresult; tempresult = ""; chunk = 0;
			}
		}
		return result + tempresult;
	} ;
} ;

dojo.crypto.SHA1Provider = function() {
	dojo.crypto.IAsymmetricProvider.call(this) ;
	var chrsz = 8 ;
	function sha1_ft(t, b, c, d) {
		if(t < 20) return (b & c) | ((~b) & d);
		if(t < 40) return b ^ c ^ d;
		if(t < 60) return (b & c) | (b & d) | (c & d);
		return b ^ c ^ d;
	}
	function sha1_kt(t) { return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 : (t < 60) ? -1894007588 : -899497514 ; }
	function safe_add(x, y) {
		var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xFFFF);
	}
	function rol(num, cnt) { return (num << cnt) | (num >>> (32 - cnt)); }

	this.computeHash = function(x, len) {
		if (!x) throw new Error("dojo.crypto.SHA1Provider.computeHash(): no arguments passed.") ;
		if (x.length && isNaN(x[0])) throw new Error("dojo.crypto.SHA1Provider.computeHash(): Array passed is not a byte array.") ; 
		if (typeof(x) == "string") x = dojo.Convert.toByteArray(x) ;
		if (!len) var len = x.length ;

		x[len >> 5] |= 0x80 << (24 - len % 32) ;
		x[((len + 64 >> 9) << 4) + 15] = len ;
		var w = Array(80) ;
		var a =  1732584193 ; var b = -271733879 ; var c = -1732584194 ; var d =  271733878 ; var e = -1009589776 ;
		for (var i = 0; i < x.length; i += 16){
			var olda = a ; var oldb = b ; var oldc = c ; var oldd = d ; var olde = e ;
			for (var j = 0; j < 80; j++){
				if (j < 16) w[j] = x[i + j] ;
				else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1) ;
				var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)))  ;
				e = d ; d = c ; c = rol(b, 30) ; b = a ; a = t ;
			}
			a = safe_add(a, olda) ; b = safe_add(b, oldb) ; c = safe_add(c, oldc) ; d = safe_add(d, oldd) ; e = safe_add(e, olde) ;
		}
		return Array(a, b, c, d, e) ;
	} ;
} ;

dojo.crypto.RijndaelProvider = function() {
	dojo.crypto.ISymmetricProvider.call(this) ;
	var keySizeInBits = 128 ;
	var blockSizeInBits = 128 ;
	var roundsArray = [ ,,,,[,,,,10,, 12,, 14],, 
							[,,,,12,, 12,, 14],, 
							[,,,,14,, 14,, 14] ];
	var shiftOffsets = [ ,,,,[,1, 2, 3],,[,1, 2, 3],,[,1, 3, 4] ];
	var Rcon = [ 
		0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 
		0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 
		0xab, 0x4d, 0x9a, 0x2f, 0x5e, 0xbc, 
		0x63, 0xc6, 0x97, 0x35, 0x6a, 0xd4, 
		0xb3, 0x7d, 0xfa, 0xef, 0xc5, 0x91 
	];
	var SBox = [
		 99, 124, 119, 123, 242, 107, 111, 197,  48,   1, 103,  43, 254, 215, 171, 
		118, 202, 130, 201, 125, 250,  89,  71, 240, 173, 212, 162, 175, 156, 164, 
		114, 192, 183, 253, 147,  38,  54,  63, 247, 204,  52, 165, 229, 241, 113, 
		216,  49,  21,   4, 199,  35, 195,  24, 150,   5, 154,   7,  18, 128, 226, 
		235,  39, 178, 117,   9, 131,  44,  26,  27, 110,  90, 160,  82,  59, 214, 
		179,  41, 227,  47, 132,  83, 209,   0, 237,  32, 252, 177,  91, 106, 203, 
		190,  57,  74,  76,  88, 207, 208, 239, 170, 251,  67,  77,  51, 133,  69, 
		249,   2, 127,  80,  60, 159, 168,  81, 163,  64, 143, 146, 157,  56, 245, 
		188, 182, 218,  33,  16, 255, 243, 210, 205,  12,  19, 236,  95, 151,  68,  
		23,  196, 167, 126,  61, 100,  93,  25, 115,  96, 129,  79, 220,  34,  42, 
		144, 136,  70, 238, 184,  20, 222,  94,  11, 219, 224,  50,  58,  10,  73,
		  6,  36,  92, 194, 211, 172,  98, 145, 149, 228, 121, 231, 200,  55, 109, 
		141, 213,  78, 169, 108,  86, 244, 234, 101, 122, 174,   8, 186, 120,  37,  
		 46,  28, 166, 180, 198, 232, 221, 116,  31,  75, 189, 139, 138, 112,  62, 
		181, 102,  72,   3, 246,  14,  97,  53,  87, 185, 134, 193,  29, 158, 225,
		248, 152,  17, 105, 217, 142, 148, 155,  30, 135, 233, 206,  85,  40, 223,
		140, 161, 137,  13, 191, 230,  66, 104,  65, 153,  45,  15, 176,  84, 187,  
		 22 
	];
	var SBoxInverse = [
		 82,   9, 106, 213,  48,  54, 165,  56, 191,  64, 163, 158, 129, 243, 215, 
		251, 124, 227,  57, 130, 155,  47, 255, 135,  52, 142,  67,  68, 196, 222, 
		233, 203,  84, 123, 148,  50, 166, 194,  35,  61, 238,  76, 149,  11,  66, 
		250, 195,  78,   8,  46, 161, 102,  40, 217,  36, 178, 118,  91, 162,  73, 
		109, 139, 209,  37, 114, 248, 246, 100, 134, 104, 152,  22, 212, 164,  92, 
		204,  93, 101, 182, 146, 108, 112,  72,  80, 253, 237, 185, 218,  94,  21,  
		 70,  87, 167, 141, 157, 132, 144, 216, 171,   0, 140, 188, 211,  10, 247, 
		228,  88,   5, 184, 179,  69,   6, 208,  44,  30, 143, 202,  63,  15,   2, 
		193, 175, 189,   3,   1,  19, 138, 107,  58, 145,  17,  65,  79, 103, 220, 
		234, 151, 242, 207, 206, 240, 180, 230, 115, 150, 172, 116,  34, 231, 173,
		 53, 133, 226, 249,  55, 232,  28, 117, 223, 110,  71, 241,  26, 113,  29, 
		 41, 197, 137, 111, 183,  98,  14, 170,  24, 190,  27, 252,  86,  62,  75, 
		198, 210, 121,  32, 154, 219, 192, 254, 120, 205,  90, 244,  31, 221, 168,
		 51, 136,   7, 199,  49, 177,  18,  16,  89,  39, 128, 236,  95,  96,  81,
		127, 169,  25, 181,  74,  13,  45, 229, 122, 159, 147, 201, 156, 239, 160,
		224,  59,  77, 174,  42, 245, 176, 200, 235, 187,  60, 131,  83, 153,  97, 
		 23,  43,   4, 126, 186, 119, 214,  38, 225, 105,  20,  99,  85,  33,  12,
		125 
	];
	function cyclicShiftLeft(theArray, positions) {
		var temp = theArray.slice(0, positions);
		theArray = theArray.slice(positions).concat(temp);
		return theArray;
	}
	var Nk = keySizeInBits / 32;                   
	var Nb = blockSizeInBits / 32;
	var Nr = roundsArray[Nk][Nb];
	function xtime(poly) {
		poly <<= 1;
		return ((poly & 0x100) ? (poly ^ 0x11B) : (poly));
	}
	function mult_GF256(x, y) {
		var bit, result = 0;
		for (bit = 1; bit < 256; bit *= 2, y = xtime(y)) {
			if (x & bit) result ^= y;
		}
		return result;
	}
	function byteSub(state, direction) {
		var S;
		if (direction == "encrypt") S = SBox;
		else S = SBoxInverse;
		for (var i = 0; i < 4; i++){           // Substitute for every byte in state
			for (var j = 0; j < Nb; j++){
				state[i][j] = S[state[i][j]];
			}
		}
	}
	function shiftRow(state, direction) {
		for (var i=1; i<4; i++){
			if (direction == "encrypt") state[i] = cyclicShiftLeft(state[i], shiftOffsets[Nb][i]);
			else state[i] = cyclicShiftLeft(state[i], Nb - shiftOffsets[Nb][i]);
		}
	}
	function mixColumn(state, direction) {
		var b = [];
		for (var j = 0; j < Nb; j++) {
			for (var i = 0; i < 4; i++) {
				if (direction == "encrypt")
					b[i] = mult_GF256(state[i][j], 2) ^ mult_GF256(state[(i+1)%4][j], 3) ^ state[(i+2)%4][j] ^ state[(i+3)%4][j];
				else 
					b[i] = mult_GF256(state[i][j], 0xE) ^ mult_GF256(state[(i+1)%4][j], 0xB) ^ mult_GF256(state[(i+2)%4][j], 0xD) ^ mult_GF256(state[(i+3)%4][j], 9);
			}
			for (var i = 0; i < 4; i++) state[i][j] = b[i];
		}
	}
	function addRoundKey(state, roundKey) {
		for (var j = 0; j < Nb; j++) {
			state[0][j] ^= (roundKey[j] & 0xFF); 
			state[1][j] ^= ((roundKey[j]>>8) & 0xFF);
			state[2][j] ^= ((roundKey[j]>>16) & 0xFF);
			state[3][j] ^= ((roundKey[j]>>24) & 0xFF);
		}
	}
	function keyExpansion(key) {
		var expandedKey = new Array();
		var temp;
		Nk = keySizeInBits / 32;                   
		Nb = blockSizeInBits / 32;
		Nr = roundsArray[Nk][Nb];
		for (var j=0; j < Nk; j++) expandedKey[j] = (key[4*j]) | (key[4*j+1]<<8) | (key[4*j+2]<<16) | (key[4*j+3]<<24);
		for (j = Nk; j < Nb * (Nr + 1); j++) {
			temp = expandedKey[j - 1];
			if (j % Nk == 0) temp = ( (SBox[(temp>>8) & 0xFF]) | (SBox[(temp>>16) & 0xFF]<<8) | (SBox[(temp>>24) & 0xFF]<<16) | (SBox[temp & 0xFF]<<24) ) ^ Rcon[Math.floor(j / Nk) - 1];
			else if (Nk > 6 && j % Nk == 4) temp = (SBox[(temp>>24) & 0xFF]<<24) | (SBox[(temp>>16) & 0xFF]<<16) | (SBox[(temp>>8) & 0xFF]<<8) | (SBox[temp & 0xFF]);
			expandedKey[j] = expandedKey[j-Nk] ^ temp;
		}
		return expandedKey;
	}
	function Round(state, roundKey) {
		byteSub(state, "encrypt");
		shiftRow(state, "encrypt");
		mixColumn(state, "encrypt");
		addRoundKey(state, roundKey);
	}
	function InverseRound(state, roundKey) {
		addRoundKey(state, roundKey);
		mixColumn(state, "decrypt");
		shiftRow(state, "decrypt");
		byteSub(state, "decrypt");
	}
	function FinalRound(state, roundKey) {
		byteSub(state, "encrypt");
		shiftRow(state, "encrypt");
		addRoundKey(state, roundKey);
	}
	function InverseFinalRound(state, roundKey){
		addRoundKey(state, roundKey);
		shiftRow(state, "decrypt");
		byteSub(state, "decrypt");  
	}

	function encrypt(block, expandedKey) {
		var i;  
		if (!block || block.length*8 != blockSizeInBits) return; 
		if (!expandedKey) return;
		block = packBytes(block);
		addRoundKey(block, expandedKey);
		for (i=1; i<Nr; i++) Round(block, expandedKey.slice(Nb*i, Nb*(i+1)));
		FinalRound(block, expandedKey.slice(Nb*Nr)); 
		return unpackBytes(block);
	} ;
	function decrypt(block, expandedKey) {
		var i;
		if (!block || block.length*8 != blockSizeInBits) return;
		if (!expandedKey) return;
		block = packBytes(block);
		InverseFinalRound(block, expandedKey.slice(Nb*Nr)); 
		for (i = Nr - 1; i>0; i--) InverseRound(block, expandedKey.slice(Nb*i, Nb*(i+1)));
		addRoundKey(block, expandedKey);
		return unpackBytes(block);
	}

	function packBytes(octets) {
		var state = new Array();
		if (!octets || octets.length % 4) return;
		state[0] = new Array();  state[1] = new Array(); 
		state[2] = new Array();  state[3] = new Array();
		for (var j=0; j<octets.length; j+= 4) {
			state[0][j/4] = octets[j];
			state[1][j/4] = octets[j+1];
			state[2][j/4] = octets[j+2];
			state[3][j/4] = octets[j+3];
		}
		return state;  
	}
	function unpackBytes(packed) {
		var result = new Array();
		for (var j=0; j<packed[0].length; j++) {
			result[result.length] = packed[0][j];
			result[result.length] = packed[1][j];
			result[result.length] = packed[2][j];
			result[result.length] = packed[3][j];
		}
		return result;
	}
	function formatPlaintext(plaintext) {
		var bpb = blockSizeInBits / 8;               // bytes per block
		var i;
		if (typeof plaintext == "string" || plaintext.indexOf) {
			plaintext = plaintext.split("");
			for (i=0; i<plaintext.length; i++) plaintext[i] = plaintext[i].charCodeAt(0) & 0xFF;
		} 
		for (i = bpb - (plaintext.length % bpb); i > 0 && i < bpb; i--) plaintext[plaintext.length] = 0;
		return plaintext;
	}

	function getRandomBytes(howMany) {
		var i;
		var bytes = new Array();
		for (i = 0; i < howMany; i++) bytes[i] = Math.round(Math.random() * 255);
		return bytes;
	}

	this.encrypt = function(key, plaintext, mode) {
		var expandedKey, i, aBlock;
		var bpb = blockSizeInBits / 8;          // bytes per block
		var ct;                                 // ciphertext
		if (!plaintext || !key)	
			throw new Error("RijndaelProvider.encrypt: You must provide both the plaintext and the key.") ;
		if (key.length * 8 != keySizeInBits) 
			throw new Error("RijndaelProvider.encrypt: the length of the key should be " + keySizeInBits / 8 + " bits.") ;
		if (!mode) var mode = dojo.crypto.cipherMode.ECB ;

		if (mode == dojo.crypto.cipherMode.CBC) ct = getRandomBytes(bpb);
		else ct = new Array();

		plaintext = formatPlaintext(plaintext);
		expandedKey = keyExpansion(key);
		for (var block = 0; block < plaintext.length / bpb; block++) {
			aBlock = plaintext.slice(block*bpb, (block+1)*bpb);
			if (mode == dojo.crypto.cipherMode.CBC){
				for (var i = 0; i < bpb; i++) aBlock[i] ^= ct[block*bpb + i];
			}
			ct = ct.concat(encrypt(aBlock, expandedKey));
		}
		return ct;
	}

	this.decrypt = function(key, ciphertext, mode) {
		var expandedKey;
		var bpb = blockSizeInBits / 8;          // bytes per block
		var pt = new Array();                   // plaintext array
		var aBlock;                             // a decrypted block
		var block;                              // current block number

		if (!ciphertext || !key) 
			throw new Error("RijndaelProvider.decrypt: You must provide both the ciphertext and the key.") ;
		if (typeof(ciphertext) == "string") 
			throw new Error("RijndaelProvider.decrypt: the ciphertext must be passed in the form of a byte array.") ;
		if (key.length*8 != keySizeInBits) 
			throw new Error("RijndaelProvider.decrypt: the length of the key should be " + keySizeInBits / 8 + " bits.") ;
		if (!mode) var mode = dojo.crypto.cipherMode.ECB ;
		expandedKey = keyExpansion(key);

		for (block = (ciphertext.length / bpb)-1; block > 0; block--) {
			aBlock = decrypt(ciphertext.slice(block*bpb,(block+1)*bpb), expandedKey);
			if (mode == dojo.crypto.cipherMode.CBC) 
				for (var i = 0; i < bpb; i++) pt[(block-1)*bpb + i] = aBlock[i] ^ ciphertext[(block-1)*bpb + i];
			else pt = aBlock.concat(pt);
		}
		if (mode == dojo.crypto.cipherMode.ECB) 
			pt = decrypt(ciphertext.slice(0, bpb), expandedKey).concat(pt);
		return pt;
	}
} ;

dojo.crypto.RipeMD160Provider = function() {
	dojo.crypto.IAsymmetricProvider.call(this) ;
	var RMDSize = 160 ;
	var X = [] ;
	function ROL(x, n){  return (x << n) | (x >>> (32 - n)) ; }
	function F(x, y, z){ return x ^ y ^ z ; } ;
	function G(x, y, z){ return (x & y) | (~x & z) ; } ;
	function H(x, y, z){ return (x | ~y) ^ z ; } ;
	function I(x, y, z){ return (x & z) | (y & ~z) ; } ;
	function J(x, y, z){ return x ^ (y | ~z) ; } ;
	function mixOneRound(a, b, c, d, e, x, s, roundNumber) {
		switch (roundNumber) {
			case 0 : a += F(b, c, d) + x + 0x00000000; break; 	// FF round 1
			case 1 : a += G(b, c, d) + x + 0x5a827999; break; 	// GG round 2
			case 2 : a += H(b, c, d) + x + 0x6ed9eba1; break; 	// HH round 3
			case 3 : a += I(b, c, d) + x + 0x8f1bbcdc; break; 	// II round 4
			case 4 : a += J(b, c, d) + x + 0xa953fd4e; break; 	// JJ round 5
			case 5 : a += J(b, c, d) + x + 0x50a28be6; break; 	// JJJ parallel 1
			case 6 : a += I(b, c, d) + x + 0x5c4dd124; break; 	// III parallel 2
			case 7 : a += H(b, c, d) + x + 0x6d703ef3; break; 	// HHH parallel 3
			case 8 : a += G(b, c, d) + x + 0x7a6d76e9; break; 	// GGG parallel 4
			case 9 : a += F(b, c, d) + x + 0x00000000; break; 	// FFF parallel 5
			default : throw new Exception("dojo.crypto.RipeMD160Provider[mixOneRound]: bad roundNumber passed (" + roundNumber + ").") ;
		}	
		a = ROL(a, s) + e;
		c = ROL(c, 10);
		a &= 0xffffffff;
		b &= 0xffffffff;
		c &= 0xffffffff;
		d &= 0xffffffff;
		e &= 0xffffffff;
		return new Array(a, b, c, d, e, x, s) ;
	}
	function MDinit(MDbuf) {
		MDbuf[0] = 0x67452301;
		MDbuf[1] = 0xefcdab89;
		MDbuf[2] = 0x98badcfe;
		MDbuf[3] = 0x10325476;
		MDbuf[4] = 0xc3d2e1f0;
	} ;
	var ROLs = [
		[11, 14, 15, 12,  5,  8,  7,  9, 11, 13, 14, 15,  6,  7,  9,  8],	// 1
		[ 7,  6,  8, 13, 11,  9,  7, 15,  7, 12, 15,  9, 11,  7, 13, 12],	// 2
		[11, 13,  6,  7, 14,  9, 13, 15, 14,  8, 13,  6,  5, 12,  7,  5],	// 3
		[11, 12, 14, 15, 14, 15,  9,  8,  9, 14,  5,  6,  8,  6,  5, 12],	// 4
		[ 9, 15,  5, 11,  6,  8, 13, 12,  5, 12, 13, 14, 11,  8,  5,  6],	// 5
		[ 8,  9,  9, 11, 13, 15, 15,  5,  7,  7,  8, 11, 14, 14, 12,  6],	// 6  (parallel 1)
		[ 9, 13, 15,  7, 12,  8,  9, 11,  7,  7, 12,  7,  6, 15, 13, 11],	// 7  (parallel 2)
		[ 9,  7, 15, 11,  8,  6,  6, 14, 12, 13,  5, 14, 13, 13,  7,  5],	// 8  (parallel 3)
		[15,  5,  8, 11, 14, 14,  6, 14,  6,  9, 12,  9, 12,  5, 15,  8],	// 9  (parallel 4)
		[ 8,  5, 12,  9, 12,  5, 14,  6,  8, 13,  6,  5, 15, 13, 11, 11]	// 10 (parallel 5)
	];
	var indexes = [
		[ 0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14, 15],	// 1
		[ 7,  4, 13,  1, 10,  6, 15,  3, 12,  0,  9,  5,  2, 14, 11,  8],	// 2
		[ 3, 10, 14,  4,  9, 15,  8,  1,  2,  7,  0,  6, 13, 11,  5, 12],	// 3
		[ 1,  9, 11, 10,  0,  8, 12,  4, 13,  3,  7, 15, 14,  5,  6,  2],	// 4
		[ 4,  0,  5,  9,  7, 12,  2, 10, 14,  1,  3,  8, 11,  6, 15, 13],	// 5
		[ 5, 14,  7,  0,  9,  2, 11,  4, 13,  6, 15,  8,  1, 10,  3, 12],	// 6  (parallel 1)
		[ 6, 11,  3,  7,  0, 13,  5, 10, 14, 15,  8, 12,  4,  9,  1,  2],	// 7  (parallel 2)
		[15,  5,  1,  3,  7, 14,  6,  9, 11,  8, 12,  2, 10,  0,  4, 13],	// 8  (parallel 3)
		[ 8,  6,  4,  1,  3, 11, 15,  0,  5, 12,  2, 13,  9,  7, 10, 14],	// 9  (parallel 4)
		[12, 15, 10,  4,  1,  5,  8,  7,  6,  2, 13, 14,  0,  3,  9, 11]	// 10 (parallel 5)
	];
	function compress (MDbuf, X) {
		blockA = new Array();	// aa, bb, cc, dd, ee (single round)
		blockB = new Array();	// aaa, bbb, ccc, ddd, eee (parallel round)
		var retBlock;		// temporary holder for returned values
		for (var i=0; i < 5; i++) {
			blockA[i] = new Number(MDbuf[i]);
			blockB[i] = new Number(MDbuf[i]);
		}
		var step = 0;
		for (var j = 0; j < 5; j++) {
			for (var i = 0; i < 16; i++) {
				retBlock = mixOneRound(blockA[(step+0) % 5], blockA[(step+1) % 5], blockA[(step+2) % 5], blockA[(step+3) % 5], blockA[(step+4) % 5], X[indexes[j][i]], ROLs[j][i], j);
				blockA[(step+0) % 5] = retBlock[0];
				blockA[(step+1) % 5] = retBlock[1];
				blockA[(step+2) % 5] = retBlock[2];
				blockA[(step+3) % 5] = retBlock[3];
				blockA[(step+4) % 5] = retBlock[4];
				step += 4;
			}
		}
		step = 0;		// reset step here - continue from aaa
		for (var j = 5; j < 10; j++) {
			for (var i = 0; i < 16; i++) {	
				retBlock = mixOneRound(blockB[(step+0) % 5], blockB[(step+1) % 5], blockB[(step+2) % 5], blockB[(step+3) % 5], blockB[(step+4) % 5], X[indexes[j][i]], ROLs[j][i], j);
				blockB[(step+0) % 5] = retBlock[0];
				blockB[(step+1) % 5] = retBlock[1];
				blockB[(step+2) % 5] = retBlock[2];
				blockB[(step+3) % 5] = retBlock[3];
				blockB[(step+4) % 5] = retBlock[4];
				step += 4;
			}
		}
		blockB[3] += blockA[2] + MDbuf[1];	// final result for MDbuf[0]
		MDbuf[1]  = MDbuf[2] + blockA[3] + blockB[4];
		MDbuf[2]  = MDbuf[3] + blockA[4] + blockB[0];
		MDbuf[3]  = MDbuf[4] + blockA[0] + blockB[1];
		MDbuf[4]  = MDbuf[0] + blockA[1] + blockB[2];
		MDbuf[0]  = blockB[3];
	}
	function zeroX(X){ for (var i = 0; i < 16; i++) X[i] = 0; }
	function MDfinish (MDbuf, strptr, lswlen, mswlen) {
		var X = new Array(16);
		zeroX(X);
		var j = 0;	// index into strptr
		for (var i = 0; i < (lswlen & 63); i++) {
			X[i >>> 2] ^= (strptr.charCodeAt(j++) & 255) << (8 * (i & 3));
		}
		X[(lswlen >>> 2) & 15] ^= 1 << (8 * (lswlen & 3) + 7);
		if ((lswlen & 63) > 55) {
			compress(MDbuf, X);
			var X = new Array(16);
			zeroX(X);
		}
		X[14] = lswlen << 3;
		X[15] = (lswlen >>> 29) | (mswlen << 3);
		compress(MDbuf, X);
	}
	function BYTES_TO_DWORD(fourChars){
		var tmp  = (fourChars.charCodeAt(3) & 255) << 24;
		tmp 	|= (fourChars.charCodeAt(2) & 255) << 16;
		tmp 	|= (fourChars.charCodeAt(1) & 255) << 8;
		tmp 	|= (fourChars.charCodeAt(0) & 255);	
		return tmp;
	}
	function RMD(message) {
		var MDbuf 	= new Array(RMDsize / 32);	// (A, B, C, D (, E)) 
		var hashcode 	= new Array(RMDsize / 8);	// for final hash value
		var length;					// length of message in bytes
		var nbytes;					// number of bytes not yet processed

		// initialize
		MDinit(MDbuf);
		length = message.length;

		var X = new Array(16);
		zeroX(X);

		// process the message in 16 word chunks
		var j=0;
		for (var nbytes=length; nbytes > 63; nbytes -= 64) {
			for (var i=0; i < 16; i++) {
				X[i] = BYTES_TO_DWORD(message.substr(j, 4));
				j += 4;
			}
			compress(MDbuf, X);
		}	// length mod 64 bytes left

		// finish
		MDfinish(MDbuf, message.substr(j), length, 0);

		for (var i=0; i < RMDsize / 8; i += 4) {
			hashcode[i]   =  MDbuf[i >>> 2] 	& 255;
			hashcode[i+1] = (MDbuf[i >>> 2] >>> 8) 	& 255;
			hashcode[i+2] = (MDbuf[i >>> 2] >>> 16) & 255;
			hashcode[i+3] = (MDbuf[i >>> 2] >>> 24) & 255;
		}
		return hashcode;
	}
	function toHex32(x) {
		var hexChars = "0123456789abcdef";
		var hex = "";

		for (var i = 0; i < 2; i++) {
			hex = String(hexChars.charAt(x & 0xf)).concat(hex);
			x >>>= 4;
		}
		return hex;
	}
	function toRMDstring(hashcode) {
		var retString = "";
		for (var i=0; i < RMDsize/8; i++) retString += toHex32(hashcode[i]);
		return retString;	
	}
	function RMDstring(message) {
		var hashcode = RMD(message);
		var retString = "";
		for (var i=0; i < RMDsize/8; i++) retString += toHex32(hashcode[i]);
		return retString;	
	}
	this.computeHash = function(msg) { return RMDstring(msg) ; } ;
} ;
