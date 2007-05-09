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
import java.util.logging.*;
import java.util.zip.*;
import java.io.*;

import org.dojo.jsl.janitor.Janitor3;
import org.dojo.jsl.muffler.Muffler;

import org.dojo.jsl.parser.*;
import org.dojo.jsl.task.*;

import org.dojo.jsl.argparser.ArgParser;

import sisc.*;

/**
 * The <code>Top</code> class is the central starting point and controlling
 * facility for the <i>jsl</i> tool. Through its singleton obtained with the
 * call <code>Top.getSharedInstance()</code> it provides underlying
 * infrastructure services for all the tasks executed within a <i>jsl</i> run.
 * The singleton is also the object which executes the <i>jsl</i> run.
 * <code>Top</code> provides the <code>main</code> method for the <i>jsl</i>
 * tool.
 * <p>
 * 
 * What actually happens in a <i>jsl</i> run is specified declaratively with a
 * set of properties on the command line and/or in a property file. The
 * properties fall into two sets: common properties and task specific properties
 * for each task. Click <a href="doc-files/Properties.html">here</a> for all
 * properties known by default. As explained later in this doc and in the docs
 * for the <code>Sources</code> class and for the <code>Tasks</code> class
 * the tool is open to user-defined tasks, sources and properties for them.
 * <p>
 * 
 * The <code>main</code> method starts everything. It constructs the singleton
 * passing in the specified properties. The source directories are scanned for
 * the input source files, the temp directory and the logging are setup, all the
 * tasks are instantiated and then executed in order.
 * <p>
 * 
 * Each task can use the <code>Top</code> API for common services like the
 * logger instance, the list of source files and all specified properties.
 * <p>
 * 
 * The bootstrapping of this class registers all the necessary factories for the
 * built-in tasks and source file factories.
 * 
 * In addition to the built-in factories the <code>Top</code> singleton also
 * registers all the factories specified in the properties. This is the
 * mechanism to extend the built-in behavior with new tasks and new source file
 * types (for example java, idl etc).
 * 
 * 
 * @since JDK 1.4
 * @see Sources
 * @see Tasks
 */
public class Top extends Object {

	/**
	 * The version string
	 */
	static public String JSC_VERSION;

	/**
	 * The build string
	 */
	static public String JSC_BUILD;

	static {
		// read the build string and version string
		InputStream is = null;
		BufferedInputStream bis = null;

		try {
			is = Top.class.getResourceAsStream("version.properties");
			bis = new BufferedInputStream(is);
			Properties versionProps = new Properties();
			versionProps.load(bis);

			Top.JSC_VERSION = versionProps.getProperty("jsl.version", "v 1.0");
			Top.JSC_BUILD = versionProps.getProperty("jsl.build", "bxx");
		} catch (IOException exc) {
		} finally {
			try {
				if (bis != null) {
					bis.close();
				} else if (is != null) {
					is.close();
				}
			} catch (IOException exc) {
			}
		}
	}

	/**
	 * The default properties.
	 */
	static public Properties defaultProperties = new Properties();

	/**
	 * Convenience method for finding out java vm system properties. For
	 * non-existing properties returns a fallback value instead of throwing a
	 * runtime error.
	 * 
	 * @param propertyName
	 *            name of java vm property
	 * @param fallback
	 *            fallback value returned in case of problems retrieving the vm
	 *            property
	 * @return system property
	 */
	static private String getSystemProperty(String propertyName, String fallback) {
		try {
			return System.getProperty(propertyName, fallback);
		} catch (RuntimeException e) {
			return fallback;
		}
	}

	/**
	 * Property key of printer task output dir property.
	 * 
	 * @see Printer
	 */
	static public final String OUTPUT_DIR_PROPERTY_KEY = Printer.OUTPUT_DIR_PROPERTY_KEY;

	/**
	 * Property key of temporary directory property.
	 */
	static public final String TEMP_DIR_PROPERTY_KEY = "jsl.temp.dir";

	/**
	 * Property key of <i>jsl</i> home directory property.
	 */
	static public final String HOME_DIR_PROPERTY_KEY = "jsl.home.dir";

	/**
	 * Property key of logging directory property.
	 */
	static public final String LOG_DIR_PROPERTY_KEY = "jsl.log.dir";

