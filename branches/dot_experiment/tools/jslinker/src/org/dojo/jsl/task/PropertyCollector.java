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
import java.util.regex.*;

import org.dojo.jsl.parser.*;
import org.dojo.jsl.top.*;

import org.dojo.jsl.parser.EcmaScriptConstants;
import org.dojo.jsl.parser.EcmaScriptVisitor;
import org.dojo.jsl.parser.Token;

/**
 * Implementation of the <code>Task</code> interface that jsl properties
 * declared in code as comments. The syntax for declaring a property in js code
 * is a one line comment looking like this: //
 * jsl(jsl.sources.unparsable=blabla,foo).
 * 
 * Only properties that are lists can have properties declared in code. The
 * properties in code are added to the list (it's additive and not destructive).
 * 
 * 
 * @since JDK 1.4
 */
public class PropertyCollector extends Object implements Task {

	/**
	 * Task name
	 */
	static public final String TASK_NAME = "props";

	/**
	 * task factory for this class
	 */
	static private final TaskFactory factory = new TaskFactory() {
		public Task create() throws JscException {
			return new PropertyCollector();
		}
	};

	static private class PropertyCommentsCollector extends Object implements
			EcmaScriptVisitorDelegate {
		private Map properties;

		private Pattern jslPropertyPattern;

		public PropertyCommentsCollector(Map properties) {
			super();
			this.properties = properties;
			jslPropertyPattern = Pattern.compile("jsl\\(([^)]*)\\)");
		}

		private List findComments(SimpleNode node) {
			LinkedList result = new LinkedList();

			Token token = node.getBeginToken();

			if (token != null) {
				Token specialToken = token.specialToken;

				while (specialToken != null) {

					if (specialToken.kind == EcmaScriptConstants.SINGLE_LINE_COMMENT) {
						String commentLine = specialToken.image;
						commentLine = commentLine.substring(2);
						commentLine = commentLine.trim();
						result.add(commentLine);
					}

					specialToken = specialToken.specialToken;
				}
			}

			return result;
		}

		public void willVisit(SimpleNode node, Object data) {
			List comments = findComments(node);
			Iterator iter = comments.iterator();

			while (iter.hasNext()) {
				String commentBody = (String) iter.next();
				Matcher matcher = jslPropertyPattern.matcher(commentBody);

				if (matcher.matches()) {
					String propValString = matcher.group(1);

					if (propValString != null) {
						int eqIndex = propValString.indexOf('=');

						if ((eqIndex != -1)
								&& (eqIndex < propValString.length() - 1)) {
							String key = propValString.substring(0, eqIndex)
									.trim();
							String val = propValString.substring(eqIndex + 1)
									.trim();

							Set props = (Set) properties.get(key);

							if (props == null) {
								props = new HashSet();

								properties.put(key, props);
							}

							props.add(val);
						}
					}
				}
			}
		}

		public void didVisit(SimpleNode node, Object data) {
		}
	}

	/**
	 * Registers with specified <code>Tasks</code> instance a
	 * <code>TaskFactory</code> for instances of this class.
	 * 
	 * @param tasks
	 *            Tasks instance
	 */
	static public void register(Tasks tasks) {
		tasks.register(PropertyCollector.TASK_NAME, PropertyCollector.factory);
	}

	/**
	 * Creates an instance of <code>PropertyCollector</code> using the
	 * specified properties
	 * 
	 */
	public PropertyCollector() {
		super();
	}

	public String execute(Map context) throws JscException {
		Top top = Top.getSharedInstance();
		List sources = top.getSources();
		Iterator iter = sources.iterator();

		Map properties = new HashMap();

		EcmaScriptVisitor visitor = new EcmaScriptVisitorAdapter(
				new PropertyCommentsCollector(properties));

		while (iter.hasNext()) {
			Object source = iter.next();

			if (source instanceof JSFile) {
				Top.logger.log(Level.INFO,
						"collecting global ogredoc nodes from js file "
								+ ((SourceFile) source).getFilename());

				JSFile jsFile = (JSFile) source;

				ASTProgram ast = jsFile.getAST();

				ast.jjtAccept(visitor, null);
			} else if (source instanceof HtmlFile) {
				Top.logger.log(Level.INFO,
						"collecting global ogredoc nodes from html file "
								+ ((SourceFile) source).getFilename());

				HtmlFile htmlFile = (HtmlFile) source;

			}
		}

		iter = properties.entrySet().iterator();
		Properties jslProps = top.getProperties();

		while (iter.hasNext()) {
			Map.Entry entry = (Map.Entry) iter.next();

			String key = (String) entry.getKey();
			Set valSet = (Set) entry.getValue();

			if (valSet.size() > 0) {
				StringBuffer valBuffer = new StringBuffer();
				String jslVal = jslProps.getProperty(key);
				boolean comma = false;

				if (jslVal != null) {
					valBuffer.append(jslVal);
					comma = true;
				}

				Iterator miter = valSet.iterator();

				while (miter.hasNext()) {
					String addVal = (String) miter.next();

					if (comma) {
						valBuffer.append(',');
						valBuffer.append(addVal);
					} else {
						valBuffer.append(addVal);
						comma = true;
					}
				}
				jslProps.setProperty(key, valBuffer.toString());
			}
		}

		return PropertyCollector.TASK_NAME
				+ " : this jsl run has the following properties now "
				+ jslProps;
	}

	public String getName() {
		return PropertyCollector.TASK_NAME;
	}

}
