dojo.provide("dojo.sql");

dojo.require("dojo.crypto.DES");


dojo.sql = function(){
	// There are four ways to call this:
	// 1) Straight SQL: dojo.sql("SELECT * FROM FOOBAR");
	// 2) SQL with parameters: dojo.sql("INSERT INTO FOOBAR VALUES (?)", someParam)
	// 3) Encrypting particular values: 
	//		dojo.sql("INSERT INTO FOOBAR VALUES (ENCRYPT(?))", someParam, "somePassword", callbackFunction)
	// 4) Decrypting particular values:
	//		dojo.sql("SELECT DECRYPT(SOMECOL1), DECRYPT(SOMECOL2) FROM
	//				FOOBAR WHERE SOMECOL3 = ?", someParam,
	//				"somePassword", callbackFunction)
	//
	// For encryption and decryption the last two values should be the the password for
	// encryption/decryption, and the callback function that gets the result set.
	//
	// Note: We only support ENCRYPT(?) statements, and
	// and DECRYPT(*) statements for now -- you can not have a literal string
	// inside of these, such as ENCRYPT('foobar')
	//
	// Note: If you have multiple columns to encrypt and decrypt, you can use the following
	// convenience form to not have to type ENCRYPT(?)/DECRYPT(*) many times:
	//
	// dojo.sql("INSERT INTO FOOBAR VALUES (ENCRYPT(?, ?, ?))", 
	//				someParam1, someParam2, someParam3, 
	//				"somePassword", callbackFunction)
	//
	// dojo.sql("SELECT DECRYPT(SOMECOL1, SOMECOL2) FROM
	//				FOOBAR WHERE SOMECOL3 = ?", someParam,
	//				"somePassword", callbackFunction)
	
	// determine our parameters
	var sql = null;
	var callbackFunction = null;
	var password = null;
	
	var args = new Array(arguments.length);
	for(var i = 0; i < arguments.length; i++){
		args[i] = arguments[i];
	}
	
	sql = args.splice(0, 1)[0];
	
	// does this SQL statement use the ENCRYPT or DECRYPT
	// keywords? if so, extract our callbackFunction and crypto
	// password
	if(dojo.sql._needsEncrypt(sql) || dojo.sql._needsDecrypt(sql)){
		callbackFunction = args.splice(args.length - 1, 1)[0];
		password = args.splice(args.length - 1, 1)[0];
	}
	
	// 'args' now just has the SQL parameters
	
	// get the Gears Database object
	if(dojo.sql.db == null || typeof dojo.sql.db == "undefined"){
		dojo.sql.db = google.gears.factory.create("beta.database", "1.0");
	}
	
	// print out debug SQL output if the developer wants that
	if(dojo.sql.debug == true){
		dojo.sql._printDebugSQL(sql, args);
	}
	
	// handle SQL that needs encryption/decryption differently
	// do we have an ENCRYPT SQL statement? if so, handle that first
	if(dojo.sql._needsEncrypt(sql)){
		dojo.sql._execEncryptSQL(sql, password, args, callbackFunction);
		return; // encrypted results will arrive asynchronously
	}else if(dojo.sql._needsDecrypt(sql)){ // otherwise we have a DECRYPT statement
		dojo.sql._execDecryptSQL(sql, password, args, callbackFunction);
		return; // decrypted results will arrive asynchronously
	}

	// execute the SQL and get the results
	try{
		var rs = dojo.sql.db.execute(sql, args);
	}catch(exp){
		if(typeof exp.message != "undefined"){
			throw exp.message;
		}else{
			throw exp;
		}
	}
	
	// Gears ResultSet object's are ugly -- normalize
	// these into something JavaScript programmers know
	// how to work with, basically an array of 
	// JavaScript objects where each property name is
	// simply the field name for a column of data
	return dojo.sql._normalizeResults(rs);
}

dojo.sql.dbName = "PersistentStorage";

if(typeof dojo.sql.debug == "undefined"){
	dojo.sql.debug = false;
}

