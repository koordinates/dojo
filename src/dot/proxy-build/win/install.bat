rem Move new distributions to a place on Windows we can run them.
rem
rem Define WINDOWS_BUILD to the full path to where your Windows build
rem files are (such as z:\), and SOURCE_PATH to where your Dojo Offline
rem local proxy source files are (such as y:\dev\dojo\offline\trunk\src\dot\proxy).
rem These are both defined below and must be changed in this file.
rem
rem On my machine, Z:\ is a mapped network drive that actually maps to a Samba
rem mounted drive, through Parallels, to a directory on my Mac OS X box
rem (~/dev/dojo/offline/trunk/src/dot/proxy), while Y:\ is a mapped network 
rem drive that maps through Samba and Parallels, to my home directory. Note
rem that Windows-style network paths will not work for these variables, since
rem DOS can not handle them (such as \\.psf\bradneuberg for example).
rem
rem This file will place all DOT configuration files in the root of C:, and
rem will place the executables and source files into C:\dot
rem  
rem @author Brad Neuberg, bkn3@columbia.edu
rem
rem
set WINDOWS_BUILD=z:
set SOURCE_PATH=y:\dev\dojo\offline\trunk\src\dot\proxy
rmdir /Q /S c:\dot
mkdir c:\dot
rmdir /Q /S c:\.offline-cache
del c:\.offline-list
mkdir c:\.offline-cache
copy %WINDOWS_BUILD%\dot.exe c:\dot
copy %WINDOWS_BUILD%\config c:\dot
copy %WINDOWS_BUILD%\offline-pac c:\offline-pac
move c:\offline-pac c:\.offline-pac
copy %SOURCE_PATH%\*.c c:\dot
copy %SOURCE_PATH%\*.h c:\dot

