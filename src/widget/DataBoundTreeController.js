// THIS CODE IS NOT CURRENTLY WORKING.  
// IT IS THE ORIGINAL TREE ADAPTER CODE REFORMATTED FOR REFERENCE WHEN WE BEGIN
// WRITING A TREE ADAPTER FOR THE DOJO TREE CONTROL.
dojo.provide("dojo.data.js.TreeAdapter");
dojo.require("dojo.lang.string");

/**
 * @class public TreeAdapter
 * @constructor dojo.data.js.TreeAdapter
 * 	The TreeAdapter is used to facilitate the rendering of a JS-impl data graph in a Tree control.
 * @param tree treeCtrl
 *	 tree control to render the data model
 * @param DataObject objRoot
 *	 the root dataObject which is used to populate the tree.
 */
dojo.data.js.TreeAdapter=function(treeCtrl, objRoot){
	this.treeControl = treeCtrl;
	this.treeControl.Adapter = this;
	this.xmiModel = objRoot; // TODO: why xmi?
	this.objRoot = objRoot;
	this.treeObjects = [];
	this.maskedNames= [];
	this.expandedNode = [];
	this.nodeHandler = [];
	this.dataHandler = [];
}

dojo.data.js.TreeAdapter.prototype.treeStyles = null;
dojo.data.js.TreeAdapter.prototype.iconStyles = null;

/**
 * @method public dojo.data.js.TreeAdapter.prototype.refresh
 *   This function is used to redisplay the tree
 */
dojo.data.js.TreeAdapter.prototype.refresh = function(){
	this.treeControl.updateControl();
}

/**
 * @method public dojo.data.js.TreeAdapter.prototype.activateDataSet
 *  this function is used to construct the new data set based on the passed eobject. To improve
 * 	the performance, the first time the tree is displayed, only the first level of nodes are rendered.
 * @param DataObject dataObject
 *	the dataObject which need to be rendered in tree control.
 */
dojo.data.js.TreeAdapter.prototype.activateDataSet=function(dataObject){
	if (null == dataObject) {
		return;
	}
	if(this.treeControl.a_index!=null)
		this.treeControl.a_index = [];
	this.objRoot = dataObject;
	this.dataObjIndex = 0;
	dataObjInstance = dataObject;
	this.treeControl.childItems = [];
	this.treeControl.depth = -1;
	this.bind();
}

/**
 * @method public dojo.data.js.TreeAdapter.prototype.setMask
 *   this function is used to set the control's mask array so that all the items in this array will not displayed
 * @param String maskstr
 *	String of the to be masked node's name, seperated by ","
 */
dojo.data.js.TreeAdapter.prototype.setMask=function(maskstr){
	this.maskedNames=maskstr.split(",");
}

/**
 * @method private dojo.data.js.TreeAdapter.prototype.isMasked
 *   this function is used to determine if the name which is passed in should be filtered out
 * @param String name
 *	The name of the node
 * @return boolean
 *	True if the name is in the masked array. otherwise false.
 */
dojo.data.js.TreeAdapter.prototype.isMasked=function(name){
	for (var i = 0; i < this.maskedNames.length; ++i) {
		if (this.maskedNames[i]==name){
			return true;
		}
	}
	return false;
}

/**
 * @method private dojo.data.js.TreeAdapter.prototype.applyImage
 *   this function is used to get the icons path of a specific class name if user supply
 *	one,otherwise return null
 * @param String name
 *	The dojo.data.meta.Class name of the node
 * @return Array
 *	Take file structure as example, if the Type is DIR, the first element of the returned
 *	array is directory open icon,the second element is directory close icon
 *	If the Type is FILE, the first element is base icon, the second element is folder open icon
 *	do we use the second icon in FILE case?
 */
