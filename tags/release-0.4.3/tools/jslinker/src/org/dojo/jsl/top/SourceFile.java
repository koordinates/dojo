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
 * Interface of source file objects. There's API to write the object to a
 * specified place and to query the filename of the source file.
 * 
 * 
 * @since JDK 1.4
 */
public interface SourceFile {

	/**
	 * Returns the filename of the receiver.
	 * 
	 * @return filename
	 */
	public String getFilename();

	/**
	 * Returns the file of the receiver.
	 * 
	 * @return file
	 */
	public java.io.File getFile();

	/**
	 * Returns an arbitrary user tag. Could be application vs framework etc
	 * 
	 * @return tag
	 */
	public int tag();

	/**
	 * Tags the receiver with the specified tag
	 * 
	 * @param tag
	 *            a tag
	 */
	public void tag(int tag);

	/**
	 * Writes out the receiver to the specified location.
	 * 
	 * @param filename
	 *            location where to write out
	 * @exception JscException
	 *                if an I/O error occurred
	 */
	public void write(String filename) throws JscException;

	/**
	 * Writes out the receiver with the specified writer.
	 * 
	 * @param writer
	 *            writer to use when writing out
	 * @exception JscException
	 *                if an I/O error occurred
	 */
	public void write(java.io.Writer writer) throws JscException;

	/**
	 * Writes out the receiver with the specified writer in specified style.
	 * 
	 * @param writer
	 *            writer to use when writing out
	 * @param style
	 *            pretty printer style
	 * @exception JscException
	 *                if an I/O error occurred
	 * @see HtmlPrettyPrinter
	 * @see PrettyPrinter
	 */
	public void write(java.io.Writer writer, PrettyPrinterStyle style)
			throws JscException;

	/**
	 * Sets the receiver's encoding
	 * 
	 * @param charsetName
	 *            name of a charset
	 * @see java.nio.Charset
	 */
	public void setEncoding(String charsetName);

	/**
	 * Returns the receiver's encoding
	 * 
	 * @return name of receiver's charset
	 * @see java.nio.Charset
	 */
	public String getEncoding();

	/**
	 * Marks the receiver as changed (that means it needs to write out)
	 */
	public void changed();

	/**
	 * Asks the receiver if it wants to be written out
	 * 
	 * @return <code>true</code> if it wants to be written out
	 */
	public boolean shouldOutput();

	/**
	 * Asks if receiver had errors while in a jsl run. (Mostly used to record
	 * parsing errors)
	 * 
	 * @return <code>true</code> if there were some errors when dealing with
	 *         receiver (like IO errors or parsing errors)
	 */
	public boolean failedDuringRun();

	/**
	 * Sets the "failed during run" flag to <code>true</code>.
	 * 
	 */
	public void setFailedDuringRun();

}
