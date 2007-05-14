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
 * Partial implementation of the <code>SourceFile</code> interface. The only
 * method that needs implementation from subclasses to make a full
 * <code>SourceFile</code> implementation is:
 * <p>
 * <ul>
 * <li> <code>public void write(Writer writer) throws JscException;</code>
 * </ul>
 * 
 * This implementation keeps a change state and only calls
 * <code>writeImpl</code> when it actually needs to to write something out,
 * otherwise it does a cheap copy of the input source file or if the location is
 * the same does nothing.
 * 
 * 
 * @since JDK 1.4
 */
public abstract class AbstractSourceFile extends Object implements SourceFile {

	/**
	 * Filename
	 */
	protected String filename;

	/**
	 * File
	 */
	protected File file;

	/**
	 * <code>true</code> if receiver changed and needs to write out
	 */
	protected boolean changed;

	/**
	 * Holds an arbitrary user tag used to identify framework vs application
	 * files etc
	 */
	protected int tag;

	/**
	 * Name of charset for the encoding used to read and write this file
	 */
	protected String charsetName;

	/**
	 * Records parsing or io errors
	 */
	private boolean failedDuringRun;

	/**
	 * File parsed for require statements
	 */
	private boolean parsedReqStmts;

	/**
	 * Creates an instance of AbstractSourceFile for specified filename
	 * 
	 * @param filename
	 *            file name
	 */
	public AbstractSourceFile(String filename) throws JscException {
		this(new File(filename));
	}

	/**
	 * Creates an instance of AbstractSourceFile for specified file
	 * 
	 * @param file
	 *            file
	 */
	public AbstractSourceFile(File file) throws JscException {
		super();
		this.file = file;
		this.parsedReqStmts = false;
		charsetName = "ISO-8859-1";

		try {
			this.file = Sources.getSharedInstance().getCanonicalFile(this.file);
			filename = Sources.getSharedInstance().getCanonicalPath(this.file);
		} catch (IOException exc) {
			throw new JscException(exc);
		}
	}

	public String getFilename() {
		return filename;
	}

	public File getFile() {
		return file;
	}

	public int tag() {
		return tag;
	}

	public void tag(int tag) {
		this.tag = tag;
	}

	public void changed() {
		changed = true;
	}

	protected abstract boolean willModifyOnOutput() throws JscException;

	protected void writeImpl(String outputFilename) throws JscException {
		Writer writer = null;

		if (outputFilename == null) {
			outputFilename = filename;
		}

		FileOutputStream fos = null;
		OutputStream gos = null;

		try {
			fos = new FileOutputStream(outputFilename);
			gos = new BufferedOutputStream(fos);
			writer = new OutputStreamWriter(gos, charsetName);

			this.write(writer);
		} catch (IOException exc) {
			failedDuringRun = true;
			throw new JscException(exc);
		} finally {
			if (writer != null) {
				try {
					writer.close();
				} catch (IOException exc) {
				}
			} else if (gos != null) {
				try {
					gos.close();
				} catch (IOException exc) {
				}
			} else if (fos != null) {
				try {
					fos.close();
				} catch (IOException exc) {
				}
			}
		}
	}

	public void write(String outputFilename) throws JscException {
		File outFile = (outputFilename != null) ? new File(outputFilename)
				: null;

		if ((outputFilename == null) || file.equals(outFile)) {
			// in place
			// if nothing changed don't do anything
			if (changed || willModifyOnOutput()) {
				// overwrite
				writeImpl(outputFilename);
			}
		} else {
			// first make sure the parent output dir exists
			File parentFile = outFile.getParentFile();

			if (!parentFile.exists()) {
				if (!parentFile.mkdirs()) {
					throw new JscException("could not create directory "
							+ parentFile);
				}
			}

			if ((!changed) && (!willModifyOnOutput())) {
				// copy file over
				try {
					Util.copyFile(filename, outputFilename);
				} catch (IOException exc) {
					failedDuringRun = true;
					throw new JscException(exc);
				}
			} else {
				// write out ast
				writeImpl(outputFilename);
			}
		}
	}

	public void write(Writer writer) throws JscException {
		this.write(writer, Top.getSharedInstance().getPrettyPrinterStyle());
	}

	public void setEncoding(String charsetName) {
		this.charsetName = charsetName;
	}

	public String getEncoding() {
		return charsetName;
	}

	public boolean shouldOutput() {
		return true;
	}

	public boolean failedDuringRun() {
		return failedDuringRun;
	}

	public void setFailedDuringRun() {
		failedDuringRun = true;
	}

	public void setFileParsed() {
		parsedReqStmts = true;
	}

	public Boolean requireStmtParsed() {
		return parsedReqStmts;
	}

	@Override
	public String toString() {
		return this.getClass().getName() + "[" + filename + ", "
				+ Sources.tag2String(tag) + ", " + charsetName + "]";
	}

}
