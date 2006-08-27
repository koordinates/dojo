/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/
package org.dojotoolkit;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.RhinoException;
import org.mozilla.javascript.tools.shell.Global;

import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;

/**
 * Core class for running dojo based tests within 
 * a Rhino execution environment.
 * 
 * @author jkuhnert
 */
public class DojoTest {

	public static final String ARG_OUTPUT_DIR = "outputdir";
	public static final String ARG_DOJO_DIR = "dojodir";
	public static final String ARG_TEST_DIR = "testdir";
	public static final String ARG_TEST_FILES = "testfiles";
	
	private String[] _testFiles;
	private File _dojoDir;
	private File _outputDir;
	private File _testDir;
	
	/**
	 * Default constructor.
	 */
	public DojoTest()
	{
	}
	
	/**
	 * Sets the set of javascript file paths to be run in this
	 * test.
	 * @param testFiles
	 */
	public void setTestFiles(String[] testFiles)
	{
		_testFiles = testFiles;
	}
	
	/**
	 * Sets the root dojo source directory. This
	 * can be either the path to a checked out dojo 
	 * source project or a built dojo release. 
	 * @param dojoDir
	 */
	public void setDojoDir(File dojoDir)
	{
		_dojoDir = dojoDir;
	}
	
	/**
	 * The output directory where the required helper 
	 * javascript files are expected to be found. (epilogue.js/BUFakeDom.js/etc..)
	 * @param outputDir
	 */
	public void setOutputDir(File outputDir)
	{
		_outputDir = outputDir;
	}
	
	/**
	 * Sets the absolute path to the root test directory.
	 * @param testDir
	 */
	public void setTestDir(File testDir)
	{
		_testDir = testDir;
	}
	
	/**
	 * Fixes the incoming path string to be compliant with javascript
	 * string rules.
	 * 
	 * @param incoming
	 * @return
	 */
	public String path(String incoming)
	{
		try {
            StringWriter writer = new StringWriter(incoming.length() * 2);
            escapeJavaStyleString(writer, incoming, true);
            return writer.toString();
        } catch (IOException ioe) {
            // this should never ever happen while writing to a StringWriter
            ioe.printStackTrace();
            return null;
        }
	}
	
	/**
	 * Shamelessly stolen from jakarta commons-lang.
	 * 
	 * @param out
	 * @param str
	 * @param escapeSingleQuote
	 * @throws IOException
	 */
	private static void escapeJavaStyleString(Writer out, String str, boolean escapeSingleQuote) 
	throws IOException 
	{
        if (out == null)
            throw new IllegalArgumentException("The Writer must not be null");
        
        if (str == null)
            return;
        
        int sz;
        sz = str.length();
        for (int i = 0; i < sz; i++) {
            char ch = str.charAt(i);

            // handle unicode
            if (ch > 0xfff) {
                out.write("\\u" + hex(ch));
            } else if (ch > 0xff) {
                out.write("\\u0" + hex(ch));
            } else if (ch > 0x7f) {
                out.write("\\u00" + hex(ch));
            } else if (ch < 32) {
                switch (ch) {
                    case '\b':
                        out.write('\\');
                        out.write('b');
                        break;
                    case '\n':
                        out.write('\\');
                        out.write('n');
                        break;
                    case '\t':
                        out.write('\\');
                        out.write('t');
                        break;
                    case '\f':
                        out.write('\\');
                        out.write('f');
                        break;
                    case '\r':
                        out.write('\\');
                        out.write('r');
                        break;
                    default :
                        if (ch > 0xf) {
                            out.write("\\u00" + hex(ch));
                        } else {
                            out.write("\\u000" + hex(ch));
                        }
                        break;
                }
            } else {
                switch (ch) {
                    case '\'':
                        if (escapeSingleQuote) {
                          out.write('\\');
                        }
                        out.write('\'');
                        break;
                    case '"':
                        out.write('\\');
                        out.write('"');
                        break;
                    case '\\':
                        out.write('\\');
                        out.write('\\');
                        break;
                    default :
                        out.write(ch);
                        break;
                }
            }
        }
    }
	
	private static String hex(char ch) 
	{
        return Integer.toHexString(ch).toUpperCase();
    }
	
