dojo.provide("dojo.widget.Repeater");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.string.*");
dojo.require("dojo.event.*");
dojo.require("dojo.experimental");
dojo.experimental("dojo.widget.Repeater");

dojo.widget.defineWidget("dojo.widget.Repeater", dojo.widget.HtmlWidget,
	{
		/*
		summary: 
			Makes it easy to add dynamicly new segments to form, ie. add new rows.
		
			description: 
					
			usage: 
				<div dojoType="Repeater" pattern="row.${index}" useDndMove="false" userDndDelete="false">
					<p>Name: <input typ="text" name="row.%{index}.name" value="" /><input type="button" rowAction="delete" value="remove this" </p>
				</div>

				or:
				var myRepeater=dojo.widget.createWidget("Repeater",{pattern: "row.%{index}", useDndMove: false, useDndDelete: false});
				myRepeater.setRow("<p>Name: <input typ="text" name="row.%{index}.name" value="" rowFunction="doThis" /><input type="button" rowAction="delete" value="remove this" /></p>", {doThis:function(node){ dojo.event.connect(node,"onClick", function(){ alert("HERE"); }); } );

		*/
		/* TODO
				- preemptive row initialize for faster row adding
				- check obsoletes
		*/
		name: "", // FIXME: obsolete?
		rowTemplate: "",
		// myObject:
		// 	Used to bind functionality to rowFunctions
		myObject: null,
		// myObject:
		// 	defines pattern of the names
		pattern: "",
		// useDndMove:
		// 	if true, you can change position of rows by DnD
		//	you can also remove rows by dragging row away
		useDndMove: false,
		// useDndDelete:
		// 	if true, you can remove rows by dragging row away
		useDndDelete: false,

		isContainer: true,

		initialize:function(args, frag){
			var node = this.getFragNodeRef(frag);
			node.removeAttribute("dojotype");
			this.setRow(dojo.string.trim(node.innerHTML), {});
			// wrapper to make table row as repeated row
			if(node.nodeName == "TBODY"){
				if(node.childNodes.length == 1){
					node.removeChild(node.childNodes[0]);
				}
			}else{
				node.innerHTML = "";
			}
			frag = null;
		},

		postCreate:function(args, frag){
			if(this.useDndMove || this.useDndDelete){
				dojo.require("dojo.dnd.*");
				var dnd = new dojo.dnd.HtmlDropTarget(this.domNode, [this.widgetId]);
			}
		},

		_reIndexRows:function(){
			var children = this.getChildrenOfType("RepeaterRow",false);
			var childNodes = this.domNode.childNodes;

			for(var i=0,len=childNodes.length; i<len;i++){
				for(j=0,len=children.length; j<len;++j){
					if(children[j].domNode === childNodes[i]){
						children[j].row=i;
					}
				}
				var elems = ["INPUT", "SELECT", "TEXTAREA"];
				for(var k=0; k<elems.length; k++){
					var list = childNodes[i].getElementsByTagName(elems[k]);
					for(var j=0,len2=list.length; j<len2; j++){
						var name = list[j].name;
						var index = dojo.string.escape("regexp", this.pattern);
						index = index.replace(/(\\\$\\\{index\\\})/g,"\${index}");
						var nameRegexp = dojo.string.substitute(index, {"index": "[0-9]*"});
						var newName = dojo.string.substitute(this.pattern, {"index": "" + i});
						var re = new RegExp(nameRegexp,"g");
						list[j].name = name.replace(re,newName);
					}
				}
			}
		},

		onDeleteRow:function(e){
			var index = dojo.string.escape("regexp", this.pattern);
			index = index.replace(/\\\$\\\{index\\\}/g,"\${index}");
			var nameRegexp = dojo.string.substitute(index, {"index": "([0-9]*)"});
			var re = new RegExp(nameRegexp,"g");
			this.deleteRow(re.exec(e.target.name)[1]);
		},
		hasRows:function(){
			if(this.domNode.childNodes.length > 0){
				return true;
			}
			return false;
		},

		getRowCount:function(){
			return this.domNode.childNodes.length;
		},

		deleteRow:function(/*integer*/idx){
			var children = this.getChildrenOfType("RepeaterRow",false);
			for(var i=0,len=children.length; i<len; ++i){
				var child = children[i];
				if(child.row == idx){
					child.destroy();
					break;
				}
			}
			this._reIndexRows();
		},

		_changeRowPosition:function(e){
			var children = this.getChildrenOfType("RepeaterRow",false);
			if(e.dragStatus == "dropFailure" && this.useDndDelete){
				var target = e["dragSource"].domNode;
				for(var i=0,len=children.length; i<len; ++i){
					if(children[i].domNode === target){
						this.deleteRow(i);
					}
				}
				this._reIndexRows();
			}else if(e.dragStatus == "dropSuccess" && this.useDndMove){
				this._reIndexRows();
				//  nothing to do
			} // else-if
		},
		setRow:function(/*string*/template, /*object*/myObject){
			//template = dojo.string.substitute(template, {"index": "0"});
			template = template.replace(/\$\{(index)\}/g, "0");
			this.rowTemplate = template;
			if(myObject == null){ myObject = {}; }
			this.myObject = myObject;
		},
		getRow:function(){
			return this.rowTemplate;
		},
		_initRow:function(/*integer or dom node*/node){
			if(typeof(node) == "number"){
                           node=this.getChildrenOfType("RepeaterRow",false)[node];
			} // if
			var elems = ["INPUT", "SELECT", "IMG"];
			for(var k=0; k<elems.length; k++){
				var list = node.domNode.getElementsByTagName(elems[k]);
				for(var i=0,len=list.length; i<len; i++){
					var child = list[i];
					if(child.nodeType != 1){continue};
					if(child.getAttribute("rowFunction") != null){
						if(typeof(this.myObject[child.getAttribute("rowFunction")]) == "undefined"){
							dojo.debug("Function " + child.getAttribute("rowFunction") + " not found");
						}else{ 
							this.myObject[child.getAttribute("rowFunction")](child);
						} // ifelse
					}
					if(child.getAttribute("rowAction") != null){
						if(child.getAttribute("rowAction") == "delete"){
							child.name = dojo.string.substitute(this.pattern, {"index": "" + node.row})+".delete";
							dojo.event.connect(child, "onclick", this, "onDeleteRow");
						} // if
					} // else-if
				} // for
			} // for
			return node;
		},
		// FIXME: is index obsolete?
		onAddRow:function(/*RepeaterRow*/node,index){
		},
		addRow:function(/*boolean*/doInit){
                        if(typeof(doInit) == "undefined"){
				doInit = true;
                        }
			var node=document.createElement("span");
			// wrapper to make table row as repeated row
			if(this.domNode.nodeName=="TBODY"){
				node.innerHTML = "<table>"+this.getRow()+"</table>";
				node=node.getElementsByTagName("TR")[0];
			}else{
				node.innerHTML = this.getRow();
				if(node.childNodes.length == 1){
					node = node.childNodes[0];
				}
			}
			var rowIndex = this.getChildrenOfType("RepeaterRow",false).length;
			node = dojo.widget.createWidget("RepeaterRow", {row: rowIndex}, node);
			this.addChild(node);
			var parser = new dojo.xml.Parse();
			var frag = parser.parseElement(node.domNode, null, true);
			dojo.widget.getParser().createSubComponents(frag, node);
			this._reIndexRows();
			if(doInit){
				this._initRow(node);
			}
			if(this.useDndMove || this.useDndDelete){ // bind to DND
				var node2 = new dojo.dnd.HtmlDragSource(node.domNode, this.widgetId);
				dojo.event.connect(node2, "onDragEnd", this, "_changeRowPosition");
			}
			this.onAddRow(node, rowIndex);
			return node;
		}
});

dojo.widget.defineWidget("dojo.widget.RepeaterRow", dojo.widget.HtmlWidget,
	{
		row: 0
	}
);
