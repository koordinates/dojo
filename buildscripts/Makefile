# This Makefile relies on GNU make features.
# This Makefile can only be run successfully when the current working directory
# is the one it resides in.

TOP     := ..
DEST    := $(TOP)/dist
WEBSITE := $(DEST)/website

default:
	@echo Currently DEST=$(DEST)
	@echo Targets are:
	@echo "  apidoc  - generate api documentation from src"
	@echo "  sitedoc - generate website documents from documents"
	@echo "  website - do sitedoc, apidoc"
	@echo "  update  - do a 'cvs update'"

# external tool locations and commands
include $(TOP)/buildscripts/externalconfig.mak

# targets for web site documents generation
include $(TOP)/buildscripts/sitedoc.mak

apidoc:
	@echo target "apidoc" not implemented.