dojo.data.js.TreeAdapter.prototype.applyImage=function(dataObj){
	if (this.iconFilePaths == null){
		return null;
	}
	var filePath = new Array();
	if(this.iconFilePaths!=null){
		for (var i = 0; i < this.iconFilePaths.length; i++){
			var style = this.iconFilePaths[i];
			if (dataObj._class.name == dojo.string.trim(style[0])){
				//if there is an alias this allows every node to have different icon.
				//i.e string is ("nodeName,alias = aliasName , openIconImg ,closeIconImg,showSystemIconFlag,openImgAlt,closeImgAlt) 
				if(style[1].indexOf("=")!=-1 && (style[1].indexOf("wsrp-url"))==-1){
					//specific to WorkPlace datasource if alias exists split it into alias tag and value
					var valueArr = style[1].split("=");
					//if the alias attribute of dataObj (obtained using ValueArr[0]) equals the alias value in ValueArr[1]
					if(dataObj.get(Trim(valueArr[0])) == Trim(valueArr[1])){
						//openIconImg
						filePath[0] = Trim(style[2]);
						//closeIconImg
						filePath[1] = Trim(style[3]);
						//showSystemIcon
						filePath[2] = style[4];
						//closedImgAlt
						if(style[5]=="null"){
							style[5]="";
						}
						filePath[3] = style[5];
						//openImgAlt
						if(style[6]=="null"){
							style[6]="";
						}
						filePath[4] = style[6];
						break;
					}
				}else{ //if there is no alias i.e all nodes on the same level have the same icon.
					filePath[0] = Trim(style[1]);
					filePath[1] = Trim(style[2]);
					filePath[2] = style[3];
					if(style[4]=="null")
						style[4]="";
					filePath[3] = style[4];
					if(style[5]=="null")
						style[5]="";
					filePath[4] = style[5];
				}
			}
		}
	}
	return filePath;
}

/**
 * @method private dojo.data.js.TreeAdapter.prototype.applyStyle
 *   If the user provide node display type, then when the node is rendered, it will use this type
 *	otherwise display class name.
 * @param String name
 *	The eclass name of the node
 * @param DataObject obj
 *	the dataObject is used to get other display attribute value based on the eclass name.
 * @return String displayName
 *	If there is no style, node will use its eclass name. Otherwise use the display attribute value.
 */
dojo.data.js.TreeAdapter.prototype.applyStyle=function(name,obj){
	var displayObj = new Object();
	if (this.treeStyleNames == null){
		displayObj.name = name;
		return displayObj;
	}
	for (var i = 0; i < this.treeStyleNames.length; i++) {
		//var style = this.treeStyleNames[i].split(":");
		var style = this.treeStyleNames[i];
		if (name == style[0]) {
			var str = (obj.GetMember(style[1]))?obj.eGet(style[1]):style[1];
			if (str != null && "object" != typeof(str) ) {
				displayObj.name = (str == "")? " ":str;
				displayObj.propertyName = (obj.getMember(style[1]))?style[1]:null;
				return displayObj;
			}
			break;
		}
	}
	displayObj.name =name;
	return displayObj;
}

/**
 * @method private dojo.data.js.TreeAdapter.prototype.GetChildrenRefs
 *   This function is mainly used to define how to walk throught the child node under the parent node
 * @param String someClass
 *	The dojo.data.meta.Class name of the parent node
 * @return Array refArray
 *	The array which define what kind of children node will be displayed and in which order
 */
dojo.data.js.TreeAdapter.prototype.getChildrenRefs = function(someClass) {
	var refArray = new Array();
	if (this.treeStyleNames == null){
		return refArray;
	}
	for (var i = 0; i < this.treeStyleNames.length; i++) {
		if (this.treeStyleNames[i][0] == someClass) {
			refArray[refArray.length] = Trim(this.treeStyleNames[i][2]);
		}
	}
	return refArray;
}

//TODO: DEPENDS: Strong Typing
this.isleaf = function(className){
	if (this.treeStyleNames == null){
		return false;
	}
	var style = this.treeStyleNames[this.treeStyleNames.length-2][0];
	if(className == style){
		return true;
	}else{
		return false;
	}
}