	/**
	 * Property key for verbosity.
	 */
	static public final String VERBOSE_PROPERTY_KEY = "jsl.verbose";

	/**
	 * Property key to keep output to a minimum.
	 */
	static public final String QUIET_PROPERTY_KEY = "jsl.quiet";

	/*
	 * Property key to set dojo root
	 */
	static public final String DOJO_ROOT_PROPERTY_KEY = "jsl.dojo.root";

	/**
	 * Property key to collect metrics while executing.
	 */
	static public final String METRICS_PROPERTY_KEY = "jsl.metrics";

	/**
	 * Property key for file where to drop metrics.
	 */
	static public final String METRICS_FILE_PROPERTY_KEY = "jsl.metrics.file";

	/**
	 * Property key for metrics loader detail. Value should be one of "small",
	 * "medium" or "large". Default is small.
	 */
	static public final String METRICS_LOADER_TABLE = "jsl.metrics.loader.table";

	/**
	 * Property key for metrics loader detail generation, it specifies after
	 * which task to generate loader details. Value should be one a task name.
	 * Default is janitor.
	 */
	static public final String METRICS_LOADER_TASK = "jsl.metrics.loader.task";

	/**
	 * Property key of input source property.
	 */
	static public final String SOURCES_PROPERTY_KEY = "jsl.sources";

	/**
	 * Property key of framework input source property.
	 */
	static public final String SOURCES_FW_PROPERTY_KEY = "jsl.sources.fw";

	/**
	 * Property key of input source encodings.
	 */
	static public final String SOURCES_ENCODINGS_PROPERTY_KEY = "jsl.sources.encodings";

	/**
	 * Property key of unparsable input sources.
	 */
	static public final String SOURCES_UNPARSABLE_PROPERTY_KEY = "jsl.sources.unparsable";

	/**
	 * Property key for input sources to exclude (ignore)
	 */
	static public final String SOURCES_EXCLUDE_PROPERTY_KEY = "jsl.sources.exclude";

	/**
	 * Property key for directory mirror property
	 */
	static public final String SOURCES_MIRROR_PROPERTY_KEY = "jsl.sources.mirror";

	/**
	 * Property key for following symlinks
	 */
	static public final String SOURCES_FOLLOW_SYMLINKS_PROPERTY_KEY = "jsl.sources.follow.symlinks";

	/**
	 * Property key for declaring which file endings are for html files
	 */
	static public final String SOURCES_HTML_SUFFIX_LIST_PROPERTY_KEY = "jsl.sources.html.suffixes";

	/**
	 * Property key for declaring which file endings are for js files
	 */
	static public final String SOURCES_JS_SUFFIX_LIST_PROPERTY_KEY = "jsl.sources.js.suffixes";

	/**
	 * Property key for declaring the web root
	 */
	static public final String WEB_ROOT_PROPERTY_KEY = "jsl.web.root";

	/**
	 * Property key for declaring the web url mappings
	 */
	static public final String WEB_MAPS_PROPERTY_KEY = "jsl.web.maps";

	/**
	 * Property key for declaring the web url mappings
	 */
	static public final String WEB_TOKENS_PREFIX = "jsl.web.tokens.";

	/**
	 * Property key of task list property.
	 */
	static public final String TASK_LIST_PROPERTY_KEY = "jsl.tasklist";

	/**
	 * Name of <i>jsl</i> logger. Can be used to retrieve logger with
	 * <code>java.util.logging.Logger.getLogger()</code>.
	 */
	static public final String LOGGER_NAME = "jsl";

	/*
	 * OS independent file sperator property
	 */
	static public final String DIR_SEPERATOR = File.separator;

	/*
	 * Value is true when require syntax is encountered when parsing the html
	 * file
	 */
	static public Boolean requireProcessed = false;

	/**
	 * <i>jsl</i> logger
	 */
	static public Logger logger;

	static {
		// create the default jsl properties
		String userDir = Top.getSystemProperty("user.dir", ".");

		Top.defaultProperties.setProperty(TEMP_DIR_PROPERTY_KEY, Top
				.getSystemProperty("java.io.tmpdir", "."));
		Top.defaultProperties.setProperty(HOME_DIR_PROPERTY_KEY, Top
				.getSystemProperty("jsl.home", Top.getSystemProperty(
						"user.home", ".")));
		Top.defaultProperties.setProperty(SOURCES_PROPERTY_KEY, userDir);
		Top.defaultProperties.setProperty(WEB_ROOT_PROPERTY_KEY, ".");
	}

