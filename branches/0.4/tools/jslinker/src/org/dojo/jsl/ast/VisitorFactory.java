/*
 Copyright (c) 2004-2005, The Dojo Foundation
 All Rights Reserved.

 Licensed under the Academic Free License version 2.1 or above OR the
 modified BSD license. For more information on Dojo licensing, see:

 http://dojotoolkit.org/community/licensing.shtml <http://dojotoolkit.org/community/licensing.shtml>

 Code donated to the Dojo Foundation by AOL LLC under the terms of
 the Dojo CCLA (http://dojotoolkit.org/ccla.txt).

 */
package org.dojo.jsl.ast;

import java.util.*;
import java.util.logging.*;
import java.io.*;
import org.apache.bcel.*;
import org.apache.bcel.generic.*;
import org.apache.bcel.classfile.*;
import org.dojo.jsl.parser.*;
import org.dojo.jsl.top.*;

import org.dojo.jsl.ast.TreePattern;
import org.dojo.jsl.parser.EcmaScriptVisitor;

/**
 * Creates abstract syntax tree visitors that act according to specified tree
 * patterns. When one of the patterns matches during a visit run by a generated
 * visitor a specified method on a specified target gets called.
 * 
 * 
 * @since JDK 1.4
 */
public class VisitorFactory extends Object implements Constants {

	static public final int VISIT_SUBTREE_METHOD_TYPE = 1;

	static public final int DELEGATE_METHOD_TYPE = 2;

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
	 * Generated class cache. Keys are <code>TreeTemplateArray</code>
	 * instances, values are <code>Class</code> instances.
	 */
	private HashMap classCache;

	/**
	 * Constant used at byte code generation
	 */
	static private final String[] interfaces = new String[] { EcmaScriptVisitor.class
			.getName() };

	/**
	 * Constant used at byte code generation
	 */
	static private final ObjectType objectType = new ObjectType(
			"java.lang.Object");

	/**
	 * Constant used at byte code generation
	 */
	static private final Type[] argTypes = new Type[] {
			new ObjectType("org.dojo.jsl.parser.SimpleNode"), Type.INT,
			new ObjectType("java.lang.Object") };

	/**
	 * A shared instance
	 */
	static private final VisitorFactory sharedInstance = new VisitorFactory();

	/**
	 * Returns a shared instance
	 * 
	 * @return shared instance
	 */
	static public VisitorFactory getSharedInstance() {
		return VisitorFactory.sharedInstance;
	}

