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

import java.util.logging.*;
import java.io.*;

import org.dojo.jsl.parser.*;

import org.dojo.jsl.parser.EcmaScript;
import org.dojo.jsl.parser.ParseException;

/**
 * Implementation of the <code>SourceFile</code> interface taking care of
 * javascript source input. The source file suffix corresponding to this file is
 * "js".
 * 
 * 
 * @since JDK 1.4
 */
public class JSFile extends AbstractSourceFile implements SourceFile {

	static public final String PRETTY_PRINT_STRIP_ALL_PROPERTY = "source.js.prettyprinter.strip.all";

	static public final String PRETTY_PRINT_STRIP_COMMENTS_PROPERTY = "source.js.prettyprinter.strip.comments";

	static public final String PRETTY_PRINT_STRIP_WS_PROPERTY = "source.js.prettyprinter.strip.whitespace";

	static public final String PRETTY_PRINT_STRIP_NEWLINES_PROPERTY = "source.js.prettyprinter.strip.newlines";

	static public final String PRETTY_PRINT_PRESERVE_FORMATTING_PROPERTY = "source.js.prettyprinter.preserve";

	static public final String PRETTY_PRINT_INDENT_PROPERTY = "source.js.prettyprinter.indent";

	/**
	 * factory for this class
	 */
	static private final SourceFileFactory factory = new SourceFileFactory() {
		public SourceFile create(String filename) throws JscException {
			return new JSFile(filename);
		}

		public SourceFile create(File file) throws JscException {
			return new JSFile(file);
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
				.getProperty(Top.SOURCES_JS_SUFFIX_LIST_PROPERTY_KEY));

		if (customSuffixes != null) {
			for (int i = 0; i < customSuffixes.length; i++) {
				sources.register(customSuffixes[i], JSFile.factory);
			}
		}
		sources.register("js", JSFile.factory);
		sources.register("as", JSFile.factory);
	}

	/**
	 * Abstract syntax tree
	 */
	private ASTProgram ast;

	/**
	 * Flag controls whether the instance wants to participate in output
	 */
	private boolean shouldOutput;

	/**
	 * Flag tells if this is Macromedia Flash MX actionscript The rules for
	 * actionscript in the individual tasks are slightly different.
	 */
	private boolean isActionScript;

	/**
	 * Creates an instance of <code>JSFile</code> for specified filename.
	 * 
	 * @param filename
	 *            file name
	 * @param shouldOutput
	 *            flag for output control
	 * @exception JscException
	 *                if instance cannot be created
	 */
	public JSFile(String filename, boolean shouldOutput) throws JscException {
		super(filename);
		this.shouldOutput = shouldOutput;

		if (filename.endsWith(".as")) {
			isActionScript = true;
		}
	}

	/**
	 * Creates an instance of <code>JSFile</code> for specified filename.
	 * 
	 * @param filename
	 *            file name
	 * @exception JscException
	 *                if instance cannot be created
	 */
	public JSFile(String filename) throws JscException {
		this(filename, true);
	}

	/**
	 * Creates an instance of <code>JSFile</code> for specified file.
	 * 
	 * @param file
	 *            file
	 * @param shouldOutput
	 *            flag for output control
	 * @exception JscException
	 *                if instance cannot be created
	 */
	public JSFile(File file, boolean shouldOutput) throws JscException {
		super(file);
		this.shouldOutput = shouldOutput;

		if (file.getName().endsWith(".as")) {
			isActionScript = true;
		}
	}

	/**
	 * Creates an instance of <code>JSFile</code> for specified file.
	 * 
	 * @param file
	 *            file
	 * @exception JscException
	 *                if instance cannot be created
	 */
	public JSFile(File file) throws JscException {
		this(file, true);
	}

	protected void createAST() throws JscException {
		FileInputStream fis = null;
		BufferedInputStream bis = null;
		Reader reader = null;

		Top.logger.log(Level.INFO, "parsing file " + filename);

		try {
			EcmaScript parser;

			fis = new FileInputStream(filename);
			bis = new BufferedInputStream(fis);
			reader = new InputStreamReader(bis, charsetName);

			parser = new EcmaScript(reader);

			// parser.setExpectActionScript(isActionScript);
			parser.token_source.expectActionScript = isActionScript;

			ast = parser.Program();

			ast.setSourceFile(this);

		} catch (ParseException exc) {
			setFailedDuringRun();
			throw new JscException(exc, filename);
		} catch (IOException exc) {
			setFailedDuringRun();
			throw new JscException(exc, filename);
		} finally {
			try {
				if (reader != null) {
					reader.close();
				} else if (bis != null) {
					bis.close();
				} else {
					if (fis != null) {
						fis.close();
					}
				}
			} catch (IOException exc) {
			}
		}
	}

	/**
	 * Returns the AST of this receiver. If the ast hasn't been created yet a
	 * parse is fired up with the source file as input.
	 * 
	 * @return abstract syntax tree of javascript file represented by receiver
	 * @exception JscException
	 *                if a parsing error occurred
	 */
	public ASTProgram getAST() throws JscException {
		if (ast == null) {
			createAST();
		}

		return ast;
	}

	@Override
	protected boolean willModifyOnOutput() throws JscException {
		Top top = Top.getSharedInstance();

		boolean result = "true".equals(top
				.getProperty(JSFile.PRETTY_PRINT_STRIP_ALL_PROPERTY))
				|| "true".equals(top
						.getProperty(JSFile.PRETTY_PRINT_INDENT_PROPERTY))
				|| "true"
						.equals(top
								.getProperty(JSFile.PRETTY_PRINT_STRIP_COMMENTS_PROPERTY))
				|| "true".equals(top
						.getProperty(JSFile.PRETTY_PRINT_STRIP_WS_PROPERTY))
				|| "true"
						.equals(top
								.getProperty(JSFile.PRETTY_PRINT_STRIP_NEWLINES_PROPERTY));

		if (result) {
			// force a parse before the input file disappears
			// in case it's in place
			getAST();
		}

		return result;
	}

	public void write(java.io.Writer writer, PrettyPrinterStyle style)
			throws JscException {
		PrettyPrinter prettyPrinter = new PrettyPrinter(writer, style
				.getJSFlags());

		getAST().jjtAccept(prettyPrinter, null);
	}

	@Override
	public boolean shouldOutput() {
		return shouldOutput;
	}

	public boolean isActionScript() {
		return isActionScript;
	}

}
