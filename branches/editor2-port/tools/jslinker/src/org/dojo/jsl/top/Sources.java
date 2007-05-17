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
import java.util.regex.*;
import java.io.*;

/**
 * Class that manages the creation of <code>SourceFile</code> instances for a
 * <i>jsl</i> run. It uses <code>SourceFileFactory</code> objects to do the
 * creation. Each factory has been registered with the <code>Sources</code>
 * instance for a specified file suffix.
 * <p>
 * 
 * 
 * @since JDK 1.4
 * @see SourceFile
 * @see SourceFileFactory
 */
public class Sources extends Object {

	static public final int APPLICATION_FILE_TAG = 1;

	static public final int FRAMEWORK_FILE_TAG = 2;

	static public String tag2String(int tag) {
		return tag == 1 ? "ApplicationFile" : "FrameworkFile";
	}

	/**
	 * <code>Sources</code> instance used by the <code>Top</code> singleton
	 */
	static private Sources sharedInstance = new Sources();

	/**
	 * Returns the <code>Sources</code> instance used by the <code>Top</code>
	 * singleton for determining source files.
	 * 
	 * @return shared instance
	 */
	static public Sources getSharedInstance() {
		return Sources.sharedInstance;
	}

	/**
	 * Map of SourceFile factories. The keys in the map are strings representing
	 * file suffixes and the value are implementations of the
	 * <code>SourceFileFactory</code> interface.
	 */
	private Map factories;

	/**
	 * Creates an instance of <code>Sources</code>
	 */
	public Sources() {
		super();
		factories = new HashMap();
	}

	/**
	 * Registers the specified source file factory for source files with the
	 * specified suffix. This factory will be used by <code>Top</code> to
	 * create instances of <code>SourceFile</code> when reading in input
	 * source files of that suffix.
	 * 
	 * @param suffix
	 *            source file suffix
	 * @param factory
	 *            source file factory
	 * @see SourceFile
	 * @see SourceFileFactory
	 */
	public void register(String suffix, SourceFileFactory factory) {
		factories.put(suffix, factory);
	}

	/**
	 * Resets (clears) the factory registry.
	 */
	public void clear() {
		factories.clear();
	}

	/**
	 * A directory file filter.
	 */
	static public FileFilter dirFilter = new FileFilter() {
		public boolean accept(File pathname) {
			return pathname.isDirectory();
		}
	};

	/**
	 * A file name filter that filters according to some wildcard pattern
	 */
	static public class WildcardFileFilter extends Object implements FileFilter {
		private Pattern regex;

		private boolean not;

		private String patternStr;

		/**
		 * Creates an instance of <code>WildcardFileFilter</code> that will
		 * filter according to the specified wildcard pattern.
		 * 
		 * @param pattern
		 *            wildcard pattern
		 * @param not
		 *            if true then files not matching the wildcard are accepted
		 */
		public WildcardFileFilter(String pattern, boolean not)
				throws JscException {
			super();

			pattern = pattern.replace(File.separatorChar, '/');

			int n = pattern.length();
			StringBuffer regexPatternBuffer = new StringBuffer(n);

			for (int i = 0; i < n; i++) {
				char c = pattern.charAt(i);
				if (c == '*') {
					if ((i < n - 1) && (pattern.charAt(i + 1) == '*')) {
						regexPatternBuffer.append(".*");
						i++;
					} else {
						regexPatternBuffer.append("[^/]*");
					}
				} else if (c == '?') {
					regexPatternBuffer.append('.');
				} else if (c == '.') {
					regexPatternBuffer.append("\\.");
				} else if (c == '$') {
					regexPatternBuffer.append("\\$");
				} else {
					regexPatternBuffer.append(c);
				}
			}

			patternStr = regexPatternBuffer.toString();

			try {
				regex = Pattern.compile(patternStr);
			} catch (PatternSyntaxException exc) {
				throw new JscException(exc);
			}

			this.not = not;
		}

