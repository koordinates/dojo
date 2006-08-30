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

import org.dojo.jsl.parser.*;

import org.dojo.jsl.parser.ASTAndExpressionSequence;
import org.dojo.jsl.parser.ASTOrExpressionSequence;
import org.dojo.jsl.parser.ASTParenExpression;
import org.dojo.jsl.parser.ASTUnaryExpression;
import org.dojo.jsl.parser.EcmaScriptConstants;

/**
 * 
 * 
 * @since JDK 1.4
 */
public class BooleanEval extends EcmaScriptVisitorAdapter {

	private Map id2vals;

	public BooleanEval(Map id2vals) {
		super();
		this.id2vals = id2vals;
	}

	@Override
	protected Object visitImpl(SimpleNode node, Object data) {
		return null;
	}

	@Override
	public Object visit(ASTAndExpressionSequence node, Object data) {
		Object val = ((SimpleNode) node.jjtGetChild(0)).jjtAccept(this, data);

		if (val != null) {
			if (!((Boolean) val).booleanValue()) {
				return Boolean.FALSE;
			}
			val = Boolean.TRUE;

			int n = node.jjtGetNumChildren();

			for (int i = 2; i < n; i += 2) {
				Object aval = ((SimpleNode) node.jjtGetChild(i)).jjtAccept(
						this, data);

				if (aval == null) {
					val = null;
					break;
				} else {
					if (!((Boolean) aval).booleanValue()) {
						val = Boolean.FALSE;
						break;
					}
				}
			}
		}

		return val;
	}

	@Override
	public Object visit(ASTOrExpressionSequence node, Object data) {
		Object val = ((SimpleNode) node.jjtGetChild(0)).jjtAccept(this, data);

		if (val != null) {
			if (((Boolean) val).booleanValue()) {
				return Boolean.TRUE;
			}
			val = Boolean.FALSE;

			int n = node.jjtGetNumChildren();

			for (int i = 2; i < n; i += 2) {
				Object aval = ((SimpleNode) node.jjtGetChild(i)).jjtAccept(
						this, data);

				if (aval == null) {
					val = null;
					break;
				} else {
					if (((Boolean) aval).booleanValue()) {
						val = Boolean.TRUE;
						break;
					}
				}
			}
		}

		return val;
	}

	@Override
	public Object visit(ASTParenExpression node, Object data) {
		return ((SimpleNode) node.jjtGetChild(0)).jjtAccept(this, data);
	}

	@Override
	public Object visit(ASTUnaryExpression node, Object data) {
		ASTOperator op = (ASTOperator) node.jjtGetChild(0);

		if (op.getOperator() != EcmaScriptConstants.BANG) {
			return null;
		}

		Object val = ((SimpleNode) node.jjtGetChild(1)).jjtAccept(this, data);

		return (val == null) ? null : Boolean.valueOf(!((Boolean) val)
				.booleanValue());
	}

	@Override
	public Object visit(ASTIdentifier node, Object data) {
		return id2vals.get(node.getName());
	}

	@Override
	public Object visit(ASTCompositeReference node, Object data) {
		String compositeName = node.getCompositeName();

		return (compositeName != null) ? id2vals.get(compositeName) : null;
	}

}
