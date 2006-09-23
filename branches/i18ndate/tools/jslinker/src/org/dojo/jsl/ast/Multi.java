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

/**
 * This class represents all the state of the <i>multi</i> qunatifier as
 * described <a href="doc-files/Tree_Patterns.html">here</a>. The two methods
 * <code>min()</code> and <code>max()</code> return the minimum and maximum
 * number of children allowed by the quantifier represented y an object of this
 * class.
 * 
 * 
 * @since JDK 1.4
 */
public class Multi extends Object {

	static private final int STAR_OPERATOR = 1;

	static private final int PLUS_OPERATOR = 2;

	static private final int RANGE_OPERATOR = 3;

	static private final int EQUALS_OPERATOR = 4;

	static private final int GREATER_OPERATOR = 5;

	static private final int LESS_OPERATOR = 6;

	static private final int GREATEREQUAL_OPERATOR = 7;

	static private final int LESSEQUAL_OPERATOR = 8;

	private int operator;

	private int rangeMin;

	private int rangeMax;

	private int treshold;

	public Multi() {
		super();
		operator = EQUALS_OPERATOR;
		rangeMin = rangeMax = 1;
		treshold = 1;
	}

	/**
	 * Returns the minimum number of children allowed by the receiver.
	 * 
	 * @return min number of children
	 */
	public int min() {
		switch (operator) {
		case STAR_OPERATOR:
			return 0;
		case PLUS_OPERATOR:
			return 1;
		case RANGE_OPERATOR:
			return rangeMin;
		case EQUALS_OPERATOR:
			return treshold;
		case GREATER_OPERATOR:
			return treshold + 1;
		case LESS_OPERATOR:
			return 0;
		case GREATEREQUAL_OPERATOR:
			return treshold;
		case LESSEQUAL_OPERATOR:
			return 0;
		default:
			return 0;
		}
	}

	/**
	 * Returns the maximum number of children allowed by the receiver.
	 * 
	 * @return max number of children
	 */
	public int max() {
		switch (operator) {
		case STAR_OPERATOR:
			return Integer.MAX_VALUE - 1;
		case PLUS_OPERATOR:
			return Integer.MAX_VALUE - 1;
		case RANGE_OPERATOR:
			return rangeMax;
		case EQUALS_OPERATOR:
			return treshold;
		case GREATER_OPERATOR:
			return Integer.MAX_VALUE - 1;
		case LESS_OPERATOR:
			return treshold - 1;
		case GREATEREQUAL_OPERATOR:
			return Integer.MAX_VALUE - 1;
		case LESSEQUAL_OPERATOR:
			return treshold;
		default:
			return 0;
		}
	}

	public void setEqual() {
		operator = EQUALS_OPERATOR;
	}

	public void setGreater() {
		operator = GREATER_OPERATOR;
	}

	public void setLess() {
		operator = LESS_OPERATOR;
	}

	public void setGreaterOrEqual() {
		operator = GREATEREQUAL_OPERATOR;
	}

	public void setLessOrEqual() {
		operator = LESSEQUAL_OPERATOR;
	}

	public void setDecimal(String decimalStr) {
		treshold = Integer.parseInt(decimalStr);
	}

	public void setLeftDecimal(String decimalStr) {
		operator = RANGE_OPERATOR;
		rangeMin = Integer.parseInt(decimalStr);
	}

	public void setRightDecimal(String decimalStr) {
		operator = RANGE_OPERATOR;
		rangeMax = Integer.parseInt(decimalStr);
	}

	public void setPlus() {
		operator = PLUS_OPERATOR;
	}

	public void setStar() {
		operator = STAR_OPERATOR;
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
			Multi other = (Multi) obj;

			return (operator == other.operator) && (rangeMin == other.rangeMin)
					&& (rangeMax == other.rangeMax)
					&& (treshold == other.treshold);
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

		result = 37 * result + operator;
		result = 37 * result + rangeMin;
		result = 37 * result + rangeMax;
		result = 37 * result + treshold;

		return result;
	}

	/**
	 * Return a string representation
	 */
	@Override
	public String toString() {
		return "Multi[" + min() + ", " + max() + "]";
	}

}
