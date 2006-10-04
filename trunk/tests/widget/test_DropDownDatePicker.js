dojo.require("dojo.widget.DropdownDatePicker");

function test_widget_datePickerInitialState(){
	
	var w=new dojo.widget.DropdownDatePicker();
	w.displayFormat="MM/dd/yy";
	w.date="8/11/06";
	w._initData();
	
	jum.assertTrue(typeof w.date == "Date");
	jum.assertEquals(8, w.date.getDate());
	jum.assertEquals(11, w.date.getMonth());
	jum.assertEquals(2006, w.date.getFullYear());
}