		/**
		 * Creates an instance of <code>WildcardFileFilter</code> that will
		 * filter according to the specified wildcard pattern.
		 * 
		 * @param pattern
		 *            wildcard pattern
		 */
		public WildcardFileFilter(String pattern) throws JscException {
			this(pattern, false);
		}

		public boolean accept(File pathname) {
			boolean result = true;

			try {
				String filename = Sources.getSharedInstance().getCanonicalPath(
						pathname);
				filename = filename.replace(File.separatorChar, '/');

				Matcher matcher = regex.matcher(filename);

				result = matcher.matches();

			} catch (IOException exc) {
				result = false;
			}

			return not ? (!result) : result;
		}

		@Override
		public String toString() {
			return "WildcardFileFilter[" + patternStr + "]";
		}
	}

	/**
	 * A file filter that filters according to specified file suffix
	 */
	static public class SuffixFileFilter extends Object implements FileFilter {
		private String[] suffixes;

		private boolean not;

		/**
		 * Creates an instance of <code>SuffixFileFilter</code> that will
		 * filter according to the specified file suffixes. Files having a
		 * suffix which is in the specified array are accepted.
		 * 
		 * @param suffixes
		 *            file suffixes
		 * @param not
		 *            if true then files not having a suffix in the specified
		 *            array are accepted
		 */
		public SuffixFileFilter(String[] suffixes, boolean not) {
			super();
			if ((suffixes == null) || (suffixes.length == 0)) {
				throw new IllegalArgumentException();
			}
			this.suffixes = suffixes;
			this.not = not;
		}

		/**
		 * Creates an instance of <code>SuffixFileFilter</code> that will
		 * filter according to the specified file suffixes. Files having a
		 * suffix which is in the specified array are accepted.
		 * 
		 * @param suffixes
		 *            file suffixes
		 */
		public SuffixFileFilter(String[] suffixes) {
			this(suffixes, false);
		}

		/**
		 * Creates an instance of <code>SuffixFileFilter</code> that will
		 * filter according to the specified file suffixes. Files having a
		 * suffix which is in the specified comma-separated list of suffixes are
		 * accepted.
		 * 
		 * @param commaSepSuffixes
		 *            file suffixes
		 */
		public SuffixFileFilter(String commaSepSuffixes) {
			this(Util.tokenizeCommaSepString(commaSepSuffixes), false);
		}

		public boolean accept(File pathname) {
			if (!pathname.isFile()) {
				return false;
			}

			String filename = pathname.getName();
			boolean result = false;

			for (int i = 0; i < suffixes.length; i++) {
				if (filename.endsWith("." + suffixes[i])) {
					result = true;
					break;
				}
			}
			return not ? (!result) : result;
		}
	}

	/**
	 * Recursively searches the specified directory for files that pass the
	 * specified file filter or adds the specified file. Files that do are added
	 * to the passed result list.
	 * 
	 * @param dirOrFile
	 *            directory to search recursively or file to add
	 * @param result
	 *            array of lists where found files are added
	 * @param fileFilter
	 *            array of filters the files have to pass
	 */
	private void findFiles(File dirOrFile, List[] result,
			FileFilter[] fileFilter, Set excludeSet, List excludeResult)
			throws JscException {

		if (dirOrFile.isDirectory()) {
			for (int k = 0; k < result.length; k++) {
				File[] files = dirOrFile.listFiles(fileFilter[k]);

				if (files != null) {
					for (int i = 0; i < files.length; i++) {
						result[k].add(files[i]);
					}
				}
			}

			File[] subDirs = dirOrFile.listFiles(Sources.dirFilter);

			if (subDirs != null) {
				for (int i = 0; i < subDirs.length; i++) {
					if (include(excludeSet, subDirs[i])) {
						this.findFiles(subDirs[i], result, fileFilter,
								excludeSet, excludeResult);
					} else {
						excludeFiles(subDirs[i], excludeResult);
					}
				}
			}
		} else {
			boolean added = false;

			for (int k = 0; (!added) && (k < result.length); k++) {
				if (fileFilter[k].accept(dirOrFile)) {
					result[k].add(dirOrFile);
					added = true;
				}
			}

			if (!added) {
				excludeResult.add(dirOrFile);
			}
		}
	}

