# This Makefile relies on GNU make features.
# This Makefile can only be run successfully when the current working directory
# is the one it resides in.

###
# external tool locations and commands
###
include externalconfig.mak

####
# constants for directories
####
TOP           := ..
include dirnames.mak

####
# calculate variables for file names
####

# Rather than independently maintain the list here, we extract the script names from
# the source code to burst_first.js which contains them in the desired order.
CORE_MODULES             := burst_first fix_ecma $(shell perl -ne "print \$$1,' ' if m/^  'burst\.(.*)'/" $(JS_SRC_DIR)/burst_first.js)

# core scripts according to declared CORE_MODULES
SRC_CORE_SCRIPTS         := $(addprefix $(JS_SRC_DIR)/,$(addsuffix .js,$(subst .,/,$(CORE_MODULES))))
SRC_CORE_SCRIPTS_F       := $(addprefix -f ,$(SRC_CORE_SCRIPTS))

# get all library script files by examining the source directory (this is for sanity checking with SRC_CORE_SCRIPTS)
SRC_TOP_SCRIPTS          := $(subst ./,,$(shell cd $(JS_SRC_DIR); find . -name '*.js'))

# for sanity checking that our list of core source scripts is complete
# take core modules, add js and replace '.' with '/'
#JS_CORE_SOURCES          := $(addsuffix .js,$(CORE_MODULES))
JS_CORE_SOURCES          := $(addsuffix .js,$(subst .,/,$(CORE_MODULES)))
JS_NONCORE               := $(filter-out $(JS_CORE_SOURCES),$(SRC_TOP_SCRIPTS))

# the source script files within the build area (copied over)
BUILD_TOP_SCRIPTS        := $(addprefix $(JS_BLD_DIR)/,$(SRC_TOP_SCRIPTS))

