!include "LogicLib.nsh"
!include "TextFunc.nsh"
!include "WordFunc.nsh"
!include "MUI.nsh"

!include "dot_util.nsh"

!define VERSION "0.4.2-dot-beta1"

;constants for the beginning of the lines we search for
!define PAC_LINE_START 'user_pref("network.proxy.autoconfig_url",'
!define PROXY_TYPE_LINE_START 'user_pref("network.proxy.type",'

Name "Dojo Offline Toolkit"
OutFile "Install.exe"

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


Function .onInit
	;make sure the user doesn't run the installer multiple times
	;at the same time - block on a common mutex object
	System::Call 'kernel32::CreateMutexA(i 0, i 0, t "dotInstallation") i .r1 ?e'
	Pop $R0
	StrCmp $R0 0 +3
		MessageBox MB_OK|MB_ICONEXCLAMATION "The installer is already running."
		Abort
FunctionEnd

Function ensureEnvironment
	DetailPrint "Ensuring correct installation environment..."
	
	DetailPrint "Making sure user has admin privileges..."
	;make sure this user has admin privs - the 'userInfo::getAccountType' 
	;plugin places its results on the stack
	userInfo::getAccountType
	pop $0
    ${if} $0 != "Admin"
		messageBox MB_OK "You must have Administrator privileges to install this application"
		Abort
	${endif}
	
	;TODO: Make sure supported Windows version is installed
	DetailPrint "Making sure supported version of Windows is installed..."
	
	;TODO: Make sure the version of IE installed is supported
	DetailPrint "Making sure user has supported version of Internet Explorer..."
FunctionEnd

Function createFileLayout
	DetailPrint "Creating file layout..."
	
	;create our application data directory
	CreateDirectory "$APPDATA\Dojo"
	CreateDirectory "$APPDATA\Dojo\dot"
	
	;create our offline cache directory
	CreateDirectory "$APPDATA\Dojo\dot\.offline-cache"

	;add our files
	File "dot.exe"
	File "proxy.exe"
	File "config"
	File /oname=$APPDATA\Dojo\dot\.offline-pac ".offline-pac"
FunctionEnd

Function updateConfigFile
	DetailPrint "Configuring Dojo Offline config file for user's machine..."

	;update the configuration file to point to Windows locations,
	;rather than Unix ones - replace all slashes with backslashes
	${WordReplace} "$APPDATA" "\" "/" "+" $R1
	${ConfigWrite} "$INSTDIR\config" "diskCacheRoot = " '"$R1/Dojo/dot/.offline-cache"' $R0
	${ConfigWrite} "$INSTDIR\config" "offlineFile = " '"$R1/Dojo/dot/.offline-list"' $R0
	${ConfigWrite} "$INSTDIR\config" "offlinePACFile = " '"$R1/Dojo/dot/.offline-pac"' $R0
FunctionEnd

Function storeAppMetadata
	DetailPrint "Storing Dojo Offline metadata in registry..."

	;store installation folder and application data folder
	WriteRegStr HKCU "Software\Dojo\dot" "InstallFolder" $INSTDIR
	WriteRegStr HKCU "Software\Dojo\dot" "AppFolder" "$APPDATA\Dojo\dot"
	
	;write out our version
	WriteRegStr HKCU "Software\Dojo\dot" "CurrentVersion" ${VERSION}
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
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Internet Settings" \
										"AutoConfigURL" \
										"file://$APPDATA\Dojo\dot\.offline-pac"
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
	;profile (such as w2hwmkob.default), then update the prefs.js file with our
	;new values. On Uninstallation we will restore these values
	;using the registry settings.
	
	Var /GLOBAL profilePath
	Var /GLOBAL profileName
	Var /GLOBAL pacPref
	Var /GLOBAL proxyTypePref
	Var /GLOBAL prefsFile
	Var /GLOBAL currentLine
	Var /GLOBAL lineStart
	Var /GLOBAL lineLen
	
	;get the profile file name passed to this function
	Pop $profileName
	
	StrCpy $pacPref 'none'
	StrCpy $proxyTypePref 'none'	
	
	StrCpy $profilePath "$APPDATA\Mozilla\Firefox\Profiles\$profileName"
	
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

		;replace the old proxy values in the file with the new ones now
		StrCpy $R2 'user_pref("network.proxy.type", 2);$\r$\n'
		${ReplaceLineStr} "$profilePath\prefs.js" ${PROXY_TYPE_LINE_START} $R2
		StrCpy $R2 'user_pref("network.proxy.autoconfig_url", "file://$APPDATA\Dojo\dot\.offline-pac");$\r$\n'
		${ReplaceLineStr} "$profilePath\prefs.js" ${PAC_LINE_START} $R2
