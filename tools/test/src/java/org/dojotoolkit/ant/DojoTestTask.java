/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/
package org.dojotoolkit.ant;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.DirectoryScanner;
import org.apache.tools.ant.Project;
import org.apache.tools.ant.Task;
import org.apache.tools.ant.taskdefs.Execute;
import org.apache.tools.ant.types.CommandlineJava;
import org.apache.tools.ant.types.FileSet;
import org.apache.tools.ant.types.Path;
import org.dojotoolkit.DojoTest;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.text.CharacterIterator;
import java.text.StringCharacterIterator;

/**
 * Represents an ant task the simplifies the dependency / build
 * issues associated with trying to use the dojo test system 
 * outside of dojo.
 * 
 * @author jkuhnert
 */
public class DojoTestTask extends Task {
	
	// The directory containing dojo, compressed or in original form
	private String _dojoSrc;
	// The directory containg tests to be run
	private String _testSrc;
	// The directory any tempory output is written to, goes to java.io.tmpdir by default
	private String _outputTargetDir;
	// Whether or not local dojo src detected 
	private boolean _localDetected;
	
	private File _dojoDir;
	private File _testDir;
	private File _outputDir;
	
	/**
	 * Validates that required parameters are set.
	 * @throws BuildException on error
	 */
	void validate()
	{
		if (_dojoSrc == null) 
			throw new BuildException("dojosrc not set");
		if (_testSrc == null) 
			throw new BuildException("testsrc not set");
		
		_dojoDir = getProject().resolveFile(_dojoSrc);
		_testDir = getProject().resolveFile(_testSrc);
		
		// output defaults to system tmp dir if not set
		
		if (_outputTargetDir != null) {
			
			_outputDir = getProject().resolveFile(_outputTargetDir);
		} else {
			
			_outputDir = new File(System.getProperty("java.io.tmpdir"));
		}
	}
	
	/**
	 * Gets all files matching <code>test*.js</code> in the
	 * specified <code>testsrc</code> directory.
	 * @return The set of files found, if any.
	 */
	String[] getTestFiles()
	{
		FileSet fs = new FileSet();
		
		fs.setIncludes("**/test*.js"); // TODO: Use file sets so these names aren't hard coded
		fs.setFollowSymlinks(true);
		fs.setDir(_testDir);
		
		DirectoryScanner ds = fs.getDirectoryScanner(getProject());
		
		return ds.getIncludedFiles();
	}
	
	/**
	 * Ensures that all needed test.js files are 
	 * present in the temporary output directory. 
	 * 
	 * Files would be things like prologue.js,jsunit_wrap.js,etc..
	 */
	void prepareOutput()
	throws IOException
	{
		log("Preparing output directory.");
		
		checkFile("prologue.js", "tests");
		checkFile("BUFakeDom.js", "testtools/JsFakeDom");
		checkFile("jsunit_wrap.js", "testtools/JsTestManager");
		checkFile("epilogue.js", "tests");
	}
	
	/**
	 * Checks for the existance of the specified 
	 * file in the output directory, if not present
	 * attempts to grab it from the current ClassLoader (if in a jar),
	 * or from the filesystem if dojo src is pointed at 
	 * the dojo project folder.
	 * 
	 * @param fileName
	 * 			The file to check for existance of.
	 * @param localPath
	 * 			Optional locally resolvable path if task being executed
	 * 			against dojo project sources.
	 */
	void checkFile(String fileName, String localPath)
	throws IOException
	{
		if (_localDetected)
			return;
		
		if (localPath != null) {
			
			File local = getProject().resolveFile(_dojoDir + "/" + localPath + "/" + fileName);
			
			if (local.exists()) {
				_localDetected=true;
				return;
			}
		}
		
		File file = new File(_outputDir.getAbsolutePath() + "/" + fileName);
		
		if (file.exists()) 
			return;
		
		byte[] data = new byte[3000];
		
		BufferedInputStream bi = 
			new BufferedInputStream(getClass().getClassLoader().getResourceAsStream(fileName));
		int read = 0;
		
		FileOutputStream out = 
			new FileOutputStream(_outputDir.getAbsolutePath() + "/" + fileName);
		
		while ((read = bi.read(data)) > -1 ) {
			
			out.write(data, 0, read);
		}
		
		bi.close();
		out.close();
	}
	
