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

import org.dojo.jsl.parser.*;

/**
 * Encapsulates the style information for both the html and the js pretty
 * printers. The style flags can be retrieved with the methods
 * <code>getHtmlFlags()</code> and <code>getJSFlags()</code>. The objects
 * are immutable.
 * 
 * 
 * @since JDK 1.4
 */
public class PrettyPrinterStyle extends Object {

	private int jsFlags;

	private int htmlFlags;

	/**
	 * Creates an instance of <code>PrettyPrinterStyle</code>. Calculates the
	 * flags from the <code>Top</code> properties.
	 */
	public PrettyPrinterStyle() {
		super();
		Top top = Top.getSharedInstance();

		if ("true".equals(top
				.getProperty(HtmlFile.PRETTY_PRINT_STRIP_COMMENTS_PROPERTY))) {
		}

		jsFlags = PrettyPrinter.PRESERVE_FORMATTING;

		if ("true".equals(top
				.getProperty(JSFile.PRETTY_PRINT_STRIP_ALL_PROPERTY))) {
			jsFlags = PrettyPrinter.STRIP_ALL;
		} else if ("true".equals(top
				.getProperty(JSFile.PRETTY_PRINT_INDENT_PROPERTY))) {
			jsFlags = PrettyPrinter.PRETTY_PRINT;
		} else {
			if ("true".equals(top
					.getProperty(JSFile.PRETTY_PRINT_STRIP_COMMENTS_PROPERTY))) {
				jsFlags |= PrettyPrinter.STRIP_COMMENTS;
			}

			if ("true".equals(top
					.getProperty(JSFile.PRETTY_PRINT_STRIP_WS_PROPERTY))) {
				jsFlags |= PrettyPrinter.STRIP_WHITESPACE;
			}

			if ("true".equals(top
					.getProperty(JSFile.PRETTY_PRINT_STRIP_NEWLINES_PROPERTY))) {
				jsFlags |= PrettyPrinter.STRIP_NEWLINES;
			}
		}
	}

	/**
	 * Creates an instance of <code>PrettyPrinterStyle</code> with the
	 * specified flags.
	 */
	public PrettyPrinterStyle(int jsFlags, int htmlFlags) {
		super();
		this.jsFlags = jsFlags;
		this.htmlFlags = htmlFlags;
	}

	/**
	 * Returns the style flags for the javascript pretty-printer.
	 * 
	 * @return js style flags
	 * @see PrettyPrinter
	 */
	public int getJSFlags() {
		return jsFlags;
	}

	/**
	 * Returns the style flags for the html pretty-printer.
	 * 
	 * @return html style flags
	 * @see HtmlPrettyPrinter
	 */
	public int getHtmlFlags() {
		return htmlFlags;
	}
}
