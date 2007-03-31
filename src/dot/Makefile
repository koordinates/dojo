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

# The following directives can only be run on Windows using
# nmake

# Our Windows installer relies on an open source project named WiX, available from this home page:
#
# http://wix.sourceforge.net/
# 
# For obvious reasons these installers can only be produced on Windows; our src/dot/Makefile has a number
# of directives that can only be run on Windows, using nmake. You must have the WiX package in your
# PATH for these directives to work.
#
# You must also have the 'cabarc' utility installed and in your path to create Microsoft CAB 
# files -- this can be downloaded from http://support.microsoft.com/kb/310618
#
# The 'win-install-validate' task, which validates a WIX file to aid in the creation
# and writing of WIX files (not necessary to produce installers), uses the free msival2 utility
# which must be downloaded from Microsoft at 
# http://www.microsoft.com/downloads/details.aspx?FamilyId=A55B6B43-E24F-4EA3-A93E-40C0EC4F68E5&displaylang=en
# Once installed, you must install the msival2 utility by double clicking bin/msival2.msi.
# You must set MSIVAL_HOME to where you installed msival:
# set MSIVAL_HOME=C:\dev\msival2
# with no trailing slash

# cabarc n install-src\win\wix\dot.cab proxy-build\win\dot.exe proxy-build\win\config
win-install-make:
	del proxy-build\win\dot-install.wixobj
	del proxy-build\win\dot-install.wxs
	del proxy-build\win\dot.msi
	del WinInstall.log
	copy install-src\win\wix\dot-install.wxs proxy-build\win
	cd proxy-build\win
	candle.exe dot-install.wxs -out dot-install.wixobj
	light.exe dot-install.wixobj -out dot.msi
	del dot-install.wixobj
	del dot-install.wxs
	cd ..\..

win-install-validate: win-install-make
	%MSIVAL_HOME%\msival2 proxy-build\win\dot.msi %MSIVAL_HOME%\darice.cub %MSIVAL_HOME%\mergemod.cub -f

win-install:
	msiexec /i proxy-build\win\dot.msi

win-install-debug:
	msiexec /i proxy-build\win\dot.msi /l* WinInstall.log
	
win-install-verbose:
	msiexec /i proxy-build\win\dot.msi /l*v WinInstall.log

win-uninstall:
	msiexec /quiet /x proxy-build\win\dot.msi
