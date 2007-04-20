;
;Nullsoft Scriptable Install System (NSIS) script for
;Dojo Offline installation on Windows
;
;@author Brad Neuberg, bkn3@columbia.edu

!include "LogicLib.nsh"
!include "TextFunc.nsh"
!include "WordFunc.nsh"
!include "MUI.nsh"

!include "dot_util.nsh"

!define VERSION "0.4.2.1"

;Minimum version of IE we support; this must
;be a whole number, such as 5, 6, 7, etc.
!define MINIMUM_INTERNET_EXPLORER_VERSION "6"

;constants for the beginning of the lines we search for
!define PAC_LINE_START 'user_pref("network.proxy.autoconfig_url",'
!define PROXY_TYPE_LINE_START 'user_pref("network.proxy.type",'

Name "Dojo Offline Toolkit"
OutFile "Install Dojo Offline.exe"

InstallDir "$PROGRAMFILES\Dojo\dot"

;set our compression method
SetCompressor /SOLID bzip2

;no pages -- just install or uninstall seamlessly 
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_UNPAGE_INSTFILES

;default language
!insertmacro MUI_LANGUAGE "English"

;inline library macros we use below
!insertmacro ConfigWrite
!insertmacro WordReplace
!insertmacro VersionCompare

;the number of browsers we have successfully configured
;if 0, then we will abort
Var /GLOBAL browsersConfigured

Function .onInit
	;make sure the user doesn't run the installer multiple times
	;at the same time - block on a common mutex object
	System::Call 'kernel32::CreateMutexA(i 0, i 0, t "dotInstallation") i .r1 ?e'
	Pop $R0
	StrCmp $R0 0 +3
		MessageBox MB_OK|MB_ICONEXCLAMATION "The installer is already running."
		Abort
		
	StrCpy $browsersConfigured "0"
FunctionEnd

Function handleError
	Var /GLOBAL errorMessage
	Pop $errorMessage
	ExecWait '"$INSTDIR\Uninstall.exe" _?=$INSTDIR /S' 
	MessageBox MB_OK "Unable to install Dojo Offline:$\n$errorMessage.$\n"
	Abort
FunctionEnd

Function ensureEnvironment
	DetailPrint "Ensuring correct installation environment..."
	
	DetailPrint "Making sure user has admin privileges..."
	;make sure this user has admin privs - the 'userInfo::getAccountType' 
	;plugin places its results on the stack
	ClearErrors
	userInfo::getAccountType
	pop $0
	
	IfErrors adminError adminContinue
		adminError:
			Push "Unable to ensure user has admin privileges"
			Call handleError
			
		adminContinue:
	
    ${if} $0 != "Admin"
		DetailPrint "You must have Administrator privileges to install this application"
		messageBox MB_OK "You must have Administrator privileges to install this application" /SD IDOK
		Abort
	${endif}
	
	;Make sure supported Windows version is installed -- we only
	;support Windows NT variants (i.e. Windows 2000, XP, Vista, etc.)
	DetailPrint "Making sure supported version of Windows is installed..."
	ReadRegStr $R0 HKLM "SOFTWARE\Microsoft\Windows NT\CurrentVersion" "CurrentVersion"
	${if} $R0 == ""
		StrCpy $R1 "Dojo Offline does not supported your version of Windows.$\n"
		StrCpy $R1 "$R1Would you like to continue installing Dojo Offline anyway (not recommended)?"
		messageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON2 "$R1" /SD IDNO \
						IDYES continueInstallingWin IDNO abortInstallingWin
		abortInstallingWin:
			Abort
		continueInstallingWin:
			nop
	${endif}
	
	;Make sure the version of IE installed is supported
	DetailPrint "Making sure user has supported version of Internet Explorer..."
	Var /GLOBAL dllVersionHigh
	Var /GLOBAL dllVersionLow
	Var /GLOBAL ieVersion
	;see the DLL version of IE installed
	ClearErrors
	GetDllVersion "$SYSDIR\mshtml.dll" $dllVersionHigh $dllVersionLow
	
	IfErrors ieVersionError ieVersionContinue
		ieVersionError:
			Push "Unable to verify version of Internet Explorer installed"
			Call handleError
			
		ieVersionContinue:
		
	;get the first digit
	IntOp $ieVersion $dllVersionHigh / 0x00010000
	${if} $ieVersion < ${MINIMUM_INTERNET_EXPLORER_VERSION}
		StrCpy $R1 "Dojo Offline does not supported your version of Internet Explorer (version $ieVersion).$\n"
		StrCpy $R1 "$R1Would you like to continue installing Dojo Offline anyway (not recommended)?"
		messageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON2 "$R1" /SD IDNO \
						IDYES continueInstallingIE IDNO abortInstallingIE
		abortInstallingIE:
			Abort
		continueInstallingIE:
			nop
	${endif}