	private void excludeFiles(File dir, List excludeResult) throws JscException {
		File[] files = dir.listFiles();

		if (files != null) {
			for (int i = 0; i < files.length; i++) {
				if (files[i].isFile()) {
					excludeResult.add(files[i]);
				}
			}
		}

		File[] subDirs = dir.listFiles(Sources.dirFilter);

		if (subDirs != null) {
			for (int i = 0; i < subDirs.length; i++) {
				excludeFiles(subDirs[i], excludeResult);
			}
		}
	}

	/**
	 * Recursively searches each specified directory from the comma-separated
	 * list of directories for files that pass the specified file filter.
	 * Returns a list of files that were found. List contains instances of
	 * <code>File</code>.
	 * 
	 * @param commaSepDirOrFileNames
	 *            comma-separated list of directory names
	 * @param fileFilter
	 *            filter the files have to pass
	 * @return list of <code>File</code> instances found
	 */
	public List[] findFiles(String commaSepDirOrFileNames,
			FileFilter[] fileFilter, Set excludeSet, List excludeResult)
			throws JscException {
		List[] result = new List[fileFilter.length];

		for (int k = 0; k < fileFilter.length; k++) {
			result[k] = new ArrayList();
		}

		String[] dirs = Util.tokenizeCommaSepString(commaSepDirOrFileNames);

		if (dirs != null) {
			for (int i = 0; i < dirs.length; i++) {
				if (Util.hasWildcards(dirs[i])) {

					String filename = dirs[i].replace(File.separatorChar, '/');
					int lastSlashIndex = filename.lastIndexOf('/');
					String dirname = null;

					if (lastSlashIndex == -1) {
						dirname = ".";
					} else {
						dirname = filename.substring(0, lastSlashIndex);
						if (lastSlashIndex < filename.length() - 1) {
							filename = filename.substring(lastSlashIndex + 1);
						} else {
							throw new JscException(
									"invalid wild card input source file:"
											+ " wild card can only be for file part of name :"
											+ dirs[i]);
						}
					}

					if (Util.hasWildcards(dirname)) {
						throw new JscException(
								"invalid wild card input source file:"
										+ " wild card can only be for file part of name :"
										+ dirs[i]);
					}

					File dir = new File(dirname);

					File[] wildcardFiles = dir
							.listFiles(new WildcardFileFilter(filename));

					if (wildcardFiles != null) {
						for (int j = 0; j < wildcardFiles.length; j++) {
							this.findFiles(wildcardFiles[j], result,
									fileFilter, excludeSet, excludeResult);
						}
					}
				} else {
					this.findFiles(new File(dirs[i]), result, fileFilter,
							excludeSet, excludeResult);
				}
			}
		}

		return result;
	}

	/**
	 * Determines if specified file falls into the exclude set. If it does
	 * returns <code>false</code>
	 * 
	 * @param excludeSet
	 *            set of excludes (path name suffixes) (can be null)
	 * @param file
	 *            file to test
	 * @return <code>false</code> if file matches any of the exclude suffixes
	 */
	private final boolean include(Set excludeSet, File file)
			throws JscException {

		if (excludeSet == null) {
			return true;
		}

		String filename = null;

		try {
			filename = getCanonicalPath(file);
		} catch (IOException exc) {
			throw new JscException(exc);
		}

		filename = filename.replace(File.separatorChar, '/');

		Iterator iter = excludeSet.iterator();

		while (iter.hasNext()) {
			Object nextPass = iter.next();

			if (nextPass instanceof String) {
				String pathSuffix = (String) nextPass;
				int delta = filename.length() - pathSuffix.length();
				if (delta >= 0) {
					if (filename.lastIndexOf(pathSuffix) == delta) {
						return false;
					}
				}
			} else {
				WildcardFileFilter filter = (WildcardFileFilter) nextPass;

				if (filter.accept(file)) {
					return false;
				}
			}
		}

		return true;
	}

