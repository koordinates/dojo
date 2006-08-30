/*
 Copyright (c) 2004-2005, The Dojo Foundation
 All Rights Reserved.

 Licensed under the Academic Free License version 2.1 or above OR the
 modified BSD license. For more information on Dojo licensing, see:

 http://dojotoolkit.org/community/licensing.shtml <http://dojotoolkit.org/community/licensing.shtml>

 Code donated to the Dojo Foundation by AOL LLC under the terms of
 the Dojo CCLA (http://dojotoolkit.org/ccla.txt).

 */
package org.dojo.jsl.janitor;

import java.util.*;
import java.util.logging.*;
import java.util.regex.*;
import java.io.*;

import org.dojo.jsl.ast.*;
import org.dojo.jsl.parser.*;
import org.dojo.jsl.task.*;
import org.dojo.jsl.top.*;

import org.dojo.jsl.parser.EcmaScriptVisitor;

/**
 * Implementation of the <code>Task</code> interface that deletes unused code
 * from the javascript source code.
 * 
 * "janitor3" is the task name that needs to be specified in the task list
 * property to trigger this task.
 * <p>
 * 
 * 
 * @since JDK 1.4
 */
public class Janitor3 extends Object implements Task {

	/**
	 * Task name
	 */
	static public final String TASK_NAME = "janitor";

	/**
	 * Property specifies global entry points
	 */
	static public final String ENTRY_POINTS_PROPERTY = "task.janitor.entries";

	/**
	 * Property specifies declarations valid as a janitor target
	 */
	static public final String DECLARATIONS_PROPERTY = "task.janitor.declarations";

	/**
	 * Property specifies a path to a file that holds identifiers that form the
	 * set of allowable identifiers to remove
	 */
	static public final String FILTER_FILE_PROPERTY = "task.janitor.filter.file";

	/**
	 * Property specifies
	 */
	static public final String PROCESS_JS_IMPORTS_ONLY_PROPERTY = "task.janitor.process.js.imports.only";

	/**
	 * Property specifies
	 */
	static public final String DELETE_EVENT_HANDLERS = "task.janitor.delete.event.handlers";

	/**
	 * Property that controls the removal of global declarations that are not in
	 * the callgraph
	 */
	static public final String GLOBAL_DECLS_PROPERTY = "task.janitor.process.global";

	static final int flags = Pattern.DOTALL | Pattern.CASE_INSENSITIVE;

