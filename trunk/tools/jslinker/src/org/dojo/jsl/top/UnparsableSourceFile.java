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

import java.util.regex.*;
import java.io.*;
import java.nio.*;
import java.nio.channels.*;
import java.nio.charset.*;

/**
 * Implementation of the <code>SourceFile</code> interface taking care of of
 * files that are left unchanged by the program because they are unparsable.
 * 
 * 
 * @since JDK 1.4
 */
public class UnparsableSourceFile extends ImmutableSourceFile implements
		SourceFile {

	/**
	 * If we need to do containsIdentifier checks we're gonna map in the
	 * contents of the file
	 */
	private CharSequence contents;

	private CharsetDecoder decoder;

	/**
	 * Creates an instance of <code>UnparsableSourceFile</code> for specified
	 * filename.
	 * 
	 * @param filename
	 *            file name
	 * @exception JscException
	 *                if instance cannot be created
	 */
	public UnparsableSourceFile(String filename) throws JscException {
		super(filename);
	}

	/**
	 * Creates an instance of <code>UnparsableSourceFile</code> for specified
	 * file.
	 * 
	 * @param file
	 *            file
	 * @exception JscException
	 *                if instance cannot be created
	 */
	public UnparsableSourceFile(File file) throws JscException {
		super(file);
	}

	public boolean containsIdentifier(String identifier) throws JscException {
		if (contents == null) {
			FileInputStream fis = null;
			FileChannel fc = null;

			try {

				if (decoder == null) {
					Charset charset = Charset.forName(charsetName);
					decoder = charset.newDecoder();
				} else {
					decoder.reset();
				}

				// Open the file and then get a channel from the stream
				fis = new FileInputStream(filename);
				fc = fis.getChannel();

				// Get the file's size and then map it into memory
				int sz = (int) fc.size();
				MappedByteBuffer bb = fc.map(FileChannel.MapMode.READ_ONLY, 0,
						sz);

				// Decode the file into a char buffer
				contents = decoder.decode(bb);
			} catch (IOException exc) {
				throw new JscException(exc.toString());
			} finally {
				// Close the channel and the stream
				try {
					if (fc != null) {
						fc.close();
					} else if (fis != null) {
						fis.close();
					}
				} catch (IOException exc) {
				}
			}
		}

		Pattern pattern = Pattern.compile("\\Q" + identifier + "\\E");
		Matcher matcher = pattern.matcher(contents);

		return matcher.find();
	}

}