	// main will construct it
	static private Top sharedInstance;

	/**
	 * Returns the top singleton.
	 * 
	 * @return singleton
	 */
	static public Top getSharedInstance() {
		if (Top.sharedInstance == null) {
			throw new IllegalStateException(
					"too soon, jsl hasn't been created yet");
		}
		return Top.sharedInstance;
	}

	/**
	 * List of tasks. Contains instances of <code>Task</code>
	 */
	private List tasks;

	/**
	 * Properties specified for this <i>jsl</i> run.
	 */
	private Properties properties;

	/**
	 * List of input source file. Contains instances of <code>SourceFile</code>
	 */
	private List sources;

	/**
	 * Scheme interpreter
	 */
	private Interpreter interpreter;

	/**
	 * Web root file, can be null.
	 */
	private File webrootFile;

	/**
	 * Web maps, can be null.
	 */
	private Map webmaps;

	/**
	 * Default pretty printer style
	 */
	private PrettyPrinterStyle prettyPrinterStyle;

	/**
	 * Creates an instance of <code>Top</code> with the specified properties.
	 * 
	 * @param properties
	 *            <i>jsl</i> run properties
	 * @exception JscException
	 *                if something is wrong with the properties
	 */
	private Top(Properties properties) throws JscException {
		super();
		this.properties = properties;

		// setup the tmp directory
		String tmpDirStr = properties.getProperty(TEMP_DIR_PROPERTY_KEY);
		File tmpDir = new File(tmpDirStr);
		if (tmpDir.exists()) {
			if (!tmpDir.isDirectory()) {
				throw new JscException(
						"specified temporary directory is not really a directory");
			}
		} else {
			if (!tmpDir.mkdirs()) {
				throw new JscException(
						"could not create specified temporary directory");
			}
		}

		// setup the logging facility
		Logger jslLogger = Logger.getLogger(Top.LOGGER_NAME);

		boolean verbose = "true".equals(this.properties
				.getProperty(Top.VERBOSE_PROPERTY_KEY));
		Handler[] handlers = jslLogger.getHandlers();

		if (!verbose) {
			for (int i = 0; i < handlers.length; i++) {
				if (handlers[i] instanceof ConsoleHandler) {
					jslLogger.removeHandler(handlers[i]);
				}
			}

		} else {
			boolean hasConsoleHandler = false;

			for (int i = 0; i < handlers.length; i++) {
				if (handlers[i] instanceof ConsoleHandler) {
					hasConsoleHandler = true;
					break;
				}
			}

			if (!hasConsoleHandler) {
				jslLogger.addHandler(new ConsoleHandler());
			}
		}

		jslLogger.setUseParentHandlers(false);

		String logDirStr = properties.getProperty(LOG_DIR_PROPERTY_KEY);
		File logDir = new File(logDirStr);
		if (logDir.exists()) {
			if (!logDir.isDirectory()) {
				throw new JscException(
						"specified logging directory is not really a directory");
			}
		} else {
			if (!logDir.mkdirs()) {
				throw new JscException(
						"could not create specified logging directory");
			}
		}

		try {
			jslLogger.addHandler(new FileHandler(logDirStr + "/jsl.log"));
			FileHandler humanReadableFileHandler = new FileHandler(logDirStr
					+ "/jsl.logtext");
			humanReadableFileHandler.setFormatter(new SimpleFormatter());
			jslLogger.addHandler(humanReadableFileHandler);
		} catch (IOException exc) {
			throw new JscException("failed to create log file");
		}

		Top.logger = jslLogger;

		// at this point logging works

		Top.logger.log(Level.INFO, "Temp directory used by this run is "
				+ tmpDirStr);
		Top.logger.log(Level.INFO, "Logging directory used by this run is "
				+ logDirStr);

	}

