<?php
extract($_REQUEST);

sleep(3);
if ($action == 'getChildren') {
?>
[{title:"empty1",isFolder:true,objectId:"myobj"},{title:"empty2",isFolder:true,objectId:"myobj"},{title:"singleChild",children:[ {title:"leaf"}  ]}]
<?
	return;
}

if ($action == 'createChild') {
?>
{title:"New node from server"}
<?
	return;
}

if ($action == 'editLabelSave') {
?>
{title:"server_generated title"}
<?
return;
}

?>
true


