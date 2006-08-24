<?php

// Request encoding/decoding skipped to make things simple

// user should see progress indicator
sleep(3);


extract($_REQUEST);

if ($action == 'getChildren') {
?>
([{title:"empty1",isFolder:true,objectId:"myobj"},{title:"empty2",isFolder:true,objectId:"myobj"},{title:"singleChild",children:[ {title:"leaf"}  ]}])
<?
	return;
}

if ($action == 'createChild') {
?>
({title:"New node from server",objectId:666})
<?
	return;
}

if ($action == 'editLabelSave') {
?>
({title:"server replaced your title"})
<?
return;
}

?>
({})



