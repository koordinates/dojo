package org.dojo.moxie.sync;

import java.util.*;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class Command{
	public String CREATE = "create";
	public String CLEAR = "clear";
	public String DELETE = "delete";
	public String UPDATE = "update";
	public String DELETED = "deleted";
	public String UPDATED = "updated";
	public String CREATED = "created";
							
	protected String name;
	protected String status;
	protected String itemType;
	protected Item item;
	
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
	
	public String toString(){
		StringBuffer results = new StringBuffer();
		
		results.append("\n{");
		results.append("name: " + this.name + ", ");
		if(this.status != null){
			results.append("status: " + this.status + ", ");
		}
		results.append("itemType: " + this.itemType + ", ");
		results.append("item: " + this.item);
		results.append("}");
		
		return results.toString();
	}
}