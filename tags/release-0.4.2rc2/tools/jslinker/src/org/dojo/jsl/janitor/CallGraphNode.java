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
import java.util.regex.*;

import org.dojo.jsl.ast.*;
import org.dojo.jsl.parser.*;
import org.dojo.jsl.top.*;

import org.dojo.jsl.parser.EcmaScriptVisitor;

public class CallGraphNode extends Object {

	static private final String[] treepatterns = {

	// pattern: an assignment expression that has an anonymous function decl on
			// the
			// rhs and a composite reference on the lhs
			"({type = 'ASTExpressionStatement'}, ({type = 'ASTAssignmentExpression'},"
					+ "({type = 'ASTCompositeReference', name : 'compositeRef'}, "
					+ "{multi = *, stop, name : 'compositeList'}, ({type = 'ASTPropertyIdentifierReference'},"
					+ " {type = 'ASTIdentifier', name : 'name'})), "
					+ "{type = 'ASTOperator'}, ({type = 'ASTFunctionDeclaration', name : 'rhs'},"
					+ " {type = 'ASTFormalParameterList', stop},"
					+ " {type = 'ASTBlock', name : 'body', stop})))",

			// pattern: a simple assignment expression that has an anonymous
			// function decl on the rhs
			// and an identifier on the lhs
			"({type = 'ASTExpressionStatement'}, ({type = 'ASTAssignmentExpression'},"
					+ " {type = 'ASTIdentifier', name : 'name'}, "
					+ "{type = 'ASTOperator'}, ({type = 'ASTFunctionDeclaration', name : 'rhs'},"
					+ " {type = 'ASTFormalParameterList', stop},"
					+ " {type = 'ASTBlock', name : 'body', stop})))",

			// pattern: an assignment expression that has a literal on the
			// rhs and a composite reference on the lhs
			"({type = 'ASTExpressionStatement'}, ({type = 'ASTAssignmentExpression'},"
					+ "({type = 'ASTCompositeReference', name : 'compositeRef'}, "
					+ "{multi = *, stop, name : 'compositeList'}, ({type = 'ASTPropertyIdentifierReference'},"
					+ " {type = 'ASTIdentifier', name : 'name'})), "
					+ "{type = 'ASTOperator'}, {type = 'ASTLiteral', name : 'rhs', stop}))",

			// pattern: a simple assignment expression that has a literal on the
			// rhs
			// and an identifier on the lhs
			"({type = 'ASTExpressionStatement'}, ({type = 'ASTAssignmentExpression'},"
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

			// identifiers
			"{type = 'ASTIdentifier'}",

			// literal strings
			"{type = 'ASTLiteral'}"

	};

	private String name;

	private SimpleNode node;

	private SourceFile sourceFile;

	private boolean marked;

	private SimpleNode rhs;

	private ASTCompositeReference compositeRef;

	public CallGraphNode(String name, SimpleNode node, SourceFile sourceFile,
			SimpleNode rhs, ASTCompositeReference compositeRef) {

		super();
		this.node = node;
		this.sourceFile = sourceFile;
		this.name = name;
		marked = false;
		this.rhs = rhs;
		this.compositeRef = compositeRef;
	}

	public String getName() {
		return name;
	}

	public SimpleNode getNode() {
		return node;
	}

	public SourceFile getSourceFile() {
		return sourceFile;
	}

	public SimpleNode getRhs() {
		return rhs;
	}

	public void mark() {
		marked = true;
	}

	public void unmark() {
		marked = false;
	}

	public boolean marked() {
		return marked;
	}

