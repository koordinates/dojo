/*
 Copyright (c) 2004-2005, The Dojo Foundation
 All Rights Reserved.

 Licensed under the Academic Free License version 2.1 or above OR the
 modified BSD license. For more information on Dojo licensing, see:

 http://dojotoolkit.org/community/licensing.shtml <http://dojotoolkit.org/community/licensing.shtml>

 Code donated to the Dojo Foundation by AOL LLC under the terms of
 the Dojo CCLA (http://dojotoolkit.org/ccla.txt).

 */
package org.dojo.jsl.muffler;

import java.util.*;

import org.dojo.jsl.ast.*;
import org.dojo.jsl.parser.*;
import org.dojo.jsl.task.*;
import org.dojo.jsl.top.*;

import org.dojo.jsl.parser.ASTIfStatement;
import org.dojo.jsl.parser.EcmaScriptVisitor;

/**
 * Implementation of the <code>Task</code> interface that deletes code noise,
 * ie code that developers use to develop the app like asserts, alerts etc
 * source code.
 * 
 * "muffler" is the task name that needs to be specified in the task list
 * property to trigger this task.
 * <p>
 * 
 * 
 * @since JDK 1.4
 */
public class Muffler extends Object implements Task {

	/**
	 * Task name
	 */
	static public final String TASK_NAME = "muffler";

	/**
	 * Property name of property that specifies which functions to delete Value
	 * should be a comma-separated list of function names of functions that are
	 * global.
	 */
	static public final String NOISE_PROPERTY_KEY = "task.muffler.noise";

	static public final String BRANCH_PROPERTY_KEY = "task.muffler.branch";

	/**
	 * task factory for this class
	 */
	static private final TaskFactory factory = new TaskFactory() {
		public Task create() throws JscException {
			return new Muffler();
		}
	};

	/**
	 * Pattern for if statement
	 */
	static private final String[] ifStatement = { "{type = 'ASTIfStatement', stop}" };

	/**
	 * Registers with specified <code>Tasks</code> instance a
	 * <code>TaskFactory</code> for instances of this class.
	 * 
	 * @param tasks
	 *            Tasks instance
	 */
	static public void register(Tasks tasks) {
		tasks.register(Muffler.TASK_NAME, Muffler.factory);
	}

	/**
	 * Creates an instance of <code>Muffler</code>
	 * 
	 */
	public Muffler() throws JscException {
		super();
	}