	/**
	 * Executes the <i>jsl</i> run.
	 * 
	 * @exception JscException
	 *                if the run fails
	 */
	private void run() throws JscException {
		// clear the sources registry for the next run
		Sources sourcesRegistry = Sources.getSharedInstance();
		sourcesRegistry.clear();

		// clear the tasks registry for the next run
		Tasks tasksRegistry = Tasks.getSharedInstance();
		tasksRegistry.clear();

		// register built-in source file factories
		JSFile.register(sourcesRegistry);
		HtmlFile.register(sourcesRegistry);

		// register built-in task factories
		// LocalVariables.register(tasksRegistry);
		LocalVariables2.register(tasksRegistry);
		TestTreeMatcher.register(tasksRegistry);
		TestTreePatterns.register(tasksRegistry);
		Printer.register(tasksRegistry);
		// Janitor.register(tasksRegistry);
		// Janitor2.register(tasksRegistry);
		Janitor3.register(tasksRegistry);
		Muffler.register(tasksRegistry);
		Changer.register(tasksRegistry);
		// Jammer.register(tasksRegistry);
		Importer.register(tasksRegistry);
		RequireSrcImporter.register(tasksRegistry);
		PropertyCollector.register(tasksRegistry);

		// PENDING(uwe): analyze properties for additional task or source file
		// factories
		// and register those

		boolean collectMetrics = "true"
				.equals(getProperty(Top.METRICS_PROPERTY_KEY));

		String metricsLoaderDetailsTask = getProperty(Top.METRICS_LOADER_TASK);

		if (metricsLoaderDetailsTask == null) {
			metricsLoaderDetailsTask = Janitor3.TASK_NAME;
		}

		// read the source files
		sources = sourcesRegistry.getSources();

		if (sources.size() == 0) {
			throw new JscException("no source files found");
		}

		// Top.logger.log(Level.INFO, "Sources for this run = " +
		// this.sources.toString());

		// instantiate the tasks
		tasks = tasksRegistry.getTasks();

		if (tasks.size() == 0) {
			throw new JscException("no tasks for this run have been created");
		}

		Iterator iter = tasks.iterator();

		boolean dumpToSystemOut = (!("true".equals(properties
				.getProperty(Top.VERBOSE_PROPERTY_KEY)) || "true"
				.equals(properties.getProperty(Top.QUIET_PROPERTY_KEY))));

		String startMessage = "\n\njsl run, version " + Top.JSC_VERSION
				+ ", build " + Top.JSC_BUILD;

		Top.logger.log(Level.INFO, startMessage);

		Map context = new HashMap();

		StringBuffer summary = new StringBuffer();

		summary.append(startMessage);

		long totalTime = 0;

		while (iter.hasNext()) {
			Task task = (Task) iter.next();

			Top.logger.log(Level.INFO, "running task " + task.getName());
			long timeStart = System.currentTimeMillis();
			summary.append('\n');
			summary.append(task.execute(context));
			long timeEnd = System.currentTimeMillis();
			Top.logger.log(Level.INFO, "completed task " + task.getName()
					+ " in " + Util.millisToNice(timeEnd - timeStart));

			totalTime += timeEnd - timeStart;

		}

		summary.append("\nused temp directory ");
		summary.append(getProperty(TEMP_DIR_PROPERTY_KEY));

		summary.append("\nused logging directory ");
		summary.append(getProperty(LOG_DIR_PROPERTY_KEY));

		String outputDirnameOption = getProperty(Printer.OUTPUT_DIR_PROPERTY_KEY);
		boolean inplaceOption = "true"
				.equals(getProperty(Printer.INPLACE_PROPERTY_KEY));

		if (inplaceOption) {
			summary.append("\nwritten results in place");
		} else {
			summary.append("\nwritten results to output directory ");
			summary.append(outputDirnameOption);
		}

		boolean gotErrorsFromInput = false;

		iter = getSources().iterator();

		while (iter.hasNext()) {
			SourceFile source = (SourceFile) iter.next();

			if (source.failedDuringRun()) {
				summary.append("\ninput file ");
				summary.append(source.getFilename());
				summary
						.append(" failed (parsing or IO error): check logs for details");
				gotErrorsFromInput = true;
			}
		}

		String summaryMessage = summary.toString();
		Top.logger.log(Level.INFO, summaryMessage);
		if (dumpToSystemOut) {
			System.out.println(summaryMessage);
		}

		String endMessage = null;

		if (gotErrorsFromInput) {
			endMessage = "\njsl run, version "
					+ Top.JSC_VERSION
					+ ", build "
					+ Top.JSC_BUILD
					+ ": completed in "
					+ Util.millisToNice(totalTime)
					+ ". There were errors from processing input files. Check logs for details and treat results with care.";
		} else {
			endMessage = "\njsl run, version " + Top.JSC_VERSION + ", build "
					+ Top.JSC_BUILD + ": completed succesfully in "
					+ Util.millisToNice(totalTime);
		}

		Top.logger.log(Level.INFO, endMessage);

		if (dumpToSystemOut) {
			System.out.println(endMessage);
		}
	}

