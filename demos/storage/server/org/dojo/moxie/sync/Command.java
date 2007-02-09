package org.dojo.moxie.sync;

import java.util.*;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class Command{
	public static String CREATE = "create";
	public static String CLEAR = "clear";
	public static String DELETE = "delete";
	public static String UPDATE = "update";
	public static String DELETED = "deleted";
	public static String UPDATED = "updated";
	public static String CREATED = "created";
							
	protected String name;
	protected String status;
	protected String itemType;
	protected Item item;
	protected Long timestamp;
	protected Long timeoffset;
	
	public String getName(){
		return this.name;
	}
	
	public void setName(String name){
		this.name = name;
	}
	
	public String getStatus(){
		return status;
	}
	
	public void setStatus(String status){
		this.status = status;
	}
	
	public String getItemType(){
		return this.itemType;
	}
	
	public void setItemType(String itemType){
		this.itemType = itemType;
	}
	
	public Item getItem(){
		return this.item;
	}
	
	public void setItem(Item item){
		this.item = item;
	}
	
	/**
		A timestamp is the total amount of time since the epoch (1970)
		when this command occurred.
	*/
	public void setTimestamp(Long timestamp){
		this.timestamp = timestamp;
	}
	
	public Long getTimestamp(){
		return timestamp;
	}
	
	/**
		A timeoffset is the amount of time, in milliseconds, that this
		command ocurred. This is relative to the lastSync or serverTimestamp
		of this command.
	*/	
	public void setTimeoffset(Long timeoffset){
		this.timeoffset = timeoffset;
	}
	
	public Long getTimeoffset(){
		return this.timeoffset;
	}
	
	public String toString(){
		StringBuffer results = new StringBuffer();
		
		results.append("\n{");
		results.append("name: " + this.name + ", ");
		if(this.status != null){
			results.append("status: " + this.status + ", ");
		}
		results.append("itemType: " + this.itemType + ", ");
		if(this.timestamp != null){
			results.append("timestamp: " + this.timestamp + ", ");
		}else if(this.timeoffset != null){
			results.append("timeoffset: " + this.timeoffset + ", ");
		}
		results.append("item: " + this.item);
		results.append("}");
		
		return results.toString();
	}
}