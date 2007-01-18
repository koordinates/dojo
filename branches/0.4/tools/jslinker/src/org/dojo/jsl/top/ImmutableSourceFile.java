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

import java.io.*;

/**
 * Implementation of the <code>SourceFile</code> interface taking care of of
 * files that are left unchanged by the program.
 * 
 * 
 * @since JDK 1.4
 */
public class ImmutableSourceFile extends AbstractSourceFile implements
		SourceFile {

	/**
	 * Creates an instance of <code>ImmutableSourceFile</code> for specified
	 * filename.
	 * 
	 * @param filename
	 *            file name
	 * @exception JscException
	 *                if instance cannot be created
	 */
	public ImmutableSourceFile(String filename) throws JscException {
		super(filename);
		changed = false;
	}

	/**
	 * Creates an instance of <code>ImmutableSourceFile</code> for specified
	 * file.
	 * 
	 * @param file
	 *            file
	 * @exception JscException
	 *                if instance cannot be created
	 */
	public ImmutableSourceFile(File file) throws JscException {
		super(file);
		changed = false;
	}

	@Override
	public void changed() {
	}

	public void write(java.io.Writer writer, PrettyPrinterStyle style)
			throws JscException {
		throw new UnsupportedOperationException(
				"immutable source files don't support writing out to a writer");
	}

	@Override
	protected boolean willModifyOnOutput() throws JscException {
		return false;
	}

}
