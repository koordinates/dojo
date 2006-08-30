/*
 Copyright (c) 2004-2005, The Dojo Foundation
 All Rights Reserved.

 Licensed under the Academic Free License version 2.1 or above OR the
 modified BSD license. For more information on Dojo licensing, see:

 http://dojotoolkit.org/community/licensing.shtml <http://dojotoolkit.org/community/licensing.shtml>

 Code donated to the Dojo Foundation by AOL LLC under the terms of
 the Dojo CCLA (http://dojotoolkit.org/ccla.txt).

 */
package org.dojo.jsl.task;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.StringWriter;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Scanner;
import java.util.Set;
import java.util.logging.Level;
import java.util.regex.MatchResult;
import java.util.regex.Pattern;

import org.dojo.jsl.top.HtmlFile;
import org.dojo.jsl.top.JSFile;
import org.dojo.jsl.top.JscException;
import org.dojo.jsl.top.SourceFile;
import org.dojo.jsl.top.Sources;
import org.dojo.jsl.top.Top;
import org.dojo.jsl.top.Util;
import org.dojo.jsl.util.TokenComposer;
import org.dojo.jsl.util.TokenComposerException;

/**
 * Implementation of the <code>Task</code> interface that imports js files
 * found in import statements in html.
 * 
 * 
 * @since JDK 1.4
 */
public class Importer extends Object implements Task, TokenComposer.Delegate {

	/**
	 * Task name
	 */
	static public final String TASK_NAME = "import";

	final int flags = Pattern.DOTALL | Pattern.CASE_INSENSITIVE;

	private String webrootPath;

	private Map webmaps;

	/**
	 * task factory for this class
	 */
	static private final TaskFactory factory = new TaskFactory() {
		public Task create() throws JscException {
			return new Importer();
		}
	};

	/**
	 * Registers with specified <code>Tasks</code> instance a
	 * <code>TaskFactory</code> for instances of this class.
	 * 
	 * @param tasks
	 *            Tasks instance
	 */
	static public void register(Tasks tasks) {
		tasks.register(Importer.TASK_NAME, Importer.factory);
	}

	/**
	 * Creates an instance of <code>Importer</code> using the specified
	 * properties
	 * 
	 */
	public Importer() {
		super();
		webrootPath = Top.getSharedInstance().getProperty(
				Top.WEB_ROOT_PROPERTY_KEY);
		webmaps = Top.getSharedInstance().getWebMaps();
	}

	public String execute(Map context) throws JscException {
		Top top = Top.getSharedInstance();
		List<File> sources = top.getSources();
		Iterator<File> iter = sources.iterator();
		HashSet<File> imports = new HashSet<File>();
		HtmlFile htmlFile = null;
		;

		while (iter.hasNext()) {
			Object source = iter.next();

			if (source instanceof HtmlFile) {
				Top.logger.log(Level.INFO, "collecting imports from file "
						+ ((SourceFile) source).getFilename());

				htmlFile = (HtmlFile) source;

				Scanner reader;
				try {
					reader = new Scanner(new FileReader(htmlFile.getFile()));

					Pattern scriptSrc = Pattern.compile(
							"src=\\s*\"(.+?)\"\\s*>\\s*</script>", flags);
					while (reader.findWithinHorizon(scriptSrc, 0) != null) {
						MatchResult result = reader.match();
						String srcFile = result.group(1);
						addToSource(srcFile, imports, htmlFile);
					}

					Pattern requireSyntax = Pattern
							.compile("dojo.require\\(\"dojo.(.+?)\"\\);");

					while (reader.findWithinHorizon(requireSyntax, 0) != null) {
						MatchResult result = reader.match();
						String reqFile = result.group(1);
						String fileName = reqFile.replace('.', '/');
						String dojoRoot = top
								.getProperty(Top.DOJO_ROOT_PROPERTY_KEY);
						fileName = dojoRoot + Top.DIR_SEPERATOR
								+ fileName.concat(".js");
						if (!Util.hasWildcards(fileName)) {
							addToSource(fileName, imports, htmlFile);
							Top.requireProcessed = true;
						}
					}
					reader.close();
				} catch (FileNotFoundException e) {
					e.printStackTrace();
				}
			}
		}

		iter = sources.iterator();

		while (iter.hasNext()) {
			Object source = iter.next();

			if (source instanceof JSFile) {
				JSFile jsFile = (JSFile) source;

				if (imports.contains(jsFile.getFile())) {
					imports.remove(jsFile.getFile());
				}
			}
		}

		// the remaining imports haven't been declared upfront as input source
		// files
		// for these we create JSFile instances that won't appear in the output
		// directory
		iter = imports.iterator();

		while (iter.hasNext()) {
			top.addSource(new JSFile(iter.next()));
		}

		return "Html " + Importer.TASK_NAME + ": "
				+ Integer.toString(imports.size()) + " js files imported";
	}

	public String getName() {
		return Importer.TASK_NAME;
	}

	// token composer delegate methods
	public void processToken(TokenComposer composer, String tokenName)
			throws TokenComposerException {
		String tokenValue = Top.getSharedInstance().getProperty(
				Top.WEB_TOKENS_PREFIX + tokenName);
		if (tokenValue == null) {
			throw new TokenComposerException("token value not found for token "
					+ tokenName);
		}

		composer.write(tokenValue);
	}

	public void processTokenBlock(TokenComposer composer, TokenComposer minime)
			throws TokenComposerException {
		throw new TokenComposerException(
				"token blocks not supported in src attributes");
	}

	public void addToSource(String importPath, Set<File> scriptImports,
			HtmlFile currentFile) {

		// if it's a local filesystem path we want to turn it into a canonical
		// path
		// if it has a :// we're gonna ignore it

		if (importPath.indexOf("://") == -1) {
			// if path has dig tokens in them replace them now
			// take token values from project file

			if (importPath.indexOf('@') != -1) {
				try {
					TokenComposer composer = new TokenComposer(importPath);
					StringWriter stringWriter = new StringWriter();
					composer.compose(stringWriter, this);
					stringWriter.flush();
					importPath = stringWriter.toString();
				} catch (TokenComposerException exc) {
					Top.logger.log(Level.WARNING,
							"Importer cannot resolve path " + importPath
									+ " because " + exc);
				}
			}

			if (importPath.charAt(0) == '/') {
				if (webrootPath != null) {
					File impFile = (webmaps != null) ? Util.resolveWebURL(
							importPath, webrootPath, webmaps) : (new File(
							webrootPath + importPath));

					if (impFile.exists()) {
						try {
							impFile = Sources.getSharedInstance()
									.getCanonicalFile(impFile);
							scriptImports.add(impFile);
						} catch (IOException exc) {
							Top.logger.log(Level.WARNING,
									"Importer cannot resolve absolute path "
											+ importPath + " because " + exc);

						}
					}
				} else {
					Top.logger
							.log(
									Level.WARNING,
									"Importer cannot resolve absolute path "
											+ importPath
											+ " because jsl.web.root property is missing");
				}
			} else {
				if (currentFile != null) {
					File impFile = new File(currentFile.getFile().getParent(),
							importPath);

					if (impFile.exists()) {
						try {
							impFile = Sources.getSharedInstance()
									.getCanonicalFile(impFile);
							scriptImports.add(impFile);
						} catch (IOException exc) {
							Top.logger.log(Level.WARNING,
									"Importer cannot resolve absolute path "
											+ importPath + " because " + exc);

						}
					}
				} else {
					Top.logger.log(Level.WARNING,
							"Importer cannot resolve relative path "
									+ importPath
									+ " because reference path is missing");

				}
			}
		}
	}

}