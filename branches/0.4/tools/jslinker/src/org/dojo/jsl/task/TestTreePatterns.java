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

public class TestTreePatterns extends Object implements Task {

	static public final String TASK_NAME = "testtreepatterns";

	/**
	 * task factory for this class
	 */
	static private final TaskFactory factory = new TaskFactory() {
		public Task create() throws JscException {
			return new TestTreePatterns();
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
		tasks.register(TestTreePatterns.TASK_NAME, TestTreePatterns.factory);
	}

	public TestTreePatterns() {
		super();
	}

	public void mmPatternOne(SimpleNode node, Map matchedNodes, Object data) {
		Top.logger.log(Level.INFO, "saw pattern one");
	}

	public void mmPatternTwoPre(SimpleNode node, Map matchedNodes, Object data) {
		Top.logger.log(Level.INFO, "saw pattern two pre");
	}

	public void mmPatternTwoPost(SimpleNode node, Map matchedNodes, Object data) {
		Top.logger.log(Level.INFO, "saw pattern two post");
	}

	public void mmPatternThree(SimpleNode node, Map matchedNodes, Object data) {
		Top.logger.log(Level.INFO, "saw pattern three");
	}

	public void mmPatternFour(SimpleNode node, Map matchedNodes, Object data) {
		ASTIdentifier identifier = (ASTIdentifier) matchedNodes
				.get("identifier");
		Top.logger.log(Level.INFO, "saw pattern four with identifier "
				+ identifier.getName());
	}

	public void mmPatternFive(SimpleNode node, Map matchedNodes, Object data) {
		ASTLiteral literal = (ASTLiteral) matchedNodes.get("loadName");
		Top.logger.log(Level.INFO, "saw pattern five with literal "
				+ literal.getValue());
	}

	public String execute(Map context) throws JscException {
		String[] patterns = new String[] {
				"({type = 'ASTVariableDeclaration', scope = local}, "
						+ "{ type = 'ASTIdentifier', name:'identifier', stop }, {multi = *, stop})",
				"({type = 'ASTVariableDeclaration', scope = global}, "
						+ "{ type = 'ASTIdentifier', name:'identifier', stop }, {multi = *, stop})",
				"({type = 'ASTFunctionDeclaration', scope = global}, "
						+ "{ type = 'ASTIdentifier', name:'identifier', stop }, {multi = *, stop})",
				"({type = 'ASTCompositeReference'}, {multi = *, stop }, ({type = 'ASTPropertyIdentifierReference'},"
						+ " {type = 'ASTIdentifier', name: 'identifier'}))",
				"({type = 'ASTExpressionStatement'}, ({type = 'ASTCompositeReference'},"
						+ "{type = 'ASTIdentifier', value = 'DIGLoad'}, ({type = 'ASTFunctionCallParameters'}, {type = 'ASTLiteral', name: 'loadName'})))", };

		Object[] targets = new Object[] { this, this, this, this, this };
		String[] methodNames = new String[] { "mmPatternOne", "mmPatternTwo",
				"mmPatternThree", "mmPatternFour", "mmPatternFive" };
		int[] methodTypes = new int[] { VisitorFactory.DELEGATE_METHOD_TYPE,
				VisitorFactory.VISIT_SUBTREE_METHOD_TYPE,
				VisitorFactory.DELEGATE_METHOD_TYPE,
				VisitorFactory.DELEGATE_METHOD_TYPE,
				VisitorFactory.DELEGATE_METHOD_TYPE };

		EcmaScriptVisitor visitor = VisitorFactory.getSharedInstance().create(
				patterns, targets, methodNames, methodTypes);

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
			}
		}

		return TestTreePatterns.TASK_NAME + ": completed succesfully";
	}

	public String getName() {
		return TestTreePatterns.TASK_NAME;
	}

}
