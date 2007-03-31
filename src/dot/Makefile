# Build file for creating both Mac/x86 and Windows builds from
# a Mac OS X box. This requires that you have a Windows cross-compiling
# environment setup on your Mac box to create Windows builds.
#
# See http://landonf.bikemonkey.org/code/win32/MinGW.20041207231336.1583.sulu.html
# for details on how to get a Windows cross-compiling environment setup
# using Darwin Ports (you must install Darwin Ports first)
#
# @author Brad Neuberg, bkn3@columbia.edu

# Debug builds are off by default; you must define
# the following environment variable to the following
# value to get debug builds:
# export DEBUGFLAG="-g"

all:
	make clean
	make mac
	make clean
	make windows
	make clean

mac:
	@echo
	@echo
	@echo --- Creating Mac/x86 Build ---
	@echo
	make -e -C proxy all
	mv -f proxy/polipo proxy-build/mac/x86/dot
	cp -f proxy/config.mac proxy-build/mac/x86/config
	cp -f proxy/default-pac proxy-build/mac/x86/.offline-pac

windows:
	@echo
	@echo
	@echo --- Creating Windows/x86 Build ---
	@echo
	make -e -C proxy all CC=i386-mingw32-gcc EXE=.exe LDLIBS=-lwsock32 PREFIX=/
	mv -f proxy/polipo.exe proxy-build/win/dot.exe
	cp -f proxy/config.win proxy-build/win/config
	cp -f proxy/default-pac proxy-build/win/.offline-pac
	cp -f proxy/default-pac proxy-build/win/offline-pac

run:
	./proxy-build/mac/x86/dot -c ./proxy-build/mac/x86/config
	
debug:
	gdb -d proxy ./proxy-build/mac/x86/dot

install:
	rm -fr ~/.offline-cache
	mkdir ~/.offline-cache
	rm ~/.offline-list
	cp proxy-build/mac/x86/.offline-pac ~

clean:
	make -C proxy clean

# The following directives can only be run on Windows using
# nmake

# Our Windows installer relies on an open source project named NSIS 2.24, available from this home page:
#
# http://nsis.sourceforge.net/Main_Page
#
# MakeNSIS.exe must be in your PATH environment variable.

win-install-make:
	del proxy-build\win\Install.exe
	copy install-src\win\nsis\dot.nsi proxy-build\win\dot.nsi
	makensis proxy-build\win\dot.nsi
	del proxy-build\win\dot.nsi

win-install:
	proxy-build\win\Install.exe /S

win-uninstall:
	"C:\Program Files\Dojo\dot\Uninstall.exe" /S

