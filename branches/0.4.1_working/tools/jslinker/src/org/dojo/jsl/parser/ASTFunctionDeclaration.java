/* Generated By:JJTree: Do not edit this line. ASTFunctionDeclaration.java */

package org.dojo.jsl.parser;

import java.util.*;

import org.dojo.jsl.parser.EcmaScript;
import org.dojo.jsl.parser.EcmaScriptVisitor;

public class ASTFunctionDeclaration extends SimpleNode {

	private Map locals;

	public ASTFunctionDeclaration(int id) {
		super(id);
	}

	public ASTFunctionDeclaration(EcmaScript p, int id) {
		super(p, id);
	}

	/** Accept the visitor. * */
	@Override
	public Object jjtAccept(EcmaScriptVisitor visitor, Object data) {
		return visitor.visit(this, data);
	}

	public void setLocals(List localsStack) {
		locals = new HashMap();

		Iterator iter = localsStack.iterator();

		while (iter.hasNext()) {
			Map stackItem = (Map) iter.next();

			locals.putAll(stackItem);
		}
	}

	public Map getLocals() {
		return locals;
	}

}