	/**
	 * task factory for this class
	 */
	static private final TaskFactory factory = new TaskFactory() {
		public Task create() throws JscException {
			return new Janitor3();
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
		tasks.register(Janitor3.TASK_NAME, Janitor3.factory);
	}

	// we only consider assignment expressions that have a rhs that is
	// side-effect free.
	// the easiest to detect side-effect-free rhs types are function
	// declarations and literals
	// for now we deal only with those and we leave room to consider others in
	// the future

	static private final String[] globals = {

	// pattern: a global variable that holds an anonymous function
			"({type = 'ASTVariableStatement', scope = global}, ({type = 'ASTVariableDeclaration'},"
					+ " {type = 'ASTIdentifier', name : 'name'}, "
					+ " ({type = 'ASTFunctionDeclaration', name : 'rhs'}, {type = 'ASTFormalParameterList', stop},"
					+ " {type = 'ASTBlock', name : 'body', stop})))",

			// pattern: an assignment expression that has an anonymous function
			// decl on the
			// rhs and a composite reference on the lhs
			"({type = 'ASTExpressionStatement', scope = global}, ({type = 'ASTAssignmentExpression'},"
					+ "({type = 'ASTCompositeReference', name : 'compositeRef'}, "
					+ "{multi = *, stop, name : 'compositeList'}, ({type = 'ASTPropertyIdentifierReference'},"
					+ " {type = 'ASTIdentifier', name : 'name'})), "
					+ "{type = 'ASTOperator'}, ({type = 'ASTFunctionDeclaration', name : 'rhs'},"
					+ " {type = 'ASTFormalParameterList', stop},"
					+ " {type = 'ASTBlock', name : 'body', stop})))",

			// pattern: a simple assignment expression that has an anonymous
			// function decl on the rhs
			// and an identifier on the lhs
			"({type = 'ASTExpressionStatement', scope = global}, ({type = 'ASTAssignmentExpression'},"
					+ " {type = 'ASTIdentifier', name : 'name'}, "
					+ "{type = 'ASTOperator'}, ({type = 'ASTFunctionDeclaration', name : 'rhs'},"
					+ " {type = 'ASTFormalParameterList', stop},"
					+ " {type = 'ASTBlock', name : 'body', stop})))",

			// pattern: normal function declaration with name
			"({type = 'ASTFunctionDeclaration', scope = global}, {type = 'ASTIdentifier', name : 'name'}, "
					+ "{type = 'ASTFormalParameterList', stop},"
					+ "{type = 'ASTBlock', name : 'rhs', stop})",

			// pattern: a global variable that holds a literal on the rhs
			"({type = 'ASTVariableStatement', scope = global}, ({type = 'ASTVariableDeclaration'},"
					+ " {type = 'ASTIdentifier', name : 'name'}, "
					+ " {type = 'ASTLiteral', name : 'rhs', stop}))",

			// pattern: an assignment expression that has a literal on the
			// rhs and a composite reference on the lhs
			"({type = 'ASTExpressionStatement', scope = global}, ({type = 'ASTAssignmentExpression'},"
					+ "({type = 'ASTCompositeReference', name : 'compositeRef'}, "
					+ "{multi = *, stop, name : 'compositeList'}, ({type = 'ASTPropertyIdentifierReference'},"
					+ " {type = 'ASTIdentifier', name : 'name'})), "
					+ "{type = 'ASTOperator'}, {type = 'ASTLiteral', name : 'rhs', stop}))",

			// pattern: a simple assignment expression that has a literal on the
			// rhs
			// and an identifier on the lhs
			"({type = 'ASTExpressionStatement', scope = global}, ({type = 'ASTAssignmentExpression'},"
					+ " {type = 'ASTIdentifier', name : 'name'}, "
					+ "{type = 'ASTOperator'}, {type = 'ASTLiteral', name : 'rhs', stop}))",

			// pattern: pattern to collect provide statement calls
			"({type = 'ASTExpressionStatement', scope = global}, ({type = 'ASTCompositeReference'},"
					+ "({type = 'ASTCompositeReference'}, {type = 'ASTIdentifier', value = 'dojo'},({type = 'ASTPropertyIdentifierReference'},"
					+ " {type = 'ASTIdentifier', value = 'provide'}) ) ,({type = 'ASTFunctionCallParameters'},"
					+ " {type = 'ASTLiteral', name: 'loadName'})  ) )",

			// the last two patterns are for the initial global entry points
			// these are all identifiers and strings that are not in the
			// subtrees matched by the patterns above

			// global identifiers
			"{type = 'ASTIdentifier', scope = global}",

			// global literal strings
			"{type = 'ASTLiteral', scope = global}"

	};

	static private final String[] identifierOrStringPatterns = new String[] {
			"{type = 'ASTIdentifier'}", "{type = 'ASTLiteral'}" };

	/**
	 * Creates an instance of <code>Janitor3</code>
	 * 
	 */
	public Janitor3() throws JscException {
		super();
	}

	public String execute(Map context) throws JscException {
		Top top = Top.getSharedInstance();
		List<Object> sources = top.getSources();
		Iterator<Object> iter;
		HashSet<String> allowedTargets = null;

		boolean deleteEventHandlers = "true".equals(top
				.getProperty(Janitor3.DELETE_EVENT_HANDLERS));

		// ---------------------------------------------------------------------------------------------------------------
		// read in the filter file if it exists
		String path = top.getProperty(Janitor3.FILTER_FILE_PROPERTY);

		if (path != null) {
			allowedTargets = new HashSet<String>();
			FileReader fr = null;
			LineNumberReader reader = null;

			try {
				fr = new FileReader(path);
				reader = new LineNumberReader(fr);

				String line = reader.readLine();

				while (line != null) {
					line = line.trim();

					if (Util.isJavaIdentifier(line)) {
						allowedTargets.add(line);
					}

					line = reader.readLine();
				}
			} catch (IOException exc) {
				allowedTargets = null;
				Top.logger.log(Level.INFO, "failed to read in the filter file "
						+ path + ". Continuing without");
			} finally {
				try {
					if (reader != null) {
						reader.close();
					} else if (fr != null) {
						fr.close();
					}
				} catch (IOException exc) {
				}
			}
		}

		// ---------------------------------------------------------------------------------------------------------------
		// collect all the imports
		HashSet imports = null;

		/*
		 * if ("true".equals(top
		 * .getProperty(Janitor3.PROCESS_JS_IMPORTS_ONLY_PROPERTY))) { imports =
		 * new HashSet(); HtmlImportSrcVisitor importVisitor = new
		 * HtmlImportSrcVisitor( imports);
		 * 
		 * iter = sources.iterator();
		 * 
		 * while (iter.hasNext()) { Object source = iter.next();
		 * 
		 * if (source instanceof HtmlFile) { Top.logger.log(Level.INFO,
		 * "collecting imports from html file " + ((SourceFile)
		 * source).getFilename());
		 * 
		 * HtmlFile htmlFile = (HtmlFile) source;
		 * importVisitor.setCurrentHtmlFile(htmlFile);
		 * 
		 * htmlFile.getAST().accept(importVisitor); } } }
		 */

		// ---------------------------------------------------------------------------------------------------------------
		// first collect all global identifiers and composite references
		HashSet<String> declarations = new HashSet<String>();

		EcmaScriptVisitor visitor = new GlobalDeclCollector(declarations);

		iter = sources.iterator();

		while (iter.hasNext()) {
			Object source = iter.next();

			if (source instanceof JSFile) {
				Top.logger.log(Level.INFO,
						"collecting global identifiers and composite references from js file "
								+ ((SourceFile) source).getFilename());

				JSFile jsFile = (JSFile) source;

				if ((imports == null)
						|| ((imports != null) && imports.contains(jsFile
								.getFile()))) {
					ASTProgram ast = jsFile.getAST();

					ast.jjtAccept(visitor, null);
				}
			}
		}
		// ---------------------------------------------------------------------------------------------------------------

		// ---------------------------------------------------------------------------------------------------------------
		// collect all janitor targets
		visitor = VisitorFactory.getSharedInstance().create(
				Janitor3.globals,
				new Object[] { this, this, this, this, this, this, this, this,
						this, this },
				new String[] { "collectAssignment", "collectAssignment",
						"collectAssignment", "collectAssignment",
						"collectAssignment", "collectAssignment",
						"collectAssignment", "collectLoaderCall",
						"collectIdentifierEntry", "collectLiteralEntry" },
				new int[] { VisitorFactory.DELEGATE_METHOD_TYPE,
						VisitorFactory.DELEGATE_METHOD_TYPE,
						VisitorFactory.DELEGATE_METHOD_TYPE,
						VisitorFactory.DELEGATE_METHOD_TYPE,
						VisitorFactory.DELEGATE_METHOD_TYPE,
						VisitorFactory.DELEGATE_METHOD_TYPE,
						VisitorFactory.DELEGATE_METHOD_TYPE,
						VisitorFactory.DELEGATE_METHOD_TYPE,
						VisitorFactory.DELEGATE_METHOD_TYPE,
						VisitorFactory.VISIT_SUBTREE_METHOD_TYPE });

		HashMap assignmentsByName = new HashMap();
		HashMap loadersByName = new HashMap();
		HashSet<Object> identifierStrings = new HashSet<Object>();
		HashSet<Object> literalStrings = new HashSet<Object>();
		HashSet<Object> loaderStrings = new HashSet<Object>();

		// also consider all the UnparsableSourceFile objects
		LinkedList<Object> unparsableSourceFiles = new LinkedList<Object>();

		HashMap<String, Object> data = new HashMap<String, Object>();
		data.put("assignmentsByName", assignmentsByName);
		data.put("identifierStrings", identifierStrings);
		data.put("literalStrings", literalStrings);
		data.put("loadersByName", loadersByName);
		data.put("loaderStrings", loaderStrings);
		data.put("visitor", visitor);

		iter = sources.iterator();

		while (iter.hasNext()) {
			Object source = iter.next();

			data.put("sourceFile", source);

			if (source instanceof JSFile) {
				Top.logger.log(Level.INFO,
						"collecting janitor targets from js file "
								+ ((SourceFile) source).getFilename());

				JSFile jsFile = (JSFile) source;

				if ((imports == null)
						|| ((imports != null) && imports.contains(jsFile
								.getFile()))) {
					ASTProgram ast = jsFile.getAST();

					ast.jjtAccept(visitor, data);
				}
			} else if (source instanceof UnparsableSourceFile) {
				unparsableSourceFiles.add(source);
			}
		}
		// ---------------------------------------------------------------------------------------------------------------

		// if we don't have any global assignments just bail out
		if (assignmentsByName.size() == 0) {
			return null;
		}

		// ---------------------------------------------------------------------------------------------------------------
		// consider the html attributes too

		visitor = VisitorFactory.getSharedInstance()
				.create(
						Janitor3.identifierOrStringPatterns,
						new Object[] { this, this },
						new String[] { "collectIdentifierEntry",
								"collectLiteralEntry" },
						new int[] { VisitorFactory.DELEGATE_METHOD_TYPE,
								VisitorFactory.VISIT_SUBTREE_METHOD_TYPE });

		// first the html tag attributes
		iter = sources.iterator();

		while (iter.hasNext()) {
			Object source = iter.next();

			if (source instanceof HtmlFile) {
				HtmlFile htmlFile = (HtmlFile) source;

				String jsCode = " ";

				Scanner reader;
				try {
					reader = new Scanner(new FileReader(htmlFile.getFile()));
					Pattern codeBlock = Pattern.compile(
							"<script.*?>(.*?)</script>", Janitor3.flags);
					while (reader.findWithinHorizon(codeBlock, 0) != null) {
						MatchResult result = reader.match();
						jsCode = result.group(1);

						if (!jsCode.equalsIgnoreCase("")) {
							InputStream is = new ByteArrayInputStream(jsCode
									.getBytes());

							try {
								EcmaScript parser = new EcmaScript(is);
								ASTProgram ast = parser.Program();
								ast.jjtAccept(visitor, data);
							} catch (org.dojo.jsl.parser.ParseException exc) {
								htmlFile.setFailedDuringRun();
								Top.logger.log(Level.SEVERE,
										"parsing script block " + jsCode
												+ " failed", exc);
							} catch (org.dojo.jsl.parser.TokenMgrError err) {
								htmlFile.setFailedDuringRun();
								Top.logger.log(Level.SEVERE,
										"parsing script block " + jsCode
												+ " failed", err);
							} finally {
								try {
									is.close();
								} catch (IOException exc) {
								}
							}
						}
					}
				} catch (FileNotFoundException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

				Top.logger.log(Level.INFO,
						"collecting global elements in html tag attributes in file "
								+ htmlFile.getFilename());

			}
		}

		List<Pattern> wildCardConstraints = new LinkedList<Pattern>();

		if (top.hasProperty(Janitor3.ENTRY_POINTS_PROPERTY)) {
			String[] entries = Util.tokenizeCommaSepString(top
					.getProperty(Janitor3.ENTRY_POINTS_PROPERTY));

			addToEntriesCollections(entries, identifierStrings,
					wildCardConstraints);
		}

		// we also add all the identifiers declared tabu in the obfuscation task
		// here

		// read in identifier defaults and declaration defaults
		String defaultsFilePath = top.getProperty(Top.HOME_DIR_PROPERTY_KEY)
				+ "/resources/janitor/defaults.properties";
		Properties defaultProps = new Properties();
		FileInputStream fis = null;
		BufferedInputStream bis = null;
		try {
			fis = new FileInputStream(defaultsFilePath);
			bis = new BufferedInputStream(fis);
			defaultProps.load(bis);
		} catch (IOException exc) {
			Top.logger
					.log(Level.INFO,
							"couldn't read in janitor default entries and declarations, continuing without");
		} finally {
			try {
				if (bis != null) {
					bis.close();
				} else if (fis != null) {
					fis.close();
				}
			} catch (IOException exc) {
			}
		}

		if (defaultProps.containsKey(Janitor3.ENTRY_POINTS_PROPERTY)) {
			String[] entries = Util.tokenizeCommaSepString(defaultProps
					.getProperty(Janitor3.ENTRY_POINTS_PROPERTY));

			addToEntriesCollections(entries, identifierStrings,
					wildCardConstraints);
		}

		if (defaultProps.containsKey(Janitor3.DECLARATIONS_PROPERTY)) {
			String[] decls = Util.tokenizeCommaSepString(defaultProps
					.getProperty(Janitor3.DECLARATIONS_PROPERTY));

			if (decls != null) {
				for (int i = 0; i < decls.length; i++) {
					declarations.add(decls[i]);
				}
			}
		}

		if (wildCardConstraints.size() == 0) {
			wildCardConstraints = null;
		}

		// ---------------------------------------------------------------------------------------------------------------
		// at this point we have collected all the global assignments (in map
		// assignmentsByName)
		// and all the identifiers and literals which didn't appear in the
		// subtree of one of those global assignments

		// we make the assumption that these identifiers and literals are our
		// entry points into the call graph
		// we work ourselves down that graph now marking all assignments we
		// touch,
		// the unmarked assignments are our unused code that we will delete

		// we also mark all assignments that are not ours according to the
		// declarations set
		// i.e. window.onload =

		LinkedList<CallGraphNode> marked = new LinkedList<CallGraphNode>();

		iter = identifierStrings.iterator();

		while (iter.hasNext()) {
			String identifierString = (String) iter.next();
			List assignmentList = (List) assignmentsByName
					.get(identifierString);

			mark(marked, assignmentList);
		}

		iter = literalStrings.iterator();

		while (iter.hasNext()) {
			String literalString = (String) iter.next();

			markLiteral(literalString, assignmentsByName, marked);
		}

		iter = unparsableSourceFiles.iterator();

		while (iter.hasNext()) {
			UnparsableSourceFile upfile = (UnparsableSourceFile) iter.next();

			markUnparsable(upfile, assignmentsByName, marked);
			markUnparsable(upfile, loadersByName, marked);
		}

		if (!"true".equals(top.getProperty(Janitor3.GLOBAL_DECLS_PROPERTY))) {
			iter = assignmentsByName.values().iterator();
			while (iter.hasNext()) {
				Iterator diter = ((List) iter.next()).iterator();

				while (diter.hasNext()) {
					CallGraphNode callGraphNode = (CallGraphNode) diter.next();

					if (!callGraphNode.marked()) {
						if (!callGraphNode.removable(declarations,
								allowedTargets, deleteEventHandlers,
								wildCardConstraints)) {
							callGraphNode.mark();
							marked.add(callGraphNode);
						}
					}
				}
			}
		}

		iter = loaderStrings.iterator();

		while (iter.hasNext()) {
			String identifierString = (String) iter.next();
			List assignmentList = (List) loadersByName.get(identifierString);

			mark(marked, assignmentList);
		}

		// spin until we traversed all call graph nodes we need to mark
		while (marked.size() > 0) {
			CallGraphNode callGraphNode = marked.removeLast();

			callGraphNode.callVisit(marked, assignmentsByName, declarations,
					allowedTargets, identifierStrings, wildCardConstraints,
					literalStrings, unparsableSourceFiles, loadersByName,
					loaderStrings, deleteEventHandlers, this);
		}

		// ---------------------------------------------------------------------------------------------------------------
		// at this point we have marked all assignments that are used
		// so just walk the assignmentsByName map and collect all unmarked
		// assignments
		// and delete them

		// this is solely for reporting
		StringBuffer unusedReport = new StringBuffer();

		RemoveLinesResult removeLinesResult = new RemoveLinesResult();

		removeImpl(assignmentsByName, unusedReport, "target", removeLinesResult);
		removeImpl(loadersByName, unusedReport, "loader", removeLinesResult);

		String unusedReportStr = unusedReport.toString();

		Top.logger.log(Level.INFO, "removed following targets:\n"
				+ unusedReportStr);

		boolean dumpToSystemOut = (!("true".equals(top
				.getProperty(Top.VERBOSE_PROPERTY_KEY)) || "true".equals(top
				.getProperty(Top.QUIET_PROPERTY_KEY))));

		if (dumpToSystemOut) {
			System.out
					.println("removed following targets:\n" + unusedReportStr);
		}

		return Janitor3.TASK_NAME + ": removed "
				+ removeLinesResult.nrDeletedAssignments
				+ " targets with a total of "
				+ removeLinesResult.nrDeletedLines + " lines of code";
	}

	static private class RemoveLinesResult {
		public int nrDeletedAssignments;

		public int nrDeletedLines;
	}

	private void removeImpl(Map targets, StringBuffer unusedReport,
			String targetName, RemoveLinesResult removeLinesResult) {
		TreeMap<String, Object> sortedReportMap = new TreeMap<String, Object>();

		Iterator<Object> iter = targets.values().iterator();
		while (iter.hasNext()) {
			Iterator diter = ((List) iter.next()).iterator();

			while (diter.hasNext()) {
				CallGraphNode callGraphNode = (CallGraphNode) diter.next();

				if (!callGraphNode.marked()) {
					// sort this on filename for reporting
					String sortKey = callGraphNode.getSourceFile()
							.getFilename();
					List<CallGraphNode> callNodes = (List<CallGraphNode>) sortedReportMap
							.get(sortKey);

					if (callNodes == null) {
						callNodes = new ArrayList<CallGraphNode>();
						sortedReportMap.put(sortKey, callNodes);
					}
					callNodes.add(callGraphNode);

					// actually do the delete
					callGraphNode.remove();
				}
			}
		}

		// compose the report
		iter = sortedReportMap.values().iterator();
		while (iter.hasNext()) {
			Iterator diter = ((List) iter.next()).iterator();

			while (diter.hasNext()) {
				CallGraphNode callGraphNode = (CallGraphNode) diter.next();

				unusedReport.append(targetName);
				unusedReport.append(" ");
				unusedReport.append(callGraphNode.getName());
				unusedReport.append(" in file ");
				unusedReport
						.append(callGraphNode.getSourceFile().getFilename());
				unusedReport.append(" at line ");
				int beginLine = callGraphNode.getNode().getBeginToken().beginLine;
				int endLine = callGraphNode.getNode().getEndToken().endLine;

				unusedReport.append(Integer.toString(beginLine));
				unusedReport.append('\n');

				removeLinesResult.nrDeletedAssignments++;
				removeLinesResult.nrDeletedLines += endLine - beginLine;
			}
		}

	}

	public void collectAssignment(SimpleNode node, Map matchedNodes, Object data) {
		SimpleNode rhs = (SimpleNode) matchedNodes.get("rhs");
		ASTIdentifier identifierNode = (ASTIdentifier) matchedNodes.get("name");
		ASTCompositeReference compositeRef = (ASTCompositeReference) matchedNodes
				.get("compositeRef");

		// before we collect the assignment it has to pass two tests

		// ---------------------------------- test one
		// -------------------------------------
		// we have to make sure that
		// the lhs name is not a formal argument name in a function declaration
		// because those are names that stand in for other entities later
		// we cannot possibly know what will come in here so we skip those

		// also local variables and loop variables are not allowed because
		// they can be assigned to a formal argument name

		// so the function declaration nodes have the local information

		String rootLhsName = identifierNode.getName();
		if (compositeRef != null) {
			rootLhsName = compositeRef.getCompositeName(0);
		}

		// find the closest enclosing function declaration node
		// if there is none we're fine, if there is one we check if rootLhsName
		// is a local variable in that function scope

		SimpleNode parentCursor = (SimpleNode) node.jjtGetParent();
		while ((parentCursor != null)
				&& (!(parentCursor instanceof ASTFunctionDeclaration))) {
			parentCursor = (SimpleNode) parentCursor.jjtGetParent();
		}

		if (parentCursor != null) {
			ASTFunctionDeclaration enclosingFunctionNode = (ASTFunctionDeclaration) parentCursor;

			if (enclosingFunctionNode.getLocals().containsKey(rootLhsName)) {
				// bail out early
				EcmaScriptVisitor visitor = (EcmaScriptVisitor) ((Map) data)
						.get("visitor");

				if (compositeRef != null) {
					compositeRef.jjtAccept(visitor, data);
				} else {
					identifierNode.jjtAccept(visitor, data);
				}

				rhs.jjtAccept(visitor, data);
				return;
			}
		}

		// ------------------------------------ end test one
		// -----------------------------------

		// ------------------------------------ test two
		// -----------------------------------
		if (rhs instanceof ASTLiteral) {
			// make sure it is not an object or array literal because those
			// can have arbitrary expressions in their declarations so could
			// have
			// side effects

			Object literalValue = ((ASTLiteral) rhs).getValue();

			boolean isOk = false;

			if (literalValue == ASTLiteral.NULL) {
				isOk = true;
			} else if (literalValue instanceof String) {
				isOk = true;
			} else if (literalValue instanceof Number) {
				isOk = true;
			} else if (literalValue == ASTLiteral.REGEX) {
				isOk = true;
			}

			if (!isOk) {
				// bail out early
				EcmaScriptVisitor visitor = (EcmaScriptVisitor) ((Map) data)
						.get("visitor");

				if (compositeRef != null) {
					compositeRef.jjtAccept(visitor, data);
				} else {
					identifierNode.jjtAccept(visitor, data);
				}

				rhs.jjtAccept(visitor, data);
				return;
			}
		}
		// ------------------------------------- end test two
		// ----------------------------------

		HashMap<String, List> assignmentsByName = (HashMap<String, List>) ((Map) data)
				.get("assignmentsByName");
		HashMap loadersByName = (HashMap) ((Map) data).get("loadersByName");
		SourceFile sourceFile = (SourceFile) ((Map) data).get("sourceFile");

		String lhsName = identifierNode.getName();
		CallGraphNode callGraphNode = new CallGraphNode(lhsName, node,
				sourceFile, rhs, compositeRef);

		// decide if it is a regular assignment
		Map<String, List> whereTo = assignmentsByName;

		List<CallGraphNode> assignmentList = whereTo.get(lhsName);

		if (assignmentList == null) {
			assignmentList = new ArrayList<CallGraphNode>();
			whereTo.put(lhsName, assignmentList);
		}
		assignmentList.add(callGraphNode);
	}

	public void collectIdentifierEntry(SimpleNode node, Map matchedNodes,
			Object data) {
		HashSet<String> identifierStrings = (HashSet<String>) ((Map) data)
				.get("identifierStrings");
		String identifierString = ((ASTIdentifier) node).getName();

		// here we could be more aggressive:
		// if the identifier is a local variable, loop variable or formal
		// argument name we could skip it
		// right now these pollute the entry points set

		identifierStrings.add(identifierString);
	}

	public void collectLiteralEntryPre(SimpleNode node, Map matchedNodes,
			Object data) {
		HashSet<String> literalStrings = (HashSet<String>) ((Map) data)
				.get("literalStrings");
		Object value = ((ASTLiteral) node).getValue();

		if (value instanceof String) {
			String literalString = (String) value;
			literalStrings.add(literalString);
		} else if (value == ASTLiteral.HTML) {
			literalStrings.add(((ASTLiteral) node).getTokenImage());
		}
	}

	public void collectLiteralEntryPost(SimpleNode node, Map matchedNodes,
			Object data) {
	}

	public void collectLoaderCall(SimpleNode node, Map matchedNodes, Object data) {
		HashSet<String> loaderStrings = (HashSet<String>) ((Map) data)
				.get("loaderStrings");
		Object value = ((ASTLiteral) matchedNodes.get("loadName")).getValue();

		if (value instanceof String) {
			String literalString = (String) value;
			loaderStrings.add(literalString);
		}
	}

	public void mark(List<CallGraphNode> marked, List assignmentList) {
		if (assignmentList != null) {
			Iterator miter = assignmentList.iterator();

			while (miter.hasNext()) {
				CallGraphNode callGraphNode = (CallGraphNode) miter.next();

				if (!callGraphNode.marked()) {
					callGraphNode.mark();
					marked.add(callGraphNode);
				}
			}
		}
	}

	public void markLiteral(String literalString, Map assignmentsByName,
			List<CallGraphNode> marked) {
		Iterator diter = assignmentsByName.keySet().iterator();

		while (diter.hasNext()) {
			String assignmentName = (String) diter.next();

			if (literalString.indexOf(assignmentName) != -1) {
				List assignmentList = (List) assignmentsByName
						.get(assignmentName);

				mark(marked, assignmentList);
			}
		}
	}

	public void markUnparsable(UnparsableSourceFile upfile,
			Map assignmentsByName, List<CallGraphNode> marked)
			throws JscException {
		Iterator diter = assignmentsByName.keySet().iterator();

		while (diter.hasNext()) {
			String assignmentName = (String) diter.next();

			if (upfile.containsIdentifier(assignmentName)) {
				List assignmentList = (List) assignmentsByName
						.get(assignmentName);

				mark(marked, assignmentList);
			}
		}
	}

	private void addToWildCardConstraints(String pattern,
			List<Pattern> wildCardConstraints) throws PatternSyntaxException {
		int n = pattern.length();
		StringBuffer regexPatternBuffer = new StringBuffer(n);

		for (int i = 0; i < n; i++) {
			char c = pattern.charAt(i);
			if (c == '*') {
				regexPatternBuffer.append(".*");
			} else if (c == '?') {
				regexPatternBuffer.append('.');
			} else if (c == '.') {
				regexPatternBuffer.append("\\.");
			} else if (c == '$') {
				regexPatternBuffer.append("\\$");
			} else {
				regexPatternBuffer.append(c);
			}
		}

		pattern = regexPatternBuffer.toString();
		wildCardConstraints.add(Pattern.compile(pattern));
	}

	private void addToEntriesCollections(String[] entries,
			Set<Object> identifierStrings, List<Pattern> wildCardConstraints) {
		if (entries != null) {
			for (int i = 0; i < entries.length; i++) {
				if ((entries[i].indexOf('*') != -1)
						|| (entries[i].indexOf('?') != -1)) {
					try {
						addToWildCardConstraints(entries[i],
								wildCardConstraints);
					} catch (PatternSyntaxException exc) {
						Top.logger.log(Level.WARNING, "wildcard entry point "
								+ entries[i] + " could not be used "
								+ " because " + exc);

					}
				} else {
					identifierStrings.add(entries[i]);
				}
			}
		}
	}

	public String getName() {
		return Janitor3.TASK_NAME;
	}

}