dojo.sql.open = function(dbName){
	if(dojo.sql.db == null || typeof dojo.sql.db == "undefined"){
		dojo.sql.db = google.gears.factory.create('beta.database', '1.0');
	}
	
	if(typeof dbName == "undefined"){
		name = dojo.sql.dbName;
	}
	
	dojo.sql.db.open(dbName);
}

dojo.sql.close = function(dbName){
	if(dojo.sql.db == null || typeof dojo.sql.db == "undefined"){
		dojo.sql.db = google.gears.factory.create('beta.database', '1.0');
	}
	
	if(typeof dbName == "undefined"){
		name = dojo.sql.dbName;
	}
	
	dojo.sql.db.close(dbName);
}

dojo.sql._printDebugSQL = function(sql, args){
	var msg = "dojo.sql(\"" + sql + "\"";
	for(var i = 0; i < args.length; i++){
		if(typeof args[i] == "string"){
			msg += ", \"" + args[i] + "\"";
		}else{
			msg += ", " + args[i];
		}
	}
	msg += ")";
	
	dojo.debug(msg);
}

dojo.sql._needsEncrypt = function(sql){
	return /encrypt\([^\)]*\)/i.test(sql);
}

dojo.sql._needsDecrypt = function(sql){
	return /decrypt\([^\)]*\)/i.test(sql);
}

dojo.sql._execEncryptSQL = function(sql, password, args, callbackFunction){
	// strip the ENCRYPT/DECRYPT keywords from the SQL
	var strippedSQL = dojo.sql._stripCryptoSQL(sql);
	
	// determine what arguments need encryption
	var encryptColumns = dojo.sql._flagEncryptedArgs(sql, args);
	
	// asynchronously encrypt each argument that needs it
	dojo.sql._encrypt(strippedSQL, password, args, encryptColumns, function(finalArgs){
		// execute the SQL
		var error = false;
		var resultSet = new Array();
		var exp = null;
		try{
			resultSet = dojo.sql.db.execute(strippedSQL, finalArgs);
		}catch(execError){
			error = true;
			if(typeof execError.message != "undefined"){
				exp = execError.message;
			}else{
				exp = execError;
			}
		}
		
		// was there an error during SQL execution?
		if(exp != null){
			callbackFunction(null, true, exp.toString());
			return;
		}
		
		// normalize SQL results into a JavaScript object 
		// we can work with
		resultSet = dojo.sql._normalizeResults(resultSet);
				
		// are any decryptions necessary on the result set?
		if(dojo.sql._needsDecrypt(sql)){
			// determine which of the result set columns needs decryption
 			var needsDecrypt = dojo.sql._determineDecryptedColumns(sql);

			// now decrypt columns asynchronously
			// decrypt columns that need it
			dojo.sql._decrypt(resultSet, needsDecrypt, password, function(finalResultSet){
				callbackFunction(finalResultSet, false, null);
			});
		}else{
			callbackFunction(resultSet, false, null);
		}
	});
}

dojo.sql._execDecryptSQL = function(sql, password, args, callbackFunction){
	//dojo.debug("execDecryptSQL, sql="+sql+", password="+password+", args="+args);
	// strip the ENCRYPT/DECRYPT keywords from the SQL
	var strippedSQL = dojo.sql._stripCryptoSQL(sql);
	
	// determine which columns needs decryption; this either
	// returns the value *, which means all result set columns will
	// be decrypted, or it will return the column names that need
	// decryption set on a hashtable so we can quickly test a given
	// column name; the key is the column name that needs
	// decryption and the value is 'true' (i.e. needsDecrypt["someColumn"] 
	// would return 'true' if it needs decryption, and would be 'undefined'
	// or false otherwise)
	var needsDecrypt = dojo.sql._determineDecryptedColumns(sql);
	
	// execute the SQL
	var error = false;
	var resultSet = new Array();
	var exp = null;
	try{
		resultSet = dojo.sql.db.execute(strippedSQL, args);
	}catch(execError){
		error = true;
		if(typeof execError.message != "undefined"){
			exp = execError.message;
		}else{
			exp = execError;
		}
	}
	
	// was there an error during SQL execution?
	if(exp != null){
		callbackFunction(resultSet, true, exp.toString());
		return;
	}
	
	// normalize SQL results into a JavaScript object 
	// we can work with
	resultSet = dojo.sql._normalizeResults(resultSet);
	
	// decrypt columns that need it
	dojo.sql._decrypt(resultSet, needsDecrypt, password, function(finalResultSet){
		callbackFunction(finalResultSet, false, null);
	});
}

