#
# you probably need to override some variables in this file, unless everything is in your path
#

####
# JS javascript interpreter
####
JS = js -w -s

# spidermonkey
#SPIDER_DIR= /Applications/js/src/Darwin_DBG.OBJ
#SPIDER_DIR= /home/default/bin/js/jsd
#JS = $(SPIDER_DIR)/jsd -w -s

# or xpcshell
#MOZ_DIR = /tmp/mozilla
#JS = $(MOZ_DIR)/run-mozilla.sh $(MOZ_DIR)/xpcshell -w

# or rhino
#RHINO_OPT=-opt -1 #
RHINO_OPT=#
RHINO_DIR = /usr/java/rhino1_5R5
# RHINO_CP is only needed for the JsLinker project
RHINO_CP   :=-classpath $(RHINO_DIR)/js.jar
JS = /usr/java/j2sdk1.4.2_04/bin/java -jar $(RHINO_DIR)/js.jar

# or windows cscript

# or kjs
#JS = /home/mda/shared/src/javascript/JavaScriptCore/kjs/testkjs.linux
# JS = /Users/mda/Desktop/JavaScriptCore/kjs/kjs

####
# DOXYGEN
####
DOXYGEN = doxygen
#DOXYGEN = /Applications/doxygen-1.3-rc3/bin/doxygen
#DOXYGEN = /Users/mda/Desktop/doxygen-1.3.6/bin/doxygen

#####
# DOT
####
DOT = dot
#DOT = `which dot 2>/dev/null`
#DOT = /Applications/graphviz-1.9/bin/dot

####
# POD2HTML
####
# must use $< as input and $@ as output
# there is no way to turn off pod2html's double quote conversion, so we post process
POD2HTML = pod2html --verbose --norecurse --podroot=$(DOCSRC_DIR) --infile=$< --css=burstsite.css | perl -pe "s/\`\`/\"/g; s/\'\'/\"/g" > $@
# The new Pod::Simple doesn't yet support index generation.
# POD2HTML = $(PERL) -MPod::Simple::HTML -e "exit Pod::Simple::HTML->filter(shift)->errors_seen" $< >$@
# Pod::HtmlEasy does not handle =for html and has several perl errors
# POD2HTML = $(PERL) -MPod::HtmlEasy -e "print Pod::HtmlEasy->new()->pod2html('$<')" >$@

####
# JSUNIT_SCHAIBLE directory for command-line jsunit (you probably don't need)
####
JSUNIT_SCHAIBLE = jsunit_schaible

####
# PERL
####
PERL = perl -w

####
# CP
####
CP = cp



