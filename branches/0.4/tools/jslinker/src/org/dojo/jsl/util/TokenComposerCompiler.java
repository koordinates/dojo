/*
 Copyright (c) 2004-2005, The Dojo Foundation
 All Rights Reserved.

 Licensed under the Academic Free License version 2.1 or above OR the
 modified BSD license. For more information on Dojo licensing, see:

 http://dojotoolkit.org/community/licensing.shtml <http://dojotoolkit.org/community/licensing.shtml>

 Code donated to the Dojo Foundation by AOL LLC under the terms of
 the Dojo CCLA (http://dojotoolkit.org/ccla.txt).

 */
package org.dojo.jsl.util;

import java.util.*;
import org.apache.bcel.*;
import org.apache.bcel.generic.*;
import org.apache.bcel.classfile.*;

final class TokenComposerCompiler extends Object implements Constants {

	/**
	 * Used to generate a unique name for a generated class
	 */
	static private int factories = 0;

	/**
	 * Used to generate a unique name for a generated class
	 */
	private int factoryId;

	/**
	 * Used to generate a unique name for a generated class
	 */
	private int creationId;

	/**
	 * Generated class cache. Keys are
	 * <code>Composer template LinkedLists</code> instances, values are
	 * <code>Class</code> instances.
	 */
	private HashMap classCache;

	/**
	 * Constant used at byte code generation
	 */
	static private final String[] interfaces = new String[] { CompiledTokenComposer.class
			.getName() };

	/**
	 * Constant used at byte code generation
	 */
	static private final ObjectType objectType = new ObjectType(
			"java.lang.Object");

	/**
	 * Constant used at byte code generation
	 */
	static private final Type[] argTypes = new Type[] { new ObjectType(
			"org.dojo.jsl.util.TokenComposer") };

	/**
	 * A shared instance
	 */
	static private final TokenComposerCompiler sharedInstance = new TokenComposerCompiler();

	/**
	 * Returns a shared instance
	 * 
	 * @return shared instance
	 */
	static TokenComposerCompiler getSharedInstance() {
		return TokenComposerCompiler.sharedInstance;
	}

	/**
	 * Creates an instance of <code>TokenComposerCompiler</code>
	 */
	TokenComposerCompiler() {
		super();
		factoryId = factories++;
		creationId = 0;
		classCache = new HashMap();
	}

	/**
	 * Generates a unique string every time when called. This string can be used
	 * as part of a legal java class name
	 * 
	 * @return unique string
	 */
	final String getUniqueID() {
		return Integer.toString(factoryId) + "_"
				+ Integer.toString(creationId++);
	}

