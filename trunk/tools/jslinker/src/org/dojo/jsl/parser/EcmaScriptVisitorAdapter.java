/*
 Copyright (c) 2004-2005, The Dojo Foundation
 All Rights Reserved.

 Licensed under the Academic Free License version 2.1 or above OR the
 modified BSD license. For more information on Dojo licensing, see:

 http://dojotoolkit.org/community/licensing.shtml <http://dojotoolkit.org/community/licensing.shtml>

 Code donated to the Dojo Foundation by AOL LLC under the terms of
 the Dojo CCLA (http://dojotoolkit.org/ccla.txt).

 */
package org.dojo.jsl.parser;

import java.util.*;

import org.dojo.jsl.parser.ASTAllocationExpression;
import org.dojo.jsl.parser.ASTAndExpressionSequence;
import org.dojo.jsl.parser.ASTArrayLiteral;
import org.dojo.jsl.parser.ASTAssignmentExpression;
import org.dojo.jsl.parser.ASTBinaryExpressionSequence;
import org.dojo.jsl.parser.ASTBreakStatement;
import org.dojo.jsl.parser.ASTCaseGroup;
import org.dojo.jsl.parser.ASTCaseGroups;
import org.dojo.jsl.parser.ASTCaseGuard;
import org.dojo.jsl.parser.ASTCatchClause;
import org.dojo.jsl.parser.ASTConditionalExpression;
import org.dojo.jsl.parser.ASTContinueStatement;
import org.dojo.jsl.parser.ASTDoStatement;
import org.dojo.jsl.parser.ASTEmptyExpression;
import org.dojo.jsl.parser.ASTEmptyStatement;
import org.dojo.jsl.parser.ASTExpressionList;
import org.dojo.jsl.parser.ASTExpressionStatement;
import org.dojo.jsl.parser.ASTFinallyClause;
import org.dojo.jsl.parser.ASTForInStatement;
import org.dojo.jsl.parser.ASTForStatement;
import org.dojo.jsl.parser.ASTForVarInStatement;
import org.dojo.jsl.parser.ASTForVarStatement;
import org.dojo.jsl.parser.ASTFormalParameterList;
import org.dojo.jsl.parser.ASTFunctionCallParameters;
import org.dojo.jsl.parser.ASTIfStatement;
import org.dojo.jsl.parser.ASTLiteralField;
import org.dojo.jsl.parser.ASTObjectLiteral;
import org.dojo.jsl.parser.ASTOrExpressionSequence;
import org.dojo.jsl.parser.ASTParenExpression;
import org.dojo.jsl.parser.ASTPostfixExpression;
import org.dojo.jsl.parser.ASTPropertyIdentifierReference;
import org.dojo.jsl.parser.ASTPropertyValueReference;
import org.dojo.jsl.parser.ASTReturnStatement;
import org.dojo.jsl.parser.ASTStatementList;
import org.dojo.jsl.parser.ASTSwitchStatement;
import org.dojo.jsl.parser.ASTThisReference;
import org.dojo.jsl.parser.ASTThrowStatement;
import org.dojo.jsl.parser.ASTTryStatement;
import org.dojo.jsl.parser.ASTUnaryExpression;
import org.dojo.jsl.parser.ASTVariableDeclaration;
import org.dojo.jsl.parser.ASTVariableDeclarationList;
import org.dojo.jsl.parser.ASTVariableStatement;
import org.dojo.jsl.parser.ASTWhileStatement;
import org.dojo.jsl.parser.ASTWithStatement;
import org.dojo.jsl.parser.EcmaScriptVisitor;

public class EcmaScriptVisitorAdapter extends Object implements
		EcmaScriptVisitor {

	protected LinkedList scopes;

	protected ASTFunctionDeclaration enteringFunction;

	protected EcmaScriptVisitorDelegate delegate;

	protected EcmaScriptVisitorAdapter() {
		this(null);
	}

	public EcmaScriptVisitorAdapter(EcmaScriptVisitorDelegate delegate) {
		super();
		this.delegate = delegate;
		scopes = new LinkedList();
	}

	public SimpleNode getScope() {
		return scopes.size() == 0 ? null : (SimpleNode) scopes.getLast();
	}

	protected void pre(SimpleNode node, Object data) {
		if (delegate != null) {
			delegate.willVisit(node, data);
		}
	}

	protected void post(SimpleNode node, Object data) {
		if (delegate != null) {
			delegate.didVisit(node, data);
		}
	}

	protected Object visitImpl(SimpleNode node, Object data) {
		pre(node, data);
		data = node.childrenAccept(this, data);
		post(node, data);
		return data;
	}

	public Object visit(SimpleNode node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTLiteral node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTIdentifier node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTObjectLiteral node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTLiteralField node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTArrayLiteral node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTThisReference node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTCompositeReference node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTFunctionCallParameters node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTPropertyValueReference node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTPropertyIdentifierReference node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTAllocationExpression node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTParenExpression node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTOperator node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTPostfixExpression node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTUnaryExpression node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTBinaryExpressionSequence node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTAndExpressionSequence node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTOrExpressionSequence node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTConditionalExpression node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTAssignmentExpression node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTExpressionList node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTStatementList node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTVariableDeclaration node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTExpressionStatement node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTIfStatement node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTWhileStatement node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTForStatement node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTEmptyExpression node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTForVarStatement node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTForInStatement node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTForVarInStatement node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTContinueStatement node, Object data) {
		return visitImpl(node, data);
	}

	/*
	 * public Object visit(ASTDebuggerStatement node, Object data) { return
	 * visitImpl(node, data); }
	 */

	public Object visit(ASTBreakStatement node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTReturnStatement node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTWithStatement node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTFunctionDeclaration node, Object data) {
		pre(node, data);
		enteringFunction = node;
		data = node.childrenAccept(this, data);
		post(node, data);
		return data;
	}

	public Object visit(ASTFormalParameterList node, Object data) {
		return visitImpl(node, data);
	}

	/*
	 * public Object visit(ASTActiveXReference node, Object data) { return
	 * visitImpl(node, data); }
	 */

	public Object visit(ASTBlock node, Object data) {
		boolean addedScope = false;
		if ((enteringFunction != null)
				&& (node.jjtGetParent() == enteringFunction)) {
			scopes.add(node);
			addedScope = true;
			enteringFunction = null;
		}
		pre(node, data);
		data = node.childrenAccept(this, data);
		post(node, data);
		if (addedScope) {
			scopes.removeLast();
		}
		return data;
	}

	public Object visit(ASTSwitchStatement node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTCaseGroups node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTCaseGroup node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTCaseGuard node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTTryStatement node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTCatchClause node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTFinallyClause node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTThrowStatement node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTDoStatement node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTVariableStatement node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTVariableDeclarationList node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTEmptyStatement node, Object data) {
		return visitImpl(node, data);
	}

	public Object visit(ASTProgram node, Object data) {
		scopes.add(node);
		pre(node, data);
		data = node.childrenAccept(this, data);
		post(node, data);
		scopes.removeLast();
		return data;
	}

}