	/**
	 * The main method executed by ant tasks.
	 */
	public void execute()
	{
		validate();
		
		try {
			
			prepareOutput();
		} catch (Throwable t) { 
			throw new BuildException(t); 
		}
		
		String[] tests = getTestFiles();
		
		if (tests == null || tests.length < 1) {
			log("No tests found.");
			return;
		}
		
		String testGroup = getProject().getProperty("test.group");
		
		Execute execute = new Execute();
		execute.setAntRun(getProject());
		
		CommandlineJava cmd = new CommandlineJava();
		
		Path cp = cmd.createClasspath(getProject());
		cp.createPath().setLocation(findJar());
		cmd.setClassname("org.dojotoolkit.DojoTest");
		
		cmd.createArgument().setValue(DojoTest.ARG_DOJO_DIR);
		cmd.createArgument().setFile(_dojoDir);
		cmd.createArgument().setValue(DojoTest.ARG_OUTPUT_DIR);
		cmd.createArgument().setFile(_outputDir);
		cmd.createArgument().setValue(DojoTest.ARG_TEST_DIR);
		cmd.createArgument().setFile(_testDir);
		cmd.createArgument().setValue(DojoTest.ARG_USE_LOCAL);
		cmd.createArgument().setValue(String.valueOf(_localDetected));
		
		if (testGroup != null) {
			
			cmd.createArgument().setValue(DojoTest.ARG_GROUP);
			cmd.createArgument().setValue(testGroup);
		}
		
		cmd.createArgument().setValue(DojoTest.ARG_TEST_FILES);
		for (int i=0; i < tests.length; i++) 
			cmd.createArgument().setValue(tests[i]);
		
		execute.setCommandline(cmd.getCommandline());
		
		log(cmd.describeCommand(), Project.MSG_VERBOSE);
		
		log("Executing dojo tests.");
		
		try {
			
			execute.execute();
			
		} catch (IOException e) {
			throw new BuildException("Process fork failed.", e, getLocation());
		}
	}
	
	public void setDojoSrc(String dojosrc) 
	{ 
		_dojoSrc = dojosrc; 
	}
	
	public void setTestSrc(String testsrc) 
	{ 
		_testSrc = testsrc; 
	}
	
	public void setOutputDir(String outputdir) 
	{ 
		_outputTargetDir = outputdir; 
	}
	
	/**
	 * Stolen from TestNG. Resolves the jar file that this class is running in.
	 * 
	 * @return The file if found, null otherwise.
	 */
	private File findJar() 
	{
		Class  thisClass = getClass();
		String resource = thisClass.getName().replace('.', '/') + ".class";
		URL url = thisClass.getClassLoader().getResource(resource);

		if(null != url) {
			String u = url.toString();
			
			if(u.startsWith("jar:file:")) {
				
				int    pling = u.indexOf("!");
				String jarName = u.substring(4, pling);
				
				return new File(fromURI(jarName));
				
			} else if(u.startsWith("file:")) {
				
				int    tail = u.indexOf(resource);
				String dirName = u.substring(0, tail);
				return new File(fromURI(dirName));
			}
		}
		
		return null;
	}

	/**
	 * Stolen from TestNG, resolves uris.
	 * 
	 * @param uri The relative/absolute uri to resolve.
	 * @return The uri turned into a File loadable string path.
	 */
	private String fromURI(String uri) 
	{
		URL url = null;
		try {
			
			url = new URL(uri);
		}
		catch(MalformedURLException murle) {
		}
		
		if((null == url) || !("file".equals(url.getProtocol())))
			throw new IllegalArgumentException("Can only handle valid file: URIs");
		
		StringBuffer buf = new StringBuffer(url.getHost());
		
		if(buf.length() > 0) {
			buf.insert(0, File.separatorChar).insert(0, File.separatorChar);
		}

		String file = url.getFile();
		int    queryPos = file.indexOf('?');
		buf.append((queryPos < 0) ? file : file.substring(0, queryPos));
		
		uri = buf.toString().replace('/', File.separatorChar);

		if((File.pathSeparatorChar == ';') && uri.startsWith("\\") && (uri.length() > 2)
				&& Character.isLetter(uri.charAt(1)) && (uri.lastIndexOf(':') > -1)) {
			uri = uri.substring(1);
		}
		
		StringBuffer      sb = new StringBuffer();
		CharacterIterator iter = new StringCharacterIterator(uri);
		
		for(char c = iter.first(); c != CharacterIterator.DONE; c = iter.next()) {
			
			if(c == '%') {
				char c1 = iter.next();
				
				if(c1 != CharacterIterator.DONE) {
					
					int  i1 = Character.digit(c1, 16);
					char c2 = iter.next();
					
					if(c2 != CharacterIterator.DONE) {
						int i2 = Character.digit(c2, 16);
						sb.append((char) ((i1 << 4) + i2));
					}
				}
			} else {
				sb.append(c);
			}
		}
		
		return sb.toString();
	}
}