	/**
	 * Returns the property with specified name.
	 * 
	 * @param propertyName
	 *            property name
	 * @return property
	 */
	public String getProperty(String propertyName) {
		return properties.getProperty(propertyName);
	}

	/**
	 * Returns <code>true</code> if it knows about property with specified
	 * name.
	 * 
	 * @param propertyName
	 *            property name
	 * @return <code>true</code> if known
	 */
	public boolean hasProperty(String propertyName) {
		return properties.containsKey(propertyName);
	}

	/**
	 * Returns the properties of the run
	 * 
	 * @return properties
	 */
	public Properties getProperties() {
		return properties;
	}

	/**
	 * Returns a list with all the available property keys that start with the
	 * specified prefix and that have been set for the receiver and the current
	 * run.
	 * 
	 * @param prefix
	 *            property key prefix
	 * @return a list of property keys (strings), list could be empty but is
	 *         never null
	 */
	public List getPropertyKeys(String prefix) {
		ArrayList list = new ArrayList();

		Iterator iter = properties.keySet().iterator();

		while (iter.hasNext()) {
			String key = (String) iter.next();

			if (key.startsWith(prefix)) {
				list.add(key);
			}
		}

		return list;
	}

	/**
	 * Returns the default pretty printer style that is specified by the jsl
	 * properties.
	 * 
	 * @return a PrettyPrinterStyle
	 */
	public PrettyPrinterStyle getPrettyPrinterStyle() {
		if (prettyPrinterStyle == null) {
			prettyPrinterStyle = new PrettyPrinterStyle();
		}

		return prettyPrinterStyle;
	}

	/**
	 * Returns the web root file or null if none has been specified in the run.
	 * 
	 * @return web root file
	 */
	public File getWebRootFile() {
		if (webrootFile == null) {
			String webrootPath = getProperty(Top.WEB_ROOT_PROPERTY_KEY);

			if (webrootPath != null) {
				webrootFile = new File(webrootPath);
			}
		}

		return webrootFile;
	}

	/**
	 * Returns a map of web mappings. Map could be empty. Keys are strings with
	 * url path segments and values are instances of <code>File</code> that
	 * are the mappings to the local file system. The map is a sorted map with
	 * the longer url path segments coming first in a key iteration.
	 * 
	 * @return web maps
	 */
	public Map getWebMaps() {
		if (webmaps == null) {
			String[] webmapsProp = Util
					.tokenizeCommaSepString(getProperty(Top.WEB_MAPS_PROPERTY_KEY));

			if (webmapsProp != null) {
				webmaps = new TreeMap(new Comparator() {
					public int compare(Object o1, Object o2) {
						String s1 = (String) o1;
						String s2 = (String) o2;

						return (s2.length() - s1.length());
					}

					public boolean equals(Object obj) {
						return false;
					}
				});

				for (int i = 0; i < webmapsProp.length; i += 2) {
					webmaps.put(webmapsProp[i], webmapsProp[i + 1]);
				}
			}
		}

		return webmaps;
	}

	/**
	 * Returns an unmodifiable list of input sources. The elements in the
	 * returned list implement the <code>SourceFile</code> interface.
	 * 
	 * @return input sources
	 * @see Sources
	 * @see SourceFile
	 */
	public List getSources() {
		return Collections.unmodifiableList(sources);
	}

	/**
	 * Adds a source to the list of input sources. Can be used by tasks to
	 * expand the set of files for a run.
	 * 
	 * @param source
	 *            source to add
	 */
	public void addSource(SourceFile source) {
		sources.add(source);
	}

	/**
	 * Adds list of sources to the list of input sources. Can be used by tasks
	 * to expand the set of files for a run.
	 * 
	 * @param sourceList
	 *            source to add
	 */
	public void addSources(List sourceList) {
		Iterator iter = sourceList.iterator();

		while (iter.hasNext()) {
			sources.add((SourceFile) iter.next());
		}
	}