	/**
	 * Causes the tests to be run.
	 */
	public void execute()
	{
		Context cx = Context.enter();
		cx.setOptimizationLevel(-1);
		cx.setGeneratingDebug(true);
		cx.setGeneratingSource(true);
		try {
			Global global = new Global(cx);
			
			execString(cx, global, 
					"djConfig = { \n" + 
					"	baseRelativePath: \"" + path(_dojoDir.getAbsolutePath() + File.separatorChar) +"\",\n" + 
					"	isDebug: true\n" + 
					"};\n",
					"djConfig"
			);
			
			String path = path(_outputDir.getAbsolutePath() + File.separatorChar);
			
			execString(cx, global, 
					"load('" + path(_dojoDir.getAbsolutePath() + File.separatorChar) + "dojo.js');",
					"dojo.js"
			);
			
			execString(cx, global, 
					"load('" + path(_dojoDir.getAbsolutePath() + File.separatorChar 
					+ "src" + File.separatorChar) + "hostenv_rhino.js');",
					"hostenv_rhino.js"
			);
			
			execString(cx, global, 
					"load('" + path + "prologue.js');",
					"prologue.js"
			);
			
			execString(cx, global, 
					"load('" + path + "BUFakeDom.js');",
					"BUFakeDom.js"
			);
			
			execString(cx, global, 
					"load('" + path + "jsunit_wrap.js');",
					"jsunit_wrap.js"
			);
			
			for (int i=0; i < _testFiles.length; i++) {
				execString(cx, global, 
						"load('" + path(_testDir.getAbsolutePath() + File.separatorChar + _testFiles[i]) + "');",
						_testFiles[i]
				);
			}
			
			execString(cx, global, 
					"load('" + path + "epilogue.js');",
					"epilogue.js"
			);
			
			execString(cx, global, 
					"jum.init();jum.runAll();",
					"jum"
			);
		} finally {
			Context.exit();
		}
	}
	
	/**
	 * Executes a javascript string. This method wraps the execution
	 * of the specified string to catch and output any exceptions, this
	 * is so that any test failures don't prevent the whole build from
	 * running.
	 * 
	 * @param cx
	 * @param global
	 * @param str
	 * @param file
	 */
	void execString(Context cx, Global global, String str, String file)
	{
		try {
			Object result = cx.compileString(
					str,
					file, 1 , null
			).exec(cx, global);
			
			if (result != Context.getUndefinedValue())
				System.out.println(result);
			
		} catch (RhinoException e) {
			System.out.println("RhinoException : " 
					+ e.lineSource() + " sourceName:" + e.sourceName() + " line: " + e.lineNumber()
					+ " column: " + e.columnNumber() + " msg: " + e.getMessage());
		} catch (Throwable t) {
			System.out.println("Unknown error caught executing script:" + t.getMessage());
		}
	}
	
	/**
	 * Prints a usage message when invoked with incorrect arguments
	 * from the command line.
	 */
	void printUsage()
	{
		System.out.println("Usage: DojoTest "
				+ DojoTest.ARG_DOJO_DIR + " <dojo path> "
				+ DojoTest.ARG_OUTPUT_DIR + " <output path> "
				+ DojoTest.ARG_TEST_DIR + " <test dir path> "
				+ DojoTest.ARG_TEST_FILES + " <list of space seperated test file paths> ");
	}
	
	/**
	 * Main entry point when invoked from command line.
	 * @param args
	 */
	public static void main(String[] args)
	{
		DojoTest test = new DojoTest();
		
		// validate arguments
		if (args == null || args.length < 8) {
			test.printUsage();
			System.exit(-1);
		}
		
		// grab initial configuration
		for (int i=0; i < 6; i++) {
			if (DojoTest.ARG_DOJO_DIR.equals(args[i])) {
				test.setDojoDir(new File(args[i + 1]));
				i++;
				continue;
			}
			
			if (DojoTest.ARG_OUTPUT_DIR.equals(args[i])) {
				test.setOutputDir(new File(args[i + 1]));
				i++;
				continue;
			}
			
			if (DojoTest.ARG_TEST_DIR.equals(args[i])) {
				test.setTestDir(new File(args[i + 1]));
				i++;
				continue;
			}
		}
		
		String[] testFiles = new String[args.length - 7];
		System.arraycopy(args, 7, testFiles, 0, testFiles.length);
		test.setTestFiles(testFiles);
		
		test.execute();
	}
}
