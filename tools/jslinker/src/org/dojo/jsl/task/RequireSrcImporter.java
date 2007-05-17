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

import java.util.*;
import java.util.logging.*;
import java.io.*;

import org.dojo.jsl.ast.VisitorFactory;
import org.dojo.jsl.parser.ASTLiteral;
import org.dojo.jsl.parser.ASTProgram;
import org.dojo.jsl.parser.EcmaScriptVisitor;
import org.dojo.jsl.parser.SimpleNode;
import org.dojo.jsl.top.*;

/**
 * Implementation of the <code>Task</code> interface that imports js files
 * found in import statements in html.
 * 
 * 
 * @since JDK 1.4
 */
public class RequireSrcImporter extends Object implements Task {

	/**
	 * Task name
	 */
	static public final String TASK_NAME = "require";

	/**
	 * task factory for this class
	 */
	static private final TaskFactory factory = new TaskFactory() {
		public Task create() throws JscException {
			return new RequireSrcImporter();
		}
	};

	/**
	 * Dojo src tree traversal depth
	 */
	static private int treeDepth = 3;

	/**
	 * Registers with specified <code>Tasks</code> instance a
	 * <code>TaskFactory</code> for instances of this class.
	 * 
	 * @param tasks
	 *            Tasks instance
	 */
	static public void register(Tasks tasks) {
		tasks
				.register(RequireSrcImporter.TASK_NAME,
						RequireSrcImporter.factory);
	}

	static private final String[] requireStatementPattern = new String[] { "({type = 'ASTExpressionStatement', scope = global}, ({type = 'ASTCompositeReference'},"
			+ "({type = 'ASTCompositeReference'}, {type = 'ASTIdentifier', value = 'dojo'},({type = 'ASTPropertyIdentifierReference'},"
			+ " {type = 'ASTIdentifier', value = 'require'}) ) ,({type = 'ASTFunctionCallParameters'},"
			+ " {type = 'ASTLiteral', name: 'loadName'})  ) )" };

	/**
	 * Dojo Require statements
	 */
	private Set<Object> requireStatements;

	/**
	 * Shared instance of Top
	 */
	private Top top;

	/**
	 * List of source files
	 */
	private List<Object> sources;

	/**
	 * Web root path
	 */
	private String webrootPath;

	/**
	 * Web maps, can be null.
	 */
	private Map webmaps;

	/**
	 * dojo root property
	 */
	private String dojoRoot;

	/**
	 * Html source
	 */
	private HtmlFile currentFile;

	/**
	 * Imported Dojo require files
	 */
	private Set<String> requireFiles;

	/**
	 * Creates an instance of <code>RequireSrcImporter</code> using the
	 * specified properties
	 * 
	 */
	public RequireSrcImporter() {
		super();
		this.requireStatements = new HashSet<Object>();
		this.requireFiles = new HashSet<String>();
		this.top = Top.getSharedInstance();
		this.sources = top.getSources();
		this.webrootPath = top.getProperty(Top.WEB_ROOT_PROPERTY_KEY);
		this.dojoRoot = top.getProperty(Top.DOJO_ROOT_PROPERTY_KEY);
		this.webmaps = top.getWebMaps();

	}

	public String execute(Map context) throws JscException {

		Iterator<Object> iter = sources.iterator();
		while (iter.hasNext()) {
			Object source = iter.next();

			if (source instanceof HtmlFile) {
				Top.logger.log(Level.INFO, "collecting imports from file "
						+ ((SourceFile) source).getFilename());

				currentFile = (HtmlFile) source;
			}
		}

		// Start processing dojo require statements
		if (Top.requireProcessed) {

			// Load the dojo bootstrap files
			String[] bootstrapFiles = { "dojo_collections_import.js",
					"bootstrap1.js", "debug.js", "hostenv_browser.js",
					"lang.js", "loader.js" };
			int size = bootstrapFiles.length;

			for (int j = 0; j < size; j++) {
				String jsFile = bootstrapFiles[j];
				if (!alreadyImported(jsFile)) {
					addToSource(jsFile);
				}
			}

			collectRequireFiles(treeDepth);

			Top.logger.log(Level.INFO,
					"Finished processing the require statements");

		}

		return RequireSrcImporter.TASK_NAME + ": "
				+ Integer.toString(requireFiles.size()) + " js files imported";
	}

	public String getName() {
		return RequireSrcImporter.TASK_NAME;
	}

	/**
	 * Collects dojo require file values
	 * 
	 * @param node
	 * @param matchedNodes
	 * @param data
	 */
	public void collectRequireCall(SimpleNode node, Map matchedNodes,
			Object data) {
		Object value = ((ASTLiteral) matchedNodes.get("loadName")).getValue();
		if (value instanceof String) {
			requireStatements.add(value);
		}
	}

