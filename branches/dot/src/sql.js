dojo.provide("dojo.sql");

dojo.require("dojo.off");

dojo.lang.mixin(dojo.sql, {
	_iframe: null,
	_postForm: null,
	_postSql: null,
	
	exec: function(sql){
		dojo.debug("dojo.sql.exec, sql="+sql);
	
		if(this._iframe == null){
			this._createIframe();
		}
		
		this._postSql.value = sql;
		this._postForm.submit();
	},
	
	_createIframe: function(){
		var f = document.createElement("iframe");
		f.style.position = "absolute";
		f.style.top = "-1000px";
		f.style.left = "-1000px";
		
		var body = document.getElementsByTagName("body")[0];
		body.appendChild(f);
		
		// write a form out into the iframe that we will
		// use to post SQL to the local proxy and get results
		// back
		var contents = 
						  "<html>"
						+ "<body>"
						+ "<form id='postForm' method='POST' action='/__polipo/__offline?execSQL'>"
						+ "<textarea id='sql' name='sql'></textarea>"
						+ "</form>"
						+ "</body>"
						+ "</html>";
		
		var doc = null;
		if(f.contentDocument){ // Mozilla
    		doc = f.contentDocument; 
		}else if(f.contentWindow){ // IE
			doc = f.contentWindow.document;
		}
		
		doc.open();
		doc.write(contents);
		doc.close();
		
		this._iframe = f;
		this._postForm = doc.getElementById("postForm");
		this._postSql = doc.getElementById("sql");
	},
	
	_execResults: function(name, results){
		dojo.debug("execResults, name="+name+", results="+results);
	}
});