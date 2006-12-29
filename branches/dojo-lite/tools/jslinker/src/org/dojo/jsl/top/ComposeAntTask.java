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
import org.apache.tools.ant.*;
import org.dojo.jsl.util.*;

/**
 * 
 * 
 * @since JDK 1.4
 */
public class ComposeAntTask extends Task {

	private File srcFile;

	private File dstFile;

	public ComposeAntTask() {
	}

	public void setSrcFile(File file) {
		srcFile = file;
	}

	public void setDstFile(File file) {
		dstFile = file;
	}

	@Override
	public void execute() throws BuildException {
		try {
			TokenComposer.freezeDry(srcFile, dstFile);
		} catch (IOException exc) {
			throw new BuildException(exc.toString());
		} catch (TokenComposerException exc) {
			throw new BuildException(exc.toString());
		}
	}
}