	/**
	 * Returns the scheme interpreter for evaluating jsl scheme expressions
	 */
	public Interpreter getSchemeInterpreter() throws JscException {
		if (interpreter == null) {
			AppContext ctx = new AppContext();
			Context.register("jsl", ctx);
			interpreter = Context.enter("jsl");

			DataInputStream dis = null;
			BufferedInputStream bis1 = null;
			GZIPInputStream gis = null;
			BufferedInputStream bis2 = null;
			InputStream is = null;

			try {
				is = Top.class.getResource("resources/scheme/sisc.heap")
						.openStream();
				bis2 = new BufferedInputStream(is, 90000);
				gis = new GZIPInputStream(bis2);
				bis1 = new BufferedInputStream(gis);
				dis = new DataInputStream(bis1);
				interpreter.ctx.loadEnv(interpreter, dis);
			} catch (IOException exc) {
				throw new JscException(exc);
			} finally {
				try {
					if (dis != null) {
						dis.close();
					} else if (bis1 != null) {
						bis1.close();
					} else if (gis != null) {
						gis.close();
					} else if (bis2 != null) {
						bis2.close();
					} else if (is != null) {
						is.close();
					}
				} catch (IOException exc) {
				}
			}
		}

		return interpreter;
	}

	static private void printHelp() {
		System.out.println("");
		System.out.println("jsl, version " + Top.JSC_VERSION + ", build "
				+ Top.JSC_BUILD);
		System.out
				.println("Copyright (c) 2004-2005, The Dojo Foundation. All rights reserved");
		System.out.println("");
		System.out.println("\tUsage: org.dojo.jsl.top.Top <options>");
		System.out.println("\tFollowing options are supported:");
		System.out.println("\t\t-s or --sources");
		System.out.println("\t\t\tcomma-separated list of sources");
		System.out.println("\t\t\t(optional argument, default");
		System.out.println("\t\t\tvalue is current directory)");
		System.out.println("\t\t-e or --exclude");
		System.out.println("\t\t\tcomma-separated list of path suffixes");
		System.out.println("\t\t\tinput source files that are ignored");
		System.out.println("\t\t-o or --outputdir");
		System.out
				.println("\t\t\toutput directory (optional argument, default");
		System.out.println("\t\t\tvalue subdir of tempdir)");
		System.out.println("\t\t-t or --tempdir");
		System.out.println("\t\t\ttemp directory (optional argument, default");
		System.out.println("\t\t\tvalue is system temp directory)");
		System.out.println("\t\t-l or --logdir");
		System.out.println("\t\t\tlog directory (optional argument, default");
		System.out.println("\t\t\tvalue is subdir of tempdir)");
		System.out.println("\t\t-j or --homedir");
		System.out
				.println("\t\t\tjsl home directory (optional argument, default");
		System.out.println("\t\t\tvalue is user home directory)");
		System.out.println("\t\t-a or --tasks");
		System.out
				.println("\t\t\tcomma-separated list of tasks (required argument");
		System.out.println("\t\t\tif argument -p is not present)");
		System.out.println("\t\t-p or --prj");
		System.out.println("\t\t\tname of property file (required argument");
		System.out.println("\t\t\tif argument -a is not present)");
		System.out.println("\t\t-P or --prop");
		System.out.println("\t\t\tproperty key value pair separated by =");
		System.out.println("\t\t-v or --verbose");
		System.out.println("\t\t\tverbose mode");
		System.out.println("\t\t-q or --quiet");
		System.out.println("\t\t\tquiet mode");
		System.out.println("\t\t-h or --help");
		System.out.println("\t\t\tprints this help message");
		System.out.println("");
	}

