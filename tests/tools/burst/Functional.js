/**
* @file Functional.js
*
* Defines burst.Functional which contains static utility functions for functional programming.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

//=java package burst;
/**
Scoping class to hold static functions for functional programming.

These are mostly inspired by the C++ function templates in the C++ standard
library (include "functional").
That might seem an odd place to start, but the well-known FP languages such as Haskell
do too much as part of the language to be a good starting point (for example,
there is no explicit "curry" function in Haskell, because the language itself does it).

*/
//:NSBEGIN Functional
burst.Functional = {};

/** return a unary function given a binary function and the first argument. */
//:NSFUNCTION UnaryOp bind1st(BinaryOp binary_op, Object arg1)
burst.Functional.bind1st = function(binary_op, arg1) {
  return function(arg2) {return binary_op(arg1, arg2)};
}

/** return a unary function given a binary function and the second argument. */
//:NSFUNCTION UnaryOp bind2nd(BinaryOp binary_op, Object arg2)
burst.Functional.bind2nd = function(binary_op, arg2) {
  return function(arg1) {return binary_op(arg1, arg2)}
}

burst.Functional._1 = new Number(1);
burst.Functional._2 = new Number(2);
burst.Functional._3 = new Number(3);

/**
* Return a function with the supplied arguments bound.
* The variable args supplied are matched positionally to the parameters of the supplied function.
* The caller can pass in one of the constants burst.Functional._1, burst.Functional._2, etc.
* to indicate that the function func should be called with the first, second,
* etc. argument of the returned function.
*
* For example:<code>burst.Functional.bind(op, burst.Functional._2, burst.Functional._1, 17)</code> returns a binary function
* <code>f(x,y)</code> which will call <code>op(y,x,17)</code>.
* 
* See http://www.boost.org/libs/bind/bind.html
* @todo finish implementation of bind
*/
//:NSFUNCTION Function bind(func, arg1, ...)
burst.Functional.bind = function(func) {
  bu_unimplemeted('burst.Functional.bind');
}

/**
* Return a unary predicate which reverses the sense of the provided unary predicate.
*/
//:NSFUNCTION UnaryPred not1(UnaryPred unary_pred)
burst.Functional.not1 = function(unary_pred) {
  return function(arg1) {return !unary_pred(arg1)}
}

/**
* Return a binary predicate which reverses the sense of the provided binary predicate.
*/
//:NSFUNCTION BinaryPred not2(BinaryPred binary_pred)
burst.Functional.not2 = function(binary_pred) {
  return function(arg1,arg2) {return !binary_pred(arg1,arg2)}
}

/**
* Return a function which will bind 'this' to the object in its single argument,
* and call the provided member function.
*
* An example might be <code>burst.Functional.mem_fun0(Person.prototype.kill)(myperson)</code>.
*/
//:NSFUNCTION ZeroaryOp mem_fun0(ZeroAryMemberFunction mem_func)
burst.Functional.mem_fun0 = function(mem_func) {
  return function(obj) {return mem_func.call(obj)};
}

/**
* Return a function which will bind 'this' to the object in its first argument,
* and call the provided member function with its second argument.
*
* An example might be <code>burst.Functional.mem_fun1(Person.prototype.setManager)(myperson, mgr)</code>.
*
* (Note that the C++ <var>mem_fun</var> function template will work with zeroary or unary functions.
* Unless the function counts its arguments, mem_fun1 could be used as mem_fun.)
*/
//:NSFUNCTION UnaryOp mem_fun1(UnAryMemberFunction mem_func)
burst.Functional.mem_fun1 = function(mem_func) {
  return function(obj, arg1) {return mem_func.call(obj, arg1)};
}

/**
* Like mem_fun but works with any number of arguments.
*
* See http://www.boost.org/libs/bind/mem_fn.html
* @todo finish implementation of mem_fn
*/
//:NSFUNCTION Function mem_fn(MemberFunction mem_func)
burst.Functional.mem_fn = function(mem_func) {
  bu_unimplemented("burst.Functional.mem_fn");
}