dojo.sql._encrypt = function(sql, password, args, encryptColumns, callback){
	//dojo.debug("_encrypt, sql="+sql+", password="+password+", args="+args);

	// FIXME: This means we can't run several of these concurrently
	dojo.sql._totalCrypto = 0;
	dojo.sql._finishedCrypto = 0;
	dojo.sql._finishedSpawningCrypto = false;
	dojo.sql._finalArgs = args;
	
	for(var i = 0; i < args.length; i++){
		if(encryptColumns[i] == true){
			// we have an encrypt() keyword -- get just the value inside
			// the encrypt() parantheses -- for now this must be a ?
			var sqlParam = args[i];
			var paramIndex = i;
			
			// update the total number of encryptions we know must be done asynchronously
			dojo.sql._totalCrypto++;
			
			// do the actual encryption now, asychronously on a Gears worker thread
			dojo.crypto.DES.encrypt(sqlParam, password, function(results){
				//dojo.debug("Encrypted results returned, results="+results);
				
				// set the new encrypted value
				dojo.sql._finalArgs[paramIndex] = results;
				dojo.sql._finishedCrypto++;
				// are we done with all encryption?
				if(dojo.sql._finishedCrypto >= dojo.sql._totalCrypto
					&& dojo.sql._finishedSpawningCrypto == true){
					//dojo.debug("done with all encrypts");
					callback(dojo.sql._finalArgs);
				}
			});
		}
	}
	
	dojo.sql._finishedSpawningCrypto = true;
}

dojo.sql._decrypt = function(resultSet, needsDecrypt, password, callback){
	//dojo.debug("decrypt, resultSet="+resultSet+", needsDecrypt="+needsDecrypt+", password="+password);
	// FIXME: This means we can't run several of these concurrently
	dojo.sql._totalCrypto = 0;
	dojo.sql._finishedCrypto = 0;
	dojo.sql._finishedSpawningCrypto = false;
	dojo.sql._finalResultSet = resultSet;
	
	for(var i = 0; i < resultSet.length; i++){
		var row = resultSet[i];
		
		// go through each of the column names in row,
		// seeing if they need decryption
		for(var columnName in row){
			// FIXME: If a column name starts with a number this could
			// break
			if(needsDecrypt == "*" || needsDecrypt[columnName] == true){
				dojo.sql._totalCrypto++;
				var columnValue = row[columnName];
				
				// forming a closure here can cause issues, with values not cleanly
				// saved on Firefox/Mac OS X for some of the values above that
				// are needed in the callback below; call a subroutine that will form 
				// a closure inside of itself instead
				dojo.sql._decryptSingleColumn(columnName, columnValue, password, i,
												function(finalResultSet){
					callback(finalResultSet);
				});
			}
		}
	}
	
	dojo.sql._finishedSpawningCrypto = true;
}

dojo.sql._normalizeResults = function(rs){
	var results = new Array();
	
	if(rs == null){
		return results;
	}
	
	while(rs.isValidRow() == true){
		var row = new Object();
		
		for(var i = 0; i < rs.fieldCount(); i++){
			var fieldName = rs.fieldName(i);
			var fieldValue = rs.field(i);
			// FIXME: POTENTIAL BUG: If field name starts with a number this
			// will be misinterpreted as an array position instead of a property
			// name
			row[fieldName] = fieldValue;
		}
		
		results.push(row);
		
		rs.next();
	}
	
	rs.close();
	
	return results;
}

