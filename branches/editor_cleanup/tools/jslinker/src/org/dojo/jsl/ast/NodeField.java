/*
 Copyright (c) 2004-2005, The Dojo Foundation
 All Rights Reserved.

 Licensed under the Academic Free License version 2.1 or above OR the
 modified BSD license. For more information on Dojo licensing, see:

 http://dojotoolkit.org/community/licensing.shtml <http://dojotoolkit.org/community/licensing.shtml>

 Code donated to the Dojo Foundation by AOL LLC under the terms of
 the Dojo CCLA (http://dojotoolkit.org/ccla.txt).

 */
package org.dojo.jsl.ast;

import java.util.regex.*;
import java.util.logging.*;

import org.dojo.jsl.parser.*;
import org.dojo.jsl.top.*;

/**
 * At template node field used to match up one particular property of a node.
 * Class is well-behaved in regards to <code>equals</code> and
 * <code>hashCode</code> so objects of this class can be dropped in
 * collections and used as keys in maps.
 * 
 * 
 * @since JDK 1.4
 */
public class NodeField extends Object {

	/**
	 * Holds the value to be matched
	 */
	public ASTLiteral literal;

	/**
	 * Comparison method Valid strings are "<", "<=", "=", "!=", ">=", ">"
	 */
	public String comp;

	/**
	 * Creates an instance of <code>NodeField</code>
	 * 
	 * @param literal
	 *            value to match
	 * @param comparisonOperator
	 *            string specifying how to compare
	 */
	public NodeField(ASTLiteral literal, String comparisonOperator) {
		super();
		this.literal = literal;
		comp = comparisonOperator;
	}

	/**
	 * Returns <code>true</code> if the object matches the value represented
	 * by receiver according to comparison method defined in receiver.
	 * <p>
	 * 
	 * How the comparison actually happens depends on the passed-in object. The
	 * object can be anything, even <code>null</code>. No assumption are
	 * made.
	 * <p>
	 * 
	 * The "<", "<=", ">=", ">" comparisons are used only if receiver and
	 * passed in object represent numbers.
	 * 
	 * @param object
	 *            object to compare with receiver
	 * @return <code>true</code> if comparison is true
	 */
	public boolean matches(Object object) {
		if (literal == null) {
			if (comp.equals("=")) {
				return object == null;
			} else {
				return object != null;
			}
		}

		if (object instanceof ASTLiteral) {
			if (comp.equals("=")) {
				return literal.equals(object);
			} else if (comp.equals("!=")) {
				return (!literal.equals(object));
			} else if (comp.equals("/=")) {
				Object litObj = literal.getValue();
				Object valObj = ((ASTLiteral) object).getValue();

				if (!(litObj instanceof String)) {
					return false;
				}

				if (!(valObj instanceof String)) {
					return false;
				}

				String regexStr = (String) litObj;
				String valueStr = (String) valObj;

				try {
					return Pattern.matches(regexStr, valueStr);
				} catch (PatternSyntaxException exc) {
					Top.logger.log(Level.SEVERE, "the regex [" + regexStr
							+ "] in the tree pattern is invalid", exc);
				}
				return false;
			} else {
				Object v1 = literal.getValue();
				Object v2 = ((ASTLiteral) object).getValue();

				if ((v1 instanceof Number) && (v2 instanceof Number)) {
					double n1 = ((Number) v1).doubleValue();
					double n2 = ((Number) v2).doubleValue();

					if (comp.equals(">")) {
						return n2 > n1;
					} else if (comp.equals("<")) {
						return n2 < n1;
					} else if (comp.equals(">=")) {
						return n2 >= n1;
					} else if (comp.equals("<=")) {
						return n2 <= n1;
					} else {
						return false;
					}
				} else {
					return false;
				}
			}
		}

		Object v2 = null;
		Object v1 = literal.getValue();

		if (object instanceof ASTIdentifier) {
			v2 = ((ASTIdentifier) object).getName();
		} else {
			v2 = object;
		}

		if (comp.equals("=")) {
			if (v1 == ASTLiteral.NULL) {
				return v2 == null;
			} else {
				return v1.equals(v2);
			}
		} else if (comp.equals("!=")) {
			if (v1 == ASTLiteral.NULL) {
				return v2 != null;
			} else {
				return (!v1.equals(v2));
			}
		} else if (comp.equals("/=") && (v1 instanceof String)
				&& (v2 instanceof String)) {
			try {
				return Pattern.matches((String) v1, (String) v2);
			} catch (PatternSyntaxException exc) {
				Top.logger.log(Level.SEVERE, "the regex [" + v1
						+ "] in the tree pattern is invalid", exc);
			}
		}

		return false;
	}

	/**
	 * Overwrites <code>equals</code> from <code>Object</code>.
	 * 
	 * @param obj
	 *            a object
	 * @return true if specified object equal to receiver
	 * @see java.lang.Object#equals(Object)
	 */
	@Override
	public boolean equals(Object obj) {
		if ((obj != null) && (obj.getClass().equals(this.getClass()))) {
			NodeField other = (NodeField) obj;

			return (literal != null ? literal.equals(other.literal)
					: other.literal == null)
					&& (comp != null ? comp.equals(other.comp)
							: other.comp == null);

		}

		return false;
	}

	/**
	 * Overwrites <code>hashCode</code> from <code>Object</code>.
	 * 
	 * @return hash code of receiver
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		int result = 17;

		if (literal != null) {
			result = 37 * result + literal.hashCode();
		} else {
			result = 37 * result;
		}

		if (comp != null) {
			result = 37 * result + comp.hashCode();
		} else {
			result = 37 * result;
		}

		return result;
	}

	/**
	 * Return a string representation
	 */
	@Override
	public String toString() {
		return "NodeField[" + comp + " " + literal + "]";
	}

}