	/**
	 * Returns a list of input <code>SourceFile</code> instances. The
	 * <code>Top.SOURCE_DIRS_PROPERTY_KEY</code> property is a comma-separated
	 * list of directories that will be searched recursively for files with
	 * suffix being one of the registered suffixes that have a source file
	 * factory associated with them. For each file a <code>SourceFile</code>
	 * instance is created with the appropiate factory and added to the
	 * resulting list.
	 * 
	 * @return list of <code>SourceFile</code> instances found
	 * @exception JscException
	 *                if finding the sources generates an error
	 */
	public List getSources() throws JscException {
		ArrayList sources = null;
		HashSet excludeSet = null;
		HashSet unparseSet = null;
		HashSet fwSet = null;
		HashMap encodings = null;
		Top top = Top.getSharedInstance();

		if (top.hasProperty(Top.SOURCES_EXCLUDE_PROPERTY_KEY)) {
			String commaSepExcludes = top
					.getProperty(Top.SOURCES_EXCLUDE_PROPERTY_KEY);
			String[] excludes = Util.tokenizeCommaSepString(commaSepExcludes);

			excludeSet = new HashSet();

			for (int i = 0; i < excludes.length; i++) {
				if (Util.hasWildcards(excludes[i])) {
					excludeSet.add(new WildcardFileFilter(excludes[i]));
				} else {
					excludeSet
							.add(excludes[i].replace(File.separatorChar, '/'));
				}
			}
		}

		if (top.hasProperty(Top.SOURCES_UNPARSABLE_PROPERTY_KEY)) {
			String commaSepUnparsables = top
					.getProperty(Top.SOURCES_UNPARSABLE_PROPERTY_KEY);
			String[] unparses = Util
					.tokenizeCommaSepString(commaSepUnparsables);

			unparseSet = new HashSet();

			for (int i = 0; i < unparses.length; i++) {
				if (Util.hasWildcards(unparses[i])) {
					unparseSet.add(new WildcardFileFilter(unparses[i]));
				} else {
					unparseSet
							.add(unparses[i].replace(File.separatorChar, '/'));
				}
			}
		}

		if (top.hasProperty(Top.SOURCES_FW_PROPERTY_KEY)) {
			String commaSepFWs = top.getProperty(Top.SOURCES_FW_PROPERTY_KEY);
			String[] fws = Util.tokenizeCommaSepString(commaSepFWs);

			fwSet = new HashSet();

			for (int i = 0; i < fws.length; i++) {
				if (Util.hasWildcards(fws[i])) {
					fwSet.add(new WildcardFileFilter(fws[i]));
				} else {
					fwSet.add(fws[i].replace(File.separatorChar, '/'));
				}
			}
		}

		List encodingProps = top
				.getPropertyKeys(Top.SOURCES_ENCODINGS_PROPERTY_KEY);

		if (encodingProps.size() > 0) {
			String prefixStr = Top.SOURCES_ENCODINGS_PROPERTY_KEY + ".";
			int prefixLength = prefixStr.length();

			encodings = new HashMap();
			Iterator iter = encodingProps.iterator();

			while (iter.hasNext()) {
				String encodingprop = (String) iter.next();

				int dotIndex = encodingprop.indexOf(prefixStr);

				if (dotIndex != -1) {
					String charsetName = encodingprop.substring(prefixLength);

					String commaSepDirs = top.getProperty(encodingprop);
					String[] dirs = Util.tokenizeCommaSepString(commaSepDirs);

					HashSet dirSet = new HashSet();

					for (int i = 0; i < dirs.length; i++) {
						if (Util.hasWildcards(dirs[i])) {
							dirSet.add(new WildcardFileFilter(dirs[i]));
						} else {
							dirSet
									.add(dirs[i].replace(File.separatorChar,
											'/'));
						}
					}

					encodings.put(charsetName, dirSet);
				}
			}
		}

		String commaSepNames = top.getProperty(Top.SOURCES_PROPERTY_KEY);

		String[] suffixes = new String[factories.size()];

		int i = 0;

		Iterator iter = factories.keySet().iterator();

		while (iter.hasNext()) {
			suffixes[i] = (String) iter.next();
			i++;
		}

		FileFilter[] fileFilter = null;

		boolean mirror = "true".equals(top
				.getProperty(Top.SOURCES_MIRROR_PROPERTY_KEY));

		if (mirror) {
			fileFilter = new FileFilter[2];
			fileFilter[1] = new SuffixFileFilter(suffixes, true);
		} else {
			fileFilter = new FileFilter[1];
		}

		fileFilter[0] = new SuffixFileFilter(suffixes);

		List excludeResult = new ArrayList();

		List[] files = this.findFiles(commaSepNames, fileFilter, excludeSet,
				excludeResult);
		sources = new ArrayList(files[0].size());

		iter = files[0].iterator();

		while (iter.hasNext()) {
			File file = (File) iter.next();

			if (include(excludeSet, file)) {
				SourceFile sourceFile = null;

				if (include(unparseSet, file)) {
					sourceFile = createSource(file);

					if (fwSet != null) {
						if (include(fwSet, file)) {
							sourceFile.tag(Sources.APPLICATION_FILE_TAG);
						} else {
							sourceFile.tag(Sources.FRAMEWORK_FILE_TAG);
						}
					}

					if (encodings != null) {
						Iterator eiter = encodings.entrySet().iterator();

						while (eiter.hasNext()) {
							Map.Entry entry = (Map.Entry) eiter.next();
							String charsetName = (String) entry.getKey();
							HashSet dirSet = (HashSet) entry.getValue();

							if (!include(dirSet, file)) {
								sourceFile.setEncoding(charsetName);
							}
						}
					}

				} else {
					sourceFile = new UnparsableSourceFile(file);
				}

				sources.add(sourceFile);
			} else if (mirror) {
				sources.add(new ImmutableSourceFile(file));
			}
		}

		if (mirror) {
			iter = files[1].iterator();

			while (iter.hasNext()) {
				File file = (File) iter.next();

				sources.add(new ImmutableSourceFile(file));
			}

			iter = excludeResult.iterator();

			while (iter.hasNext()) {
				File file = (File) iter.next();

				sources.add(new ImmutableSourceFile(file));
			}

		}

		return sources;
	}