/**
 * @method private dojo.data.js.TreeAdapter.prototype.getChildContent
 *   This method takes the dataObject and constructs its children nodes dom data structure so that each
 *	node will know the parent-children relationship.
 * @param ElementWrapper elementWrap
 *	The parent element which has two properties, one is the parent DOM object, the other one is a
 *	boolean which indicate this parent node is worked through or not
 * @param DataObject dataObject
 *	The parent dataObject which will used to get its children
 */
//TODO: DEPENDS: Strong Typing
dojo.data.js.TreeAdapter.prototype.getChildContent = function(elementWrap, dataObject){
	var innerObject = dataObject;
	var childrenRefs = this.getChildrenRefs(dataObject._class.name);
	elementWrap.emptyFlag = false; // may need to move this further on in the code: our "new" dataObject may be empty...
	var spanedArr = new Array();
	var value;
	for(var i=0; i<childrenRefs.length;i++){
		var strName = childrenRefs[i];
		if (this.isMasked(strName)){
				continue;
		}
		if(!spanedArr[strName]){
			//in case the style string has duplicate style.
			spanedArr[strName] = strName;
			try{
				if(strName){
					value = innerObject.eGet(strName);
				}
			}catch(e){
				return;
			}
			if(value!=null){
				//has childrens & value is an object
				if (value != null && typeof(value) == "object"){
					if (value.length != null && "number" == typeof(value.length)){
						//objects array
						elementWrap.element.setAttribute("childrenLen", value.length);
						for (var j = 0; j < value.length; ++j){
							this.constructChildElement(elementWrap, value[j],strName);
						}
					}else{
						//single dataObject
						this.constructChildElement(elementWrap, value,strName);
					}
				}
			}else if(this.treeControl.rootItem.dynamicFlag==true){
				//tree is dynamic so we don't know if its got kids
				if(i==0){
					elementWrap.element.setAttribute("childrenLen", 1);
				}	
				//if a node doesn't have kids then we need to set it to be a leaf.
				for(var j=0;j<this.treeControl.a_index.length;j++){	
					//find the treeItem corresponding to the dataObject
					if(this.treeControl.a_index[j].dataObj.ID==dataObject.ID){
						var treeItem = this.treeControl.a_index[j];
						//if it has no children set childItems.length to 0
						if(treeItem.childItems!=null){
							if(treeItem.childItems[0]==null||treeItem.childItems[0]=="undefined"){
								elementWrap.element.setAttribute("childrenLen", 0);
								this.treeControl.a_index[j].childItems.length=0;
							}
						}
					}
				}
			}else{
				//data is in the page, but without children.
				//the reason to set the length when i==0 is, if the node has two ref, and one ref
				//has child, the other ref has no child, so that the second child len will not overwrite
				//the first child length.
				if(i==0){
					elementWrap.element.setAttribute("childrenLen", 0);
				}
			}
		}
	}
}

/**
 * @method private dojo.data.js.TreeAdapter.prototype.constructChildElement
 *   This is a sub method in getChildContent method to reduce the duplicate code
 * @param ElementWrapper elementWrap
 *	The parent element which has two properties, one is the parent DOM object, the other one is a
 *	boolean which indicate this parent node is worked through or not
 * @param DataObject childObj
 *	Child dataObject
 * @param String strName
 *	The propertyName of the parent dataObject which is used to get the children
 */
