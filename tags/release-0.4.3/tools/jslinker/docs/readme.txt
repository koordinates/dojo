 


JavaScript Linker (JSL) - Alpha 1 : Readme
------------------------------------------------------------------------

Copyright (c) 2004-2006, The Dojo Foundation, All Rights Reserved


Contents

    * 1.0 Overview
    * 2.0 Requirements
    * 3.0 Installation Instructions 
    * 4.0 Documentation


1.0 Overview

The JavaScript source code can be represented in different levels of granularity. 
The JavaScript Linker uses the Abstract Syntax Trees (ASTs) representation, which represents 
the lowest level of detail, to model the source code. One of the main task for this 
project was to write a JavaCC compatible grammar that strictly follows the ECMA 
Specification. JavaCC uses this grammar to build a custom parser than can read and 
analyze the JavaScript source, which in turn, is used to build the JavaScript Linker.

The purpose of JavaScript Linker is to process HTML/JavaScript code base to prepare code for 
deployment by reducing file size, create source code documentation, obfuscate source 
code to protect intellectual property, and help gather source code metrics for source 
code analysis & improvements. The source code modifications can either be made in place 
by overwriting the input files, or can be saved to a user-specified output directory.

This latest alpha release of the JavaScript Linker uses the new ECMA grammar (supports ECMA-262 
Standard 3rd edition). This release is meant for testing purposes only.

 


Currently Supported Tasks

This is the list of JavaScript Linker tasks supported in this release:

   1.

      *Import* - Import JavaScript file from Html documents

      Import task finds and imported all input source files which have
      not been explicitly declared by the user, but are referenced with
      src attributes in HTML.

   2.

      *Require* - Import source files specified by the require
      statements included in the Dojo source code.

      Require task helps process require statements referenced in the
      Dojo source code. This task, like the ant build scripts included
      with Dojo, helps in constructing a custom profile which includes
      only those modules used by your application. This tool
      automatically processess the require statements from the Dojo
      source without any intervention from the user.

   3.

      *Janitor* - unused function removal via dependency analysis

      Janitor task is used to strip out unused functions from the
      JavaScript source code. Janitor performs a static code analysis
      constructing a function call graph for all global functions. Entry
      points are also calculated from all source files that have
      imported after processing the Dojo require statements. Every
      function not reachable from the graph is considered unused and
      gets removed.

      There are two cases where the analysis needs help from the user:
      Functions that are only called by the server (through the pipe),
      and functions that are composed with string concatenation of the
      function name which then gets passed to eval or similar reflective
      functionality. The user can enumerate the function names in these
      cases in a property that declares them protected from removal.

      The entry points are calculated from all global statements in all
      JavaScript source code visible to the tool in that run. This might
      not be desirable, so there is a property that when set to true
      makes the task only consider JavaScript code that was actually
      imported in an import statement in an HTML file.

          * *Known Issues:*

            The current version of the code is not very aggressive in
            removing unsed function. It always errs on the side of
            caution. However, you can control how aggresive Janitor is
            by changing a property called
            /'task.janitor.process.global'/ in the project file. Setting
            this property helps remove more unused functions but it also
            has the potential to break some test cases.

          *

            HTML event handlers are *ignored* and they are *not used* as
            entry points into the call graph. This feature is disabled
            because the html parser used with the earlier version had a
            incompatible licence. This feature will be supported after
            the work on new html grammar is complete.

      Janitor task will be improved incrementally in the later releases.

   4.

      *Muffler* - assert/alert, developer "noise" removal

      Muffler is used to remove developer noise, like alert and assert
      statements. For specified identifiers that match declared global
      functions, the function declarations themselves are removed.
      Examples of statements that are removed are:

      	assert( foo < 3 );

      	alert( "this is a fire drill" );

      It can also removes code that cannot be reached if certain
      specified identifiers have declared Boolean values. For example,
      by declaring the identifier debug = false, the code inside the
      following if-statement cannot be reached, and so is stripped:

      	if( debug ) {

      		alert( "here" );

      	} 

       

   5.

      *Pretty Printer * ? Writing back the results from other tasks

      Print writes out the result from the other tasks and strips out
      whitespace, newlines and/or comments if desired. If this task is
      omitted from the task list, then the run is like a dry-run that
      won't write out anything. The user can look in the log files to
      check that the run is doing what is expected, and then add this
      task to the task list to do the actual writing out of the results.

      The print result is written out in an output directory and the
      files are written in a directory tree structure that is identical
      to the input directory structure. Since the input can be a list of
      input directories, the output tree structure will start at the
      point where the input directories differ (the common prefix is not
      mirrored). The output can also be done in place by specifying a
      property.

      By specifying pretty-printing properties, one can control the
      stripping of newlines, whitespace and comments.

          * *Known Issues:*

            This version does not support stripping of newline characters

 


