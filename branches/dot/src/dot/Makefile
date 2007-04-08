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

# The version of DOT we are generating
VERSION=0.4.2.1

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
	mv -f proxy/polipo proxy-build/mac/x86/proxy
	mv -f proxy/restarter proxy-build/mac/x86/dot
	cp -f proxy/config.mac proxy-build/mac/x86/config
	cp -f proxy/default-pac proxy-build/mac/x86/.offline-pac

windows:
	@echo
	@echo
	@echo --- Creating Windows/x86 Build ---
	@echo
	make -e -C proxy all CC=i386-mingw32-gcc EXE=.exe LDLIBS=-lwsock32 PREFIX=/ HIDECONSOLE=-mwindows
	mv -f proxy/polipo.exe proxy-build/win/proxy.exe
	mv -f proxy/restarter.exe proxy-build/win/dot.exe
	cp -f proxy/config.win proxy-build/win/config
	cp -f proxy/default-pac proxy-build/win/.offline-pac

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
	
mac-install-make:
	# clean up old stuff first
	sudo rm -fr proxy-build/mac/x86/DojoOffline-$(VERSION).pkg
	sudo rm -f proxy-build/mac/x86/DojoOffline-$(VERSION).dmg
	sudo rm -f install-src/mac/pkg/DotApp-$(VERSION)/component/Dojo\ Offline\ Toolkit/dot
	sudo rm -f install-src/mac/pkg/DotApp-$(VERSION)/component/Dojo\ Offline\ Toolkit/proxy
	sudo rm -f install-src/mac/pkg/DotApp-$(VERSION)/component/Dojo\ Offline\ Toolkit/config
	sudo rm -f install-src/mac/pkg/DotApp-$(VERSION)/component/Dojo\ Offline\ Toolkit/.offline-pac
	# copy our built files over
	sudo cp proxy-build/mac/x86/dot install-src/mac/pkg/DotApp-$(VERSION)/component/Dojo\ Offline\ Toolkit/dot
	sudo cp proxy-build/mac/x86/proxy install-src/mac/pkg/DotApp-$(VERSION)/component/Dojo\ Offline\ Toolkit/proxy
	sudo cp proxy-build/mac/x86/config install-src/mac/pkg/DotApp-$(VERSION)/component/Dojo\ Offline\ Toolkit/config
	sudo cp proxy-build/mac/x86/.offline-pac install-src/mac/pkg/DotApp-$(VERSION)/component/Dojo\ Offline\ Toolkit/.offline-pac
	# make sure the files inside the pre-generated PKG directory layout have 
	# correct permissions and ownership
	sudo find -E install-src/mac/pkg/DotApp-$(VERSION) -false -regex '.*svn.*' -print0 | xargs -t -0 sudo chown root:admin
	sudo find -E install-src/mac/pkg/DotApp-$(VERSION) -false -regex '.*svn.*' -print0 | xargs -t -0 sudo chmod u+rwx
	sudo find -E install-src/mac/pkg/DotApp-$(VERSION) -false -regex '.*svn.*' -print0 | xargs -t -0 sudo chmod g+rwx
	sudo find -E install-src/mac/pkg/DotApp-$(VERSION) -false -regex '.*svn.*' -print0 | xargs -t -0 sudo chmod o+rx
	# generate the PKG file	
	sudo /Developer/Applications/Utilities/PackageMaker.app/Contents/MacOS/PackageMaker -build -proj install-src/mac/pkg/DojoOffline-$(VERSION).pmproj -f -v -p proxy-build/mac/x86/DojoOffline-$(VERSION).pkg
	# make sure it's ownership and permissions are correct for installation on user's machine
	sudo chown root:admin proxy-build/mac/x86/DojoOffline-$(VERSION).pkg
	sudo chmod u+rwx proxy-build/mac/x86/DojoOffline-$(VERSION).pkg
	sudo chmod g+rwx proxy-build/mac/x86/DojoOffline-$(VERSION).pkg
	sudo chmod o+rx proxy-build/mac/x86/DojoOffline-$(VERSION).pkg
	# turn it into an Internet-distributable disk image
	sudo hdiutil create -srcfolder proxy-build/mac/x86/DojoOffline-$(VERSION).pkg proxy-build/mac/x86/DojoOffline-$(VERSION).dmg
	sudo hdiutil internet-enable -yes proxy-build/mac/x86/DojoOffline-$(VERSION).dmg
	# make sure the disk image has correct permissions
	sudo chown root:admin proxy-build/mac/x86/DojoOffline-$(VERSION).dmg
	sudo chmod u+rwx proxy-build/mac/x86/DojoOffline-$(VERSION).dmg
	sudo chmod g+rwx proxy-build/mac/x86/DojoOffline-$(VERSION).dmg
	sudo chmod o+rx proxy-build/mac/x86/DojoOffline-$(VERSION).dmg
	# cleanup the build files we copied over
	sudo rm -f install-src/mac/pkg/DotApp-$(VERSION)/component/Dojo\ Offline\ Toolkit/dot
	sudo rm -f install-src/mac/pkg/DotApp-$(VERSION)/component/Dojo\ Offline\ Toolkit/proxy
	sudo rm -f install-src/mac/pkg/DotApp-$(VERSION)/component/Dojo\ Offline\ Toolkit/config
	sudo rm -f install-src/mac/pkg/DotApp-$(VERSION)/component/Dojo\ Offline\ Toolkit/.offline-pac

mac-install:

mac-uninstall:

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
	copy install-src\win\nsis\dot_util.nsh proxy-build\win\dot_util.nsh
	makensis proxy-build\win\dot.nsi
	del proxy-build\win\dot.nsi
	del proxy-build\win\dot_util.nsh

win-install:
	proxy-build\win\Install.exe /S

win-uninstall:
	"C:\Program Files\Dojo\dot\Uninstall.exe" /S

