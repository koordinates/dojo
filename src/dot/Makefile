# Build file for creating both Mac/x86 and Windows builds from
# a Mac OS X box. This requires that you have a Windows cross-compiling
# environment setup on your Mac box to create Windows builds.
#
# See http://landonf.bikemonkey.org/code/win32/MinGW.20041207231336.1583.sulu.html
# for details on how to get a Windows cross-compiling environment setup
# using Darwin Ports (you must install Darwin Ports first)
#
# @author Brad Neuberg, bkn3@columbia.edu

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
	make -C proxy all
	mv -f proxy/polipo proxy-build/mac/x86/dot
	cp -f proxy/config.mac proxy-build/mac/x86/config
	cp -f proxy/default-pac proxy-build/mac/x86/.offline-pac
	
windows:
	@echo
	@echo
	@echo --- Creating Windows/x86 Build ---
	@echo
	make -C proxy all CC=i386-mingw32-gcc EXE=.exe LDLIBS=-lwsock32 PREFIX=/
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
	