Additional Tasks

This is a list of JavaScript Linker tasks that will supported in future releases:

   1.  *Metrics* ? Source code metric analysis during a JavaScript Linker run

   2.  *Lint* - Checks JavaScript and HTML input for known problems

   3.  *Jammer * - concatenates individual JavaScript files for custom builds/packaging

   4.  *Jabber* - Obfuscate JavaScript source code

   5.  *Vorpal* - Deobfuscate previously obfuscated source code

   6.  *Ogredoc* - Generates HTML documentation from the JavaScript source code

 


2.0 Requirements

   1. JDK 1.5.x installed with *JAVA_HOME* pointing to that JDK.

   2. You will need Apache Ant 1.6.x installed with *ANT_HOME* set.

 


3.0 Installation Instructions

   1. Download JSL from the SVN Repository:

              svn co http://svn.dojotoolkit.org/dojo/trunk/tools/jslinker

   2. Edit the included build.properties and set the location for the
      *ANT_HOME* property

   3. Then build the project using:


      	ant dist
        

   4. There are 8 test cases bundled with this release. To run each test
      case using ant, navigate to *'jsl/bin'* and type:


      	ant test1
        

      Test cases test1 through test8 are available for testing.

   5. To run the tasks from the command line, navigate to *'jsl/bin'*
      and type:


      	java -Xms8m -Xmx200m -cp jsl.jar;sisc.jar;bcel.jar org.dojo.jsl.top.Top --verbose --prj jsl.prj --sources ../tests/test_Colorspace.html
        

   6. You can also use the included shell script:


      	jsc/bin/jsl --verbose --prj jsl.prj --sources ../tests/test_Colorspace.html
       

   7. After the JavaScript Linker run, by default:
          * Modified files are written to the *'jsl/tmp'* directory.
          * Log files are written to the *'jsl/log'* directory.

 

4.0 Documentation


JSL Options

The following options are supported:

    *JSL command line options:*

    *-s or --sources*

        comma-separated list of directories or files
        (optional argument, default value is current directory,
        wildcards * and *?* are supported)

    *-e or --exclude*

        comma-separated list of path suffixes
        input source files that are ignored
        (wildcards *** and *?* are supported)

    *-o or --outputdir*

        output directory

        (optional argument, default value is current directory)

    *-t or --tempdir*

        temp directory
        (optional argument, default value is system temp directory)

    *-l or --logdir*

        log directory
        (optional argument, default value is current directory)

    *-j or --homedir*

        jsl home directory
        (optional argument, default value is user home directory)

    *-a or --tasks*

        comma-separated list of tasks <#Tasks>
        (required argument if argument *-p* is not present)

    *-p or --prj*

        name of property file
        <http://dig.netscape.com/public-doc/frameworks/template.prj>
        (required argument if argument *-a* is not present, if there
        is a file called "jsl.prj" in the current directory it will be used
        in case -p is not specified)

    *-P or --prop*

        property key value pair separated by *=*

    *-v or --verbose*

        verbose mode (e.g. more output during tool run)

    *-h or --help*

        prints this help message

 

It is recommended for normal project deployment use to create a property
*.prj* file that defines all the properties and customizes the tool for
the project. This is less awkward than creating long command lines with
multiple properties. A template.prj file is provided for convenience.
All the available properties are described there as well as in this
document. At minimum one should define a list of input directories, an
output directory and a list of tasks. If you name your property file
"jsl.prj" and start jsl from the directory where that file lives it will
pick it up automatically without needing a -p option at startup.

 