dojo.data.js.TreeAdapter.prototype.constructChildElement = function (elementWrap, childObj,strName){
	this.expandedNode[this.expandedNode.length] = childObj;
	var objclsname = childObj.EClass.Name;
	var displayObj = this.applyStyle(objclsname , childObj);
	var str = displayObj.name;
	var propertyName = displayObj.propertyName;
	var strtmp = "" + str; // make sure that it is always a string
	var str1 = strtmp.replace(/\ /gi,"_");		
	//TODO fix w/dojo equiv....
	if(isIE()&&typeof(str1)=="string"&&str1.indexOf(":")!=-1){
		dojo.debug("TreeAdapter.constructChildElement(): we have a colon in "+str1);
		str1 = str1.replace(/:/, "&#x003A;");
	}	
	var childElement ;	
	//Stricter dtds and firefox 1.5 don't allow the use of special characters in element names so we are replacing it with '_'
	str1=replaceSpecialChars(str1,"_");	
	//Letter had to be prepended by a letter instead of appended by a number to work in 
	//firefox 1.5 if str1 is a number.
	childElement = document.createElement("x"+str1);			
	childElement.displayName = str;
	var childRef = this.GetChildrenRefs(objclsname);
	//Check to see if this node has instances of children.
	//this information is used to determine whether it is an empty folder or not.
	//in getJunctionImage in treecontrol.js, neither a + or - junction will be drawn
	//if it is found here that the node won't have any children
	var hasChild = false;
	for (var i=0; i<childRef.length; i++ ){
		var tempMember = childObj.findMember(childRef[i]);
		if (tempMember){
			if(tempMember.value){
				hasChild=true;
				continue;
			}
		}
		if (i==childRef.length-1){
			hasChild=false;
		}
	}
	if(!(childRef.length==1&&childRef=="")){
		if (hasChild==false){
			childElement.setAttribute("hasNoChildrenValues", true);
		}
		childElement.setAttribute("childrenLen",1);
	}
	//default to false => has >=1 child value
	if (childElement.getAttribute("hasNoChildrenValues")==null){
		childElement.setAttribute("hasNoChildrenValues",false);
	}
	var handler = this.nodeHandler[objclsname];
	if(handler!=null&&handler!='undefined'){childElement.eventHandler = handler;}
	childElement.dataObject = childObj;
	childElement.propertyName = propertyName;
	var imgpath = this.applyImage(childObj);
	if (null != imgpath) {
		childElement.setAttribute("treecloseimgfile", imgpath[0]);
		childElement.setAttribute("treeopenimgfile", imgpath[1]);
		if(imgpath[2]){childElement.setAttribute("showsystemiconflag", imgpath[2]);}
		if(imgpath[3]){childElement.setAttribute("treecloseimgalt", imgpath[3]);}
		if(imgpath[4]){childElement.setAttribute("treeopenimgalt", imgpath[4]);}
	}
	var childElementWrap = new ElementWrapper(childElement, false);
	if (!childElementWrap.emptyFlag) {
		elementWrap.element.appendChild(childElement);
	}
}

/**
  * @method private dojo.data.js.TreeAdapter.prototype.setPropertyBinders
  *  This method is used to bind the tree with the data model so that once the data mode is changed, the
  *  tree's content will be updated automatically. 
  */
/* TODO: Right now those two rows are commented out, don't
  *  know why. The other issue with this is, because of performace improvement, at the first time, only
  *  the first level of nodes are rendered, so only those nodes are bound to data model, need to work on
  *  the tree control to bind the later rendered node.
  */
dojo.data.js.TreeAdapter.prototype.setPropertyBinders = function(index) {
	//To improve performance we don't need to expand all child node and then use updatecontrol
	//to collapse all the nodes from the second level. Only the nodes which will be displayed
	//need to be constructed.
	for (var i = index; i < this.treeControl.a_index.length; i++){
		var treeitem = this.treeControl.a_index[i];
		if (treeitem.dataObj){
			var htmlElement = get_element('i_txt'+this.treeControl.itemID+'_'+treeitem.itemID);//TODO:fix itemID
			if (htmlElement){
				// attach property binder
				try {
					var binding = new dojo.data.js.PropertyBinder(treeitem.dataObj,treeitem.propertyName,htmlElement,"innerHTML","onchange");
					binding.dataBind();
				} catch (e) {
					return;
				}
			}
		}
	}
}

dojo.data.js.TreeAdapter.prototype.setStyleSelectorText = function(styleText){
	this.treeStyles = styleText;
}

dojo.data.js.TreeAdapter.prototype.setIconSelectorText = function(iconText){
	this.iconStyles = iconText;
}

