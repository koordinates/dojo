/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/
package org.dojotoolkit.ant;

import static org.testng.AssertJUnit.assertEquals;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.Project;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.tools.shell.Global;
import org.testng.annotations.Test;

import java.io.IOException;

/**
 * Tests functionality of {@link DojoTestTask}.
 * 
 * @author jkuhnert
 */
@Test
public class TestDojoTestTask {
	
	@Test(expectedExceptions=BuildException.class)
	public void test_No_Config()
	{
		DojoTestTask task = newTask();
		task.execute();
	}
	
	@Test(expectedExceptions=BuildException.class)
	public void test_Bad_Config()
	{
		DojoTestTask task = newTask();
		task.setDojoSrc("../../thisaintdojo");
		
		task.execute();
	}
	
	public void test_Default()
	throws IOException
	{
		DojoTestTask task = newTask();
		task.setDojoSrc(".");
		task.setTestSrc("tools/test/test/test-data/tests");
		
		task.validate();
		
		String[] tests = task.getTestFiles();
		assert tests != null;
		assertEquals(2, tests.length);
		
		String basePath = task.getProject().getBaseDir().getAbsolutePath();
		
		String scriptArg = "djConfig = { \n" + 
				"	baseRelativePath: \"" + basePath + "/\",\n" + 
				"	isDebug: true\n" + 
				"};\n" + 
				"\n" + 
				"load(\"" + basePath + "/dojo.js\");\n" + 
				"\n" + 
				"load(\"" + basePath + "/tests/prologue.js\", \n" + 
				"	\"" + basePath + "/testtools/JsFakeDom/BUFakeDom.js\", \n" + 
				"	\"" + basePath + "/testtools/JsTestManager/jsunit_wrap.js\");\n" + 
				"load(\"" + basePath + "/tests/date/test_date.js\");\n" + 
				"load(\"" + basePath + "/tests/test_dom.js\");" +
				"load(\"" + basePath + "/tests/epilogue.js\");\n" + 
				"jum.init();\n" + 
				"jum.runAll();";
		
		Context cx = Context.enter();
		try {
			Global lGlobal = new Global(cx);
			
			cx.compileString(
					scriptArg, 
					"djconfig", 1 , null
			).exec(cx, lGlobal);
			
		} finally {
			Context.exit();
		}
	}
	
	public void test_Run_Tests()
	{
		DojoTestTask task = newTask();
		
		task.setDojoSrc(".");
		task.setTestSrc("tools/test/test/test-data/tests");
		
		task.execute();
	}
	
	protected DojoTestTask newTask()
	{
		Project project = new Project();
		project.setBasedir(System.getProperty("basedir", "."));
		
		DojoTestTask task = new DojoTestTask();
		task.setProject(project);
		
		return task;
	}
}