	/**
	 * Creates a <code>SourceFile</code> instance for the specified file.
	 * 
	 * @param file
	 *            file for which the <code>SourceFile</code> instance is
	 *            created
	 * @return <code>SourceFile</code> instance
	 * @exception JscException
	 *                if no source file factory is found or file has no suffix
	 */
	private SourceFile createSource(File file) throws JscException {
		String filename = file.getName();
		int dotIndex = filename.lastIndexOf('.');

		if (dotIndex < (filename.length() - 2)) {
			String suffix = filename.substring(dotIndex + 1);

			SourceFileFactory factory = (SourceFileFactory) factories
					.get(suffix);

			if (factory == null) {
				throw new JscException(
						"no source file factory found for suffix " + suffix);
			}

			return factory.create(file);
		} else {
			throw new JscException("found file without a suffix " + filename);
		}
	}

	/**
	 * Returns the canonical pathname string from the specified file object. The
	 * difference between this implementation and java.io.File implementation is
	 * the ability to turn off the following of symlinks on UNIX platforms
	 * 
	 * 
	 * @return The canonical pathname string denoting the same file or directory
	 *         as this abstract pathname
	 * 
	 * @throws IOException
	 *             If an I/O error occurs, which is possible because the
	 *             construction of the canonical pathname may require filesystem
	 *             queries
	 * 
	 * @throws SecurityException
	 *             If a required system property value cannot be accessed.
	 * 
	 */
	public String getCanonicalPath(File aFile) throws IOException {
		String followSymLinksProp = Top.getSharedInstance().getProperty(
				Top.SOURCES_FOLLOW_SYMLINKS_PROPERTY_KEY);
		boolean followSymLinks = (followSymLinksProp == null)
				|| ("true".equals(followSymLinksProp));

		if ((File.separatorChar == '\\') || followSymLinks) {
			// use jdk implementation
			return aFile.getCanonicalPath();
		}

		// we use getAbsolutePath and resolve redundancies
		// but we don't follow symlinks

		String absPath = aFile.getAbsolutePath();
		LinkedList stack = new LinkedList();
		StringTokenizer tokenizer = new StringTokenizer(absPath, File.separator);

		while (tokenizer.hasMoreTokens()) {
			String pathElement = tokenizer.nextToken();

			if ((pathElement.length() == 0) || (pathElement.equals("."))) {
				// do nothing
			} else if (pathElement.equals("..")) {
				if (stack.size() == 0) {
					throw new IOException("invalid path " + absPath);
				}

				stack.removeLast();
			} else {
				stack.add(pathElement);
			}
		}

		if (stack.size() == 0) {
			return "/";
		}

		Iterator iter = stack.iterator();
		StringBuffer buffer = new StringBuffer();

		while (iter.hasNext()) {
			String pathElement = (String) iter.next();

			buffer.append('/');
			buffer.append(pathElement);
		}

		return buffer.toString();
	}

