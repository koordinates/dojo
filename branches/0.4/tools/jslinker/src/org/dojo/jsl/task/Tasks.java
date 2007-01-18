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

import org.dojo.jsl.top.Top;
import org.dojo.jsl.top.JscException;
import org.dojo.jsl.top.Util;

/**
 * Class that manages the creation of <code>Task</code> instances for a <i>jsl</i>
 * run. It uses <code>TaskFactory</code> objects to do the creation. Each
 * factory has been registered with the <code>Tasks</code> instance for a
 * specified task name.
 * <p>
 * 
 * 
 * @since JDK 1.4
 * @see Task
 * @see TaskFactory
 */
public class Tasks extends Object {

	/**
	 * <code>Tasks</code> instance used by the <code>Top</code>
	 * singleton
	 */
	static private Tasks sharedInstance = new Tasks();

	/**
	 * Returns the <code>Tasks</code> instance used by the
	 * <code>Top</code> singleton for determining tasks.
	 * 
	 * @return shared instance
	 */
	static public Tasks getSharedInstance() {
		return Tasks.sharedInstance;
	}

	/**
	 * Map of Task factories. The keys in the map are strings representing task
	 * names and the value are implementations of the <code>TaskFactory</code>
	 * interface.
	 */
	private Map factories;

	/**
	 * Creates an instance of <code>Tasks</code>
	 */
	public Tasks() {
		super();
		factories = new HashMap();
	}

	/**
	 * Registers the specified task factory for tasks with the specified name.
	 * This factory will be used by <code>Top</code> to create instances
	 * of <code>Task</code>.
	 * 
	 * @param taskName
	 *            task name
	 * @param factory
	 *            task factory
	 * @see Task
	 * @see TaskFactory
	 */
	public void register(String taskName, TaskFactory factory) {
		factories.put(taskName, factory);
	}

	/**
	 * Resets (clears) the factory registry.
	 */
	public void clear() {
		factories.clear();
	}

	/**
	 * Returns a list of <code>Task</code> instances. The
	 * <code>Top.TASK_LIST_PROPERTY_KEY</code> property is a
	 * comma-separated list of task names that will be used. For each task name
	 * a <code>Task</code> instance is created with the appropiate factory and
	 * added to the resulting list.
	 * 
	 * @return list of <code>Task</code> instances
	 * @exception JscException
	 *                if creating tasks generates an error
	 */
	public List getTasks() throws JscException {
		ArrayList tasks = new ArrayList();

		String commaSepTaskList = Top.getSharedInstance().getProperty(
				Top.TASK_LIST_PROPERTY_KEY);

		if (commaSepTaskList == null) {
			throw new JscException("no tasks specified");
		}

		String[] taskNames = Util.tokenizeCommaSepString(commaSepTaskList);

		for (int i = 0; i < taskNames.length; i++) {
			TaskFactory taskFactory = (TaskFactory) factories.get(taskNames[i]);

			if (taskFactory == null) {
				throw new JscException(
						"no task factory defined for tasks with name "
								+ taskNames[i]);
			}

			tasks.add(taskFactory.create());
		}

		return tasks;
	}
}
