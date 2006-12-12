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

import java.util.*;
import java.io.*;
import org.apache.tools.ant.*;
import org.apache.tools.ant.types.*;

/**
 * 
 * 
 * @since JDK 1.4
 */
public class JscAntTask extends Task {

	private Properties properties;

	private ArrayList filesets;

	public JscAntTask() {
		properties = new Properties(Top.defaultProperties);
		filesets = new ArrayList();
	}

	public void setSources(String sources) {
		properties.setProperty(Top.SOURCES_PROPERTY_KEY, sources);
	}

	public void setExclude(String exclude) {
		properties.setProperty(Top.SOURCES_EXCLUDE_PROPERTY_KEY, exclude);
	}

	public void setOutputdir(String outputdir) {
		properties.setProperty(Top.OUTPUT_DIR_PROPERTY_KEY, outputdir);
	}

	public void setTempdir(String tempdir) {
		properties.setProperty(Top.TEMP_DIR_PROPERTY_KEY, tempdir);
	}

	public void setLogdir(String logdir) {
		properties.setProperty(Top.LOG_DIR_PROPERTY_KEY, logdir);
	}

	public void setHomedir(String homedir) {
		properties.setProperty(Top.HOME_DIR_PROPERTY_KEY, homedir);
	}

	public void setTasks(String tasks) {
		properties.setProperty(Top.TASK_LIST_PROPERTY_KEY, tasks);
	}

	public void setPrj(String prj) throws BuildException {
		try {
			FileInputStream fis = new FileInputStream(prj);
			BufferedInputStream bis = new BufferedInputStream(fis);
			properties.load(bis);
		} catch (IOException exc) {
			throw new BuildException("could not read prj file " + prj
					+ " due to exception " + exc, location);
		}
	}

	public void setProp(String prop) {
		int equalIndex = prop.indexOf('=');

		if ((equalIndex != -1) && (equalIndex != 0)
				&& (equalIndex != prop.length() - 1)) {
			properties.setProperty(prop.substring(0, equalIndex), prop
					.substring(equalIndex + 1));
		}
	}

	public void setVerbose(String verbose) {
		properties.setProperty(Top.VERBOSE_PROPERTY_KEY, verbose);
	}

	public void setQuiet(String quiet) {
		properties.setProperty(Top.QUIET_PROPERTY_KEY, quiet);
	}

	public Properties getProperties() {
		return properties;
	}

	public void addJscprop(JscAntProperty prop) {
		prop.setOwner(this);
	}

	public void addFileset(FileSet fileset) {
		filesets.add(fileset);
	}

	@Override
	public void execute() throws BuildException {

		// set the log and output dir defaults
		if (!properties.containsKey(Top.OUTPUT_DIR_PROPERTY_KEY)) {
			properties.setProperty(Top.OUTPUT_DIR_PROPERTY_KEY, properties
					.getProperty(Top.TEMP_DIR_PROPERTY_KEY)
					+ File.separator + "jslout" + Util.getDateStamp());
		}

		if (!properties.containsKey(Top.LOG_DIR_PROPERTY_KEY)) {
			properties.setProperty(Top.LOG_DIR_PROPERTY_KEY, properties
					.getProperty(Top.TEMP_DIR_PROPERTY_KEY)
					+ File.separator + "jsllog" + Util.getDateStamp());
		}

		int n = filesets.size();
		StringBuffer commaBuffer = new StringBuffer();
		boolean added = false;

		for (int i = 0; i < n; i++) {
			FileSet fs = (FileSet) filesets.get(i);
			DirectoryScanner ds = fs.getDirectoryScanner(project);
			File fromDir = fs.getDir(project);
			String fromDirStr = fromDir.getPath();

			String[] srcFiles = ds.getIncludedFiles();

			if ((srcFiles != null) && (srcFiles.length > 0)) {
				for (int j = 0; j < srcFiles.length; j++) {
					if (added) {
						commaBuffer.append(',');
					} else {
						added = true;
					}
					commaBuffer.append(fromDirStr);
					commaBuffer.append(File.separator);
					commaBuffer.append(srcFiles[j]);
				}
			}
		}

		if (added) {
			properties.setProperty(Top.SOURCES_PROPERTY_KEY, commaBuffer
					.toString());
		}

		String jslHome = getProject().getProperty("jsl.home");

		if (jslHome != null) {
			properties.setProperty(Top.HOME_DIR_PROPERTY_KEY, jslHome);
		}

		try {
			Top.main(properties);
		} catch (JscException exc) {
			throw new BuildException("jsl run failed with " + exc);
		}
	}
}
