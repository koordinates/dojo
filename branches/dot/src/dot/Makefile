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
#
# Note that the Mac installer for DOT, which uses the Mac OS X bundled PackageManager
# utility, also has a version number inside of it that must be changed
# manually through the PackageManager GUI. Our PackageManager configuration
# is at src/dot/install-src/mac/pkg/DojoOffline-$(VERSION).pmproj .
# PackageManager can be run from /Developer/Applications/Utilities/PackageMaker
#
VERSION=0.4.2.1

all:
	make sqlite-clean clean
	make mac
	make sqlite-clean clean
	make windows
	make sqlite-clean clean

mac: #sqlite
	@echo
	@echo
	@echo --- Creating Mac/x86 Build ---
	@echo
	make -e -C proxy all
	mv -f proxy/polipo proxy-build/mac/x86/proxy
	mv -f proxy/restarter proxy-build/mac/x86/dot
	cp -f proxy/config.mac proxy-build/mac/x86/config
	cp -f proxy/default-pac proxy-build/mac/x86/.offline-pac

windows: #sqlite-win
	@echo
	@echo
	@echo --- Creating Windows/x86 Build ---
	@echo
	make -e -C proxy all \
		CC=i386-mingw32-gcc \
		EXE=.exe \
		LDLIBS=-lwsock32 \
		PREFIX=/ \
		HIDECONSOLE=-mwindows
	mv -f proxy/polipo.exe proxy-build/win/proxy.exe
	mv -f proxy/restarter.exe proxy-build/win/dot.exe
	cp -f proxy/config.win proxy-build/win/config
	cp -f proxy/default-pac proxy-build/win/.offline-pac

install:
	rm -fr ~/.offline-cache
	mkdir ~/.offline-cache
	rm ~/.offline-list
	cp proxy-build/mac/x86/.offline-pac ~

clean:
	make -C proxy clean

sqlite: sqlite/build sqlite/build/Makefile sqlite/build/sqlite3

sqlite-win: sqlite/build sqlite/build/Makefile-win sqlite/build/sqlite3.exe

sqlite/build:
	mkdir sqlite/build

sqlite/build/Makefile: 
	cd sqlite/build; \
		../configure \
		CFLAGS="-Os" \
		--disable-tcl

sqlite/build/sqlite3:
	make -C sqlite/build all
	
sqlite/build/sqlite3.exe:
	make -C sqlite/build EXE=exe
	mv sqlite/build/sqlite3 sqlite/build/sqlite3.exe

sqlite/build/Makefile-win:
	cd sqlite/build; \
		../configure \
		--host=i386-mingw32 \
		--build=i386-apple-darwin8.8.1 \
		CFLAGS="-Os" \
		--disable-tcl
	
sqlite-clean:
	rm -fr sqlite/build

mac-run:
	./proxy-build/mac/x86/dot "`pwd`/proxy-build/mac/x86/" 
	
mac-debug:
	gdb -d proxy ./proxy-build/mac/x86/dot
	
