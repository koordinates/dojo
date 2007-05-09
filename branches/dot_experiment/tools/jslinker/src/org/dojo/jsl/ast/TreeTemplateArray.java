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
 * This wraps a template array so it can be used as a key in hashtable. By
 * definition this class is well-behaved in regards to <code>equals</code> and
 * <code>hashCode</code> so objects of this class can be dropped in
 * collections and used as keys in maps.
 * 
 * 
 * @since JDK 1.4
 */
public final class TreeTemplateArray extends Object {

	/**
	 * The tree template array
	 */
	public final TreeTemplate[] array;

	/**
	 * Create a new TreeTemplate
	 * 
	 * @param array
	 *            the array it wraps
	 */
	public TreeTemplateArray(TreeTemplate[] array) {
		this.array = array;
	}

	/**
	 * Return a string representation listing of the array
	 */
	@Override
	public String toString() {
		StringBuffer buf = new StringBuffer();

		buf.append("{");

		for (int i = 0; i < array.length; i++) {
			if (i != 0) {
				buf.append(", ");
			}
			buf.append(array[i].toString());
		}
		buf.append("}");

		return buf.toString();
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
			TreeTemplateArray other = (TreeTemplateArray) obj;

			if (array.length != other.array.length) {
				return false;
			}

			for (int i = 0; i < array.length; i++) {
				if (!array[i].equals(other.array[i])) {
					return false;
				}
			}

			return true;
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

		for (int i = 0; i < array.length; i++) {
			result = 37 * result + array[i].hashCode();
		}

		return result;
	}

}
