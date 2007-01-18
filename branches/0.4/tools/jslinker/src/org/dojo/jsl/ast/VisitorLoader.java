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

import org.apache.bcel.classfile.*;

/**
 * ClassLoader for dynamically generated classes by the
 * <code>VisitorFactory</code>.
 * 
 * 
 * @since JDK 1.4
 * @see VisitorFactory
 */
public class VisitorLoader extends java.lang.ClassLoader {

	private JavaClass clazz;

	public VisitorLoader(JavaClass clazz) {
		super();
		this.clazz = clazz;
	}

	public VisitorLoader(JavaClass clazz, java.lang.ClassLoader parent) {
		super(parent);
		this.clazz = clazz;
	}

	@Override
	protected Class findClass(String name) throws ClassNotFoundException {
		if (name.equals(clazz.getClassName())) {
			byte[] bytes = clazz.getBytes();

			return this.defineClass(clazz.getClassName(), bytes, 0,
					bytes.length);
		} else {
			return super.findClass(name);
		}
	}
}