Setting Up a Project File

Open the template.prj file and set values for the properties defined there. 
The values you set will control what input <#SpecifyingInput> gets 
processed, what tasks get executed, and tailors the individual tasks to the 
needs of your project. The documentation for each property specifies valid 
property values, and default values when no value is specified. 

Note: Don't use quotes for any specified values.

 

Specifying Input

The input HTML and JavaScript files should contain valid JavaScript and
HTML (i.e. follow standards). If it happens that the tool cannot parse a
certain file, it can be excluded from the run.

Here are all the properties that specify input to the tool:

    JSL Input Properties:

    jsl.sources
    The list of input source directories and files.
    (optional property, default value is the directory where JSL was
    started)

        *specified with* command line option *-s* or *--sources*
        *value* is a comma-separated list of directories and files

        Example:

        jsl.source.dirs = /projects/framework/content,/projects/music/content/script

        *

    *jsl.sources.encodings*
    Marks sources as having a specific encoding. Each property ends with
    the name of the encoding.

        *value* is a comma-separated list of filename patterns.

        *Example:*

            *jsl.rcoder.sources.encodings.Big5=**/src/localized/chinese/**

    *jsl.sources.unparsable*
    Marks sources as unparsable by jsl. This means that jsl will not
    attempt to parse them but will consider them as immutable input when
    executing tasks (for example things referenced in those files are
    still protected from janitor deletion).

        *value* is a comma-separated list of filename patterns.

        *Example:*

            *

            jsl.rcoder.sources.unparsable=**/src/heavy_jsp/*

            *

    *jsl.sources.html.suffixes*
    Specifies which suffixes are used for HTML files.
    (optional property, default value is html, htm, jhtml, sxi, jsi,
    adp. jsp)

        *value* is a comma-separated list of suffixes.

    *jsl.sources.js.suffixes*
    Specifies which suffixes are used for JavaScript files.
    (optional property, default value is |js|).

        *value* is a comma-separated list of suffixes.

    *jsl.sources.exclude*
    The list of input source entities to ignore.
    (optional property)

        *value* is a comma-separated list of filename patterns

        *Example:*

            *

            jsl.source.exclude = main.adp,header.adp

            *

    Both these properties support the standard file system wildcards ***
    and *?*.
    For the first property, only the last part of a path can have
    wildcards.
    For the second property, any part can have wildcards.

    For certain tasks it is desirable to only consider HTML files and
    the files that those
    HTML files import with src attributes (jammer2 and janitor can
    operate in this
    mode). To resolve paths specified in src attributes in HTML to real
    files on local
    disks, the tool needs to know the Web root directory specified with
    this property:

    *jsl.web.root*
    The Web root directory; needed to resolve absolute paths in src
    attributes
    in HTML.
    (optional property, default value is the directory where JSL was
    started)

        *value* is a directory

        *Example:*

            *

            jsl.web.root = /projects/framework/content

            *


    For cases where the Web structure has url mappings to several
    directories,
    the following property can be used:

    *jsl.web.maps*
    Resolves absolute paths in src attributes in HTML.
    (optional property)

        * value* is a comma-separated list of key-value pairs
        *keys* are url prefixes, *values* are directories on the local
        file system

        *Example:*

            *

            jsl.web.maps = /fw,dig/framework/client/content,/fw/images,dig/images,/


            music,dig/client/music* 


 

*File Patterns*

File patterns as property values are very useful to conveniently declare
a set of files without having to list each file in the set. JSL supports
the classic file system patterns |*| and |?| and also supports the |**|
pattern. The *ANT* <#ANT> documentation explains patterns best:

 

*Patterns*

Patterns are used for inclusion and exclusion. These patterns look very
much like the patterns used in DOS and UNIX:

|*| matches zero or more characters, |?| matches one character.

    *Examples*:

    |**.java*| matches |.java|, |x.java|and |FooBar.java|, but not
    |FooBar.xml| (does not end with .java).

    |*?.java*| matches |x.java|, |A.java|, but not |.java| or |xyz.java|
    (both don't have one character before |.java|).

    Combinations of *'s and ?'s are allowed.

Matching is done per-directory. This means that the first directory in
the pattern is matched against the first directory in the path to match,
then the second directory is matched, and so on. For example, if the
pattern is |/?abc/*/*.java| and the path is |/xabc/foobar/test.java|,
the first |?abc| is matched with |xabc|, then |*| is matched with
|foobar|, and finally |*.java| is matched with |test.java|. They all
match, so the path matches the pattern.

