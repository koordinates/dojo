dojo.provide("dojo.widget.Editor2Plugin.FindReplace");

dojo.require("dojo.widget.Editor2Plugin.DialogCommands");

//TODO replace, better GUI

dojo.widget.Editor2Plugin.SearchOption={
	CaseSensitive: 4,
	SearchBackwards: 64,
	WholeWord: 2,
	WrapSearch: 128
};
dojo.declare("dojo.widget.Editor2FindCommand", dojo.widget.Editor2DialogCommand,
{
	find: function(text, option){
		this._editor.focus();
		var so=dojo.widget.Editor2Plugin.SearchOption;
		if(window.find){ //moz
			this._editor.window.find(text, 
				option & so.CaseSensitive ? true : false,
				option & so.SearchBackwards ? true : false,
				option & so.WrapSearch ? true : false,
				option & so.WholeWord ? true : false
				);
		}else if(dojo.body().createTextRange){ //IE
			var range = this._editor.document.body.createTextRange();
			var found = range.findText(text, (option&so.SearchBackwards)?1:-1, option );
			if(found){
				range.scrollIntoView() ;
				range.select() ;
			}else{
				alert("Can not find "+text+" in the document");
			}
		}else{
			alert("No idea how to search in this browser. Please submit patch if you know.");
		}
	},
	getText: function(){
		return 'Find';
	},
	getState: dojo.widget.Editor2Command.prototype.getState
});

dojo.widget.Editor2Plugin.FindReplace ={
	getCommand: function(editor, name){
		var command;
		if(name == 'find'){
			command = new dojo.widget.Editor2FindCommand(editor, 'find', 
				{contentFile: "dojo.widget.Editor2Plugin.FindReplaceDialog", 
				contentClass: "Editor2FindDialog",
				title: "Find", width: "350px", height: "150px", modal: false});
		}else if(name == 'replace') {
			command = new dojo.widget.Editor2DialogCommand(editor, 'replace', 
				{contentFile: "dojo.widget.Editor2Plugin.FindReplaceDialog", 
				contentClass: "Editor2ReplaceDialog",
				href: dojo.uri.cache.allow(dojo.uri.moduleUri("dojo.widget", "templates/Editor2/Dialog/replace.html")), 
				title: "Replace", width: "350px", height: "200px", modal: false});
		}
	
		return command;
	},
	getToolbarItem: function(name){
		var item;
		if(name == 'replace'){
			item = new dojo.widget.Editor2ToolbarButton('Replace');
		}else if(name == 'find') {
			item = new dojo.widget.Editor2ToolbarButton('Find');
		}
	
		return item;
	}
}
dojo.widget.Editor2Manager.registerHandler(dojo.widget.Editor2Plugin.FindReplace.getCommand);
dojo.widget.Editor2ToolbarItemManager.registerHandler(dojo.widget.Editor2Plugin.FindReplace.getToolbarItem);