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

import org.dojo.jsl.ast.*;
import org.dojo.jsl.parser.*;
import org.dojo.jsl.top.*;

import org.dojo.jsl.parser.EcmaScriptVisitor;
import org.dojo.jsl.ast.TreePattern;

public class TestTreeMatcher extends Object implements Task {

	static public final String TASK_NAME = "testtreematcher";

	/**
	 * task factory for this class
	 */
	static private final TaskFactory factory = new TaskFactory() {
		public Task create() throws JscException {
			return new TestTreeMatcher();
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
		tasks.register(TestTreeMatcher.TASK_NAME, TestTreeMatcher.factory);
	}

	static public class Visitor extends EcmaScriptVisitorAdapter {
		TreeTemplate template;

		TreeMatcher matcher;

		public Visitor(TreeTemplate template) {
			super();
			this.template = template;
			matcher = new TreeMatcher();
		}

		@Override
		protected void pre(SimpleNode node, Object data) {
			HashMap matchedNodes = new HashMap();
			SimpleNode scope = getScope();

			if (matcher.match(node, scope, template, matchedNodes)) {
				Top.logger.log(Level.INFO, "node matched " + node);
			}
		}
	}

	private String pattern;

	public TestTreeMatcher() throws JscException {
		super();
		pattern = Top.getSharedInstance().getProperty(
				"task.testtreematcher.pattern");

		if (pattern == null) {
			throw new JscException("no tree pattern");
		}
	}

	public String execute(Map context) throws JscException {
		InputStream is = new ByteArrayInputStream(pattern.getBytes());
		TreePattern parser = new TreePattern(is);
		TreeTemplate template = null;

		try {
			template = parser.Pattern();
		} catch (org.dojo.jsl.ast.ParseException e) {
			throw new JscException(e);
		}

		Top.logger.log(Level.INFO, template.toString());

		EcmaScriptVisitor visitor = new TestTreeMatcher.Visitor(template);

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

		return TestTreeMatcher.TASK_NAME + ": completed succesfully";
	}

	public String getName() {
		return TestTreeMatcher.TASK_NAME;
	}

}