To make things a bit more flexible, we add one extra feature, which
makes it possible to match multiple directory levels. This can be used
to match a complete directory tree, or a file anywhere in the directory
tree. To do this, |**| must be used as the name of a directory. When
|**| is used as the name of a directory in the pattern, it matches zero
or more directories. For example: |/test/**| matches all
files/directories under |/test/|, such as |/test/x.java|, or
|/test/foo/bar/xyz.html|, but not |/xyz.xml|.

The properties that accept values with file patterns are:

    *jsl.sources* (X)
    *jsl.sources.exclude
    jsl.sources.fw
    jsl.sources.encodings*

(X) /*Note:* This property can only have |*| and |?| in the last
directory part and no |**| pattern./

 


*File Encodings*

JSL reads an application's source code with the standard ISO-8859-1
encoding. This is usually sufficient for correctly interpreting the data
in the files, and correctly writing the results out after processing.
However, international application source code can have files localized
for particular languages that need different encodings. JSL supports
these encodings by correctly reading the files using them, and
respecting the encoding when writing out. Because it is impossible to
guess the encoding of a text file from the stream of data the file
contains, it is necessary to specify to JSL with a set of properties any
file encoding that differs from the default ISO-8859-1 encoding. For
example, to specify a group of files having the chinese encoding |Big5|
the encodings property would be set as follows:

|jsl.sources.encodings.Big5=**/src/localized/chinese/*|

All the charset encoding names supported by java j2se 1.5 are legal
encoding names (see Encoding in JDK 1.5
<http://java.sun.com/j2se/1.4/docs/guide/intl/encoding.doc.html>).


Tasks

The list of tasks includes: import <#Import>, require <#Require>, print
<#Print>, janitor <#Janitor> , muffler <#Muffler>. More tasks will follow.

The print <#Print> task writes out the results. The import <#Import>
task finds input source files which have not been explicitly declared by
the user, but are referenced with src attributes in HTML. The import
task is usually the first, and the print task is usually the last. The
order in which the tasks are specified is important because the tasks
form a pipeline, and the output of one task is the input to the next.

The *-a* option (or the *jsl.tasklist* property ) should be a
comma-separated list of task names.

    * Example command line:*

        *-a import,muffler,janitor,jammer2,jabber,print *

The task list can also be specified in the property file:

    *jsl.tasklist* property
    Tasks to be executed by JSL in this run
    (required property)

        *value* is a comma-separated list of task names

        *Example:*

            * jsl.tasklist = import,muffler,janitor,jammer2,jabber,print*



*Short description of each task and its properties.*

*Import*

Import task finds input source files which have not been explicitly
declared by the user, but are referenced with src attributes in HTML.

*Require*

Require task helps process require statements referenced in the Dojo
source code. This task, like the ant build scripts included with Dojo,
helps in constructing a custom profile which includes only those modules
used by your application. This tool automatically processess the require
statements from the Dojo source without any intervention from the user.


*Janitor*

Use janitor task to strip out unused functions from the JavaScript
source code. Janitor performs a static code analysis constructing a
function call graph for all global functions. Global statements are
considered entry points into the call graph. Every function not
reachable from the graph is considered unused and gets removed.

There are two cases where the analysis needs help from the user:
Functions that are only called by the server (through the pipe), and
functions that are composed with string concatenation of the function
name which then gets passed to eval or similar reflective functionality.
The user can enumerate the function names in these cases in a property
that declares them protected from removal.

The entry points are calculated from all global statements in all
JavaScript source code visible to the tool in that run. This might not
be desirable, so there is a property that when set to true makes the
task only consider JavaScript code that was actually imported in an
import statement in an HTML file.

Here are all the properties for the janitor task that can be specified
in a property file:


    * Janitor Properties:*

    * task.janitor.entries*
    The global entry points into the code (things that are used, but not
    called explicitly in code). These are the identifiers that should be
    protected from removal but won't get revealed as such by the call
    graph analysis. Entries should be simple identifiers, not composite
    names. For example to protect |MUMusic.render| the entry |render|
    should be added to the list. Simple wildcards are supported: * and
    ?. They have the same meaning as in file system wildcards.
    (optional property)

        * value* is comma-separated list of identifiers or identifier
        wildcards

        *Example:*

            * task.janitor.entries = foo,bar,handle*,*


    *task.janitor.process.js.imports.only*
    The flag that controls whether only JavaScript source files which
    are actually imported by HTML files are considered when running janitor
    (optional property, default is false)

        * value* is true or false

    */ Note:/*/ When setting the second property to true, the tool will
    need the webroot property set to a valid directory./

          



*Muffler*

Muffler task removes developer noise like alert and assert statements.
For now, only explicit function calls are being removed. For specified
identifiers that match declared global functions, the function
declarations themselves are removed. Examples of statements that are
removed are:

 
	assert(foo < 3);

	alert("this is a fire drill");
  


The identifiers can be composite names like *dig.debug.log* and can have
wildcards in them. The wildcard syntax is the familiar syntax from file
system wildcards, with *** and *?* augmented with an additional wildcard
pattern **** for any number of segments in a composite identifier.

    * Example:*

        * dig.log.** matches dig.log.foo, dig.log.info,
        dig.log.info.warning etc.*

Muffler also removes code that cannot be reached if certain specified
identifiers have declared Boolean values. For example, by declaring the
identifier *debug = false*, the code inside the following if-statement
cannot be reached, and so is stripped:

 
	if ( debug ) {

		alert ( "here" );

	}
  


Here are all the properties for the muffler task that can be specified
in a property file:


    * Muffler Properties:*

    * task.muffler.noise*
    The function names that need to be deleted
    (required property for this task

        * value* is comma-separated list of identifiers

        *Example:*

            * task.muffler.noise = assert,alert*


 

*Print*

Print task writes out the result, stripping whitespace, newlines and/or
comments if desired. If this task is omitted from the task list, then
the run is like a dry-run that won't write out anything. The user can
look in the log files to check that the run is doing what is expected,
and then add this task to the task list to do the actual writing out of
the results. The exception is the ogredoc task that generates output
without the help of this task.

The print result is written out in an output directory and the files are
written in a directory tree structure that is identical to the input
directory structure. Since the input can be a list of input directories,
the output tree structure will start at the point where the input
directories differ (the common prefix is not mirrored). The output can
also be done in place by specifying a property.

By specifying pretty-printing properties, one can control the stripping
of newlines, whitespace and comments.

Here are all the properties for the print task that can be specified in
a property file:

    * JSL Print Properties:*

    * jsl.source.mirror*
    The flag that controls whether excluded files and source files
    without any defined suffix should be copied over (mirrored) into the
    output directory (e.g. files that the tool normally doesn't process
    such as jpg, gif images etc.)
    (optional property, default is false)

        *value* is a Boolean


    *task.print.output.dir*
    The output directory
    (optional property, default value is a date-stamped jslout subdir of
    the temp dir)

        * specified with* command line option *-o* or* --outputdir*
        *value* is a directory


    *task.print.inplace*
    If true, prints in place
    (optional property, default value is false)

        * value* is a Boolean


    The following properties are the Boolean properties for
    pretty-printing files of a certain suffix. Their meaning should be
    obvious from their name.

        * source.js.prettyprinter.strip.all

        source.js.prettyprinter.strip.comments

        source.js.prettyprinter.strip.whitespace

        source.js.prettyprinter.strip.newlines

        source.js.prettyprinter.preserve

        source.js.prettyprinter.indent

        source.html.prettyprinter.strip.comments*

------------------------------------------------------------------------

*Last Update:* 2006/08/25 23:49:07

*Author:* Satish Sekharan


 