/**
  * @method public dojo.data.js.TreeAdapter.prototype.setStyleMap
  * User can use this method to define how the tree is rendered and in which order
  * @param String styleString  The user defined style
  */
dojo.data.js.TreeAdapter.prototype.setStyleMap = function(styleString){
	this.styleMapString = styleString;
}

/**
 * @method public dojo.data.js.TreeAdapter.prototype.addNodeIconMap
 *   User can use this method to set the node's icon image path
 * @param String iconString
 *	The user defined style
 */
dojo.data.js.TreeAdapter.prototype.addNodeIconMap=function(iconString){
	var iconMapString = iconString;
	if (iconMapString != "") {
		var ruleArray = iconMapString.split(",");
		if(this.iconFilePaths==null){
			this.iconFilePaths = new Array();
		}
		this.iconFilePaths[this.iconFilePaths.length] = ruleArray;
	}
}

/**
 * @method public dojo.data.js.TreeAdapter.prototype.addNodeEventHandler
 *   User can use this method to add the event handler to the tree node.
 * @param String handlerString
 *	The user defined event handler.
 */
dojo.data.js.TreeAdapter.prototype.addNodeEventHandler=function(handlerString){
	if (handlerString != "") {
		var ruleArray = handlerString.split(":");
		if(this.nodeHandler==null){
			this.nodeHandler = new Array();
			if(this.nodeHandler[ruleArray[0]]==null||this.nodeHandler[ruleArray[0]]=='undefined'){
				this.nodeHandler[ruleArray[0]] = ruleArray[1];
			}else{
				this.nodeHandler[ruleArray[0]] += ";" + ruleArray[1];
			}
		}
	}
}

/**
 * @method public dojo.data.js.TreeAdapter.prototype.addNodeColumnData
 *   User can use this method to add columnData to the tree node.
 * @param String handlerString
 *	The user defined event handler.
 */
dojo.data.js.TreeAdapter.prototype.addNodeColumnData=function(dataString){
	if (dataString != "") {
		var colData = dataString.split(":");
		this.dataHandler[colData[0]]=colData[1];
	}
}

/**
 * @method public dojo.data.js.TreeAdapter.prototype.setIconRoot
 *   User can use this method to define the root icon image path
 * @param String iconRootString
 *	The user defined style
 */
dojo.data.js.TreeAdapter.prototype.setIconRoot=function(iconRootString){
	var rootString = iconRootString.replace(/ /g, "");
	rootString = rootString.split(":");
	// need to put this functionality in... to do.
	if (rootString.length > 0) {
		this.treeControl.itemClosedImage = rootString[0];
		if (rootString.length > 1 ) {
			this.treeControl.itemOpenedImage = this.treeControl.UrlPrefix +rootString[1];
		} else {
			this.treeControl.itemOpenedImage = this.treeControl.UrlPrefix +rootString[0];
		}
	}
}

/**
 * @method public dojo.data.js.TreeAdapter.prototype.setSystemIconStyle
 *   User can use this method to set the system icon, for example, in file structure case,
 *	we use "+" image to indicate the directory has more files, etc..
 * @param String systemIconStyleString
 *	The user defined style
 */
dojo.data.js.TreeAdapter.prototype.setSystemIconStyle=function(systemIconStyleString){
	var styleString = systemIconStyleString.replace(/ /g, "");
	var iconArray = styleString.split("|");
	var len = iconArray.length-1;
	for(var i=1; i<len; i++){
		//When parsing the string icon_key=icon_path;icon_key=icon_path; splitting at "=" was causing problems because sometimes there was an equals in the icon_path and therefore 
		//the icon key returned would be invalid. Fix was to get icon_key as a substring from start to first occurance of "=" 
		//old split: var temp = iconArray[i].split("=");
		var index= iconArray[i].indexOf("=");
		var temp= new Array();
		temp[0] = iconArray[i].substring(0,index);
		temp[1] = iconArray[i].substring(index+1,iconArray[i].length);
		//for(c=0;c<temp.length;c++)
		//alert("temp "+c+" is "+temp[c]);
		//endBreff
		if(temp.length>1){
			this.treeControl.treeIcons[temp[0]] = temp[1];
		}
	}
}