dojo.sql._stripCryptoSQL = function(sql){
	// replace all DECRYPT(*) occurrences with a *
	sql = sql.replace(/DECRYPT\(\*\)/ig, "*");
	
	// match any ENCRYPT(?, ?, ?, etc) occurrences,
	// then replace with just the question marks in the
	// middle
	var matches = sql.match(/ENCRYPT\([^\)]*\)/ig);
	if(matches != null){
		for(var i = 0; i < matches.length; i++){
			var encryptStatement = matches[i];
			var encryptValue = encryptStatement.match(/ENCRYPT\(([^\)]*)\)/i)[1];
			sql = sql.replace(encryptStatement, encryptValue);
		}
	}
	
	// match any DECRYPT(COL1, COL2, etc) occurrences,
	// then replace with just the column names
	// in the middle
	matches = sql.match(/DECRYPT\([^\)]*\)/ig);
	if(matches != null){
		for(var i = 0; i < matches.length; i++){
			var decryptStatement = matches[i];
			var decryptValue = decryptStatement.match(/DECRYPT\(([^\)]*)\)/i)[1];
			sql = sql.replace(decryptStatement, decryptValue);
		}
	}
	
	return sql;
}

dojo.sql._flagEncryptedArgs = function(sql, args){
	// capture literal strings that have question marks in them,
	// and also capture question marks that stand alone
	var tester = new RegExp(/([\"][^\"]*\?[^\"]*[\"])|([\'][^\']*\?[^\']*[\'])|(\?)/ig);
	var matches;
	var currentParam = 0;
	var results = new Array();
	while((matches = tester.exec(sql)) != null){
	    var currentMatch = new String(RegExp.lastMatch);
	
	    // are we a literal string? then ignore it
	    if(/^[\"\']/.test(currentMatch)){
	        continue;
	    }

	    // do we have an encrypt keyword to our left?
	    var needsEncrypt = false;
	    if(/ENCRYPT\([^\)]*$/i.test(RegExp.leftContext)){
	        needsEncrypt = true;
	    }

		// set the encrypted flag
		results[currentParam] = needsEncrypt;
		
	    currentParam++;
	}
	
	return results;
}

dojo.sql._determineDecryptedColumns = function(sql){
	var results = new Object();

	if(/DECRYPT\(\*\)/i.test(sql)){
	    results = "*";
	}else{
	    var tester = /DECRYPT\((?:\s*\w*\s*\,?)*\)/ig;
	    var matches;
	    while((matches = tester.exec(sql)) != null){
	        var lastMatch = new String(RegExp.lastMatch);
	        var columnNames = lastMatch.replace(/DECRYPT\(/i, "");
	        columnNames = columnNames.replace(/\)/, "");
	        columnNames = columnNames.split(/\s*,\s*/);
	        for(var i = 0; i < columnNames.length; i++){
	            var column = columnNames[i];
	            if(/\s*\w* AS (\w*)/i.test(column)){
	                column = column.match(/\s*\w* AS (\w*)/i)[1];
	            }
	            console.log(column);
	            results[column] = true;
	        }
	    }
	}

	return results;
}

dojo.sql._decryptSingleColumn = function(columnName, columnValue, password, currentRowIndex,
										callback){
	//dojo.debug("decryptSingleColumn, columnName="+columnName+", columnValue="+columnValue+", currentRowIndex="+currentRowIndex)
	dojo.crypto.DES.decrypt(columnValue, password, function(results){
		//dojo.debug("Decrypted results returned, results="+results);
		
		// set the new decrypted value
		dojo.sql._finalResultSet[currentRowIndex][columnName] = results;
		dojo.sql._finishedCrypto++;
		// are we done with all encryption?
		if(dojo.sql._finishedCrypto >= dojo.sql._totalCrypto
			&& dojo.sql._finishedSpawningCrypto == true){
			//dojo.debug("done with all decrypts");
			callback(dojo.sql._finalResultSet);
		}
	});
}