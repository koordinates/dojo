package org.dojo.moxie;

import java.util.*;
import java.sql.*;

/**
	FIXME: We simply synchronize every method in this static class in order
	to ensure that our JDBC Connection is thread safe. This is fine for our simple
	uses as a demo app, but if Moxie needs to be used in an environment with lots
	of accesses it should be rewritten to use a thread-safe JDBC connection 
	pooling library instead; JDBC Connections are not necessarily thread-safe
	by default.
	
	@author Brad Neuberg, bkn3@columbia.edu
*/
public final class Documents{
	private static Connection con;
	
	// use PreparedStatements to protect against SQL Injection Attacks
	private static PreparedStatement listSQL = null;
	private static PreparedStatement findByFileNameSQL = null;
	private static PreparedStatement findByIDSQL = null;
	private static PreparedStatement newItemSQL = null;
	private static PreparedStatement deleteItemSQL = null;
	private static PreparedStatement updateItemSQL = null;
	
	/**
		Initializes our Documents object and underlying database connection.
	*/
	public synchronized static void initialize(String jdbcURL, String userName,
												String password, String driver)
													throws MoxieException{
		try {
			Class.forName(driver).newInstance();
			con = DriverManager.getConnection(jdbcURL, userName, password);
		}catch(Exception e) {
		  throw new MoxieException(e);
		}
	}
	
	/** Returns all available documents. */
	public synchronized static List<Document> list() throws MoxieException{
		try{
			if(listSQL == null){
				listSQL = Documents.con.prepareStatement(
								"SELECT * FROM DOCUMENTS");
			}
			
			List<Document> allDocs = new ArrayList<Document>();
			ResultSet results = listSQL.executeQuery();
			
			while(results.next()){
				Document doc = fromResultSet(results);
				allDocs.add(doc);
			}
			
			return allDocs;
		}catch(Exception e){
			throw new MoxieException(e);
		}
	}
	
	/**
		Finds the given Document based on the filename. If this file name
		does not exist than null is returned.
	*/
	public synchronized static Document findByFileName(String fileName)
												throws MoxieException{
		try{
			if(findByFileNameSQL == null){
				findByFileNameSQL = con.prepareStatement(
							"SELECT * FROM DOCUMENTS WHERE file_name=?");
			}
			
			// execute our query
			findByFileNameSQL.setString(1, fileName);
			ResultSet results = findByFileNameSQL.executeQuery();
			
			// try to get the first result
			if(results.first() == false){ // no results
				return null;
			}
			
			Document doc = fromResultSet(results);
			
			return doc;
		}catch(Exception e){
			throw new MoxieException(e);
		}						
	}
	
	/**
		Finds the given Document based on it's ID. If no Document with this
		ID exists than null is returned. 
	*/
	public synchronized static Document findByID(int id)
											throws MoxieException{
		try{
			if(findByIDSQL == null){
				findByIDSQL = con.prepareStatement(
							"SELECT * FROM DOCUMENTS WHERE ID=?");
			}
			
			// execute our query
			findByIDSQL.setInt(1, id);
			ResultSet results = findByIDSQL.executeQuery();
			
			// try to get the first result
			if(results.first() == false){ // no results
				return null;
			}
			
			Document doc = fromResultSet(results);
			
			return doc;
		}catch(Exception e){
			throw new MoxieException(e);
		}
	}
	
	/**
		Creates a new document based on the given document object.
		
		@param doc A Document object with it's values filled in; the id
		field should be a negative number to indicate that no actual id
		has been assigned to this document yet.
		
		@returns Document The new document created, with it's id field filled
		out to be an actual, assigned ID and origID filled out with the original
		value of ID. For example, if a document is passed in with ID "-2", then 
		the document returned will be an actual ID such as "2000" and origID will
		be "-2".
		
		@throws MoxieException Thrown if a document with the given file name
		already exists.
	*/
	public synchronized static Document newItem(Document doc)
											throws MoxieException{
		try{
			if(newItemSQL == null){
				newItemSQL = con.prepareStatement(
							"INSERT INTO DOCUMENTS (file_name, created_on, last_updated, content) "
								+ "VALUES (?, ?, ?, ?)");
			}
			
			// see if we exist yet
			if(exists(doc.fileName)){
				throw new MoxieException("The document '" + doc.fileName
											+ "' already exists");
			}
			
			// setup our SQL values
			newItemSQL.setString(1, doc.fileName);
			java.sql.Timestamp createdOnTimestamp = 
					new java.sql.Timestamp(doc.createdOn.getTime());
			java.sql.Timestamp lastUpdatedTimestamp = 
					new java.sql.Timestamp(doc.lastUpdated.getTime());
			newItemSQL.setTimestamp(2, createdOnTimestamp);
			newItemSQL.setTimestamp(3, lastUpdatedTimestamp);
			newItemSQL.setString(4, doc.content);
			
			// execute our insert
			newItemSQL.executeUpdate();
			
			// look the Document back up to get its
			// new ID
			Document newDoc = findByFileName(doc.fileName);
			newDoc.origID = doc.id;
			
			return newDoc;
		}catch(Exception e){
			throw new MoxieException(e);
		}							
	}
	