	/**
	 * Returns the canonical file object from the specified file object. The
	 * difference between this implementation and java.io.File implementation is
	 * the ability to turn off the following of symlinks on UNIX platforms
	 * 
	 * 
	 * @return The canonical file object
	 * 
	 * @throws IOException
	 *             If an I/O error occurs, which is possible because the
	 *             construction of the canonical pathname may require filesystem
	 *             queries
	 * 
	 * @throws SecurityException
	 *             If a required system property value cannot be accessed.
	 * 
	 */
	public File getCanonicalFile(File aFile) throws IOException {
		String followSymLinksProp = Top.getSharedInstance().getProperty(
				Top.SOURCES_FOLLOW_SYMLINKS_PROPERTY_KEY);
		boolean followSymLinks = (followSymLinksProp == null)
				|| ("true".equals(followSymLinksProp));

		if ((File.separatorChar == '\\') || followSymLinks) {
			// use jdk implementation
			return aFile.getCanonicalFile();
		}

		return new File(getCanonicalPath(aFile));
	}

	static public void main(String[] args) {

		System.out.println("WildcardFileFilter test");

		if (args.length != 1) {
			System.out.println("provide a search pattern");
			System.exit(-1);
		}

		try {
			File baseDir = new File(System.getProperty("user.dir"));

			System.out.println("starting search in directory " + baseDir);

			LinkedList dirs = new LinkedList();
			dirs.add(baseDir);

			WildcardFileFilter filter = new WildcardFileFilter(args[0]);

			while (dirs.size() > 0) {
				File dir = (File) dirs.removeLast();

				System.out.println("searching in " + dir);

				File[] matches = dir.listFiles(filter);

				if (matches != null) {
					for (int i = 0; i < matches.length; i++) {
						System.out.println(matches[i]);
					}
				}

				File[] subDirs = dir.listFiles(Sources.dirFilter);

				if (subDirs != null) {
					for (int i = 0; i < subDirs.length; i++) {
						dirs.add(subDirs[i]);
					}
				}
			}
		} catch (JscException exc) {
			exc.printStackTrace();
		}
	}

}