FunctionEnd

!define stopDojoOffline "!insertmacro stopDojoOffline"
!macro stopDojoOffline
	DetailPrint "Stopping existing Dojo Offline processes if running..."
	
	;TODO: Forcefully terminating these processes is not safe.
	;Instead, both dot.exe and proxy.exe need to be able to 
	;receive Windows messages to terminate themselves, close their
	;currently open file and socket handles, and then go away.
	
	;whether we have found the processes and need to sleep
	;for a bit until they are finished being terminated
	StrCpy $R1 "false"
	
	;Handle the following two error return types
	;and terminate installation:
	;604 = No permission to terminate process
	;607 = Unsupported OS
	
	KillProcDLL::KillProc "DOT.EXE" ;return value inside R0
	${if} $R0 == 604
		StrCpy $R5 "No permission to terminate dot.exe process"
		MessageBox MB_OK "Unable to install Dojo Offline:$\n$R5.$\n"
		Abort
	${elseif} $R0 == 607
		StrCpy $R5 "Unsupported OS for terminating dot.exe process"
		MessageBox MB_OK "Unable to install Dojo Offline:$\n$R5.$\n"
		Abort
	${elseif} $R0 == 0
		StrCpy $R1 "true"
	${endif}
	
	KillProcDLL::KillProc "PROXY.EXE"
	${if} $R0 == 604
		StrCpy $R5 "No permission to terminate proxy.exe process"
		MessageBox MB_OK "Unable to install Dojo Offline:$\n$R5.$\n"
		Abort
	${elseif} $R0 == 607
		StrCpy $R5 "Unsupported OS for terminating proxy.exe process"
		MessageBox MB_OK "Unable to install Dojo Offline:$\n$R5.$\n"
		Abort
	${elseif} $R0 == 0
		StrCpy $R1 "true"
	${endif}
	
	;do a slight timeout here to ensure the process has finished shutting
	;down (in milliseconds), but only if the processes were detected to
	;be running so that the common case is not slowed down
	${if} $R1 == "true"
		DetailPrint "Waiting for Dojo Offline processes to end..."
		Sleep 500
	${endif}
!macroend

Function handleExistingInstallation
	DetailPrint "Handling existing Dojo Offline installations..."
	
	;get an existing Dojo Offline version string if there is one
	ReadRegStr $R1 HKCU "Software\Dojo\dot" "CurrentVersion"
	${if} $R1 == ""
		return
	${endif}
	
	${VersionCompare} "$R1" "${VERSION}" $R2

	;is this the same as what we are trying to install?
	${if} $R2 == 0
		MessageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON2 \
					"You already have this version of Dojo Offline installed (version ${VERSION}).$\nContinue anyway?" \
					/SD IDCANCEL \
					IDYES uninstallFirst IDNO abortInstallation
	${endif}
	
	;are we installing an older version?
	${if} $R2 == 1
		MessageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON2 \
					"The version you are trying to install is older than the one you have installed (version ${VERSION}).$\nContinue anyway?" \
					/SD IDCANCEL \
					IDYES uninstallFirst IDNO abortInstallation
	${endif}
	
	;are we installing a newer version?
	${if} $R2 == 2
		Goto uninstallFirst
	${endif}
	
	abortInstallation:
		Abort
	uninstallFirst:
		ReadRegStr $R3 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\dot" \
					"UninstallString"
		DetailPrint "Uninstalling existing Dojo Offline installation..."
		DetailPrint $R3
		
		ClearErrors
		ExecWait '"$R3" _?=$INSTDIR /S'
		IfErrors uninstallError uninstallContinue
			uninstallError:
				Push "Unable to uninstall older Dojo Offline installation"
				Call handleError
			uninstallContinue:
FunctionEnd

