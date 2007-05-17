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
 * Interface of source file factories. Used by <code>Sources</code> objects to
 * create instances of <code>SourceFile</code>.
 * 
 * 
 * @since JDK 1.4
 * @see SourceFile
 * @see Sources
 */
public interface SourceFileFactory {

	/**
	 * Creates an instance of <code>SourceFile</code> for the file with the
	 * specified filename.
	 * 
	 * @param filename
	 *            name of file for which the <code>SourceFile</code> is
	 *            created
	 * @return <code>SourceFile</code> instance
	 * @exception JscException
	 *                if the creation failed
	 */
	public SourceFile create(String filename) throws JscException;

	/**
	 * Creates an instance of <code>SourceFile</code> for the specified file.
	 * 
	 * @param file
	 *            file for which the <code>SourceFile</code> is created
	 * @return <code>SourceFile</code> instance
	 * @exception JscException
	 *                if the creation failed
	 */
	public SourceFile create(java.io.File file) throws JscException;

}