	public void callVisit(LinkedList marked, Map assignmentsByName,
			Set declarations, Set allowedTargets, Set identifierStrings,
			List wildCardConstraints, Set literalStrings,
			List unparsableSourceFiles, Map loadersByName, Set loaderStrings,
			boolean deleteEventHandlers, Janitor3 janitor) throws JscException {

		// PENDING(uwe): we could be a notch more aggressive here by ignoring
		// the local identifiers
		// i.e. identifiers coming from local variables and loop variables

		HashMap newAssignmentsByName = new HashMap();
		HashMap newLoadersByName = new HashMap();
		HashSet newIdentifierStrings = new HashSet();
		HashSet newLiteralStrings = new HashSet();
		HashSet newLoaderStrings = new HashSet();

		if (compositeRef != null) {
			int n = compositeRef.jjtGetNumChildren();

			for (int i = 0; i < n - 1; i++) {
				String partName = compositeRef.getName(i);

				if (partName != null) {
					newIdentifierStrings.add(partName);
				}
			}
		}

		EcmaScriptVisitor visitor = VisitorFactory.getSharedInstance().create(
				CallGraphNode.treepatterns,
				new Object[] { janitor, janitor, janitor, janitor, janitor,
						janitor, janitor },
				new String[] { "collectAssignment", "collectAssignment",
						"collectAssignment", "collectAssignment",
						"collectLoaderCall", "collectIdentifierEntry",
						"collectLiteralEntry" },
				new int[] { VisitorFactory.DELEGATE_METHOD_TYPE,
						VisitorFactory.DELEGATE_METHOD_TYPE,
						VisitorFactory.DELEGATE_METHOD_TYPE,
						VisitorFactory.DELEGATE_METHOD_TYPE,
						VisitorFactory.DELEGATE_METHOD_TYPE,
						VisitorFactory.DELEGATE_METHOD_TYPE,
						VisitorFactory.VISIT_SUBTREE_METHOD_TYPE });

		HashMap data = new HashMap();
		data.put("assignmentsByName", newAssignmentsByName);
		data.put("loadersByName", newLoadersByName);
		data.put("identifierStrings", newIdentifierStrings);
		data.put("literalStrings", newLiteralStrings);
		data.put("loaderStrings", newLoaderStrings);
		data.put("sourceFile", sourceFile);
		data.put("visitor", visitor);

		rhs.jjtAccept(visitor, data);

		// at this point we have the new assignments, new identifier entries and
		// new literal strings entries
		// in the collections newAssignmentsByName, newIdentifierStrings and
		// newLiteralStrings

		// we now have to update the collections marked, assignmentsByName,
		// identifierStrings and literalStrings

		// first decide which assignments from newAssignmentsByName to mark

		Iterator iter = identifierStrings.iterator();

		while (iter.hasNext()) {
			String identifierString = (String) iter.next();
			List assignmentList = (List) newAssignmentsByName
					.get(identifierString);

			janitor.mark(marked, assignmentList);
		}

		iter = literalStrings.iterator();

		while (iter.hasNext()) {
			String literalString = (String) iter.next();

			janitor.markLiteral(literalString, newAssignmentsByName, marked);
		}

		iter = unparsableSourceFiles.iterator();

		while (iter.hasNext()) {
			UnparsableSourceFile upfile = (UnparsableSourceFile) iter.next();

			janitor.markUnparsable(upfile, newAssignmentsByName, marked);
			janitor.markUnparsable(upfile, newLoadersByName, marked);
		}

		iter = newIdentifierStrings.iterator();

		while (iter.hasNext()) {
			String identifierString = (String) iter.next();
			List assignmentList = (List) newAssignmentsByName
					.get(identifierString);

			janitor.mark(marked, assignmentList);
		}

		iter = newLiteralStrings.iterator();

		while (iter.hasNext()) {
			String literalString = (String) iter.next();

			janitor.markLiteral(literalString, newAssignmentsByName, marked);
		}

		iter = newAssignmentsByName.values().iterator();
		while (iter.hasNext()) {
			Iterator diter = ((List) iter.next()).iterator();

			while (diter.hasNext()) {
				CallGraphNode callGraphNode = (CallGraphNode) diter.next();

				if (!callGraphNode.marked()) {
					if (!callGraphNode.removable(declarations, allowedTargets,
							deleteEventHandlers, wildCardConstraints)) {
						callGraphNode.mark();
						marked.add(callGraphNode);
					}
				}
			}
		}

		iter = loaderStrings.iterator();

		while (iter.hasNext()) {
			String identifierString = (String) iter.next();
			List assignmentList = (List) newLoadersByName.get(identifierString);

			janitor.mark(marked, assignmentList);
		}

		iter = newLoaderStrings.iterator();

		while (iter.hasNext()) {
			String identifierString = (String) iter.next();
			List assignmentList = (List) newLoadersByName.get(identifierString);

			janitor.mark(marked, assignmentList);
		}

		// at this point all the callgraphnodes in newAssignmentsByName have
		// been checked if they need marking
		// now fresh up old callgraphnodes from assignmentsByName marking
		// against new identifiers and literals

		iter = newIdentifierStrings.iterator();

		while (iter.hasNext()) {
			String identifierString = (String) iter.next();
			List assignmentList = (List) assignmentsByName
					.get(identifierString);

			janitor.mark(marked, assignmentList);
		}

		iter = newLiteralStrings.iterator();

		while (iter.hasNext()) {
			String literalString = (String) iter.next();

			janitor.markLiteral(literalString, assignmentsByName, marked);
		}

		iter = newLoaderStrings.iterator();

		while (iter.hasNext()) {
			String identifierString = (String) iter.next();
			List assignmentList = (List) loadersByName.get(identifierString);

			janitor.mark(marked, assignmentList);
		}

		// now add the new stuff into the old collections

		identifierStrings.addAll(newIdentifierStrings);
		literalStrings.addAll(newLiteralStrings);

		iter = newAssignmentsByName.keySet().iterator();

		while (iter.hasNext()) {
			String key = (String) iter.next();

			List newList = (List) newAssignmentsByName.get(key);
			List oldList = (List) assignmentsByName.get(key);

			if (oldList == null) {
				assignmentsByName.put(key, newList);
			} else {
				oldList.addAll(newList);
			}
		}

		loaderStrings.addAll(newLoaderStrings);

		iter = newLoadersByName.keySet().iterator();

		while (iter.hasNext()) {
			String key = (String) iter.next();

			List newList = (List) newLoadersByName.get(key);
			List oldList = (List) loadersByName.get(key);

			if (oldList == null) {
				loadersByName.put(key, newList);
			} else {
				oldList.addAll(newList);
			}
		}

	}