mac-install-make:
	# clean up old stuff first
	sudo rm -fr proxy-build/mac/x86/DojoOffline-$(VERSION).pkg
	sudo rm -f proxy-build/mac/x86/DojoOffline-$(VERSION).dmg
	sudo rm -f "proxy-build/mac/x86/Install Dojo Offline.dmg"
	sudo rm -f install-src/mac/pkg/DotApp/component/Dojo\ Offline\ Toolkit/dot
	sudo rm -f install-src/mac/pkg/DotApp/component/Dojo\ Offline\ Toolkit/proxy
	sudo rm -f install-src/mac/pkg/DotApp/component/Dojo\ Offline\ Toolkit/config
	sudo rm -f install-src/mac/pkg/DotApp/component/Dojo\ Offline\ Toolkit/.offline-pac
	sudo rm -f install-src/mac/pkg/DotApp/extras/Uninstall.command
	# copy our built files over
	sudo cp proxy-build/mac/x86/dot \
			install-src/mac/pkg/DotApp/component/Dojo\ Offline\ Toolkit/dot
	sudo cp proxy-build/mac/x86/proxy \
			install-src/mac/pkg/DotApp/component/Dojo\ Offline\ Toolkit/proxy
	sudo cp proxy-build/mac/x86/config \
			install-src/mac/pkg/DotApp/component/Dojo\ Offline\ Toolkit/config
	sudo cp proxy-build/mac/x86/.offline-pac \
			install-src/mac/pkg/DotApp/component/Dojo\ Offline\ Toolkit/.offline-pac
	# copy some of the components/ scripts we might need during installation
	sudo cp install-src/mac/pkg/DotApp/component/Dojo\ Offline\ Toolkit/Uninstall.command \
			install-src/mac/pkg/DotApp/extras/Uninstall.command
	sudo cp install-src/mac/pkg/DotApp/component/Dojo\ Offline\ Toolkit/dotlauncher.sh \
			install-src/mac/pkg/DotApp/extras/dotlauncher.sh
	# make sure the files inside the pre-generated PKG directory layout have 
	# correct permissions and ownership
	sudo find -E install-src/mac/pkg/DotApp -false -regex '.*svn.*' -print0 | \
			xargs -t -0 sudo chown root:admin
	sudo find -E install-src/mac/pkg/DotApp -false -regex '.*svn.*' -print0 | \
			xargs -t -0 sudo chmod u+rwx
	sudo find -E install-src/mac/pkg/DotApp -false -regex '.*svn.*' -print0 | \
			xargs -t -0 sudo chmod g+rwx
	sudo find -E install-src/mac/pkg/DotApp -false -regex '.*svn.*' -print0 | \
			xargs -t -0 sudo chmod o+rx
	# generate the PKG file	
	sudo /Developer/Applications/Utilities/PackageMaker.app/Contents/MacOS/PackageMaker \
			-build -proj install-src/mac/pkg/DojoOffline.pmproj \
			-f -v -p proxy-build/mac/x86/DojoOffline-$(VERSION).pkg
	# make sure it's ownership and permissions are correct for installation on user's machine
	sudo chown root:admin proxy-build/mac/x86/DojoOffline-$(VERSION).pkg
	sudo chmod u+rwx proxy-build/mac/x86/DojoOffline-$(VERSION).pkg
	sudo chmod g+rwx proxy-build/mac/x86/DojoOffline-$(VERSION).pkg
	sudo chmod o+rx proxy-build/mac/x86/DojoOffline-$(VERSION).pkg
	# turn it into an Internet-distributable disk image
	sudo hdiutil create -srcfolder proxy-build/mac/x86/DojoOffline-$(VERSION).pkg \
			proxy-build/mac/x86/DojoOffline-$(VERSION).dmg
	sudo hdiutil internet-enable -yes proxy-build/mac/x86/DojoOffline-$(VERSION).dmg
	# make sure the disk image has correct permissions
	sudo chown root:admin proxy-build/mac/x86/DojoOffline-$(VERSION).dmg
	sudo chmod u+rwx proxy-build/mac/x86/DojoOffline-$(VERSION).dmg
	sudo chmod g+rwx proxy-build/mac/x86/DojoOffline-$(VERSION).dmg
	sudo chmod o+rx proxy-build/mac/x86/DojoOffline-$(VERSION).dmg
	# give it a standard name so the Learn How page can link to it
	cp proxy-build/mac/x86/DojoOffline-$(VERSION).dmg "proxy-build/mac/x86/Install Dojo Offline.dmg"
	# clean up the build files we copied over
	sudo rm -f install-src/mac/pkg/DotApp/component/Dojo\ Offline\ Toolkit/dot
	sudo rm -f install-src/mac/pkg/DotApp/component/Dojo\ Offline\ Toolkit/proxy
	sudo rm -f install-src/mac/pkg/DotApp/component/Dojo\ Offline\ Toolkit/config
	sudo rm -f install-src/mac/pkg/DotApp/component/Dojo\ Offline\ Toolkit/.offline-pac
	sudo rm -f install-src/mac/pkg/DotApp/extras/Uninstall.command
	sudo rm -f install-src/mac/pkg/DotApp/extras/dotlauncher.sh

mac-install:
	rm -f ~/dot_install.log
	touch ~/dot_install.log
	hdiutil attach -readonly proxy-build/mac/x86/DojoOffline-$(VERSION).dmg
	# the dash tells make to ignore errors from this command and continue running
	-sudo installer -pkg "/Volumes/DojoOffline-$(VERSION)/DojoOffline-$(VERSION).pkg" -target "/Applications"
	#-sudo installer -pkg "/Volumes/DojoOffline-$(VERSION)/DojoOffline-$(VERSION).pkg" -target "/Applications" -verbose -dumplog
	hdiutil unmount "/Volumes/DojoOffline-$(VERSION)"
	echo Install log:
	cat ~/dot_install.log
	rm -f ~/dot_install.log

mac-uninstall:
	sudo "install-src/mac/pkg/DotApp/component/Dojo Offline Toolkit/Uninstall.command" \
				--silent --debug

# Clean up an old installation receipt of Dojo Offline so that we
# can simulate a clean install versus an upgrade
mac-clean-old-install:
	sudo rm -fr /Applications/Dojo\ Offline\ Toolkit
	sudo rm -fr /Library/Receipts/DojoOffline-$(VERSION).pkg
	-sudo chmod -R a+rwx ~/Library/Application\ Support/Dojo 
	rm -fr ~/Library/Application\ Support/Dojo

# The following directives can only be run on Windows using
# nmake. Windows installers must be created on Windows currently 
# by running 'nmake' using one of the make directives below.
#
# Our Windows installer relies on an open source project named NSIS 2.24, available from this home page:
#
# http://nsis.sourceforge.net/Main_Page
#
# MakeNSIS.exe must be in your PATH environment variable. 

win-install-make:
	del "proxy-build\win\Install Dojo Offline.exe"
	copy install-src\win\nsis\dot.nsi proxy-build\win\dot.nsi
	copy install-src\win\nsis\dot_util.nsh proxy-build\win\dot_util.nsh
	makensis proxy-build\win\dot.nsi
	del proxy-build\win\dot.nsi
	del proxy-build\win\dot_util.nsh

win-install:
	"proxy-build\win\Install Dojo Offline.exe" /S

win-uninstall:
	@echo WARNING: You must quit all Firefox instances before continuing
	"C:\Program Files\Dojo\dot\Uninstall.exe" /S