	final CompiledTokenComposer compile(TokenComposer tokenComposer,
			Class dataSourceClass) throws TokenComposerException {
		LinkedList template = tokenComposer.getTemplate();

		Class compiledClass = null;
		CompiledTokenComposerImpl instance = null;

		if (classCache.containsKey(template)) {
			compiledClass = (Class) classCache.get(template);
		} else {
			String classNameSuffix = getUniqueID();
			String classname = "org.dojo.jsl.util.CompiledTokenComposerImpl"
					+ classNameSuffix;
			String dataSourceClassname = dataSourceClass.getName();

			InstructionFactory _factory;
			ConstantPoolGen _cp;
			ClassGen _cg;

			_cg = new ClassGen(classname,
					"org.dojo.jsl.util.CompiledTokenComposerImpl", "<Unknown>",
					ACC_PUBLIC | ACC_SUPER,
					new String[] { "org.dojo.jsl.util.CompiledTokenComposer" });

			_cp = _cg.getConstantPool();
			_factory = new InstructionFactory(_cg, _cp);

			// constructor
			_cg.addEmptyConstructor(ACC_PUBLIC);

			// method
			InstructionList il = new InstructionList();
			MethodGen method = new MethodGen(ACC_PROTECTED, Type.VOID,
					new Type[] { Type.OBJECT }, new String[] { "arg0" },
					"composeImpl", classname, il, _cp);

			il.append(InstructionFactory.createLoad(Type.OBJECT, 1));
			il.append(_factory.createCheckCast(new ObjectType(
					dataSourceClassname)));
			il.append(InstructionFactory.createStore(Type.OBJECT, 2));

			il.append(InstructionFactory.createLoad(Type.OBJECT, 0));
			il.append(_factory.createFieldAccess(classname, "tokenComposer",
					new ObjectType("org.dojo.jsl.util.TokenComposer"),
					Constants.GETFIELD));
			il.append(_factory.createInvoke("org.dojo.jsl.util.TokenComposer",
					"getTemplate", new ObjectType("java.util.LinkedList"),
					Type.NO_ARGS, Constants.INVOKEVIRTUAL));
			il.append(_factory.createInvoke("java.util.LinkedList", "iterator",
					new ObjectType("java.util.Iterator"), Type.NO_ARGS,
					Constants.INVOKEVIRTUAL));
			il.append(InstructionFactory.createStore(Type.OBJECT, 3));

			Iterator iter = tokenComposer.getTemplate().iterator();

			while (iter.hasNext()) {
				Object element = iter.next();

				if (element instanceof CharSequence) {
					il.append(InstructionFactory.createLoad(Type.OBJECT, 0));
					il.append(_factory.createFieldAccess(classname,
							"tokenComposer", new ObjectType(
									"org.dojo.jsl.util.TokenComposer"),
							Constants.GETFIELD));
					il.append(InstructionFactory.createLoad(Type.OBJECT, 3));
					il.append(_factory.createInvoke("java.util.Iterator",
							"next", Type.OBJECT, Type.NO_ARGS,
							Constants.INVOKEINTERFACE));
					il.append(_factory.createCheckCast(new ObjectType(
							"java.lang.CharSequence")));
					il.append(_factory.createInvoke(
							"org.dojo.jsl.util.TokenComposer", "write",
							Type.VOID, new Type[] { new ObjectType(
									"java.lang.CharSequence") },
							Constants.INVOKEVIRTUAL));

				} else if (element instanceof TokenComposer.Token) {
					String tokenName = ((TokenComposer.Token) element)
							.getName();

					il.append(InstructionFactory.createLoad(Type.OBJECT, 3));
					il.append(_factory.createInvoke("java.util.Iterator",
							"next", Type.OBJECT, Type.NO_ARGS,
							Constants.INVOKEINTERFACE));
					il.append(InstructionConstants.POP);

					il.append(InstructionFactory.createLoad(Type.OBJECT, 2));
					il.append(InstructionFactory.createLoad(Type.OBJECT, 0));
					il.append(_factory.createFieldAccess(classname,
							"tokenComposer", new ObjectType(
									"org.dojo.jsl.util.TokenComposer"),
							Constants.GETFIELD));
					il.append(_factory.createInvoke(dataSourceClassname,
							"composeToken" + tokenName, Type.VOID,
							new Type[] { new ObjectType(
									"org.dojo.jsl.util.TokenComposer") },
							Constants.INVOKEVIRTUAL));
				} else {
					TokenComposer minime = (TokenComposer) element;

					il.append(InstructionFactory.createLoad(Type.OBJECT, 2));
					il.append(InstructionFactory.createLoad(Type.OBJECT, 3));
					il.append(_factory.createInvoke("java.util.Iterator",
							"next", Type.OBJECT, Type.NO_ARGS,
							Constants.INVOKEINTERFACE));
					il.append(_factory.createCheckCast(new ObjectType(
							"org.dojo.jsl.util.TokenComposer")));
					il.append(_factory.createInvoke(dataSourceClassname,
							"composeTokenBlock" + minime.getName(), Type.VOID,
							new Type[] { new ObjectType(
									"org.dojo.jsl.util.TokenComposer") },
							Constants.INVOKEVIRTUAL));

				}
			}

			il.append(InstructionFactory.createReturn(Type.VOID));
			method.setMaxStack();
			method.setMaxLocals();
			_cg.addMethod(method.getMethod());
			il.dispose();

			JavaClass clazz = _cg.getJavaClass();
			DynamicClassLoader loader = new DynamicClassLoader(clazz, this
					.getClass().getClassLoader());

			try {
				compiledClass = Class.forName(classname, true, loader);

				classCache.put(template, compiledClass);
			} catch (Exception exc) {
				throw new TokenComposerException(exc);
			}
		}

		if (compiledClass != null) {
			try {
				instance = (CompiledTokenComposerImpl) compiledClass
						.newInstance();

				instance.setTokenComposer(tokenComposer);
			} catch (Exception exc) {
				throw new TokenComposerException(exc);
			}
		}

		return instance;
	}

}