// return a function that has 'this' bound to the object
function bind_object(mem_func, object) {return function() {mem_func.apply(object, arguments)}}

/**
For compose operations, we use the boost naming convention:
<pre>
f(g(value))            compose_f_gx      C++ compose1 
f(g(value),h(value))   compose_f_gx_hx   C++ compose2 
f(g(value1),h(value2)) compose_f_gx_hy  
f(g(value1,value2))    compose_f_gxy  
f(g())                 compose_f_g 
</pre>
See http://www.josuttis.com/cppcode/compose.html
*/

//:NSFUNCTION UnaryOp compose_f_gx(UnaryOp f, UnaryOp g)
burst.Functional.compose_f_gx = function(f, g) {
  return function(arg1) {return f(g(arg1))};
}

/** f(g(value),h(value)) */
//:NSFUNCTION UnaryOp compose_f_gx_hx(BinaryOp f, UnaryOp g, UnaryOp h)
burst.Functional.compose_f_gx_hx = function(f, g, h) {
  return function(arg1) {return f(g(arg1), h(arg1))};
}

/** f(g(value1),h(value2)) */
//:NSFUNCTION BinaryOp compose_f_gx_hy(BinaryOp f, UnaryOp g, UnaryOp h)
burst.Functional.compose_f_gx_hy = function(f, g, h) {
  return function(arg1,arg2) {return f(g(arg1), h(arg2))};
}

/** f(g(value1,value2)) */
//:NSFUNCTION BinaryOp compose_f_gxy(UnaryOp f, BinaryOp g)
burst.Functional.compose_f_gxy = function(f, g) {
  return function(arg1,arg2) {return f(g(arg1,arg2))};
}

/** f(g()) */
//:NSFUNCTION ZeroaryOp compose_f_g(ZeroaryOp f, ZeroaryOp g)
burst.Functional.compose_f_g = function(f, g) {
  return function() {return f(g())};
}

/*
// op1(op2())
// op1(op2(x))
// op1(op2(x,y))
Op compose1(op1, op2)
// op1(op2(x), op3(x))
// op1(op2(x), op3(y)
Op compose2(op1, op2, op3)
*/

/**
* Generic compose. The returned function calls f(g(...)). The function f is unary. 
* The returned function and g take the same number of arguments.
*/
//:NSFUNCTION Function compose(UnaryOp f, Function g)
burst.Functional.compose = function(f, g) {
  return function() {return f(g.apply(null, arguments))}
}

/**
* compose two sort comparators. The secondary is applied only if the primary returns 0.
*/
//:NSFUNCTION Function compose_sort(BinaryOp secondary, BinaryOp primary)
burst.Functional.compose_sort = function(secondary, primary) {
  return function(a,b) {
    var result = primary(a,b);
    return result == 0 ? secondary(a,b) : result;
  };
}

/*
function bind1st(f, a) {
  return function() {return f.apply(null, a, arguments[0], ...)}
}

// bind all but last arg
burst.Functional.curry function(f, a1,...aNminus1) {
  if (arguments.length < 2) return f;
  return curry(bind1st(f, arguments[0]), arguments[1], ...)
}
*/
  
/*
function swap2(f) {return function(x, y) {return f(y, x)}}
*/

/*
// return function of 1 args, given a function of 2 args and the first arg
(define curry
  (lambda (f)
    (lambda (x)
      (lambda (y)
        (f x y)))))

function curry(func2, arg1) {return function(arg2) {return func2(arg1, arg2);}}

// return function of 2 args, given a function of 1 args
(define uncurry
  (lambda (f) (lambda (x y) ((f x) y))))


function uncurry(func1) {return function(arg1, arg2) {return func1(arg1)(arg2);}}

apply == curry uncurry apply
*/

/*
funcall exists as call. 

apply exists as apply.
*/

//:NSEND

bu_loaded('burst.Functional');
