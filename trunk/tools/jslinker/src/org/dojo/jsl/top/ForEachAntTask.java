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

import java.io.*;
import java.util.*;
import org.apache.tools.ant.*;
import org.apache.tools.ant.taskdefs.*;
import org.apache.tools.ant.types.*;

/**
 * Call a target foreach entry in a set of parameters based on a fileset.
 * 
 * <pre>
 *      &lt;target name=&quot;target1&quot;&gt;
 *        &lt;foreach target=&quot;target2&quot;&gt;
 *          &lt;param name=&quot;param1&quot;&gt;
 *              &lt;fileset refid=&quot;fset1&quot;/&gt;
 *          &lt;/param&gt;
 *          &lt;param name=&quot;param2&quot;&gt;
 *            &lt;item value=&quot;jar&quot; /&gt;
 *            &lt;item value=&quot;zip&quot; /&gt;
 *          &lt;/param&gt;
 *         &lt;/foreach&gt;
 *      &lt;/target&gt;
 *  
 *      &lt;target name=&quot;target2&quot;&gt;
 *        &lt;echo message=&quot;prop is ${param1}.${param2}&quot; /&gt;
 *      &lt;/target&gt;
 * </pre>
 * 
 * <br>
 * Really this just a wrapper around "AntCall" <br>
 * Added a "type" attribute that works precisely like its equivalent in
 * <code>ExecuteOn</code>. It allows the user to specify whether directories,
 * files, or both directories and files from the filesets are included as
 * entries in the parameter set.
 * 
 * @author <a href="mailto:tpv@spamcop.net">Tim Vernum</a>
 */
public class ForEachAntTask extends Task {

	/** Defaults to "file". */
	protected String type = "file";

	private String subTarget;

	private Vector params;

	private Hashtable properties;

	/**
	 * Enumerated attribute with the values "file", "dir" and "both" for the
	 * type attribute.
	 */
	public static class FileDirBoth extends EnumeratedAttribute {
		@Override
		public String[] getValues() {
			return new String[] { "file", "dir", "both" };
		}
	}

	/**
	 * Inner class stores <item>s with <param> lists
	 */
	public class ParamItem {

		private String value;

		public void setValue(String value) {
			this.value = value;
		}

		public String getValue() {
			return value;
		}

	}

	/**
	 * Inner class stores sets of <param>s. It can hold <fileset>s or <item>s or
	 * both.
	 */
	public class ParamSet {

		private Vector filesets;

		private Vector items;

		private String name;

		public ParamSet() {
			filesets = new Vector();
			items = new Vector();
		}

		public void addFileset(FileSet fileset) {
			filesets.addElement(fileset);
		}

		public ParamItem createItem() {
			ParamItem item = new ParamItem();
			items.addElement(item);
			return item;
		}

		public void setName(String name) {
			this.name = name;
		}

		public String getName() {
			return name;
		}

		public Enumeration getValues(Project project) {

			/*
			 * As an arbitrary rule, this will return filesets first, and then
			 * <item>s. The ordering of the buildfile is not guaranteed.
			 */

			Vector values = new Vector();

			Enumeration enm = filesets.elements();
			while (enm.hasMoreElements()) {

				FileSet fileSet = (FileSet) enm.nextElement();
				File base = fileSet.getDir(project);
				DirectoryScanner scanner = fileSet.getDirectoryScanner(project);

				if (!"dir".equals(type)) {
					String[] files = getFiles(base, scanner);
					for (int j = 0; j < files.length; j++) {
						values.addElement(files[j]);
					}
				}

				if (!"file".equals(type)) {
					String[] dirs = getDirs(base, scanner);
					for (int j = 0; j < dirs.length; j++) {
						values.addElement(dirs[j]);
					}
				}

			}

			enm = items.elements();
			while (enm.hasMoreElements()) {

				ParamItem item = (ParamItem) enm.nextElement();
				values.addElement(item.getValue());
			}

			return values.elements();
		}

	}

	public ForEachAntTask() {
		params = new Vector();
		properties = new Hashtable();
	}

	@Override
	public void init() {
	}

	private void buildProperty(String propName, String propValue) {
		properties.put(propName, propValue);
	}

	private void executeTarget() {

		/*
		 * The "callee" has to be created each time in order to make the
		 * properties mutable.
		 */

		CallTarget callee;
		callee = (CallTarget) project.createTask("antcall");
		callee.init();

		callee.setTarget(subTarget);

		Enumeration keys = properties.keys();
		while (keys.hasMoreElements()) {

			String key = (String) keys.nextElement();
			String val = (String) properties.get(key);

			Property prop = callee.createParam();
			prop.setName(key);
			prop.setValue(val);
		}

		callee.execute();
	}

	/**
	 * This method is used to recursively iterate through each parameter set. It
	 * ends up being something like:
	 * 
	 * <pre>
	 * for (i = 0; i &lt; params[0].size; i++)
	 * 	for (j = 0; j &lt; params[1].size; j++)
	 * 		for (k = 0; k &lt; params[2].size; k++)
	 * 			executeTarget(params[0][i], params[1][j], params[2][k]);
	 * </pre>
	 */
	private void executeParameters(int paramNumber) {
		if (paramNumber == params.size()) {

			executeTarget();
		} else {
			ParamSet paramSet = (ParamSet) params.elementAt(paramNumber);

			Enumeration values = paramSet.getValues(project);
			while (values.hasMoreElements()) {

				String val = (String) values.nextElement();
				buildProperty(paramSet.getName(), val);

				executeParameters(paramNumber + 1);
			}
		}
	}

	@Override
	public void execute() {

		if (subTarget == null) {
			throw new BuildException("Attribute target is required.", location);
		}

		executeParameters(0);
	}

	public ParamSet createParam() {
		ParamSet param = new ParamSet();
		params.addElement(param);
		return param;
	}

	public void setTarget(String target) {
		subTarget = target;
	}

	/**
	 * Return the list of files from this DirectoryScanner that should be
	 * included on the command line.
	 */
	protected String[] getFiles(File basedir, DirectoryScanner ds) {
		return ds.getIncludedFiles();
	}

	/**
	 * Return the list of Directories from this DirectoryScanner that should be
	 * included on the command line.
	 */
	protected String[] getDirs(File basedir, DirectoryScanner ds) {
		return ds.getIncludedDirectories();
	}

	/**
	 * Shall the command work only on files, directories or both?
	 */
	public void setType(FileDirBoth type) {
		this.type = type.getValue();
	}

}