	/**
	 * Recursive method that traverses the dojo src tree and adds source files
	 * declared in the require statements to the list of shared source
	 * <p>
	 * TODO - Optimize this code...
	 * 
	 * @param recursionDepth
	 *            src tree traversal depth
	 * @throws JscException
	 */
	public void collectRequireFiles(int recursionDepth) throws JscException {

		Iterator<Object> iter = sources.iterator();
		EcmaScriptVisitor visitor = VisitorFactory.getSharedInstance().create(
				RequireSrcImporter.requireStatementPattern,
				new Object[] { this }, new String[] { "collectRequireCall" },
				new int[] { VisitorFactory.DELEGATE_METHOD_TYPE });

		String basePath = currentFile.getFile().getParent() + Top.DIR_SEPERATOR
				+ dojoRoot + Top.DIR_SEPERATOR;
		HashSet requireStmt = new HashSet();
		FilenameFilter filter = new JSFilter();
		HashMap<String, Object> data = new HashMap<String, Object>();
		data.put("requireStmt", requireStmt);

		iter = sources.iterator();

		while (iter.hasNext()) {
			Object source = iter.next();

			data.put("sourceFile", source);

			if (source instanceof JSFile) {
				JSFile jsFile = (JSFile) source;
				if (!jsFile.requireStmtParsed()
						&& (jsFile.getFilename().indexOf("__package__") == -1)) {
					Top.logger.log(Level.INFO,
							"collecting global identifiers and composite references from js file "
									+ ((SourceFile) source).getFilename());

					ASTProgram ast = jsFile.getAST();
					ast.jjtAccept(visitor, null);
					jsFile.setFileParsed();
				}
			}
		}

		if (!requireStatements.isEmpty()) {
			iter = requireStatements.iterator();
			while (iter.hasNext()) {
				String fileName = ((String) iter.next()).replace('.', '/');
				Boolean wildCardPresent = Util.hasWildcards(fileName);

				if (wildCardPresent) {
					String path = buildFilePath(fileName, wildCardPresent);
					String[] files = new File(basePath + path).list(filter);
					if (files.length != 0) {
						for (int n = 0; n < files.length; n++) {
							fileName = path + files[n];
							addFile(fileName);
						}
					}
				} else {
					fileName = buildFilePath(fileName, wildCardPresent);
					addFile(fileName);
				}

			}
			requireStatements.clear();
			if (recursionDepth > 0) {
				collectRequireFiles(--recursionDepth);
			}
		}

	}

	/**
	 * Add files to source if not imported
	 * 
	 * @param fileName
	 *            source file to be added
	 * @throws JscException
	 */
	private void addFile(String fileName) throws JscException {
		if (!alreadyImported(fileName)) {
			addToSource(fileName);
		}
	}

	/**
	 * Check if source file has already been imported
	 * 
	 * @param fileName
	 *            file name
	 * @return
	 */
	private Boolean alreadyImported(String fileName) {
		Boolean imported = true;
		if (!requireFiles.contains(fileName)) {
			requireFiles.add(fileName);
			imported = false;
		}
		return imported;
	}

	/**
	 * Build a file path
	 * 
	 * @param fileName
	 *            file name
	 * @param wildCardFile
	 *            boolean value indicating wild cards in file name
	 * @return complete path to the file
	 */
	private String buildFilePath(String fileName, Boolean wildCardFile) {
		StringBuffer buffer = new StringBuffer();
		buffer.append(fileName);
		buffer.delete(0, buffer.indexOf("/") + 1);
		if (wildCardFile) {
			buffer.deleteCharAt(buffer.indexOf("*"));
		} else {
			buffer.append(".js");
		}
		return buffer.toString();
	}

	/**
	 * Add require files to the list of sources
	 * 
	 * @param importPath
	 *            imported file path
	 * @throws JscException
	 */
	private void addToSource(String importPath) throws JscException {
		String basePath = currentFile.getFile().getParent() + Top.DIR_SEPERATOR
				+ dojoRoot + Top.DIR_SEPERATOR;
		if (importPath.charAt(0) == '/') {
			if (webrootPath != null) {
				File impFile = (webmaps != null) ? Util.resolveWebURL(
						importPath, webrootPath, webmaps) : (new File(
						webrootPath + dojoRoot + importPath));

				if (impFile.exists()) {
					try {
						impFile = Sources.getSharedInstance().getCanonicalFile(
								impFile);
						top.addSource(new JSFile((File) impFile));
					} catch (IOException exc) {
						Top.logger.log(Level.WARNING,
								"RequireSrcImporter task cannot resolve absolute path "
										+ importPath + " because " + exc);

					}
				}
			}
		} else {
			if (currentFile != null) {
				File impFile = new File(basePath + importPath);
				if (impFile.exists()) {
					try {
						impFile = Sources.getSharedInstance().getCanonicalFile(
								impFile);
						top.addSource(new JSFile((File) impFile));
					} catch (IOException exc) {
						Top.logger.log(Level.WARNING,
								"RequireSrcImporter task cannot resolve absolute path "
										+ importPath + " because " + exc);

					}
				}
			} else {

				Top.logger.log(Level.WARNING,
						"RequireSrcImporter task cannot resolve absolute path "
								+ importPath
								+ " because jsl.web.root property is missing");
			}
		}

	}

	class JSFilter implements FilenameFilter {
		public boolean accept(File dir, String name) {
			return (name.endsWith(".js"));
		}
	}
}