	public synchronized static void deleteItem(Document doc)
											throws MoxieException{
		Documents.deleteItem(doc.id);
	}
	
	/*
		Deletes a Document with the given ID.
	*/
	public synchronized static void deleteItem(int id)
											throws MoxieException{
		try{
			if(deleteItemSQL == null){
				deleteItemSQL = con.prepareStatement(
							"DELETE FROM DOCUMENTS WHERE ID = ?");
			}
			
			// execute our query
			deleteItemSQL.setInt(1, id);
			deleteItemSQL.executeUpdate();
		}catch(Exception e){
			throw new MoxieException(e);
		}						
	}
	
	/**
		Updates the given Document with new data.
		
		@throws MoxieException Thrown if a different document already
		exists with the given new file name, if a new file name
		is given.
	*/
	public synchronized static void updateItem(Document doc)
										throws MoxieException{
		try{
			if(updateItemSQL == null){
				updateItemSQL = con.prepareStatement(
							"UPDATE DOCUMENTS SET file_name = ?, "
											+ "created_on = ?, "
											+ "last_updated = ?, "
											+ "content = ? "
											+ "WHERE id = ?");
			}
			
			// see if we even exist with this ID
			if(exists(doc.id) == false){
				return;
			}
			
			// see if this file name is already taken,
			// just in case it was renamed to something already
			// existing
			Document compareMe = findByFileName(doc.fileName);
			if(compareMe != null && compareMe.fileName.equals(doc.fileName)
				&& compareMe.id != null
				&& doc.id != null
				&& compareMe.id.equals(doc.id) == false){
				throw new MoxieException("A different document with the file name "
										+ "'" + doc.fileName + "' already exists");
			}
			
			// setup our SQL values
			updateItemSQL.setString(1, doc.fileName);
			java.sql.Timestamp createdOnTimestamp = 
					new java.sql.Timestamp(doc.createdOn.getTime());
			java.sql.Timestamp lastUpdatedTimestamp = 
					new java.sql.Timestamp(doc.lastUpdated.getTime());
			updateItemSQL.setTimestamp(2, createdOnTimestamp);
			updateItemSQL.setTimestamp(3, lastUpdatedTimestamp);
			updateItemSQL.setString(4, doc.content);
			updateItemSQL.setInt(5, doc.id);
			
			// execute our insert
			updateItemSQL.executeUpdate();
		}catch(Exception e){
			throw new MoxieException(e);
		}										
	}
	
	public synchronized static boolean exists(String fileName)
										throws MoxieException{
		Document doc = findByFileName(fileName);
		return (doc != null);
	}
	
	public synchronized static boolean exists(int id)
										throws MoxieException{
		Document doc = findByID(id);
		return (doc != null);
	}
	
	private synchronized static Document fromResultSet(ResultSet results)
										throws MoxieException{
		try{
			// create a Document object with our values
			int id = results.getInt("id");
			String fileName = results.getString("file_name");
			String content = results.getString("content");
			
			// convert java.sql.Date objects to java.util.Date objects
			long createdOnTime = results.getTimestamp("created_on").getTime();
			java.util.Date createdOn = new java.util.Date(createdOnTime);
			
			long lastUpdatedTime = results.getTimestamp("last_updated").getTime();
			java.util.Date lastUpdated = new java.util.Date(lastUpdatedTime);
			
			Document doc = new Document(id, fileName, createdOn, lastUpdated, 
										content);
										
			return doc;
		}catch(Exception e){
			throw new MoxieException(e);
		}
	}
}