# everything in the library subdirs 'images' and 'html' (also copied over)
SRC_STATIC_FILES         := $(subst ./,,$(shell cd $(ST_SRC_DIR); ls images/*.* html/*.*))
BUILD_STATIC_FILES       := $(addprefix $(ST_BLD_DIR)/,$(SRC_STATIC_FILES))

# we get widget module names just by looking in the source directory, and excluding AbstractWidget which is part of core
WIDGET_MODULES           := $(basename $(shell cd $(JS_SRC_DIR)/webui/widgets/; ls *.js | grep -v AbstractWidget))
SRC_WIDGET_SCRIPTS       := $(addprefix $(JS_SRC_DIR)/webui/widgets/,$(addsuffix .js,$(WIDGET_MODULES)))
SRC_WIDGET_SCRIPTS_F     := $(addprefix -f ,$(SRC_WIDGET_SCRIPTS))
BUILD_WIDGET_SCRIPTS     := $(subst $(JS_SRC_DIR),$(JS_BLD_DIR),$(SRC_WIDGET_SCRIPTS))

# this is the file name after the individual files are combined
CORE_FILE_BASE           := burstlib.js
CORE_FILE                := $(BUILD_DIR)/burst/$(CORE_FILE_BASE)

# used for versioning. we inject these into the the intro.html
NOW                      := $(shell date +%Y%m%d%H%M)
BURSTVERSION             := 0.9

####
# general targets
#### 

# first target listed
default: 
	@echo Targets are:
	@echo "   clean     - nuke the 'build' dir"
	@echo "   buildcode - create $(CORE_FILE_BASE) and copy all other js files to build"
	@echo "   apidoc    - generate doxygen api reference doc"
	@echo "   builddoc  - copy or generate web site from docsrc"
	@echo "   testbuild - run command-line unit tests on build dir"
	@echo "   testsrc   - run command-line unit tests directly on individual source scripts"
	@echo "   testpages - generate html pages for unit testing in a browser"
	@echo "   all       - same as: testsrc buildcode testbuild testpages apidoc builddoc"
	@echo "   release   - make a full release tar ball"

all:          testsrc buildcode testbuild testpages apidoc builddoc
allnotest:    buildcode testpages apidoc builddoc
buildcode:    prepare gensrc copysrc
builddoc:     copydoc gendoc

# testbuild

.PHONY: default all clean prepare etags buildcode apidoc tooldoc copydoc gendoc

clean:
	rm -rf $(BUILD_DIR)
	find . -name '*~' |xargs rm -rf
	rm -f pod2htm*
	rm -f TAGS

prepare:
	@echo "Doing build with date stamp $(NOW)"
	@echo "noncore modules: $(JS_NONCORE)"

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(APIDOC_DIR):
	mkdir -p $(APIDOC_DIR)

etags:
	etags `find $(JS_SRC_DIR) -name '*.js'` `find $(TEST_SCRIPTS) -name '*.js'` `find $(TOOLS_DIR) -name '*.js'` $(DOCSRC_DIR)/*.pod $(DOCSRC_DIR)/*.html

# /*.js $(JS_SRC_DIR)/webui/widgets/*.js $(TEST_SCRIPTS)/*.js $(TEST_SCRIPTS)/webui/widgets/*.js $(TOOLS_DIR)/*/*.js $(DOCSRC_DIR)/*.pod $(DOCSRC_DIR)/*.html

####
# target "release"
####

# stuff under source control: index.html burst burststatic docsrc tools tests buildscripts demos    
SRC_RELEASE_FILES      := $(TOP)/index.html $(JS_SRC_DIR) $(ST_BLD_DIR) $(DOCSRC_DIR) $(TOP)/tools $(TOP)/tests $(TOP)/buildscripts $(TOP)/demos 
# sources plus build dir already built.
ALL_RELEASE_FILES      := $(SRC_RELEASE_FILES) $(JS_BLD_DIR)
# bare minimum for runtime.
RUNTIME_RELEASE_FILES  := $(JS_BLD_DIR) $(ST_BLD_DIR)

ALL_NAME         := burstlib-all
RUNTIME_NAME     := burstlib-runtime
ALL_TAR          := $(RELEASE_DIR)/$(ALL_NAME)-$(NOW).tar.gz
RUNTIME_TAR      := $(RELEASE_DIR)/$(RUNTIME_NAME)-$(NOW).tar.gz

TAR              := tar --exclude CVS

# release: clean allplus tars
release: $(ALL_TAR)

tars: $(ALL_TAR) $(RUNTIME_TAR)
.PHONY: $(ALL_TAR) $(RUNTIME_TAR)

$(ALL_TAR):
	rm -rf $(RELEASE_DIR)/$(ALL_NAME)-$(NOW)*
	mkdir -p $(RELEASE_DIR)/$(ALL_NAME)-$(NOW)
	cp -r $(ALL_RELEASE_FILES) $(RELEASE_DIR)/$(ALL_NAME)-$(NOW)/
	cd $(RELEASE_DIR); $(TAR) -cvf - $(ALL_NAME)-$(NOW) | gzip > $(ALL_NAME)-$(NOW).tar.gz
	cd $(RELEASE_DIR); rm -f $(ALL_NAME)-latest.tar.gz; ln -s $(ALL_NAME)-$(NOW).tar.gz $(ALL_NAME)-latest.tar.gz

$(RUNTIME_TAR):
	rm -rf $(RELEASE_DIR)/$(RUNTIME_NAME)-$(NOW)*
	mkdir -p $(RELEASE_DIR)/$(RUNTIME_NAME)-$(NOW)
	cp -r $(RUNTIME_RELEASE_FILES) $(RELEASE_DIR)/$(RUNTIME_NAME)-$(NOW)/
	cd $(RELEASE_DIR); $(TAR) -cvf - $(RUNTIME_NAME)-$(NOW) | gzip > $(RUNTIME_NAME)-$(NOW).tar.gz
	cd $(RELEASE_DIR); rm -f $(RUNTIME_NAME)-latest.tar.gz; ln -s $(RUNTIME_NAME)-$(NOW).tar.gz $(RUNTIME_NAME)-latest.tar.gz

####
# target "apidoc"
####
include apidoc.mak

####
# target "gendoc" and "copydoc" and "copydemos"
####
include website.mak

####
# target "copysrc" (code copying into build)
####
# only copy the widget files for now
# copysrc: $(BUILD_TOP_SCRIPTS) $(BUILD_STATIC_FILES)
copysrc: $(BUILD_WIDGET_SCRIPTS) $(BUILD_STATIC_FILES)
	@echo "Done copying individual script sources:"
	@echo BUILD_TOP_SCRIPTS=$(BUILD_TOP_SCRIPTS)
	@echo BUILD_WIDGET_SCRIPTS=$(BUILD_WIDGET_SCRIPTS)
	@echo BUILD_STATIC_FILES=$(BUILD_STATIC_FILES)
	@echo DEMO_FILES=$(DEMO_FILES)

# $(BUILD_TOP_SCRIPTS) is a superset of $(BUILD_WIDGET_SCRIPTS)
$(BUILD_TOP_SCRIPTS) : $(JS_BLD_DIR)/%: $(JS_SRC_DIR)/%
	@mkdir -p $(dir $@)
	@echo copying static script file $< to $@
	$(CP) $< $@

$(BUILD_STATIC_FILES): $(ST_BLD_DIR)/%: $(ST_SRC_DIR)/%
	@mkdir -p $(dir $@)
	@echo copying static file $< to $@
	$(CP) $< $@

# unused
# don't mess with dependencies
copyall:
	@mkdir build
	$(CP) -r $(JS_SRC_DIR) build

####
# target "gensrc" (making of the single core file)
####

SRC2CODE_F  := $(TOOLS_JSFILTER_DIR)/src2code.pl
SRC2CODE    := $(PERL) $(SRC2CODE_F)

gensrc: $(CORE_FILE)
	@echo Done creating file $(CORE_FILE)

$(CORE_FILE): $(SRC_CORE_SCRIPTS) $(SRC2CODE_F)
	@mkdir -p $(dir $(CORE_FILE))
	echo '/* This file is generated. */' > $(CORE_FILE)
	echo BU_CORE_FILENAME = \'$(CORE_FILE_BASE)\'\; >> $(CORE_FILE)
	echo var BU_VERSION_DATE = \'$(NOW)\'\; >> $(CORE_FILE)
	echo var BU_VERSION_NUMBER = \'$(BURSTVERSION)\'\; >> $(CORE_FILE)
	$(SRC2CODE) $(SRC_CORE_SCRIPTS) >> $(CORE_FILE)

# in case want to compare behavior to simply cat-ing core files together
catcore:
	cat $(SRC_CORE_SCRIPTS) >> $(BUILD_DIR)/catburstlib.js

####
# testing
####
include unittests.mak

####
# random (probably not of interest to you)
####
quicktest:
	$(JS) turds/quicktest.js

echo:
	@echo CORE_MODULES=$(CORE_MODULES)
	@echo SRC_TOP_SCRIPTS=$(SRC_TOP_SCRIPTS)
	@echo SRC_CORE_SCRIPTS_F=$(SRC_CORE_SCRIPTS_F)
	@echo JS_CORE_SOURCES=$(JS_CORE_SOURCES)
	@echo JS_NONCORE=$(JS_NONCORE)
	@echo BUILD_STATIC_FILES=$(BUILD_STATIC_FILES)
	@echo WIDGET_MODULES=$(WIDGET_MODULES)
	@echo SRC_WIDGET_SCRIPTS=$(SRC_WIDGET_SCRIPTS)
	@echo BUILD_WIDGET_SCRIPTS=$(BUILD_WIDGET_SCRIPTS)
	@echo TEST_CORE_SCRIPTS_F=$(TEST_CORE_SCRIPTS_F)
	@echo TEST_WIDGET_SCRIPTS_F=$(TEST_WIDGET_SCRIPTS_F)
	@echo SITE_COPY_FILES=$(SITE_COPY_FILES)


# run sample tests that come with jsunit
# if no TestSuite is specified on args, it looks for "AllTests".
# if 1 arg, it is a TestCase/TestSuite name
# if >1 arg, a TestSuite is created with the named TestCases/TestSuites
jsunittest:
	$(JS) $(TOOLS_DIR)/jsunit/samples/AllTests.js

xpcshell:
#	$(JS) /mnt/asabsd/home/mda/mozilla/xpcom/tests/utils/dirs.js
	$(JS) /mnt/asabsd/home/mda/mozilla-source/extensions/inspector/resources/content/jsutil/system/file.js


jslint:
	$(JS) -f /home/mda/shared/src/javascript/jslint2.js $(TOOLS_DIR)/testjslint.js

ICE_HOME=/Applications/ICEbrowserOCS_5.4.0_Trial
ice:
	java -cp $(ICE_HOME)/lib/icebrowser_ocs_trial.jar -Dice.debug.debug=true ice.ri.swing.Main 

rhino:
	java -jar $(RHINO_DIR)/js.jar $(RHINO_OPT)testrhino.js