	public String execute(Map context) throws JscException {
		Top top = Top.getSharedInstance();
		String[] noiseFunctionNames = Util.tokenizeCommaSepString(top
				.getProperty(Muffler.NOISE_PROPERTY_KEY));

		List branchIds = top.getPropertyKeys(Muffler.BRANCH_PROPERTY_KEY);

		if (((noiseFunctionNames == null) || (noiseFunctionNames.length == 0))
				&& (branchIds.size() == 0)) {
			return Muffler.TASK_NAME + ": had no noise to eliminate";
		}

		List sources = Top.getSharedInstance().getSources();

		if (noiseFunctionNames != null) {
			for (int i = 0; i < noiseFunctionNames.length; i++) {
				deleteNoise(noiseFunctionNames[i], sources);
			}
		}

		if (branchIds.size() > 0) {
			HashMap id2val = new HashMap();
			Iterator iter = branchIds.iterator();

			while (iter.hasNext()) {
				String branchprop = (String) iter.next();

				int dotIndex = branchprop.indexOf("task.muffler.branch.");

				if (dotIndex != -1) {
					id2val.put(branchprop.substring("task.muffler.branch."
							.length()),
							new Boolean(top.getProperty(branchprop)));
				}
			}

			if (id2val.size() > 0) {
				BooleanEval boolEval = new BooleanEval(id2val);

				EcmaScriptVisitor visitor = VisitorFactory
						.getSharedInstance()
						.create(
								Muffler.ifStatement,
								new Object[] { this },
								new String[] { "branchNode" },
								new int[] { VisitorFactory.DELEGATE_METHOD_TYPE });

				iter = sources.iterator();
				HashMap<String, Object> data = new HashMap<String, Object>();
				data.put("boolEval", boolEval);
				LinkedList ifNodes = new LinkedList();
				data.put("ifNodes", ifNodes);
				LinkedList elseNodes = new LinkedList();
				data.put("elseNodes", elseNodes);

				data.put("visitor", visitor);

				while (iter.hasNext()) {
					Object source = iter.next();

					data.put("sourceFile", source);

					if (source instanceof JSFile) {
						JSFile jsFile = (JSFile) source;
						ASTProgram ast = jsFile.getAST();

						ast.jjtAccept(visitor, data);
					}
				}

				iter = ifNodes.iterator();

				while (iter.hasNext()) {
					ASTIfStatement ifStmtNode = (ASTIfStatement) iter.next();
					SimpleNode parent = (SimpleNode) ifStmtNode.jjtGetParent();

					if (parent != null) {
						int n = ifStmtNode.jjtGetNumChildren();

						int ifIndex = parent.getChildIndex(ifStmtNode);
						org.dojo.jsl.parser.Token specialTransfer = ifStmtNode
								.getBeginToken().specialToken;

						ifStmtNode.removeSafely(n == 3);
						if (n == 3) {
							SimpleNode codeNode = (SimpleNode) ifStmtNode
									.jjtGetChild(2);

							hookBranch(parent, codeNode, specialTransfer,
									ifIndex);
						}
					}
				}

				iter = elseNodes.iterator();

				while (iter.hasNext()) {
					ASTIfStatement ifStmtNode = (ASTIfStatement) iter.next();
					SimpleNode parent = (SimpleNode) ifStmtNode.jjtGetParent();

					if (parent != null) {
						int ifIndex = parent.getChildIndex(ifStmtNode);
						org.dojo.jsl.parser.Token specialTransfer = ifStmtNode
								.getBeginToken().specialToken;

						ifStmtNode.removeSafely(true);
						SimpleNode codeNode = (SimpleNode) ifStmtNode
								.jjtGetChild(1);

						hookBranch(parent, codeNode, specialTransfer, ifIndex);
					}
				}

			}
		}

		return Muffler.TASK_NAME + ": succesfully eliminated developer noise";
	}

	private void deleteNoise(String functionName, List sources)
			throws JscException {
		String[] patterns = new String[1];

		if (functionName.indexOf('.') != -1) {
			StringBuffer patternBuffer = new StringBuffer();
			boolean added = false;
			StringTokenizer st = new StringTokenizer(functionName, ".");

			patternBuffer
					.append("({type = 'ASTExpressionStatement'}, ({type = 'ASTCompositeReference'}");

			while (st.hasMoreTokens()) {
				String part = st.nextToken();
				if (added) {
					if (part.equals("this")) {
						patternBuffer.append(", {type = 'ASTThisReference'}");
					} else if (part.equals("**")) {
						patternBuffer.append(", {multi = *, stop }");
					} else if (Util.hasWildcards(part)) {
						patternBuffer
								.append(", ({type = 'ASTPropertyIdentifierReference'},"
										+ " {type = 'ASTIdentifier', value /= '"
										+ Util.wildCard2Pattern(part) + "'})");
					} else {
						patternBuffer
								.append(", ({type = 'ASTPropertyIdentifierReference'},"
										+ " {type = 'ASTIdentifier', value = '"
										+ part + "'})");
					}
				} else {
					if (part.equals("this")) {
						patternBuffer.append(", {type = 'ASTThisReference'}");
					} else if (part.equals("**")) {
						patternBuffer.append(", {multi = *, stop }");
					} else if (Util.hasWildcards(part)) {
						patternBuffer
								.append(", {type = 'ASTIdentifier', value /= '"
										+ Util.wildCard2Pattern(part) + "'}");
					} else {
						patternBuffer
								.append(", {type = 'ASTIdentifier', value = '"
										+ part + "'}");
					}
					added = true;
				}
			}

			patternBuffer
					.append(", {type = 'ASTFunctionCallParameters', stop}))");
			patterns[0] = patternBuffer.toString();
		} else {
			if (Util.hasWildcards(functionName)) {
				patterns[0] = "({type = 'ASTExpressionStatement'}, ({type = 'ASTCompositeReference'},"
						+ " {type = 'ASTIdentifier', value /= '"
						+ Util.wildCard2Pattern(functionName)
						+ "'}, "
						+ "{type = 'ASTFunctionCallParameters', stop}))";
			} else {
				patterns[0] = "({type = 'ASTExpressionStatement'}, ({type = 'ASTCompositeReference'},"
						+ " {type = 'ASTIdentifier', value = '"
						+ functionName
						+ "'}, "
						+ "{type = 'ASTFunctionCallParameters', stop}))";
			}
		}

		EcmaScriptVisitor visitor = VisitorFactory.getSharedInstance().create(
				patterns, new Object[] { this },
				new String[] { "collectNode" },
				new int[] { VisitorFactory.DELEGATE_METHOD_TYPE });

		Iterator iter = sources.iterator();
		HashMap data = new HashMap();
		LinkedList deadNodes = new LinkedList();
		data.put("deadNodes", deadNodes);

		while (iter.hasNext()) {
			Object source = iter.next();

			data.put("sourceFile", source);

			if (source instanceof JSFile) {
				JSFile jsFile = (JSFile) source;
				ASTProgram ast = jsFile.getAST();

				ast.jjtAccept(visitor, data);
			} else if (source instanceof HtmlFile) {
				HtmlFile htmlFile = (HtmlFile) source;

			}
		}

		// the nodes cannot be deleted while visiting (you might miss a few)
		iter = deadNodes.iterator();

		while (iter.hasNext()) {
			((SimpleNode) iter.next()).removeSafely();
		}

	}