/**
 * @method private dojo.data.js.TreeAdapter.prototype.initStyles
 *   This method is used to construct all the style arrays from what the user passed in.
 */
dojo.data.js.TreeAdapter.prototype.initStyles = function() {
	if ((null == this.treeStyles) && (null == this.styleMapString)){
		return;
	}
	var styleString = null;
	var iconString = null;
	if (null != this.treeStyles) {
		try {
			var styleString = eval(this.treeStyles);
		} catch (e) {
			this.treeStyles = null;
			return;
		}
	} else {
		styleString = this.styleMapString;
	}
	if (styleString != "") {
		this.treeStyleNames = styleString.split(";");
		// for every rule:
		for (var i = 0; i < this.treeStyleNames.length; i++) {
			var ruleString = this.treeStyleNames[i];
			var ruleArray = ruleString.split(":");
			this.treeStyleNames[i] = ruleArray;
		}
	}
	//deal with icon string here:this is the icon map which is assign to interface instead of call addnodeiconmap function.
	if (null != this.iconStyles) {
		try {
			iconString = eval(this.iconStyles);
			iconString = iconString.replace(/ /g, "");
		} catch (e) {
			this.iconStyles = null;
			return;
		}
		if (iconString != "") {
			this.iconFilePaths = iconString.split(";");
			// for every rule:
			for (var i = 0; i < this.iconFilePaths.length; i++) {
				var ruleString = this.iconFilePaths[i];
				var ruleArray = ruleString.split(":");
				this.iconFilePaths[i] = ruleArray;
			}
		}
	}
}
/**
 * @method public dojo.data.js.TreeAdapter.prototype.setRootByID
 *   This method is used to set the tree root using the xmiID
 * @param String IDString
 *	The xmiID of the dataObject.
 */
dojo.data.js.TreeAdapter.prototype.setRootByID=function(IDString ){
	if ((this.objRoot == undefined) || (this.objRoot == null)){
		return;
	}
	//TODO: Fix this lookup to use provider registry
	this.objRoot = findDataObjectByXMIID(this.objRoot, IDString);
	this.expandedNode[this.objRoot.getSignature()] = this.objRoot;
}

/**
 * @method public dojo.data.js.TreeAdapter.prototype.bind
 *  This method is used to initialize/reset the array used to keep track of
 *  objects examined also bind them with data model
 */
dojo.data.js.TreeAdapter.prototype.bind=function(){
	index=0;
	// Starting with the objRoot, isolate the first dataObject instance
	var dataObjInstance = this.objRoot;
	if(dataObjInstance==null)
		return;
	this.initStyles();
	var displayObj = this.applyStyle(dataObjInstance._class.name,dataObjInstance ) ;
	var str = displayObj.name;
	var propertyName = displayObj.propertyName;
	var tmpstr = "" + str; // make sure that it is always a string
	var str1 = tmpstr.replace(/\ /gi,"_");		
	var treeParentElement ;		
	//Stricter dtds and firefox 1.5 mean the name must be prepended by a letter instead of having a number appended	
	treeParentElement = document.createElement("x"+str1);
	treeParentElement.displayName =  str;
	treeParentElement.setAttribute("__ID__", dataObjInstance.__ID__);
	treeParentElement.dataObject = this.objRoot;
	treeParentElement.propertyName = propertyName;
	var imgpath = this.applyImage(this.objRoot);
	if (null != imgpath) {
		treeParentElement.setAttribute("treecloseimgfile", imgpath[0]);
		treeParentElement.setAttribute("treeopenimgfile", imgpath[1]);
		if(imgpath[2]){treeParentElement.setAttribute("showsystemiconflag", imgpath[2]);}
		if(imgpath[3]){treeParentElement.setAttribute("treecloseimgalt", imgpath[3]);}
		if(imgpath[4]){treeParentElement.setAttribute("treeopenimgalt", imgpath[4]);}
	}
	var event = this.nodeHandler[dataObjInstance.EClass.Name];
	if(event){
		treeParentElement.eventHandler = event;
	}
	var elementWrap = new ElementWrapper(treeParentElement, true);
	this.GetChildContent(elementWrap, dataObjInstance, 0);
	var newTreeItemChild = new TreeItem(this.treeControl, treeParentElement, 0);
	this.treeControl.writeTreeUI1();
	this.setPropertyBinders(0);
}

