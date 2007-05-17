dojo.provide("dojo.widget.Editor2Plugin.FindReplaceDialog");

dojo.widget.defineWidget(
	"dojo.widget.Editor2FindDialog",
	dojo.widget.Editor2DialogContent,
{
	templatePath: dojo.uri.moduleUri("dojo.widget", "templates/Editor2/Dialog/find.html"),

	find: function(){
		var curInst = dojo.widget.Editor2Manager.getCurrentInstance();
		var findcmd = curInst.getCommand('find');
		var option = 0;
		var os=dojo.widget.Editor2Plugin.SearchOption;
		if(this["find_option_casesens"].checked){
			option |= os.CaseSensitive;
		}
		if(this["find_option_backwards"].checked){
			option |= os.SearchBackwards;
		}
	
		if(this["find_option_wholeword"].checked){
			option |= os.WholeWord;
		}
		findcmd.find(this["find_text"].value, option);
	}
});

dojo.widget.defineWidget(
	"dojo.widget.Editor2ReplaceDialog",
	dojo.widget.Editor2DialogContent,
{
	templatePath: dojo.uri.moduleUri("dojo.widget", "templates/Editor2/Dialog/replace.html"),

	replace: function(){
		alert("not implemented yet");
	},
	replaceAll: function(){
		alert("not implemented yet");
	}
});