Function createFileLayout
	DetailPrint "Creating file layout..."
	
	;create our application data directory
	ClearErrors
	CreateDirectory "$APPDATA\Dojo"
	IfErrors error +1
	
	ClearErrors
	CreateDirectory "$APPDATA\Dojo\dot"
	IfErrors error +1
	
	;create our offline cache directory
	ClearErrors
	CreateDirectory "$APPDATA\Dojo\dot\.offline-cache"
	IfErrors error +1

	;add our files
	ClearErrors
	File "dot.exe"
	IfErrors error +1
	
	ClearErrors
	File "proxy.exe"
	IfErrors error +1
	
	ClearErrors
	File "config"
	IfErrors error +1
	
	ClearErrors
	File /oname=$APPDATA\Dojo\dot\.offline-pac ".offline-pac"
	IfErrors error +1
	
	return
	
	error:
		Push "Unable to create file layout"
		Call handleError
FunctionEnd

Function updateConfigFile
	DetailPrint "Configuring Dojo Offline config file for user's machine..."

	;update the configuration file to point to Windows locations,
	;rather than Unix ones - replace all slashes with backslashes
	${WordReplace} "$APPDATA" "\" "/" "+" $R1
	
	ClearErrors
	${ConfigWrite} "$INSTDIR\config" "diskCacheRoot = " '"$R1/Dojo/dot/.offline-cache"' $R0
	IfErrors error +1
	
	ClearErrors
	${ConfigWrite} "$INSTDIR\config" "offlineFile = " '"$R1/Dojo/dot/.offline-list"' $R0
	IfErrors error +1
	
	ClearErrors
	${ConfigWrite} "$INSTDIR\config" "offlinePACFile = " '"$R1/Dojo/dot/.offline-pac"' $R0
	IfErrors error +1
	
	ClearErrors
	${ConfigWrite} "$INSTDIR\config" "logFile = " '"$R1/Dojo/dot/.offline-log"' $R0
	IfErrors error +1
	
	return
	
	error:
		Push "Unable to configure Dojo Offline configuration file"
		Call handleError
FunctionEnd

Function storeAppMetadata
	DetailPrint "Storing Dojo Offline metadata in registry..."

	;store installation folder and application data folder
	ClearErrors
	WriteRegStr HKCU "Software\Dojo\dot" "InstallFolder" $INSTDIR
	IfErrors error +1
	
	ClearErrors
	WriteRegStr HKCU "Software\Dojo\dot" "AppFolder" "$APPDATA\Dojo\dot"
	IfErrors error +1
	
	;write out our version
	ClearErrors
	WriteRegStr HKCU "Software\Dojo\dot" "CurrentVersion" ${VERSION}
	IfErrors error +1
	
	return
	
	error:
		Push "Unable to store Dojo Offline metadata in registry"
		Call handleError
FunctionEnd

Function handleInternetExplorer
	DetailPrint "Configuring Internet Explorer to use Dojo Offline..."

	;preserve three possible previous proxy settings:
	; * "Autodetect proxy settings" - used for the network-based PAC file installation
	; * A previous PAC file setting
	; * Directly using a proxy
	
	DetailPrint "Preserving old Internet Explorer proxy settings..."
	
	;exact proxy value given
	ReadRegDWORD $1 HKCU "Software\Microsoft\Windows\CurrentVersion\Internet Settings" "ProxyEnable"	
	${if} $1 == ""
		StrCpy $1 "0"
	${endif}
	WriteRegDWORD HKCU "Software\Dojo\dot" "OriginalIEProxyEnable" $1
	
	;PAC file given
	ReadRegStr $1 HKCU "Software\Microsoft\Windows\CurrentVersion\Internet Settings" "AutoConfigURL"
	WriteRegStr HKCU "Software\Dojo\dot" "OriginalIEAutoConfigURL" $1
	
	;TODO: "Autodetect proxy settings" which is used for WPAD PAC files over the
	;network are not clearly reflected into the registry -- unable to
	;persist this setting -- will simply stay the same. Might conflict
	;with our PAC file setting and be given precedence -- test in a
	;WPAD environment.
	
	;turn off the old proxy settings
	WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Internet Settings" "ProxyEnable" 0

	DetailPrint "Setting Internet Explorer to use Dojo Offline proxy..."

	;update Internet Explorer's PAC file setting
	ClearErrors
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Internet Settings" \
										"AutoConfigURL" \
										"file://$APPDATA\Dojo\dot\.offline-pac"
	IfErrors error noerror
		error:
			return
		noerror:
			IntOp $browsersConfigured $browsersConfigured + 1
