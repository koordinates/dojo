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

import org.dojo.jsl.parser.*;

/**
 * Objects of this class match AST tree nodes against patterns as described in
 * this <a href="doc-files/Tree_Patterns.html">document</a>.
 * 
 * 
 * @since JDK 1.4
 */
public class TreeMatcher extends Object {

	/**
	 * Constructs an instance of <code>TreeMatcher</code>
	 */
	public TreeMatcher() {
		super();
	}

	/**
	 * Returns the last part of a fully qualified class name string for the
	 * specified object (i.e. only the name of the class without the package
	 * name included)
	 * 
	 * @param object
	 *            object for which class name is needed
	 * @return unqualified class name
	 */
	private String getUnqualifiedClassName(Object object) {
		String className = object.getClass().getName();

		int dotIndex = className.lastIndexOf('.');

		if (dotIndex != -1) {
			className = className.substring(dotIndex + 1);
		}

		return className;
	}

	/**
	 * Matches the node attributes of a node against the values of attributes in
	 * the node template map
	 * 
	 * @param node
	 *            node to match
	 * @param scope
	 *            node's scope
	 * @param nodeTemplate
	 *            map, keys are attribute names, values are comparison values
	 *            for node
	 * @return <code>true</code> if node attributes match
	 */
	private boolean matchNodeAttributes(SimpleNode node, SimpleNode scope,
			Map nodeTemplate, Map matchedNodes) {
		if (nodeTemplate.containsKey("type")) {
			NodeField field = (NodeField) nodeTemplate.get("type");
			String nodeType = getUnqualifiedClassName(node);

			if (!field.matches(nodeType)) {
				return false;
			}
		}

		if (((node instanceof ASTLiteral) || (node instanceof ASTIdentifier))
				&& (nodeTemplate.containsKey("value"))) {
			NodeField field = (NodeField) nodeTemplate.get("value");

			if (!field.matches(node)) {
				return false;
			}
		}

		if (nodeTemplate.containsKey("scope")) {
			String scopeValue = (String) nodeTemplate.get("scope");

			if ((scopeValue.equals("local") && (scope instanceof ASTProgram))
					|| (scopeValue.equals("global") && (scope instanceof ASTBlock))) {
				return false;
			}
		}

		if (nodeTemplate.containsKey("parent")) {
			SimpleNode parent = (SimpleNode) node.jjtGetParent();
			Object parentNodeTemplate = nodeTemplate.get("parent");

			if (parentNodeTemplate == ASTLiteral.NULL) {
				if (parent != null) {
					return false;
				}
			} else {
				if (parent == null) {
					return false;
				}

				// adjust scope
				if (parent instanceof ASTBlock) {
					scope = (SimpleNode) parent.jjtGetParent();

					while ((scope != null) && (!(scope instanceof ASTBlock))
							&& (!(scope instanceof ASTProgram))) {
						scope = (SimpleNode) scope.jjtGetParent();
					}
				}

				if (!match(parent, scope, (TreeTemplate) parentNodeTemplate,
						matchedNodes)) {
					return false;
				}

				if (((TreeTemplate) parentNodeTemplate).node
						.containsKey("name")) {
					ASTLiteral literal = (ASTLiteral) ((TreeTemplate) parentNodeTemplate).node
							.get("name");

					matchedNodes.put(literal.getValue(), parent);
				}
			}
		}

		if (nodeTemplate.containsKey("prev")) {
			SimpleNode sibling = (SimpleNode) node.getPrevSibling();
			Object siblingNodeTemplate = nodeTemplate.get("prev");

			if (siblingNodeTemplate == ASTLiteral.NULL) {
				if (sibling != null) {
					return false;
				}
			} else {
				if (sibling == null) {
					return false;
				}

				if (!match(sibling, scope, (TreeTemplate) siblingNodeTemplate,
						matchedNodes)) {
					return false;
				}

				if (((TreeTemplate) siblingNodeTemplate).node
						.containsKey("name")) {
					ASTLiteral literal = (ASTLiteral) ((TreeTemplate) siblingNodeTemplate).node
							.get("name");

					matchedNodes.put(literal.getValue(), sibling);
				}
			}
		}

		if (nodeTemplate.containsKey("next")) {
			SimpleNode sibling = (SimpleNode) node.getNextSibling();
			Object siblingNodeTemplate = nodeTemplate.get("next");

			if (siblingNodeTemplate == ASTLiteral.NULL) {
				if (sibling != null) {
					return false;
				}
			} else {
				if (sibling == null) {
					return false;
				}

				if (!match(sibling, scope, (TreeTemplate) siblingNodeTemplate,
						matchedNodes)) {
					return false;
				}

				if (((TreeTemplate) siblingNodeTemplate).node
						.containsKey("name")) {
					ASTLiteral literal = (ASTLiteral) ((TreeTemplate) siblingNodeTemplate).node
							.get("name");

					matchedNodes.put(literal.getValue(), sibling);
				}

			}
		}

		return true;
	}

