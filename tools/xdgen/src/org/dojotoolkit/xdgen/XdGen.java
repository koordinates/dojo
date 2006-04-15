package org.dojotoolkit.xdgen;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

class XdGen{
	private static final int DEPEND_TYPE_GROUP = 1;
	private static final int DEPEND_VALUE_GROUP = 2;

	private final static String DEPEND_EXPRESSION = "dojo.(require|requireIf|requireAll|provide|requireAfterIf|requireAfter|hostenv\\.conditionalLoadModule|.hostenv\\.loadModule|hostenv\\.moduleLoaded)\\(([\\w\\W]*?)\\)";
	private static final Pattern DEPEND_PATTERN;
	static{
		DEPEND_PATTERN = Pattern.compile(DEPEND_EXPRESSION, Pattern.MULTILINE | Pattern.DOTALL);
	}

	public static void main(String[] args) throws Exception{
		if(args == null || args.length == 0){
			System.out.println("This program requires a file name or a list of file names.");
			return;
		}

		for(int i = 0; i < args.length; i++){
			XdGen.generate(args[i]);
		}
	}

	public static void generate(String fileName)
		throws FileNotFoundException, IOException, UnsupportedEncodingException{
		File file = new File(fileName);
		if(file.exists()){
			if(file.isFile()){
				//Read the file and construct xdomain contents
				String contents = readFile(fileName);
				contents = XdGen.buildXDomainPackage(contents);

				//Construct the output file name
				//Find the last dot so we can insert a ".xd" before the file extension.
				int lastIndex = fileName.lastIndexOf('.');
				if(lastIndex <= 0){
					lastIndex = fileName.length() - 1;
				}

				StringBuffer outNameBuffer = new StringBuffer(fileName.substring(0, lastIndex));
				outNameBuffer.append(".xd");
				if(lastIndex != fileName.length() - 1){
					outNameBuffer.append(fileName.substring(lastIndex, fileName.length()));
				}

				//Write the xdomain package file.
				BufferedWriter bufferedWriter = new BufferedWriter(new FileWriter(outNameBuffer.toString()));
				bufferedWriter.write(contents);
				bufferedWriter.flush();
				bufferedWriter.close();
			}else if(file.isDirectory()){
				String[] dirFiles = file.list();
				for(int i = 0; i < dirFiles.length; i++){
					XdGen.generate(dirFiles[i]);
				}
			}
		}
	}

	//***************************************************************
	//***************************************************************
	//***************************************************************
	//Private methods

	private static String buildXDomainPackage(String contents){
		//Build the dependencies.
		ArrayList deps = new ArrayList();
		Matcher matcher = DEPEND_PATTERN.matcher(contents);
		while (matcher.find()){
			deps.add("\"" + matcher.group(DEPEND_TYPE_GROUP) + "\", " + matcher.group(DEPEND_VALUE_GROUP));
		}

		//Write out the xd.js file.
		StringBuffer output = new StringBuffer(contents.length());
		output.append("dojo.hostenv.packageLoaded({\n");
		
		//Add the depedencies.
		if(deps != null && deps.size() > 0){
			output.append("depends: [");
			
			for(int i = 0; i < deps.size(); i++){
				if(i > 0){
					output.append(",\n");
				}
				output.append("[" + deps.get(i) + "]");
			}
			
			output.append("],");
		}

		//Add the contents of the file inside a function.
		//Pass in dojo as an argument to the function to help with
		//allowing multiple versions of dojo in a page.
		output.append("\ndefinePackage: function(dojo){");
		output.append(contents);
		output.append("\n}});");
		
		return output.toString();
	}

	private static String readFile(String fileName)
			throws FileNotFoundException, UnsupportedEncodingException,
			IOException{
		BufferedReader bufferedReader = new BufferedReader(new FileReader(fileName));
		StringBuffer fileBuffer = new StringBuffer(4096);
		char[] buffer = new char[4096];
		int bytesRead;

		while((bytesRead = bufferedReader.read(buffer)) != -1){
			fileBuffer.append(buffer, 0, bytesRead);
		}
		bufferedReader.close();

		return fileBuffer.toString();
	}
}