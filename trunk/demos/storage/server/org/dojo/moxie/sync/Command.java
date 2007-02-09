package org.dojo.moxie.sync;

/**
	@author Brad Neuberg, bkn3@columbia.edu
*/
public class Command{
	public enum CommandType { create, clear, delete, update,
								deleted, updated, created };
								
	protected CommandType commandType;
	protected String name;
	protected String status;
	protected String itemType;
	protected Item item;
	
	public CommandType getCommandType(){
		return this.commandType;
	}
	
	public void setCommandType(CommandType commandType){
		this.commandType = commandType;
	}
	
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
}