	private void hookBranch(SimpleNode parent, SimpleNode codeNode,
			org.dojo.jsl.parser.Token specialTransfer, int ifIndex) {
		org.dojo.jsl.parser.Token nextBeginToken = null;

		if (codeNode instanceof ASTBlock) {
			int m = codeNode.jjtGetNumChildren();

			nextBeginToken = ((SimpleNode) codeNode.jjtGetChild(0))
					.getBeginToken();

			for (int k = 0; k < m; k++) {
				parent.insertChild(codeNode.jjtGetChild(k), ifIndex + k);
			}
		} else {
			nextBeginToken = codeNode.getBeginToken();
			parent.insertChild(codeNode, ifIndex);
		}

		if (specialTransfer != null) {
			if (nextBeginToken != null) {
				SimpleNode.transferSpecial(specialTransfer, nextBeginToken);
			}
		}
	}

	public void collectNode(SimpleNode node, Map matchedNodes, Object data) {
		SourceFile sourceFile = (SourceFile) ((Map) data).get("sourceFile");
		LinkedList deadNodes = (LinkedList) ((Map) data).get("deadNodes");

		sourceFile.changed();
		deadNodes.add(node);
	}

	public void branchNode(SimpleNode node, Map matchedNodes, Object data) {
		SourceFile sourceFile = (SourceFile) ((Map) data).get("sourceFile");
		BooleanEval boolEval = (BooleanEval) ((Map) data).get("boolEval");
		LinkedList ifNodes = (LinkedList) ((Map) data).get("ifNodes");
		LinkedList elseNodes = (LinkedList) ((Map) data).get("elseNodes");

		SimpleNode condExprNode = (SimpleNode) node.jjtGetChild(0);

		Object condValue = condExprNode.jjtAccept(boolEval, null);

		if (condValue != null) {
			boolean cv = ((Boolean) condValue).booleanValue();
			int n = node.jjtGetNumChildren();

			if (cv) {
				if (n == 3) {
					elseNodes.add(node);
					sourceFile.changed();
				}
			} else {
				ifNodes.add(node);
				sourceFile.changed();
			}
		} else {
			// visit the stmts of that if stmt
			int n = node.jjtGetNumChildren();
			EcmaScriptVisitor visitor = (EcmaScriptVisitor) ((Map) data)
					.get("visitor");

			SimpleNode ifBlock = (SimpleNode) node.jjtGetChild(1);

			ifBlock.jjtAccept(visitor, data);

			if (n == 3) {
				SimpleNode elseBlock = (SimpleNode) node.jjtGetChild(2);

				elseBlock.jjtAccept(visitor, data);
			}
		}
	}

	public String getName() {
		return Muffler.TASK_NAME;
	}

}
