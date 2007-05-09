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
import java.util.logging.*;
import java.io.*;

import org.dojo.jsl.top.*;

/**
 * Implementation of the <code>Task</code> interface that writes out the
 * results of a <i>jsl</i> run by asking each <code>SourceFile</code>
 * instance to write out. The location where each source file is asked to write
 * itself out depends on the specified output directory and on the location of
 * the source file in the input directory structure. This task duplicates the
 * same directory tree as the input directory trees only rooted in the output
 * directory. "print" is the task name that needs to be specified in the task
 * list property to trigger this task.
 * 
 * 
 * @since JDK 1.4
 */
public class Printer extends Object implements Task {

	/**
	 * Task name
	 */
	static public final String TASK_NAME = "print";

	/**
	 * Output directory property name
	 */
	static public final String OUTPUT_DIR_PROPERTY_KEY = "task.print.output.dir";

	/**
	 * In place property name
	 */
	static public final String INPLACE_PROPERTY_KEY = "task.print.inplace";

	/**
	 * task factory for this class
	 */
	static private final TaskFactory factory = new TaskFactory() {
		public Task create() throws JscException {
			return new Printer();
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
		tasks.register(Printer.TASK_NAME, Printer.factory);
	}

	/**
	 * output dir name
	 */
	private String outputDirname;

	private boolean inplace;

	/**
	 * Creates an instance of <code>Printer</code> using the specified
	 * properties
	 * 
	 */
	public Printer() {
		super();

		Top top = Top.getSharedInstance();

		outputDirname = top.getProperty(Printer.OUTPUT_DIR_PROPERTY_KEY);
		inplace = "true".equals(top.getProperty(Printer.INPLACE_PROPERTY_KEY));
	}

	public String execute(Map context) throws JscException {
		List sources = Top.getSharedInstance().getSources();
		Iterator iter = sources.iterator();
		String canonicalOutputDirname = null;
		String commonSrcBasePrefix = null;

		try {

			if (!inplace) {
				File outputDir = new File(outputDirname);
				canonicalOutputDirname = Sources.getSharedInstance()
						.getCanonicalPath(outputDir);

				Iterator miter = sources.iterator();

				// find the common prefix from all these sources

				while (miter.hasNext()) {
					SourceFile sourceFile = (SourceFile) miter.next();
					String canonicalSrcFilename = sourceFile.getFilename();

					if (commonSrcBasePrefix == null) {
						commonSrcBasePrefix = canonicalSrcFilename;
					} else {
						commonSrcBasePrefix = Util.commonPathPrefix(
								commonSrcBasePrefix, canonicalSrcFilename);
					}
				}

				if (commonSrcBasePrefix != null) {
					File commonDir = new File(commonSrcBasePrefix);

					if (!commonDir.isDirectory()) {
						commonDir = commonDir.getParentFile();

						commonSrcBasePrefix = Sources.getSharedInstance()
								.getCanonicalPath(commonDir);
					}

					Top.logger.log(Level.INFO, "common source base prefix is "
							+ commonSrcBasePrefix);
				}
			}

			while (iter.hasNext()) {
				SourceFile sourceFile = (SourceFile) iter.next();

				if (sourceFile.shouldOutput()) {
					String canonicalSrcFilename = sourceFile.getFilename();

					Top.logger.log(Level.INFO, "writing out source file "
							+ canonicalSrcFilename);
					String outputFilename = null;

					if (!inplace) {
						// calculate the source output filename

						if ((commonSrcBasePrefix != null)
								&& canonicalSrcFilename
										.startsWith(commonSrcBasePrefix)) {
							canonicalSrcFilename = canonicalSrcFilename
									.substring(commonSrcBasePrefix.length());

							if (canonicalSrcFilename.charAt(0) == File.separatorChar) {
								outputFilename = canonicalOutputDirname
										+ canonicalSrcFilename;
							} else {
								outputFilename = canonicalOutputDirname
										+ File.separator + canonicalSrcFilename;
							}
						} else {
							if (Character.isLetter(canonicalSrcFilename
									.charAt(0))
									&& (canonicalSrcFilename.charAt(1) == ':')) {
								canonicalSrcFilename = File.separator
										+ canonicalSrcFilename.charAt(0)
										+ File.separator
										+ canonicalSrcFilename.substring(2);
							}

							if (canonicalSrcFilename.charAt(0) == File.separatorChar) {
								outputFilename = canonicalOutputDirname
										+ canonicalSrcFilename;
							} else {
								outputFilename = canonicalOutputDirname
										+ File.separator + canonicalSrcFilename;
							}
						}

						Top.logger.log(Level.INFO, "writing out to file "
								+ outputFilename);
					}

					sourceFile.write(outputFilename);
				}
			}
		} catch (IOException exc) {
			throw new JscException(exc);
		}

		return inplace ? Printer.TASK_NAME + ": "
				+ Integer.toString(sources.size()) + " files written in place"
				: Printer.TASK_NAME + ": " + Integer.toString(sources.size())
						+ " files written to " + outputDirname;
	}

	public String getName() {
		return Printer.TASK_NAME;
	}

}