	public boolean removable(Set declarations, Set allowedTargets,
			boolean deleteEventHandlers, List wildCardConstraints) {
		if ((!deleteEventHandlers)
				&& (name.startsWith("on") || name.startsWith("On"))) {
			return false;
		}

		if ((allowedTargets != null) && (!allowedTargets.contains(name))) {
			return false;
		}

		if (wildCardConstraints != null) {
			Iterator iter = wildCardConstraints.iterator();

			while (iter.hasNext()) {
				Pattern regex = (Pattern) iter.next();
				Matcher matcher = regex.matcher(name);

				if (matcher.matches()) {
					return false;
				}
			}
		}

		if (compositeRef != null) {
			String wholeName = compositeRef.getCompositeName();

			if (wholeName == null) {
				return false;
			}

			int n = compositeRef.jjtGetNumChildren();

			for (int i = 1; i < n; i++) {
				String partName = compositeRef.getCompositeName(i);
				if ((!declarations.contains(partName))
						&& (!Util.endsWith(partName, "prototype"))) {
					return false;
				}
			}
		}

		return true;
	}

	public void remove() {
		sourceFile.changed();
		node.removeSafely();

		// PENDING(uwe): we could be a notch more aggressive here
		// we could remove the whole if statement and
		// not consider the entry points -into the call graph used by the if
		// statement
		// conditional expression
	}

	@Override
	public String toString() {
		return "CallGraphNode[" + name + ":" + marked + "]";
	}

}
