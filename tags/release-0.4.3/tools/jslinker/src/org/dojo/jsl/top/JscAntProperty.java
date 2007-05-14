/*
 Copyright (c) 2004-2005, The Dojo Foundation
 All Rights Reserved.

 Licensed under the Academic Free License version 2.1 or above OR the
 modified BSD license. For more information on Dojo licensing, see:

 http://dojotoolkit.org/community/licensing.shtml <http://dojotoolkit.org/community/licensing.shtml>

 Code donated to the Dojo Foundation by AOL LLC under the terms of
 the Dojo CCLA (http://dojotoolkit.org/ccla.txt).

 */
package org.dojo.jsl.top;

import org.apache.tools.ant.*;
import org.apache.tools.ant.types.*;

/**
 * 
 * 
 * @since JDK 1.4
 */
public class JscAntProperty extends DataType {

	private String key;

	private String value;

	private JscAntTask owner;

	public JscAntProperty() {
	}

	public void setOwner(JscAntTask owner) {
		this.owner = owner;
	}

	public void setName(String name) {
		key = name;
	}

	public void setValue(String value) {
		this.value = value;
		owner.getProperties().setProperty(key, this.value);
	}

	public String getKey() {
		return key;
	}

	public String getValue() {
		return value;
	}

	public void execute() throws BuildException {

	}

	@Override
	public String toString() {
		return "JscAntProperty[" + key + ", " + value + "]";
	}
}