FunctionEnd

Function handleFirefox
	DetailPrint "Configuring Firefox to use Dojo Offline..."

	Var /GLOBAL searchHandle
	Var /GLOBAL foundDirectory
	Var /GLOBAL allProfileNames
	Var /GLOBAL numFirefoxProfiles
	
	StrCpy $allProfileNames ""
	StrCpy $numFirefoxProfiles "0"
	
	;Firefox installations can have multiple users -- some users create
	;multiple accounts for different reasons, though all linked to
	;this single Windows user account. Enumerate through each profile, which
	;usually has a strange GUID-like name such as w2hwmkob.default.
	FindFirst $searchHandle $foundDirectory "$APPDATA\Mozilla\Firefox\Profiles\*"
	loop:
		StrCmp $foundDirectory "" done
		
		;handle the pref settings for this Firefox profile
		;FindFirst/FindNext includes "." and ".." -- filter out
		${if} $foundDirectory != "."
		${andif} $foundDirectory != ".."
			IntOp $numFirefoxProfiles $numFirefoxProfiles + 1
			
			;record this profile name to later store in the registry
			${if} $allProfileNames == ""
				StrCpy $allProfileNames "$foundDirectory"
			${else}
				StrCpy $allProfileNames "$allProfileNames,$foundDirectory"
			${endif}
			Push $foundDirectory
			Call handleFirefoxProfile
		${endif}
		
		FindNext $searchHandle $foundDirectory
		Goto loop
	done:
		FindClose $searchHandle
		
		;persist the names of all of our profiles
		${if} $allProfileNames != ""
			WriteRegStr HKCU "Software\Dojo\dot" "allMozillaProfileNames" $allProfileNames
		${endif}
		
		DetailPrint "$numFirefoxProfiles Firefox profiles were found and configured."
FunctionEnd

Function handleFirefoxProfile
	;for each profile, get the prefs.js file, read out the old network settings,
	;persist this in a registry key as a sub-value under the name of this
	;profile (such as w2hwmkob.default), then add our new values to the end of
	;user.js. On Uninstallation we will restore these values
	;using the registry settings.
	
	Var /GLOBAL profilePath
	Var /GLOBAL profileName
	Var /GLOBAL pacPref
	Var /GLOBAL proxyTypePref
	Var /GLOBAL prefsFile
	Var /GLOBAL userJSFile
	Var /GLOBAL currentLine
	Var /GLOBAL lineStart
	Var /GLOBAL lineLen
	
	;get the profile file name passed to this function
	Pop $profileName
	
	StrCpy $pacPref 'none'
	StrCpy $proxyTypePref 'none'	
	
	StrCpy $profilePath "$APPDATA\Mozilla\Firefox\Profiles\$profileName"
	
	;make a copy of the pref.js file before we start messing with it
	CopyFiles /SILENT /FILESONLY "$profilePath\prefs.js" "$profilePath\prefs.js.orig"
	
	;keep reading pref lines in until we find
	;the ones we want
	ClearErrors
	FileOpen $prefsFile "$profilePath\prefs.js" a
	loop:
		IfErrors done
		FileRead $prefsFile $currentLine
		
		;is this the autoconfig_url pref setting?
		StrLen $lineLen ${PAC_LINE_START}
		StrCpy $lineStart $currentLine $lineLen
		${if} $lineStart == ${PAC_LINE_START}
			StrCpy $pacPref $currentLine
			Push $pacPref
			Call removeTrailingNewlines
			Pop $pacPref
		${endif}
		
		;is this the proxy type setting?
		StrLen $lineLen ${PROXY_TYPE_LINE_START}
		StrCpy $lineStart $currentLine $lineLen
		${if} $lineStart == ${PROXY_TYPE_LINE_START}
			StrCpy $proxyTypePref $currentLine
			Push $proxyTypePref
			Call removeTrailingNewlines
			Pop $proxyTypePref
		${endif}
		
		Goto loop 
	done:
		FileClose $prefsFile
	
		;persist our old proxy settings in the registry
		WriteRegStr HKCU "Software\Dojo\dot\mozilla_profiles\$profileName" "pacPref" $pacPref
		WriteRegStr HKCU "Software\Dojo\dot\mozilla_profiles\$profileName" "proxyTypePref" $proxyTypePref

		;make a backup of user.js before we start messing with it
		IfFileExists $profilePath\user.js +1 +2
			CopyFiles /SILENT /FILESONLY "$profilePath\user.js" "$profilePath\user.js.orig"

		;append our new values to the bottom of user.js
		StrCpy $R2 '/* dot */ user_pref("network.proxy.type", 2);$\r$\n'
		StrCpy $R2 '$R2/* dot */ user_pref("network.proxy.autoconfig_url", "file://$APPDATA\Dojo\dot\.offline-pac");$\r$\n'
		ClearErrors
		FileOpen $userJSFile "$profilePath\user.js" a
		IfErrors error +1
		
		ClearErrors
		FileSeek $userJSFile 0 END
		IfErrors error +1
			
		ClearErrors
		FileWrite $userJSFile "$R2"
		IfErrors error +1
			 
		FileClose $userJSFile
		
		IntOp $browsersConfigured $browsersConfigured + 1
		
		return
		
		error:
			;do nothing -- just continue, but browserConfigured
			;won't be incremented
