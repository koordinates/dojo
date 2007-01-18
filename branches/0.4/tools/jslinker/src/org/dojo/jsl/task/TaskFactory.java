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

import org.dojo.jsl.top.JscException;

/**
 * Interface of task factories. Used by <code>Tasks</code> objects to create
 * instances of <code>Task</code>.
 * 
 * 
 * @since JDK 1.4
 * @see Task
 * @see Tasks
 */
public interface TaskFactory {

	/**
	 * Creates an instance of <code>Task</code>.
	 * 
	 * @return <code>Task</code> instance
	 * @exception JscException
	 *                if the creation failed
	 */
	public Task create() throws JscException;

}
