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

import java.io.File;
import java.io.Writer;

/**
 * Implementation of the <code>SourceFile</code> interface taking care of html
 * source input. The source file suffixes corresponding to this file are "html",
 * "htm", "jhtml", "sxi", "jsi", "adp", "jsp".
 * 
 * 
 * @since JDK 1.4
 */
public class HtmlFile extends AbstractSourceFile implements SourceFile {

	static public final String PRETTY_PRINT_STRIP_COMMENTS_PROPERTY = "source.html.prettyprinter.strip.comments";

	/**
	 * factory for this class
	 */
	static private final SourceFileFactory factory = new SourceFileFactory() {
		public SourceFile create(String filename) throws JscException {
			return new HtmlFile(filename);
		}

		public SourceFile create(File file) throws JscException {
			return new HtmlFile(file);
		}

	};

	/**
	 * Registers with specified <code>Sources</code> instance a
	 * <code>SourceFileFactory</code> for instances of this class.
	 * 
	 * @param sources
	 *            Sources instance
	 */
	static public void register(Sources sources) {
		// read in custom suffixes
		Top top = Top.getSharedInstance();

		String[] customSuffixes = Util.tokenizeCommaSepString(top
				.getProperty(Top.SOURCES_HTML_SUFFIX_LIST_PROPERTY_KEY));

		if (customSuffixes != null) {
			for (int i = 0; i < customSuffixes.length; i++) {
				sources.register(customSuffixes[i], HtmlFile.factory);
			}
		}

		sources.register("html", HtmlFile.factory);
		sources.register("htm", HtmlFile.factory);
		sources.register("jhtml", HtmlFile.factory);
		sources.register("sxi", HtmlFile.factory);
		sources.register("jsi", HtmlFile.factory);
		sources.register("adp", HtmlFile.factory);
		sources.register("jsp", HtmlFile.factory);
	}

	/**
	 * Creates an instance of <code>HtmlFile</code> for specified filename.
	 * 
	 * @param filename
	 *            file name
	 * @exception JscException
	 *                if instance cannot be created
	 */
	public HtmlFile(String filename) throws JscException {
		super(filename);
	}

	/**
	 * Creates an instance of <code>HtmlFile</code> for specified file.
	 * 
	 * @param file
	 *            file
	 * @exception JscException
	 *                if instance cannot be created
	 */
	public HtmlFile(File file) throws JscException {
		super(file);
	}

	@Override
	protected boolean willModifyOnOutput() throws JscException {
		return false;
	}

	public void write(Writer writer, PrettyPrinterStyle style)
			throws JscException {

	}

}