FunctionEnd

Function initUninstaller
	DetailPrint "Creating uninstaller..."

	;create uninstaller
	ClearErrors
	WriteUninstaller "$INSTDIR\Uninstall.exe"
	IfErrors error +1
	
	;add our uninstaller to the Add/Remove Programs dialog
	ClearErrors
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\dot" \
					"DisplayName" "Dojo Offline Toolkit"
	IfErrors error +1				
					
	ClearErrors
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\dot" \
					"UninstallString" "$INSTDIR\Uninstall.exe"
	IfErrors error +1
	
	ClearErrors
	WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\dot" \
					"NoModify" 1
	IfErrors error +1
	
	ClearErrors
	WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\dot" \
					"NoRepair" 1
	IfErrors error +1
	
	return
	
	error:
		Push "Unable to create uninstaller"
		Call handleError
FunctionEnd

Function startOnStartup
	DetailPrint "Registering Dojo Offline to start on system startup..."

	;have our local proxy start up on system startup
	ClearErrors
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "DojoOffline" '"$INSTDIR\dot.exe" "$INSTDIR\"'
	IfErrors error noerror
		error:
			Push "Unable to register Dojo Offline to start on system startup"
			Call handleError
		noerror:
FunctionEnd

Function startDojoOffline
	DetailPrint "Starting Dojo Offline..."
	
	ClearErrors
	Exec '"$INSTDIR\dot.exe" "$INSTDIR\"'
	IfErrors error noerror
		error:
			Push "Unable to start Dojo Offline"
			Call handleError
		noerror:
FunctionEnd

Function un.restoreIEProxySettings
	DetailPrint "Restoring Internet Explorer's pre-Dojo Offline proxy settings..."

	ReadRegDWORD $1 HKCU "Software\Dojo\dot" "OriginalIEProxyEnable"
	WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Internet Settings" "ProxyEnable" $1
	ReadRegStr $1 HKCU "Software\Dojo\dot" "OriginalIEAutoConfigURL"
	;was there even an old PAC setting?
	${if} $1 != ""
		WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Internet Settings" "AutoConfigURL" $1
	${else}
		DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Internet Settings" \
										"AutoConfigURL"
	${endif}
FunctionEnd

