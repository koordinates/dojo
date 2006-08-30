/*
 Copyright (c) 2004-2005, The Dojo Foundation
 All Rights Reserved.

 Licensed under the Academic Free License version 2.1 or above OR the
 modified BSD license. For more information on Dojo licensing, see:

 http://dojotoolkit.org/community/licensing.shtml <http://dojotoolkit.org/community/licensing.shtml>

 Code donated to the Dojo Foundation by AOL LLC under the terms of
 the Dojo CCLA (http://dojotoolkit.org/ccla.txt).

 */
package org.dojo.jsl.top;

/**
 * Signals that a <i>jsl</i> exception of some sort has occurred. This class is
 * the general class of exceptions produced by failed operations in a <i>jsl</i>
 * run.
 * 
 * 
 * @since JDK 1.4
 */
public class JscException extends Exception {

	private Object moreInfo;

	/**
	 * Creates an instance of <code>JscException</code>.
	 * 
	 * @param exc
	 *            underlying cause
	 */
	public JscException(Throwable exc) {
		super(exc);
	}

	/**
	 * Creates an instance of <code>JscException</code>.
	 * 
	 * @param msg
	 *            exception description
	 */
	public JscException(String msg) {
		super(msg);
	}

	/**
	 * Creates an instance of <code>JscException</code>.
	 * 
	 * @param exc
	 *            underlying cause
	 * @param moreInfo
	 *            object capturing state related to exception
	 */
	public JscException(Throwable exc, Object moreInfo) {
		super(exc);
		this.moreInfo = moreInfo;
	}

	/**
	 * Creates an instance of <code>JscException</code>.
	 * 
	 * @param msg
	 *            exception description
	 * @param moreInfo
	 *            object capturing state related tp exception
	 */
	public JscException(String msg, Object moreInfo) {
		super(msg);
		this.moreInfo = moreInfo;
	}

	/**
	 * Creates an instance of <code>JscException</code>.
	 * 
	 */
	public JscException() {
		super();
	}

	public Object moreInfo() {
		return moreInfo;
	}

	@Override
	public String toString() {
		if (moreInfo == null) {
			return super.toString();
		} else {
			StringBuffer buffer = new StringBuffer();
			buffer.append(super.toString());
			buffer.append('\n');
			buffer.append(moreInfo.toString());

			return buffer.toString();
		}
	}

}
