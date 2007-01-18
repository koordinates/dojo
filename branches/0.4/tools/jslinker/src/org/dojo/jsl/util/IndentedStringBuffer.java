/*
 Copyright (c) 2004-2005, The Dojo Foundation
 All Rights Reserved.

 Licensed under the Academic Free License version 2.1 or above OR the
 modified BSD license. For more information on Dojo licensing, see:

 http://dojotoolkit.org/community/licensing.shtml <http://dojotoolkit.org/community/licensing.shtml>

 Code donated to the Dojo Foundation by AOL LLC under the terms of
 the Dojo CCLA (http://dojotoolkit.org/ccla.txt).

 */
package org.dojo.jsl.util;

import java.util.*;

/**
 * <p>
 * This class facilitates creation of indented strings. Note that the name of
 * the class may be somewhat misleading - this class does not present an
 * interface in any way related to the JDK's StringBuffer class.
 * </p>
 * <p>
 * This class works by building two adjacent arrays. For a given index, the
 * first array stores indentation string of a particular line and the second
 * array stores the content for that line
 * </p>
 * <p>
 * Some notes on the optimizations in this class:
 * <ul>
 * <li>The indentation level is recycled for adjacent lines with the same
 * indentation, reducing the amount of memory required.</li>
 * <li>Strings passed to the print and println methods are not immediately
 * appended to anything and, thus, do not result in the creation of more String
 * objects.</li>
 * <li>The toString() method uses a string buffer, again reducing the number of
 * String objects that get allocated.
 * </ul>
 * </p>
 */
public class IndentedStringBuffer {
	/** Number of spaces per indentation level */
	int levelSpaces;

	/** Number of spaces per tab */
	int tabSpaces;

	/** The current number of spaces we're indenting */
	int indentSpaces;

	/** Cache the string we're prepending to each string */
	String indentString;

	/** The array of indentations to write out */
	ArrayList indents;

	/** The array of strings to write out */
	ArrayList strings;

	/** A flag indicating that a new line should be created */
	boolean createNewline;

	//
	// Constants
	//

	/** The initial size of the ArrayLists we allocate */
	static final int DEFAULT_SIZE = 128;

	/** Our defacto empty string */
	static final String EMPTY = "";

	/** The length of the TABS and SPACES strings */
	static final int MAX_CHARS = 30;

	// PENDING(kieffer) - This will break with more than 30 tabs
	/** String used to get a substring with a specified number of tabs */
	static final String TABS = "\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t";

	// PENDING(kieffer) - This will break if spaces/tab > 30
	/** String used to get a substring with a specified number of spaces */
	static final String SPACES = "                              ";

	//
	// STATIC VARIABLES
	//

	static int spacesPerLevelOverride = -1; // Unset

	//
	// STATIC METHODS
	//

	/**
	 * Calling this method overrides any value(s) set either via constructors or
	 * via the "setSpacesPerLevel()" method.
	 * 
	 * Passing in a value of "-1" removes the override.
	 * 
	 * The typical use of this method is to simply turn off indentation
	 * altogether, normally to reduce file size in the production environment,
	 * but left on in the development environment (e.g. via a Java cmdline
	 * argument, etc.)
	 */
	static public void setSpacesPerLevelOverride(int numberOfSpaces) {
		spacesPerLevelOverride = numberOfSpaces;
	}

	//
	// Constructors
	//

	/**
	 * Create a new buffer with 4 spaces per level, 8 spaces per tab
	 */
	public IndentedStringBuffer() {
		this(4, 8);
	}

	// NOTE: This is the designated initializer, and must therefore be called
	// by all constructors (mainly because of the "new ArrayList" calls)
	/**
	 * Create a new buffer with the specified number of spaces per level and
	 * spaces per tab
	 */
	public IndentedStringBuffer(int spacesPerLevel, int spacesPerTab) {
		levelSpaces = spacesPerLevel;
		tabSpaces = spacesPerTab;
		indents = new ArrayList(DEFAULT_SIZE);
		strings = new ArrayList(DEFAULT_SIZE);
		createNewline = true;

		// Init the caches
		setIndentSpaces(0);
	}

	/**
	 * Creates a new IndentedStringBuffer which starts off with its indentation
	 * level set to the same number of spaces as "otherBuffer". It will also
	 * have its "spacesPerLevel" and "spacesPerTab" mimic the settings in
	 * "otherBuffer".
	 */
	public IndentedStringBuffer(IndentedStringBuffer otherBuffer) {
		this(otherBuffer.getSpacesPerLevel(), otherBuffer.getSpacesPerTab());
		setIndentSpaces(otherBuffer.getIndentSpaces());
	}

