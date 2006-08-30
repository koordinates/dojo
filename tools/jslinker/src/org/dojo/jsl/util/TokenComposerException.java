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

/**
 * Signals that a <i>token composer</i> exception of some sort has occurred.
 * This class is the general class of exceptions produced by failed operations
 * in a <i>token composition</i> run.
 * 
 * 
 * @since JDK 1.4
 */
public class TokenComposerException extends Exception {

	/**
	 * Creates an instance of <code>TokenComposerException</code>.
	 * 
	 * @param exc
	 *            underlying cause
	 */
	public TokenComposerException(Throwable exc) {
		super(exc);
	}

	/**
	 * Creates an instance of <code>TokenComposerException</code>.
	 * 
	 * @param msg
	 *            exception description
	 */
	public TokenComposerException(String msg) {
		super(msg);
	}

	/**
	 * Creates an instance of <code>TokenComposerException</code>.
	 * 
	 */
	public TokenComposerException() {
		super();
	}

}
