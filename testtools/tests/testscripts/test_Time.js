function test_Time_format() {
  jum.assertTrue("[].constructor ok", ([1,2,3].constructor == Array));

  var d = new Date(2003, 9, 31, 15, 31, 7, 997); 
  //var d = new Date('10/31/2003');
  jum.assertEquals('test1', '10/31/2003', burst.Time.format(d, 'MM/dd/yyyy'));
  jum.assertEquals('test2', '2003-10-31', burst.Time.format(d, 'yyyy-MM-dd'));
  jum.assertEquals('test3', '31/10/2003', burst.Time.format(d, 'dd/MM/yyyy'));
  jum.assertEquals('test4', '15:31:07', burst.Time.format(d, 'HH:mm:ss'));
  jum.assertEquals('test5', '3:31:07', burst.Time.format(d, 'h:mm:ss'));
}