	//
	// Getter/Setters
	//

	/**
	 * Explicitly set the indentation level
	 */
	public void setIndent(int aLevel) {
		setIndentSpaces(aLevel * getSpacesPerLevel());
	}

	/**
	 * Explicitly set the number of spacesPerLevel
	 */
	public void setSpacesPerLevel(int spacesPerLevel) {
		levelSpaces = spacesPerLevel;
		updateCache();
	}

	/**
	 * Get the number of spacesPerLevel
	 */
	public int getSpacesPerLevel() {
		if (spacesPerLevelOverride == -1) {
			return levelSpaces;
		} else {
			return spacesPerLevelOverride;
		}
	}

	/**
	 * Explicitly set the number of spacesPerTab
	 */
	public void setSpacesPerTab(int spacesPerTab) {
		tabSpaces = spacesPerTab;
		updateCache();
	}

	/**
	 * Get the number of spacesPerTab
	 */
	public int getSpacesPerTab() {
		return tabSpaces;
	}

	/**
	 * The one true place to set the number of spaces we indent
	 */
	public void setIndentSpaces(int aSpaces) {
		indentSpaces = aSpaces;
		if (indentSpaces < 0) {
			indentSpaces = 0;
		}
		updateCache();
	}

	/**
	 * Returns the absolute number of spaces the indent of this buffer is
	 * currently set to. One common use of this is to create a new
	 * IndentedStringBuffer which starts off with the exact same indentation as
	 * some existing one.
	 */
	public int getIndentSpaces() {
		return indentSpaces;
	}

	//
	// Operations
	//

	/**
	 * Indent by one level
	 */
	public IndentedStringBuffer indent() {
		setIndentSpaces(indentSpaces + getSpacesPerLevel());
		return this;
	}

	/**
	 * Indent by N levels
	 */
	public IndentedStringBuffer indent(int aLevels) {
		setIndentSpaces(indentSpaces + aLevels * getSpacesPerLevel());
		return this;
	}

	/**
	 * Outdent by one level
	 */
	public IndentedStringBuffer outdent() {
		setIndentSpaces(indentSpaces - getSpacesPerLevel());
		return this;
	}

	/**
	 * Outdent by N levels
	 */
	public IndentedStringBuffer outdent(int aLevels) {
		setIndentSpaces(indentSpaces - aLevels * getSpacesPerLevel());
		return this;
	}

	/**
	 * This is the "funnel-point" method for printing, called by all others.
	 * 
	 * If "addNewLine" is "true", a carriage-return ("\n") will be printed to
	 * the buffer following "aString".
	 * 
	 * If "indentNewLines" is "true", each line of "aString" will be indented
	 * the appropriate indent amount, allowing the caller to effectively indent
	 * blocks of text.
	 */
	public void print(String aString, boolean addNewLine, boolean indentNewLines) {
		if (indentNewLines) {
			aString = aString.replace("\n", "\n" + indentString);
			// We don't need to worry about the first line, which likely
			// didn't start with a "\n", because it will get indented when
			// the final string is output, just like all our output
		}
		if (createNewline) {
			indents.add(indentString);
			strings.add(aString);
			createNewline = false;
		} else {
			// Append the string to the existing string
			int myIndex = strings.size() - 1;
			String myString = (String) strings.get(myIndex);
			strings.set(myIndex, myString + aString);
		}
		if (addNewLine) {
			createNewline = true;
		}
	}

	/**
	 * Append a string and force a newline (This may or may not result in a
	 * newline w/ indentation being created, depending on the setting of the
	 * newlineType)
	 */
	public void println(String aString) {
		this.print(aString, true, false);
	}

	/**
	 * Append a string to the existing line
	 */
	public void print(String aString) {
		this.print(aString, false, false);
	}

	//
	// Overrides
	//

	/**
	 * Return the contents as a string
	 */
	@Override
	public String toString() {
		StringBuffer b = new StringBuffer();
		int mySize = strings.size();
		int lastIndex = mySize - 1;

		for (int i = 0; i < mySize; i++) {
			b.append((String) indents.get(i));
			b.append((String) strings.get(i));
			if ((i < lastIndex) || (createNewline)) {
				b.append('\n');
			}
		}

		return b.toString();
	}

	//
	// Support methods
	//

	/**
	 * Update the cached string we prepend to each line
	 */
	private void updateCache() {
		if (indentSpaces == 0) {
			indentString = EMPTY;
		} else {
			int nTabs = indentSpaces / tabSpaces;
			int nSpaces = indentSpaces % tabSpaces;
			indentString = TABS.substring(0, nTabs)
					+ SPACES.substring(0, nSpaces);
		}
	}
}
