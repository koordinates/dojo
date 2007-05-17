// Mail demo javascript code

// Display list of messages (upper right pane)
function displayList(){
    this.update = function(message) {
        var clickedTreeNode = message.node;
        var listPane = dojo.widget.getWidgetById("listPane");
        var url = "Mail/"+clickedTreeNode.title.replace(" ","") + ".html";
        listPane.setUrl(url);
    };
}

// Display a single message (in bottom right pane)
function displayMessage(name){
    var contentPane = dojo.widget.getWidgetById("contentPane");
    var url = "Mail/"+name.replace(" ","") + ".html";
    contentPane.setUrl(url);
}

dojo.addOnLoad(function(){
    var selector = dojo.widget.manager.getWidgetById('treePaneSelector');
    dojo.event.topic.subscribe(selector.eventNames.select, new displayList(), 'update');
});
