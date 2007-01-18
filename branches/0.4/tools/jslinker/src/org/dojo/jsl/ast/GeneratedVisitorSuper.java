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

import java.beans.*;

import java.util.*;
import java.util.logging.*;

import org.dojo.jsl.parser.*;
import org.dojo.jsl.top.*;

import org.dojo.jsl.parser.EcmaScriptVisitor;

/**
 * Superclass of the generated visitor that <code>VisitorFactory</code>
 * returns. It's easier to specify the method implementation core here instead
 * of with byte op-codes.
 * <p>
 * 
 * An object of this class holds templates, targets and method names. It can be
 * asked to match a certain template against a node and in case of matching call
 * the appropiate method on the appropiate target. "Appropiate" means target and
 * method in the same position in their two-dimensional arrays as the position
 * in the template array of the template that matched.
 * 
 * 
 * @since JDK 1.4
 * @see VisitorFactory
 */
public class GeneratedVisitorSuper extends EcmaScriptVisitorAdapter implements
		EcmaScriptVisitor {

	/**
	 * Two-dimensional target array
	 */
	private Object[][] targets;

	/**
	 * Two-dimensional method name array
	 */
	private String[][] methodNames;

	/**
	 * Two-dimensional method type array
	 */
	private int[][] methodTypes;

	/**
	 * Two-dimensional template array
	 */
	private TreeTemplate[][] templates;

	/**
	 * tree matcher used for the tree matching
	 */
	private TreeMatcher matcher;

	/**
	 * If this flag is <code>true</code> then the visitor method just calls
	 * super.visit and doesn't do a pattern matching.
	 */
	protected boolean propagateToSuper;

	/**
	 * Creates an instance of <code>GeneratedVisitorSuper</code>
	 */
	public GeneratedVisitorSuper() {
		super();
		matcher = new TreeMatcher();
	}

	/**
	 * Sets the template array
	 * 
	 * @param templates
	 *            template array
	 */
	public void setTemplates(TreeTemplate[][] templates) {
		this.templates = templates;
	}

	/**
	 * Sets the targets array
	 * 
	 * @param targets
	 *            targets array
	 */
	public void setTargets(Object[][] targets) {
		this.targets = targets;
	}

	/**
	 * Sets the method names array
	 * 
	 * @param methodNames
	 *            method names array
	 */
	public void setMethodNames(String[][] methodNames) {
		this.methodNames = methodNames;
	}

	/**
	 * Sets the method types array
	 * 
	 * @param methodNames
	 *            method types array
	 */
	public void setMethodTypes(int[][] methodTypes) {
		this.methodTypes = methodTypes;
	}

	/**
	 * Matches the specified node against all templates in the template array in
	 * the row at specified index until it finds a template that matches node.
	 * If it does it calls the appropiate method on the appropiate target.
	 * "Appropiate" means target and method in the same position in their
	 * two-dimensional arrays as the position in the template array of the
	 * template that matched.
	 * 
	 * @param node
	 *            node used in matching
	 * @param index
	 *            row-index in the template array
	 */
	public Object execute(SimpleNode node, int index, Object data) {
		if ((index >= 0) && (index < templates.length)) {

			TreeTemplate[] currentTemplates = templates[index];
			Object[] currentTargets = targets[index];
			String[] currentMethodNames = methodNames[index];
			int[] currentMethodTypes = methodTypes[index];
			SimpleNode scope = getScope();

			for (int i = 0; i < currentTemplates.length; i++) {
				HashMap matchedNodes = new HashMap();
				if (matcher.match(node, scope, currentTemplates[i],
						matchedNodes)) {
					try {
						Statement statement = null;

						if (currentMethodTypes[i] == VisitorFactory.VISIT_SUBTREE_METHOD_TYPE) {
							statement = new Statement(currentTargets[i],
									currentMethodNames[i] + "Pre",
									new Object[] { node, matchedNodes, data });
							statement.execute();
							propagateToSuper = true;
							data = node.jjtAccept(this, data);
							statement = new Statement(currentTargets[i],
									currentMethodNames[i] + "Post",
									new Object[] { node, matchedNodes, data });
							statement.execute();
						} else if (currentMethodTypes[i] == VisitorFactory.DELEGATE_METHOD_TYPE) {
							statement = new Statement(currentTargets[i],
									currentMethodNames[i], new Object[] { node,
											matchedNodes, data });
							statement.execute();
						}

						return data;
					} catch (Exception exc) {
						Top.logger.log(Level.SEVERE,
								"generated visitor (GeneratedVisitorSuper) "
										+ " failed at node " + node
										+ " for templates " + index
										+ " with matchedNodes " + matchedNodes,
								exc);

						throw new RuntimeException(exc);
					}
				}
			}
		}

		propagateToSuper = true;

		return node.jjtAccept(this, data);
	}

}
