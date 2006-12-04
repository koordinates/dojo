// example java class of how the generated visitors look like

package org.dojo.jsl.ast;

import org.dojo.jsl.parser.*;

public class GeneratedVisitorExample extends GeneratedVisitorSuper {

	public GeneratedVisitorExample() {
	}

	@Override
	public Object visit(ASTFunctionDeclaration node, Object data) {
		if (propagateToSuper) {
			propagateToSuper = false;
			return super.visit(node, data);
		} else {
			// 23 is the index of the templates to match
			return execute(node, 23, data);
		}
	}

}
