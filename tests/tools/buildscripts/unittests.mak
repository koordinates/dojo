####
# this has targets to generate html test pages,
# as well as targets for running command line tests. 
# this is dependent on various source variables like SRC_CORE_SCRIPTS.
####

# where our tools and templates are

# support scripts for testing
JSUNIT_WRAP       := $(TOOLS_JTM_DIR)/jsunit_wrap.js
JSUNIT_POST       := $(TOOLS_JTM_DIR)/jsunit_post.js
FAKEDOM_F         := -f $(TOOLS_JSFAKEDOM_DIR)/BUFakeDom.js
#JSUNIT_SCRIPTS_F := -f $(JSUNIT_SCHAIBLE)/lib/JsUtil.js -f $(JSUNIT_SCHAIBLE)/lib/JsUnit.js
JSUNIT_SCRIPTS_F  :=


# calculate  test filenames for core and widgets

TEST_CORE_SCRIPTS      := $(shell find $(TEST_SCRIPTS) -name '*.js' | grep -v widgets)
TEST_CORE_SCRIPTS_F    := $(addprefix -f ,$(TEST_CORE_SCRIPTS))
TEST_WIDGET_SCRIPTS    := $(shell ls $(TEST_SCRIPTS)/webui/widgets/test_*.js)
TEST_WIDGET_SCRIPTS_F  := $(addprefix -f ,$(TEST_WIDGET_SCRIPTS))

# file name that we generate
TESTPAGE_HTML     := jum_all.html
# template that we use to generate it.
TESTPAGE_TEMPLATE := $(TOOLS_JTM_DIR)/jum_template.html

# when substituting to create test html pages, we have to insert the relative path up.
# they go into places like build/testhtml/hiett_core.html and has to reference ../../build/burst/burstlib.js .
# Because we already have a ".." builtin to the paths, we only have one in TEMPL_UP
TEMPL_UP                 := ../
TEMPL_BUILD_ALL_SCRIPTS  := $(TEMPL_UP)$(CORE_FILE) $(addprefix $(TEMPL_UP),$(BUILD_WIDGET_SCRIPTS))
TEMPL_SRC_ALL_SCRIPTS    := $(addprefix $(TEMPL_UP),$(SRC_CORE_SCRIPTS) $(SRC_WIDGET_SCRIPTS))
TEMPL_DEPS               := $(CORE_FILE) $(TOOLS_JTM_DIR)/mdatempl.pl $(TESTPAGE_TEMPLATE) $(TOOLS_JTM_DIR)/load_template.html $(TOOLS_JTM_DIR)/hieatt_template.html Makefile 

SUBST_TEMPL := perl -w $(TOOLS_JTM_DIR)/mdatempl.pl HIEATT=$(TEMPL_UP)$(JSUNIT_HIEATT) JSUNIT_WRAP=$(TEMPL_UP)$(TOOLS_JTM_DIR)/jsunit_wrap.js JSUNIT_POST=$(TEMPL_UP)$(TOOLS_JTM_DIR)/jsunit_post.js 

#### target for html test pages

testpages: $(TEST_HTML)/$(TESTPAGE_HTML) $(TEST_HTML)/hieatt_core.html $(TEST_HTML)/hieatt_widgets.html $(TEST_HTML)/load_core_build.html $(TEST_HTML)/load_all_src.html $(TEST_HTML)/load_all_build.html testnames

.PHONY: testpages

$(TEST_HTML)/load_core_build.html: $(TEMPL_DEPS)
	@-mkdir -p $(TEST_HTML)
	$(SUBST_TEMPL) TITLE="Load Core" SCRIPTS=$(TEMPL_UP)$(CORE_FILE) $(TOOLS_JTM_DIR)/load_template.html > $(TEST_HTML)/load_core_build.html

