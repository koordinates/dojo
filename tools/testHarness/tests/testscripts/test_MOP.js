function test_MOP_initNamed() {
  var obj = {a: 1};
  burst.MOP.initNamed(obj, {a: 3, b: 7});
  jum.assertEquals('test1', {a: 3, b: 7}, obj);
}

function test_MOP_addMethodAdvice() {
  var obj = {counter: 5, increment: function() {return ++this.counter}};

  jum.debug("adding advice1");
  var advice1 = function() {this.counter = - this.counter};
  burst.MOP.addMethodAdvice(obj, 'increment', advice1, 'before');

  jum.debug("adding advice2");
  var advice2 = function() {this.counter = 3 * this.counter};
  burst.MOP.addMethodAdvice(obj, 'increment', advice2, 'after');

  jum.debug("calling method");
  obj.increment();
  //  (-5 + 1) * 3 = -12
  jum.debug("after call1, counter=" + obj.counter);
  jum.assertEquals('test1', -12, obj.counter);
  burst.MOP.removeMethodAdvice(obj, 'increment', advice2);

  var val = obj.increment();
  jum.debug("after call2, counter=" + obj.counter);
  jum.debug("after call2, result=" + val);
  // +12 + 1 = 13
  jum.assertEquals('test2', 13, obj.counter);

  jum.debug("removeAllMethodAdvice");
  burst.MOP.removeAllMethodAdvice(obj, 'increment');
  jum.debug("call3");
  obj.increment();
  jum.debug("after call3, counter=" + obj.counter);

  jum.assertEquals('test3', 14, obj.counter);
}