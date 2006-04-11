package org.dojotoolkit.xdgen;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.UnsupportedEncodingException;

class XdGen{
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
		return "";
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