FunctionEnd

Function initUninstaller
	DetailPrint "Creating uninstaller..."

	;create uninstaller
	WriteUninstaller "$INSTDIR\Uninstall.exe"
	
	;add our uninstaller to the Add/Remove Programs dialog
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\dot" \
					"DisplayName" "Dojo Offline Toolkit"
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\dot" \
					"UninstallString" "$INSTDIR\Uninstall.exe"
	WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\dot" \
					"NoModify" 1
	WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\dot" \
					"NoRepair" 1
FunctionEnd

Function startOnStartup
	DetailPrint "Registering Dojo Offline to start on system startup..."

	;have our local proxy start up on system startup
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "DojoOffline" '"$INSTDIR\dot.exe" "$INSTDIR\"'
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
		
		;restore prefs.js pre-Dojo Offline values
		${Un_ReplaceLineStr} "$APPDATA\Mozilla\Firefox\Profiles\$currentProfile\prefs.js" \
								${PAC_LINE_START} "$R2$\r$\n"
		${Un_ReplaceLineStr} "$APPDATA\Mozilla\Firefox\Profiles\$currentProfile\prefs.js" \
								${PROXY_TYPE_LINE_START} "$R3$\r$\n"

		IntOp $R1 $R1 + 1
	${loop}
FunctionEnd
  
Section "Install"
	DetailPrint "Installing Dojo Offline version ${VERSION}..."
	SetOutPath "$INSTDIR"
	
	call ensureEnvironment
	call createFileLayout
	call updateConfigFile
	call storeAppMetadata
	call handleInternetExplorer
	call handleFirefox
	call startOnStartup
	call initUninstaller
	
	DetailPrint "Finished installing Dojo Offline."
	DetailPrint "Have Fun!"			
SectionEnd

Section "Uninstall"
	DetailPrint "Uninstalling Dojo Offline..."
	DetailPrint "All your personal offline application data will be"
	DetailPrint "left untouched -- see $APPDATA\Dojo\dot\ to access"
	
	DetailPrint "Removing Dojo Offline files and directories..."

	Delete "$INSTDIR\config"
	Delete "$INSTDIR\dot.exe"
	Delete "$INSTDIR\proxy.exe"
	Delete "$INSTDIR\Uninstall.exe"
	
	Delete "$APPDATA\Dojo\dot\.offline-pac"

	RMDir /r "$PROGRAMFILES\Dojo\dot"
	RMDir "$PROGRAMFILES\Dojo"
	
	;restore previous IE and Firefox proxy settings
	Call un.restoreIEProxySettings
	Call un.restoreFirefoxProxySettings

	;clean up our final registry keys
	DetailPrint "Cleaning up Dojo Offline registry keys..."
	DeleteRegKey HKCU "Software\Dojo\dot"
	DeleteRegKey /ifempty HKCU "Software\Dojo"
	DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\dot"
	DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "DojoOffline"
	
	DetailPrint "Dojo Offline is uninstalled!"
	
	StrCpy $R1 "Dojo Offline is now uninstalled."
	StrCpy $R1 "$R1 Please restart Firefox and Internet Explorer"
	StrCpy $R1 "$R1 for the uninstallation to take effect."
	
	MessageBox MB_OK $R1
SectionEnd