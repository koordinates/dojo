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
import java.io.*;

import org.dojo.jsl.top.JscException;

import org.dojo.jsl.ast.TreePattern;

/**
 * Simple class that wraps the template data structure used to represent a tree
 * template as described <a href="doc-files/Tree_Patterns.html">here</a>. Class
 * is well-behaved in regards to <code>equals</code> and <code>hashCode</code>
 * so objects of this class can be dropped in collections and used as keys in
 * maps.
 * 
 * 
 * @since JDK 1.4
 * @see TreeMatcher
 */
public class TreeTemplate extends Object {

	static public TreeTemplate compile(String treePattern) throws JscException {
		InputStream is = new ByteArrayInputStream(treePattern.getBytes());
		TreePattern parser = new TreePattern(is);
		TreeTemplate template = null;

		try {
			template = parser.Pattern();
		} catch (org.dojo.jsl.ast.ParseException e) {
			throw new JscException(e);
		} finally {
			try {
				is.close();
			} catch (IOException exc) {
			}
		}

		return template;
	}

	/**
	 * Node attributes. Keys are "value", "type", "parent", "scope", "stop",
	 * "multi", "name". Values are <code>NodeField</code> instances for the
	 * keys "value", "type", "parent" and "scope". For "multi" its an instance
	 * of <code>Multi</code>, for "name" its a <code>String</code> and for
	 * stop its <code>Boolean.TRUE</code> for "scope" it's either "local" or
	 * "global"
	 */
	public Map node;

	/**
	 * list of child templates. elements are <code>TreeTemplate</code>
	 * instances
	 */
	public List children;

	/**
	 * Constructs an instance of <code>TreeTemplate</code>
	 */
	public TreeTemplate() {
		super();
	}

	/**
	 * Adds a template as a child template to receiver
	 * 
	 * @param child
	 *            child template
	 */
	public void add(TreeTemplate child) {
		if (children == null) {
			children = new ArrayList();
		}

		children.add(child);
	}

	@Override
	public String toString() {
		return "TreeTemplate(" + node + ", " + children + ")";
	}

	@Override
	public int hashCode() {
		int result = 17;

		if (node != null) {
			result = 37 * result + node.hashCode();
		} else {
			result = 37 * result;
		}

		if (children != null) {
			result = 37 * result + children.hashCode();
		} else {
			result = 37 * result;
		}

		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if ((obj != null) && (obj.getClass().equals(this.getClass()))) {
			TreeTemplate other = (TreeTemplate) obj;

			return (node != null ? node.equals(other.node) : other.node == null)
					&& (children != null ? children.equals(other.children)
							: other.children == null);
		}

		return false;
	}

}