	/**
	 * Matches a tree node against a tree template. If the match succeeded then
	 * nodes from the subtree rooted in the specified node that matched named
	 * node templates can be accessed from the passed in map by the template
	 * name.
	 * 
	 * @param node
	 *            node to be matched
	 * @param scope
	 *            the node's current scope
	 * @param template
	 *            the template for matching
	 * @param matchedNodes
	 *            where nodes in subtree that match named node templates get
	 *            collected
	 * @return <code>true</code> if node matches template
	 */
	public boolean match(SimpleNode node, SimpleNode scope,
			TreeTemplate template, Map matchedNodes) {

		// first match node attributes: type, value, scope, parent, next and
		// prev

		if (!matchNodeAttributes(node, scope, template.node, matchedNodes)) {
			return false;
		}

		// now we analyze the children

		// if template contains stop keyword we ignore children

		if (!template.node.containsKey("stop")) {

			// first some quick obvious mismatch tests

			if ((node.jjtGetNumChildren() > 0)
					&& ((template.children == null) || (template.children
							.size() == 0))) {
				return false;
			}

			if ((node.jjtGetNumChildren() == 0) && (template.children != null)
					&& (template.children.size() > 0)) {
				return false;
			}

			if ((node.jjtGetNumChildren() > 0) && (template.children != null)
					&& (template.children.size() > 0)
					&& (node.jjtGetNumChildren() < template.children.size())) {
				return false;
			}

			// go one by one matching children and child templates
			// the multi attribute is greedy (we match as many children as
			// possible before going to next template)

			if ((node.jjtGetNumChildren() > 0) && (template.children != null)
					&& (template.children.size() > 0)) {

				HashMap matchedChildren = new HashMap();
				boolean done = false;

				int childCursor = 0;
				int childTemplateCursor = 0;
				int matchedWithTemplate = 0;

				if (node instanceof ASTBlock) {
					scope = node;
				}

				while (!done) {
					SimpleNode child = (SimpleNode) node
							.jjtGetChild(childCursor);
					TreeTemplate childTemplate = (TreeTemplate) template.children
							.get(childTemplateCursor);

					boolean childMatched = match(child, scope, childTemplate,
							matchedChildren);

					if (childMatched) {
						matchedWithTemplate++;
						boolean childAssigned2Template = true;

						if (childTemplate.node.containsKey("multi")) {
							Multi multi = (Multi) childTemplate.node
									.get("multi");

							// here we decide if we move to next template or
							// not.
							// normally we're very greedy and keep the template
							// until it reaches multi.max()
							// but we can be a little smart and calculate the
							// minimum number of children needed
							// for the remaining templates, if we're over
							// multi.min() and reached that minimum
							// we move to the next template

							int minChildrenNeeded = 0;

							for (int j = childTemplateCursor + 1; j < template.children
									.size(); j++) {
								TreeTemplate aChildTemplate = (TreeTemplate) template.children
										.get(j);

								if (aChildTemplate.node.containsKey("multi")) {
									Multi aMulti = (Multi) aChildTemplate.node
											.get("multi");
									minChildrenNeeded += aMulti.min();
								} else {
									minChildrenNeeded++;
								}
							}

							if ((node.jjtGetNumChildren() - childCursor) < minChildrenNeeded) {
								return false;
							}

							if ((matchedWithTemplate == (multi.max() + 1))
									|| ((matchedWithTemplate > multi.min()) && ((node
											.jjtGetNumChildren() - childCursor) == minChildrenNeeded))) {
								childTemplateCursor++;
								matchedWithTemplate = 0;
								childAssigned2Template = false;
							} else {
								childCursor++;
							}

							if ((childCursor == node.jjtGetNumChildren())
									|| (childTemplateCursor == template.children
											.size())) {
								if ((childCursor == node.jjtGetNumChildren())
										&& (childTemplateCursor == template.children
												.size())) {
									done = true;
								} else {
									if (childCursor == node.jjtGetNumChildren()) {
										if (matchedWithTemplate < multi.min()) {
											return false;
										} else {
											done = true;
										}
									} else if (childTemplateCursor == template.children
											.size()) {
										return false;
									}
								}
							}
						} else {
							childCursor++;
							childTemplateCursor++;
							matchedWithTemplate = 0;
							if ((childCursor == node.jjtGetNumChildren())
									|| (childTemplateCursor == template.children
											.size())) {
								if ((childCursor == node.jjtGetNumChildren())
										&& (childTemplateCursor == template.children
												.size())) {
									done = true;
								} else {
									return false;
								}
							}
						}

						// if child assigned to the template and
						// if child template is named then add child to the
						// matchedNodes map
						// in case of multi add it to the list of children under
						// that name

						if (childAssigned2Template) {
							if (childTemplate.node.containsKey("name")) {
								ASTLiteral literal = (ASTLiteral) childTemplate.node
										.get("name");

								if (childTemplate.node.containsKey("multi")) {
									String key = (String) literal.getValue();
									List multiList = (List) matchedNodes
											.get(key);

									if (multiList == null) {
										multiList = new ArrayList();
										matchedNodes.put(key, multiList);
									}
									multiList.add(child);
								} else {
									matchedNodes.put(literal.getValue(), child);
								}
							}
						}
					} else {
						if (childTemplate.node.containsKey("multi")) {
							Multi multi = (Multi) childTemplate.node
									.get("multi");

							if (matchedWithTemplate < multi.min()) {
								return false;
							} else {
								childTemplateCursor++;
								matchedWithTemplate = 0;

								if (childTemplateCursor == template.children
										.size()) {
									return false;
								}
							}
						} else {
							return false;
						}
					}
				}

				matchedNodes.putAll(matchedChildren);
			}
		}

		return true;
	}
}
