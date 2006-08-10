<?php
extract($_REQUEST);

sleep(5);
if ($action == 'getChildren') {
?>
[{title:"empty1",isFolder:true,objectId:"myobj"},{title:"empty2",isFolder:true,objectId:"myobj"},{title:"singleChild",children:[ {title:"leaf"}  ]}]
<?
	return;
}
?>
true


