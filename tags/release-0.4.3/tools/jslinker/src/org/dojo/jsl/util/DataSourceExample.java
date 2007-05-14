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

public class DataSourceExample extends Object {

	public DataSourceExample() {
		super();
	}

	public void composeTokenFoo(TokenComposer composer)
			throws TokenComposerException {
		composer
				.write("token foo value -> in DataSourceExample composeTokenFoo");
	}

	public void composeTokenBar(TokenComposer composer)
			throws TokenComposerException {
		composer
				.write("token bar value -> in DataSourceExample composeTokenBar");
	}

	public void composeTokenBlockTar(TokenComposer composer)
			throws TokenComposerException {
		composer
				.write("token block tar value -> in DataSourceExample composeTokenBlockTar");
	}

}