	/**
	 * Creates an instance of <code>VisitorFactory</code>
	 */
	public VisitorFactory() {
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
	protected final String getUniqueID() {
		return Integer.toString(factoryId) + "_"
				+ Integer.toString(creationId++);
	}

	/**
	 * Parses array of tree patterns into array of tree template
	 * 
	 * @param patterns
	 *            tree patterns
	 * @return tree templates
	 * @exception JscException
	 *                when a parsing error occurs
	 */
	protected TreeTemplate[] getTemplates(String[] patterns)
			throws JscException {
		TreeTemplate[] templates = new TreeTemplate[patterns.length];

		for (int i = 0; i < patterns.length; i++) {
			InputStream is = new ByteArrayInputStream(patterns[i].getBytes());
			TreePattern parser = new TreePattern(is);

			try {
				templates[i] = parser.Pattern();
			} catch (org.dojo.jsl.ast.ParseException e) {
				throw new JscException(e);
			} finally {
				try {
					is.close();
				} catch (IOException exc) {
				}
			}
		}

		return templates;
	}

	/**
	 * Creates a visitor that when visiting nodes that match the specified
	 * pattern will call specified target with method that has specified method
	 * name. The method has to have two arguments, first of type
	 * <code>SimpleNode</code>, second of type <code>Map</code>. The first
	 * argument is the matched node, the second is the matchedNodes map that
	 * holds nodes from the subtree rooted in the specified node that matched
	 * named node templates. For examples read this <a
	 * href="doc-files/Tree_Patterns.html">document</a>
	 * 
	 * @param pattern
	 *            tree pattern
	 * @param target
	 *            target to be called on match
	 * @param methodName
	 *            name of method target implements
	 * @return visitor
	 * @exception JscException
	 *                if an error occurs
	 */
	public EcmaScriptVisitor create(String pattern, Object target,
			String methodName, int methodType) throws JscException {
		return this.create(new String[] { pattern }, new Object[] { target },
				new String[] { methodName }, new int[] { methodType });
	}

	/**
	 * Creates a visitor that when visiting nodes that match any of the
	 * specified pattern will call the appropiate target with the appropiate
	 * method. The method has to have two arguments, first of type
	 * <code>SimpleNode</code>, second of type <code>Map</code>. The first
	 * argument is the matched node, the second is the matchedNodes map that
	 * holds nodes from the subtree rooted in the specified node that matched
	 * named node templates. For examples read this <a
	 * href="doc-files/Tree_Patterns.html">document</a>
	 * 
	 * @param patterns
	 *            tree patterns
	 * @param targets
	 *            targets to be called on match
	 * @param methodNames
	 *            name of methods target implements
	 * @return visitor
	 * @exception JscException
	 *                if an error occurs
	 */
	public EcmaScriptVisitor create(String[] patterns, Object[] targets,
			String[] methodNames, int[] methodTypes) throws JscException {
		TreeTemplate[] templates = getTemplates(patterns);

		// sort the templates by root node type
		HashMap templatesByRootType = new HashMap();

		for (int i = 0; i < templates.length; i++) {
			NodeField nodeField = (NodeField) templates[i].node.get("type");
			String nodeClassName = (String) nodeField.literal.getValue();

			List indexes = (List) templatesByRootType.get(nodeClassName);

			if (indexes == null) {
				indexes = new ArrayList();
				templatesByRootType.put(nodeClassName, indexes);
			}

			indexes.add(new Integer(i));
		}

		int n = templatesByRootType.size();
		TreeTemplate[][] sortedTemplates = new TreeTemplate[n][];
		String[][] sortedMethodNames = new String[n][];
		Object[][] sortedTargets = new Object[n][];
		int[][] sortedMethodTypes = new int[n][];

		Iterator iter = templatesByRootType.keySet().iterator();

		int cursor = 0;
		while (iter.hasNext()) {
			String nodeClassName = (String) iter.next();
			List indexes = (List) templatesByRootType.get(nodeClassName);

			n = indexes.size();
			sortedTemplates[cursor] = new TreeTemplate[n];
			sortedMethodNames[cursor] = new String[n];
			sortedMethodTypes[cursor] = new int[n];
			sortedTargets[cursor] = new Object[n];

			for (int j = 0; j < n; j++) {
				int index = ((Integer) indexes.get(j)).intValue();

				sortedTemplates[cursor][j] = templates[index];
				sortedTargets[cursor][j] = targets[index];
				sortedMethodNames[cursor][j] = methodNames[index];
				sortedMethodTypes[cursor][j] = methodTypes[index];
			}
			cursor++;
		}

		TreeTemplateArray templateArray = new TreeTemplateArray(templates);

		Class visitorClass = null;
		GeneratedVisitorSuper instance = null;

		if (classCache.containsKey(templateArray)) {
			visitorClass = (Class) classCache.get(templateArray);
		} else {
			String classNameSuffix = getUniqueID();
			String classname = "org.dojo.jsl.ast.GeneratedVisitor"
					+ classNameSuffix;

			ClassGen cg = new ClassGen(classname,
					"org.dojo.jsl.ast.GeneratedVisitorSuper", "<generated>",
					ACC_PUBLIC | ACC_SUPER, interfaces);

			ConstantPoolGen cp = cg.getConstantPool();
			InstructionFactory instructionFactory = new InstructionFactory(cg,
					cp);

			for (int i = 0; i < sortedTemplates.length; i++) {
				InstructionList il = new InstructionList();

				String nodeClassName = "org.dojo.jsl.parser."
						+ ((NodeField) sortedTemplates[i][0].node.get("type")).literal
								.getValue();

				MethodGen mg = new MethodGen(
						ACC_PUBLIC,
						objectType,
						new Type[] { new ObjectType(nodeClassName), objectType },
						new String[] { "node", "data" }, "visit", classname,
						il, cp);

				InstructionHandle ih_0 = il.append(InstructionFactory
						.createLoad(Type.OBJECT, 0));
				il.append(instructionFactory.createFieldAccess(classname,
						"propagateToSuper", Type.BOOLEAN, Constants.GETFIELD));
				BranchInstruction ifeq_4 = InstructionFactory
						.createBranchInstruction(Constants.IFEQ, null);
				il.append(ifeq_4);
				InstructionHandle ih_7 = il.append(InstructionFactory
						.createLoad(Type.OBJECT, 0));
				il.append(new PUSH(cp, 0));
				il.append(instructionFactory.createFieldAccess(classname,
						"propagateToSuper", Type.BOOLEAN, Constants.PUTFIELD));
				InstructionHandle ih_12 = il.append(InstructionFactory
						.createLoad(Type.OBJECT, 0));
				il.append(InstructionFactory.createLoad(Type.OBJECT, 1));
				il.append(InstructionFactory.createLoad(Type.OBJECT, 2));
				il.append(instructionFactory.createInvoke(
						"org.dojo.jsl.ast.GeneratedVisitorSuper", "visit",
						Type.OBJECT, new Type[] {
								new ObjectType(nodeClassName), Type.OBJECT },
						Constants.INVOKESPECIAL));
				il.append(InstructionFactory.createReturn(Type.OBJECT));
				InstructionHandle ih_19 = il.append(InstructionFactory
						.createLoad(Type.OBJECT, 0));
				il.append(InstructionFactory.createLoad(Type.OBJECT, 1));
				il.append(new PUSH(cp, i));
				il.append(InstructionFactory.createLoad(Type.OBJECT, 2));
				il
						.append(instructionFactory
								.createInvoke(
										classname,
										"execute",
										Type.OBJECT,
										new Type[] {
												new ObjectType(
														"org.dojo.jsl.parser.SimpleNode"),
												Type.INT, Type.OBJECT },
										Constants.INVOKEVIRTUAL));
				InstructionHandle ih_27 = il.append(InstructionFactory
						.createReturn(Type.OBJECT));
				ifeq_4.setTarget(ih_19);
				mg.setMaxStack();
				mg.setMaxLocals();
				cg.addMethod(mg.getMethod());
				il.dispose();
			}

			cg.addEmptyConstructor(ACC_PUBLIC);

			JavaClass clazz = cg.getJavaClass();
			VisitorLoader loader = new VisitorLoader(clazz,
					GeneratedVisitorSuper.class.getClassLoader());

			try {
				visitorClass = Class.forName(classname, true, loader);

				classCache.put(templateArray, visitorClass);
			} catch (Exception exc) {
				// PENDING(uwe) what to do here, continue
				Top.logger.log(Level.SEVERE,
						"loading generated visitor failed", exc);
			}
		}

		if (visitorClass != null) {
			try {
				instance = (GeneratedVisitorSuper) visitorClass.newInstance();
			} catch (Exception exc) {
				// PENDING(uwe) what to do here, continue
				Top.logger.log(Level.SEVERE, "creating dynamic visitor failed",
						exc);
			}
		}

		if (instance != null) {
			instance.setTemplates(sortedTemplates);
			instance.setTargets(sortedTargets);
			instance.setMethodNames(sortedMethodNames);
			instance.setMethodTypes(sortedMethodTypes);
		}

		return instance;
	}

	// for tests
	static public void main(String[] args) {
		String[] patterns = new String[] {
				"({type = 'ASTVariableDeclaration', scope = local}, { type = 'ASTIdentifier', name:'identifier', stop },"
						+ " {multi = *, stop})",
				"({type = 'ASTFunctionDeclaration', scope = global}, ({}, {multi = +, stop}))" };

		VisitorFactory factory = new VisitorFactory();

		try {
			TreeTemplate[] templates1 = factory.getTemplates(patterns);
			TreeTemplate[] templates2 = factory.getTemplates(patterns);

			System.out
					.println("templates1 hashCode = " + templates1.hashCode());
			System.out
					.println("templates2 hashCode = " + templates2.hashCode());
			System.out.println("templates1.equals(templates2) = "
					+ templates1.equals(templates2));

			TreeTemplateArray array1 = new TreeTemplateArray(templates1);
			TreeTemplateArray array2 = new TreeTemplateArray(templates2);

			System.out.println("array1 hashCode = " + array1.hashCode());
			System.out.println("array2 hashCode = " + array2.hashCode());
			System.out.println("array1.equals(array2) = "
					+ array1.equals(array2));
		} catch (JscException exc) {
			exc.printStackTrace();
		}
	}

}
