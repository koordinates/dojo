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

import java.util.*;
import java.io.*;
import java.nio.*;
import java.nio.channels.*;
import org.apache.tools.ant.*;
import org.apache.tools.ant.types.*;

/**
 * 
 * 
 * @since JDK 1.4
 */
public class CatAntTask extends Task {

	private File file;

	private List filesets;

	public CatAntTask() {
		filesets = new ArrayList();
	}

	public void setFile(File file) {
		this.file = file;
	}

	public void addFileset(FileSet fileset) {
		filesets.add(fileset);
	}

	@Override
	public void execute() throws BuildException {
		int n = filesets.size();

		if ((file == null) || (n == 0)) {
			throw new BuildException("wrong arguments");
		}

		ByteBuffer copyBuffer = ByteBuffer.allocateDirect(16 * 1024);

		FileOutputStream fos = null;
		FileChannel ofc = null;

		try {
			fos = new FileOutputStream(file);
			ofc = fos.getChannel();

			for (int i = 0; i < n; i++) {
				FileSet fs = (FileSet) filesets.get(i);
				DirectoryScanner ds = fs.getDirectoryScanner(project);
				File fromDir = fs.getDir(project);
				String fromDirStr = fromDir.getPath();

				String[] sourceFiles = ds.getIncludedFiles();

				for (int j = 0; j < sourceFiles.length; j++) {
					File src = new File(fromDir, sourceFiles[j]);

					concatenate(ofc, src, copyBuffer);
				}
			}
		} catch (IOException exc) {
			throw new BuildException(exc.toString());
		} finally {
			try {
				if (ofc != null) {
					ofc.close();
				} else if (fos != null) {
					fos.close();
				}
			} catch (IOException exc) {
			}
		}
	}

	private void concatenate(FileChannel ofc, File from, ByteBuffer copyBuffer)
			throws IOException {
		FileInputStream fis = null;
		FileChannel ifc = null;

		copyBuffer.clear();

		try {
			// Open the file and then get a channel from the stream
			fis = new FileInputStream(from);
			ifc = fis.getChannel();

			int sz = (int) ifc.size();

			int n = 0;
			while (n < sz) {
				if (ifc.read(copyBuffer) < 0) {
					break;
				}
				copyBuffer.flip();
				n += ofc.write(copyBuffer);
				copyBuffer.compact();
			}

		} finally {
			try {
				if (ifc != null) {
					ifc.close();
				} else if (fis != null) {
					fis.close();
				}
			} catch (IOException exc) {
			}
		}

	}

}
