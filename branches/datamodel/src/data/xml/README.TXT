This folder and the provider folder contains the original Comet XML data model. Here's the mapping...

New Class Name					Old Class Name
==============================  ================
data.provider.XMLDataProvider = Model
data.xml.Instance			  = Instance 		<== Consider renaming to XMLData
data.xml.XMLBind			  = Bind
data.xml.XMLPropertyBinder    = PropertyBinder

Note that widget.DataGrid is tightly bound to the XMLDataProvider.  This tight coupling should
be moved into a "GridAdapter" widget, so that the widget itself does not have knowledge of the 
specific model.
