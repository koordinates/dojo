function test_PropertyDef_all() {
  var prop1 = new burst.reflect.PropertyDefBoolean({name: 'prop1', defaultValue: false, description: 'some prop 1'});
  var val1 = prop1.parse('true');
  bu_debug("val1=" + val1 + " typeof val1=" + (typeof val1));
  jum.assertTrue('test1', val1);
  var val2 = prop1.parse(true); 
  jum.assertTrue('test2', val2);
  var val3 = prop1.parse(''); 
  jum.assertFalse('test2', val3);

  var excep1;
  try {new burst.reflect.PropertyDefBoolean({})} catch(e) {excep1 = e}
  // "No value provided for mandatory key 'name'"
  //bu_alert("got excep1=" + excep1);
  jum.assertTrue('excep1', excep1);
  jum.assertTrue('excep1a', /mandatory key/.test(excep1.message));

  var excep2;
  try {prop1.parse('garbage')} catch(e) {excep2 = e}
  // "Not a valid boolean string"
  //bu_alert("got excep2=" + excep2);
  jum.assertTrue('excep2', excep2);
  jum.assertTrue('excep2a', /not a valid boolean/i.test(excep2.message));
}