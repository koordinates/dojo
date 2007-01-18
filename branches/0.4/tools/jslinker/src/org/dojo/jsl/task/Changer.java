/*
 Copyright (c) 2004-2005, The Dojo Foundation
 All Rights Reserved.

 Licensed under the Academic Free License version 2.1 or above OR the
 modified BSD license. For more information on Dojo licensing, see:

 http://dojotoolkit.org/community/licensing.shtml <http://dojotoolkit.org/community/licensing.shtml>

 Code donated to the Dojo Foundation by AOL LLC under the terms of
 the Dojo CCLA (http://dojotoolkit.org/ccla.txt).

 */
package org.dojo.jsl.task;

import java.util.*;

import org.dojo.jsl.top.*;

/**
 * 
 * 
 * @since JDK 1.4
 */
public class Changer extends Object implements Task {

	/**
	 * Task name
	 */
	static public final String TASK_NAME = "change";

	/**
	 * task factory for this class
	 */
	static private final TaskFactory factory = new TaskFactory() {
		public Task create() throws JscException {
			return new Changer();
		}
	};

	/**
	 * Registers with specified <code>Tasks</code> instance a
	 * <code>TaskFactory</code> for instances of this class.
	 * 
	 * @param tasks
	 *            Tasks instance
	 */
	static public void register(Tasks tasks) {
		tasks.register(Changer.TASK_NAME, Changer.factory);
	}

	/**
	 * Creates an instance of <code>Changer</code>
	 * 
	 */
	public Changer() {
		super();
	}

	public String execute(Map context) throws JscException {
		Iterator iter = Top.getSharedInstance().getSources().iterator();

		while (iter.hasNext()) {
			SourceFile sourceFile = (SourceFile) iter.next();

			sourceFile.changed();
		}

		return Changer.TASK_NAME + ": marked all source files as changed";
	}

	public String getName() {
		return Changer.TASK_NAME;
	}

}
