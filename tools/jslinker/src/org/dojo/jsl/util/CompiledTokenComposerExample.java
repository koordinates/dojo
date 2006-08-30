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

import java.util.*;

public class CompiledTokenComposerExample extends CompiledTokenComposerImpl
		implements CompiledTokenComposer {

	public CompiledTokenComposerExample() {
		super();
	}

	@Override
	protected void composeImpl(Object dataSource) throws TokenComposerException {
		DataSourceExample ds = (DataSourceExample) dataSource;
		Iterator iter = tokenComposer.getTemplate().iterator();

		tokenComposer.write((CharSequence) iter.next());
		tokenComposer.write((CharSequence) iter.next());

		iter.next();
		ds.composeTokenFoo(tokenComposer);

		iter.next();
		ds.composeTokenBar(tokenComposer);

		tokenComposer.write((CharSequence) iter.next());

		ds.composeTokenBlockTar((TokenComposer) iter.next());

		tokenComposer.write((CharSequence) iter.next());
	}

}
