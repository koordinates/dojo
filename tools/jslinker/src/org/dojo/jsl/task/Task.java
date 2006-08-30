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

import org.dojo.jsl.top.JscException;

/**
 * Interface of task objects. These objects encapsulate the state and
 * functionality of tasks as needed by the <i>jsl</i> system. Tasks are
 * executed in order in which they were specified and they can use the specified
 * context to retrieve data from previous tasks and set data for following
 * tasks.
 * 
 * 
 * @since JDK 1.4
 */
public interface Task {

	/**
	 * Executes the receiver in the specified context.
	 * 
	 * @param context
	 *            execution context
	 * @return a summary string in human-readable form
	 * @exception JscException
	 *                if task execution failed
	 */
	public String execute(Map context) throws JscException;

	/**
	 * Returns the task name.
	 * 
	 * @return task name
	 */
	public String getName();

}
