package org.dojotoolkit;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.ContextFactory;

/**
 * Sets rhino runtime features for friendlier/stricter testing environment.
 * 
 * @author jkuhnert
 */
public class DojoContextFactory extends ContextFactory {

	protected boolean hasFeature(Context cx, int featureIndex)
    {
		switch (featureIndex) {
		case Context.FEATURE_NON_ECMA_GET_YEAR:
			return true;

		case Context.FEATURE_MEMBER_EXPR_AS_FUNCTION_NAME:
			return true;

		case Context.FEATURE_RESERVED_KEYWORD_AS_IDENTIFIER:
			return true;
		
		case Context.FEATURE_STRICT_VARS:
			return true;
			
		case Context.FEATURE_E4X:
			return true;
			
		case Context.FEATURE_PARENT_PROTO_PROPRTIES:
			return false;
		}
		return super.hasFeature(cx, featureIndex);
    }
	
}
