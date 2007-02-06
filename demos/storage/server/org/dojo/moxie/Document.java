package org.dojo.moxie;

import java.util.*;
import java.util.regex.*;

public class Document{
	public Integer id;
	public Integer origID;
	public String fileName;
	public Date createdOn;
	public Date lastUpdated;
	public String content;
	
	/**
		@param id The ID of this document; this can either be a positive
		number if this document exists in the database; it can also be null
		or negative to indicate that no database-assigned id exists yet.
		@throws IllegalArgumentException Thrown if fileName,
		createdOn, or lastUpdated are null or if fileName is invalid.
	*/
	public Document(Integer id, String fileName, Date createdOn,
					Date lastUpdated, String content)
								throws MoxieException{
		if(fileName == null){
			throw new MoxieException("File name required");
		}
		
		if(validFileName(fileName) == false){
			throw new MoxieException("Invalid file name");
		}
		
		if(createdOn == null || lastUpdated == null){
			throw new MoxieException("Created On and Last Updated required");
		}
		
		this.id = id;
		this.fileName = fileName;
		this.createdOn = createdOn;
		this.lastUpdated = lastUpdated;
		this.content = content;
	}
	
	public String toString(){
		StringBuffer results = new StringBuffer();
		results.append("{");
		results.append("id: " + this.id + ", ");
		if(this.origID != null){
			results.append("origID: " + this.origID + ", ");
		}
		results.append("fileName: '" + this.fileName + "', ");
		results.append("createdOn: " + this.createdOn + ", ");
		results.append("lastUpdated: " + this.lastUpdated + ", ");
		results.append("content: '" + this.content + "'");
		results.append("}");
		
		return results.toString();
	}
	
	public static boolean validFileName(String fileName){
		return Pattern.matches("^[0-9A-Za-z_]*$", fileName); 
	}
}