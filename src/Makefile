TOP := ..
include $(TOP)/buildscripts/externalconfig.mak
# include $(TOP)/buildscripts/dirnames.mak

HOSTENVS := $(shell ls hostenv_*.js)
HOSTENVS_F += $(patsubst -f %,%,$(HOSTENVS2))

# make sure no warnings or errors just loading the files; in both JS and JS2
smoketest: smoketest1 smoketest2

smoketest1:
	$(JS) -f bootstrap1.js hostenv_$(JSNAME).js bootstrap2.js

smoketest2:
	$(JSC) -out:junk.exe bootstrap1.js $(HOSTENVS) bootstrap2.js

clean:
	rm -rf *.exe *~
