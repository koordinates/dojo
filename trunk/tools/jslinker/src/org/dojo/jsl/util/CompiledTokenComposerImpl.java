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

import java.io.*;

public abstract class CompiledTokenComposerImpl extends Object implements
		CompiledTokenComposer {

	protected TokenComposer tokenComposer;

	public CompiledTokenComposerImpl() {
		super();
	}

	public void setTokenComposer(TokenComposer tokenComposer) {
		this.tokenComposer = tokenComposer;
	}

	public void compose(Writer writer, Object dataSource)
			throws TokenComposerException {
		tokenComposer.setWriter(writer);
		composeImpl(dataSource);
		tokenComposer.setWriter(null);
	}

	public void compose(Object dataSource) throws TokenComposerException {
		composeImpl(dataSource);
	}

	protected abstract void composeImpl(Object dataSource)
			throws TokenComposerException;
}
