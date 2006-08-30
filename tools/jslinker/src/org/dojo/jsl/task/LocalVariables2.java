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

import org.dojo.jsl.ast.*;
import org.dojo.jsl.parser.*;
import org.dojo.jsl.top.*;

import org.dojo.jsl.parser.EcmaScriptVisitor;

public class LocalVariables2 extends Object implements Task {

	static public final String TASK_NAME = "localvars2";

	/**
	 * task factory for this class
	 */
	static private final TaskFactory factory = new TaskFactory() {
		public Task create() throws JscException {
			return new LocalVariables2();
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
		tasks.register(LocalVariables2.TASK_NAME, LocalVariables2.factory);
	}

	public LocalVariables2() {
		super();
	}

	public void processLocalVariableNode(SimpleNode node, Map matchedNodes,
			Object data) {
		ASTIdentifier identifier = (ASTIdentifier) matchedNodes
				.get("identifier");

		Top.logger.log(Level.INFO, identifier.toString());
	}

	public String execute(Map context) throws JscException {
		EcmaScriptVisitor visitor = VisitorFactory
				.getSharedInstance()
				.create(
						"({type = 'ASTVariableDeclaration', scope = local},"
								+ " { type = 'ASTIdentifier', name:'identifier', stop }, {multi = *, stop})",
						this, "processLocalVariableNode",
						VisitorFactory.DELEGATE_METHOD_TYPE);

		List sources = Top.getSharedInstance().getSources();

		Iterator iter = sources.iterator();

		while (iter.hasNext()) {
			Object source = iter.next();

			if (source instanceof JSFile) {
				JSFile jsFile = (JSFile) source;
				ASTProgram ast = jsFile.getAST();

				Top.logger.log(Level.INFO, "processing file "
						+ jsFile.getFilename());

				ast.jjtAccept(visitor, null);
			} else if (source instanceof HtmlFile) {
				HtmlFile htmlFile = (HtmlFile) source;

				Top.logger.log(Level.INFO, "processing file "
						+ htmlFile.getFilename());

			}
		}

		return LocalVariables2.TASK_NAME + ": completed succesfully";
	}

	public String getName() {
		return LocalVariables2.TASK_NAME;
	}

}
