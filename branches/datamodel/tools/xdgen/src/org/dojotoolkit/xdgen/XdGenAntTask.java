package org.dojotoolkit.xdgen;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.DirectoryScanner;
import org.apache.tools.ant.taskdefs.MatchingTask;
import org.apache.tools.ant.types.FileSet;

public class XdGenAntTask extends MatchingTask{
	private List mFileSetList = new ArrayList();

	public void addConfiguredFileSet(FileSet fileset){
		mFileSetList.add(fileset);
	}

	public void execute() throws BuildException{
		if(mFileSetList.size() > 0){
			ArrayList fileNameList = new ArrayList();
			for(int listIndex = 0; listIndex < mFileSetList.size(); listIndex++){
				DirectoryScanner directoryScanner = ((FileSet)mFileSetList
						.get(listIndex)).getDirectoryScanner(getProject());
				String[] files = directoryScanner.getIncludedFiles();

				if(files != null){
					for(int index = 0; index < files.length; index++){
						fileNameList.add(directoryScanner.getBasedir()
								.getAbsolutePath()
								+ File.separator + files[index]);
					}
				}
			}

			String[] fileNames = (String[])fileNameList
					.toArray(new String[fileNameList.size()]);
			try{
				XdGen.main(fileNames);
			}catch (Exception exception){
				throw new BuildException(exception);
			}
		}
	}
}