Function un.restoreFirefoxProxySettings
	DetailPrint "Restoring Firefox's pre-Dojo Offline proxy settings..."

	Var /GLOBAL allProfiles
	Var /GLOBAL currentProfile

	StrCpy $allProfiles ""

	;get the proxy directory names
	ReadRegStr $allProfiles HKCU "Software\Dojo\dot" "allMozillaProfileNames"

	StrCpy $R1 "0"
	${do}
		${StrTok} $currentProfile $allProfiles "," "$R1" "1"
		
		${if} $currentProfile == ""
			${exitdo}
		${endif}
		
		;get our previous values for PAC file and proxy type settings
		ReadRegStr $R2 HKCU "Software\Dojo\dot\mozilla_profiles\$currentProfile" "pacPref"
		ReadRegStr $R3 HKCU "Software\Dojo\dot\mozilla_profiles\$currentProfile" "proxyTypePref"
		
		${if} $R2 == "none"
			StrCpy $R2 ""
		${endif}
		
		${if} $R3 == "none"
			StrCpy $R3 ""
		${endif}
		
		;replace our Dojo Offline PAC settings in user.js
		;with the reverted values
		StrCpy $R4 ${PAC_LINE_START}
		StrCpy $R4 "/* dot */ $R4"
		${Un_ReplaceLineStr} "$APPDATA\Mozilla\Firefox\Profiles\$currentProfile\user.js" \
								"$R4" "$R2$\r$\n"
		StrCpy $R4 ${PROXY_TYPE_LINE_START}
		StrCpy $R4 "/* dot */ $R4"
		${Un_ReplaceLineStr} "$APPDATA\Mozilla\Firefox\Profiles\$currentProfile\user.js" \
								"$R4" "$R3$\r$\n"
								
		;delete our old Dojo Offline PAC settings in prefs.js
		${Un_ReplaceLineStr} "$APPDATA\Mozilla\Firefox\Profiles\$currentProfile\prefs.js" \
								${PAC_LINE_START} "$\r$\n"
		${Un_ReplaceLineStr} "$APPDATA\\Mozilla\\Firefox\\Profiles\$currentProfile\prefs.js" \
								${PROXY_TYPE_LINE_START} "$\r$\n"

		IntOp $R1 $R1 + 1
	${loop}
FunctionEnd

Function un.promptStopFirefox
	;if Firefox is open while reverting it's settings,
	;on closure it will promptly wipe them out -- we
	;can't change user.js here, because we want to leave
	;this alone on uninstallation, so make sure Firefox
	;is closed before we move on
	
	;it's hard to find running Firefox instances, so just
	;always prompt
	MessageBox MB_OK "If running, please quit Firefox before continuing uninstall" /SD IDOK
FunctionEnd
  
Section "Install"
	DetailPrint "Installing Dojo Offline version ${VERSION}..."
	SetOutPath "$INSTDIR"
	
	call ensureEnvironment
	${stopDojoOffline}
	call handleExistingInstallation
	call initUninstaller
	call createFileLayout
	call updateConfigFile
	call storeAppMetadata
	
	;configure our browsers
	call handleInternetExplorer
	call handleFirefox
	
	;make sure we were able to configure at least one browser
	${if} $browsersConfigured == 0
		Push "Unable to configure any browsers to use Dojo Offline"
		Call handleError
	${endif}
	
	call startOnStartup
	call startDojoOffline
	
	DetailPrint "Finished installing Dojo Offline."
	DetailPrint "Have Fun!"			
SectionEnd

Section "Uninstall"
	DetailPrint "Uninstalling Dojo Offline..."
	
	DetailPrint "All your personal offline application data will be"
	DetailPrint "left untouched -- see $APPDATA\Dojo\dot\ to access"
	
	;stop the running Dojo Offline processes
	${stopDojoOffline}
	
	;make sure Firefox is closed before reverting
	;it's proxy settings
	Call un.promptStopFirefox
	
	;restore previous IE and Firefox proxy settings
	Call un.restoreIEProxySettings
	Call un.restoreFirefoxProxySettings

	;clean up our final registry keys
	DetailPrint "Cleaning up Dojo Offline registry keys..."
	DeleteRegKey HKCU "Software\Dojo\dot"
	DeleteRegKey /ifempty HKCU "Software\Dojo"
	DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\dot"
	DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "DojoOffline"
	
	DetailPrint "Removing Dojo Offline files and directories..."

	Delete "$INSTDIR\config"
	Delete "$INSTDIR\dot.exe"
	Delete "$INSTDIR\proxy.exe"
	Delete "$INSTDIR\Uninstall.exe"

	RMDir /r "$PROGRAMFILES\Dojo\dot"
	RMDir "$PROGRAMFILES\Dojo"
	RMDir /r "$APPDATA\Dojo\dot"
	RMDir "$APPDATA\Dojo"
	
	DetailPrint "Dojo Offline is uninstalled!"
	
	StrCpy $R1 "Dojo Offline is now uninstalled.$\n"
	StrCpy $R1 "$R1Please restart Internet Explorer"
	StrCpy $R1 "$R1 for the uninstallation to take effect."	
	DetailPrint "$R1"
	MessageBox MB_OK $R1 /SD IDOK
SectionEnd