$(TEST_HTML)/load_all_src.html: $(SRC_CORE_SCRIPTS) $(SRC_WIDGET_SCRIPTS) $(TEMPL_DEPS)
	@-mkdir -p $(TEST_HTML)
	$(SUBST_TEMPL) TITLE="Load All Source Files" SCRIPTS="$(TEMPL_SRC_ALL_SCRIPTS)" $(TOOLS_JTM_DIR)/load_template.html > $(TEST_HTML)/load_all_src.html

$(TEST_HTML)/load_all_build.html: $(BUILD_WIDGET_SCRIPTS) $(TEMPL_DEPS)
	@-mkdir -p $(TEST_HTML)
	$(SUBST_TEMPL) TITLE="Load All Build Files" SCRIPTS="$(TEMPL_BUILD_ALL_SCRIPTS)" $(TOOLS_JTM_DIR)/load_template.html > $(TEST_HTML)/load_all_build.html

$(TEST_HTML)/$(TESTPAGE_HTML): $(TEST_CORE_SCRIPTS) $(TEMPL_DEPS)
	@-mkdir -p $(TEST_HTML)
	$(SUBST_TEMPL) TITLE="All Tests" SCRIPTS="$(TEMPL_BUILD_ALL_SCRIPTS)" TESTS="$(addprefix $(TEMPL_UP),$(TEST_CORE_SCRIPTS) $(TEST_WIDGET_SCRIPTS))" $(TESTPAGE_TEMPLATE) > $(TEST_HTML)/$(TESTPAGE_HTML)

$(TEST_HTML)/hieatt_core.html: $(TEST_CORE_SCRIPTS) $(TEMPL_DEPS)
	@-mkdir -p $(TEST_HTML)
	$(SUBST_TEMPL) TITLE="Test Core" SCRIPTS=$(TEMPL_UP)$(CORE_FILE) TESTS="$(addprefix $(TEMPL_UP),$(TEST_CORE_SCRIPTS))" $(TOOLS_JTM_DIR)/hieatt_template.html > $(TEST_HTML)/hieatt_core.html

$(TEST_HTML)/hieatt_widgets.html: $(TEST_WIDGET_SCRIPTS) $(TEMPL_DEPS)
	@-mkdir -p $(TEST_HTML)
	$(SUBST_TEMPL) TITLE="Test Widgets" SCRIPTS="$(TEMPL_BUILD_ALL_SCRIPTS)" TESTS="$(addprefix $(TEMPL_UP),$(TEST_WIDGET_SCRIPTS))" $(TOOLS_JTM_DIR)/hieatt_template.html > $(TEST_HTML)/hieatt_widgets.html

# generate a js file defining the list of all test names.
# this is included by jum_template.html
testnames:
	cat $(TEST_SCRIPTS)/test_*.js $(TEST_SCRIPTS)/webui/widgets/test_*.js | perl $(TOOLS_JTM_DIR)/testnames.pl > $(TEST_HTML)/testnames.js

.PHONY: testnames

####
# run tests
####

# sanity check what is in the src tree
sanitysrc:
	$(JS) $(SRC_CORE_SCRIPTS_F) $(SRC_WIDGET_SCRIPTS_F)

# sanity check what is in the build tree
sanitybuild:
	$(JS) $(CORE_FILE)

# run all unit tests directly on src tree
testsrc:
	$(JS) $(JSUNIT_SCRIPTS_F) $(SRC_CORE_SCRIPTS_F) -f $(JSUNIT_WRAP) $(FAKEDOM_F) $(TEST_CORE_SCRIPTS_F) $(SRC_WIDGET_SCRIPTS_F) $(TEST_WIDGET_SCRIPTS_F) -f $(JSUNIT_POST)

# run all unit tests on build tree
testbuild: buildcode
	$(JS) $(JSUNIT_SCRIPTS_F) -f $(CORE_FILE) -f $(JSUNIT_WRAP) $(FAKEDOM_F) $(TEST_CORE_SCRIPTS_F) $(SRC_WIDGET_SCRIPTS_F) $(TEST_WIDGET_SCRIPTS_F) -f $(JSUNIT_POST)