// Unbinds a data item from the tree control
this.unbind = function() {
	this.treeControl.removeItem(this.treeControl.rootItem.itemID);
}

/**
 * @method public dojo.data.js.TreeAdapter.prototype.addNode
 *  This method is used to add node the array used to keep track of objects examined and also bind it with data model 
 *  without requiring an entire rewrite of the tree.
 * @param dataObject node
 *	newly created dataObject that is to be added to the tree	
 * @param int parentIndex 
 *	Used to locate the parent item within treecontrol.a_index[]
 */
dojo.data.js.TreeAdapter.prototype.addNode = function ( node , parentIndex, isLeaf){
	//The new node to be added
	var dataObjInstance = node;
	if(dataObjInstance==null){
		return;
	}
	this.initStyles();
	//Get name for new node from dataObjInstance	
	var displayObj = this.applyStyle(dataObjInstance._class.name,dataObjInstance) ;
	var str = displayObj.name;
	var tmpstr = "" + str; // make sure that it is always a string
	var str1 = tmpstr.replace(/\ /gi,"_");		
	var propertyName = displayObj.propertyName;
	//Create new node	
	var newNode = document.createElement( str1 );
	if(newNode!="undefined"||newNode!=null){
		//assign attribute values for new node
		newNode.displayName =  str;
		newNode.setAttribute("EObjectID", dataObjInstance.ID);
		newNode.dataObject = node;
		newNode.propertyName = propertyName;
		//Add image info to new node
		var imgpath = this.applyImage(node);
		if (null != imgpath){
			newNode.setAttribute("treecloseimgfile", imgpath[0]);
			newNode.setAttribute("treeopenimgfile", imgpath[1]);
			if(imgpath[2]){newNode.setAttribute("showsystemiconflag", imgpath[2]);}
			if(imgpath[3]){newNode.setAttribute("treecloseimgalt", imgpath[3]);}
			if(imgpath[4]){newNode.setAttribute("treeopenimgalt", imgpath[4]);}
		}
		var event = this.nodeHandler[dataObjInstance._class.name];
		//Add related events to new node
		if(event){
			newNode.eventHandler = event;
		}
		//Get child content for the newly created node
		var elementWrap = new dojo.data.js.TreeAdapter.ElementWrapper(newNode, true);
		this.getChildContent(elementWrap,node);
		//Create new tree item for newly created node
		if(this.treeControl.a_index[parentIndex].childItems.length > 0){
			//If childitem array is only given length to give the appearence of children then new treeItem must be created
			if ( this.treeControl.a_index[parentIndex].childItems[0]==null ||
				 this.treeControl.a_index[parentIndex].childItems[0]=="dummy"){
				this.treeControl.a_index[parentIndex].childItems.length=this.treeControl.a_index[parentIndex].childItems.length-1;
			}
		}
		var tItem=new TreeItem(this.treeControl.a_index[parentIndex], newNode,this.treeControl.a_index[parentIndex].childItems.length, isLeaf);
		//Initialize tree item
		var tempElem= tItem.init();
		//Add newly created element to the DOM
		this.treeControl.addDOMElem(parentIndex,tempElem);
	}
	return;
}

function dojo.data.js.TreeAdapter.ElementWrapper(element,flag){
	this.element = element;
	this.emptyFlag = flag;
}