	static public void main(String[] args) {
		HashMap argMaps = new HashMap();
		argMaps.put("s", "sources");
		argMaps.put("e", "exclude");
		argMaps.put("o", "outputdir");
		argMaps.put("t", "tempdir");
		argMaps.put("l", "logdir");
		argMaps.put("j", "homedir");
		argMaps.put("a", "tasks");
		argMaps.put("p", "prj");
		argMaps.put("P", "prop");
		argMaps.put("h", "help");
		argMaps.put("?", "help");
		argMaps.put("v", "verbose");
		argMaps.put("q", "quiet");

		HashMap noArgValues = new HashMap();
		noArgValues.put("help", "true");
		noArgValues.put("verbose", "true");
		noArgValues.put("quiet", "true");
		
		HashMap parsedArgs = ArgParser.parse(args, argMaps, noArgValues);

		Properties properties = new Properties(Top.defaultProperties);

		String tasks = null;
		String prj = null;
		
		Set keys = parsedArgs.keySet();
		Iterator keyIterator = keys.iterator();
		String key;
		String value;
		while(keyIterator.hasNext()) {
			key = (String)keyIterator.next();
			value = (String)parsedArgs.get(key);
			if (key.equals("sources")) {
				properties.setProperty(Top.SOURCES_PROPERTY_KEY, value);
			} else if (key.equals("exclude")) {
				properties.setProperty(Top.SOURCES_EXCLUDE_PROPERTY_KEY, value);
			} else if (key.equals("outputdir")) {
				properties.setProperty(Top.OUTPUT_DIR_PROPERTY_KEY, value);
			} else if (key.equals("tempdir")) {
				properties.setProperty(Top.TEMP_DIR_PROPERTY_KEY, value);
			} else if (key.equals("logdir")) {
				properties.setProperty(Top.LOG_DIR_PROPERTY_KEY, value);
			} else if (key.equals("homedir")) {
				properties.setProperty(Top.HOME_DIR_PROPERTY_KEY, value);
			} else if (key.equals("tasks")) {
				tasks = value;
			} else if (key.equals("prj")) {
				prj = value;
			} else if (key.equals("prop")) {
				int equalIndex = value.indexOf('=');
				if ((equalIndex != -1) && (equalIndex != 0)
						&& (equalIndex != value.length() - 1)) {
					properties.setProperty(value.substring(0, equalIndex),
							value.substring(equalIndex + 1));
				}
			} else if (key.equals("verbose")) {
				properties.setProperty(Top.VERBOSE_PROPERTY_KEY, "true");
			} else if (key.equals("quiet")) {
				properties.setProperty(Top.QUIET_PROPERTY_KEY, "true");
			} else {
				Top.printHelp();
				System.exit(0);
			}
		}


		if ((tasks == null) && (prj == null)) {
			System.err
					.println("no tasks have been defined. use option -a or -p to define some tasks");
			Top.printHelp();
			System.exit(-1);
		}

		// look for a default jsl.prj in the directory where jsl is started
		if (prj == null) {
			File defaultPrjFile = new File("jsl.prj");

			if (defaultPrjFile.exists()) {
				prj = "jsl.prj";
			}
		}

		// if prj is defined it overrides all other options
		if (prj != null) {
			Properties prjProperties = new Properties(Top.defaultProperties);
			FileInputStream fis = null;
			BufferedInputStream bis = null;
			try {
				fis = new FileInputStream(prj);
				bis = new BufferedInputStream(fis);
				prjProperties.load(bis);
			} catch (IOException exc) {
				System.err.println("could not read prj file " + prj
						+ " due to exception " + exc);
				System.exit(-1);
			} finally {
				try {
					if (bis != null) {
						bis.close();
					} else if (fis != null) {
						fis.close();
					}
				} catch (IOException exc) {
				}
			}

			// cmd line wins over prj file
			prjProperties.putAll(properties);
			properties = prjProperties;
		}

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

		if (tasks != null) {
			properties.setProperty(Top.TASK_LIST_PROPERTY_KEY, tasks);
		}

		try {
			Top.main(properties);
		} catch (Throwable exc) {
			// log the exception
			if (Top.logger != null) {
				Top.logger.log(Level.SEVERE, "run failed", exc);
			}
			System.out.println("run failed");
			if ("true".equals(properties.getProperty(Top.VERBOSE_PROPERTY_KEY))) {
				exc.printStackTrace();
			} else {
				System.out
						.println("to get more info run it again, this time with the -v flag");
			}
			System.out
					.println("Houston, we have a problem. Run failed, run failed.");
			System.out.println("got exception " + exc);
			System.out.println("Beep, beep");
			System.out.println("Roger that");
			System.exit(-1);
		}

		System.exit(0);
	}

	static public void main(Properties properties) throws JscException {
		Top.sharedInstance = new Top(properties);
		Top.sharedInstance.run();
	}

}
