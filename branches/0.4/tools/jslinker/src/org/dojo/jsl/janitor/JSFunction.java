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

import org.dojo.jsl.parser.*;
import org.dojo.jsl.top.*;

public class JSFunction extends Object {

	private String name;

	private SimpleNode node;

	private SourceFile sourceFile;

	private int called;

	private ASTIdentifier identifierNode;

	private ASTBlock blockNode;

	public JSFunction(String name, SimpleNode node, SourceFile sourceFile,
			ASTIdentifier identifierNode, ASTBlock blockNode) {
		super();
		this.node = node;
		this.sourceFile = sourceFile;
		this.name = name;
		called = 0;
		this.identifierNode = identifierNode;
		this.blockNode = blockNode;
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

	public ASTIdentifier getIdentifier() {
		return identifierNode;
	}

	public ASTBlock getBody() {
		return blockNode;
	}

	public void markCalled() {
		called++;
	}

	public void unmarkCalled() {
		called--;
	}

	public boolean isCalled() {
		return called > 0;
	}

	@Override
	public String toString() {
		return "JSFunction[" + name + "]";
	}

}
