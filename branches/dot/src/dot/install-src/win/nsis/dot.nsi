!include "LogicLib.nsh"
!include "TextFunc.nsh"
!include "WordFunc.nsh"
!include "MUI.nsh"

!define VERSION "0.0.1"

Name "Dojo Offline Toolkit"
OutFile "Install.exe"

InstallDir "$PROGRAMFILES\Dojo\dot"

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
	;make sure this user has admin privs - the 'userInfo::getAccountType' 
	;plugin places its results on the stack
	userInfo::getAccountType
	pop $0
    ${if} $0 != "Admin"
		messageBox MB_OK "You must have Administrator privileges to install this application"
		Abort
	${endif}
	
	;TODO: Make sure the version of IE installed is supported
FunctionEnd

Function createFileLayout
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
	;update the configuration file to point to Windows locations,
	;rather than Unix ones - replace all slashes with backslashes
	${WordReplace} "$APPDATA" "\" "/" "+" $R1
	${ConfigWrite} "$INSTDIR\config" "diskCacheRoot = " '"$R1/Dojo/dot/.offline-cache"' $R0
	${ConfigWrite} "$INSTDIR\config" "offlineFile = " '"$R1/Dojo/dot/.offline-list"' $R0
	${ConfigWrite} "$INSTDIR\config" "offlinePACFile = " '"$R1/Dojo/dot/.offline-pac"' $R0
FunctionEnd

Function storeAppMetadata
	;store installation folder and application data folder
	WriteRegStr HKCU "Software\Dojo\dot" "InstallFolder" $INSTDIR
	WriteRegStr HKCU "Software\Dojo\dot" "AppFolder" "$APPDATA\Dojo\dot"
	
	;write out our version
	WriteRegStr HKCU "Software\Dojo\dot" "CurrentVersion" ${VERSION}
FunctionEnd

Function saveOldProxySettings
	;preserve three possible previous proxy settings:
	; * "Autodetect proxy settings" - used for the network-based PAC file installation
	; * A previous PAC file setting
	; * Directly using a proxy
	
	;exact proxy value given
	ReadRegDWORD $1 HKCU "Software\Microsoft\Windows\CurrentVersion\Internet Settings" "ProxyEnable"
	${if} $1 == ""
		StrCpy $1 "0"
	${endif}
	WriteRegDWORD HKCU "Software\Dojo\dot" "OriginalProxyEnable" $1
	
	;PAC file given
	ReadRegStr $1 HKCU "Software\Microsoft\Windows\CurrentVersion\Internet Settings" "AutoConfigURL"
	WriteRegStr HKCU "Software\Dojo\dot" "OriginalAutoConfigURL" $1
	
	;TODO: "Autodetect proxy settings" which is used for WPAD PAC files over the
	;network are not clearly reflected into the registry -- unable to
	;persist this setting -- will simply stay the same. Might conflict
	;with our PAC file setting and be given precedence -- test in a
	;WPAD environment.
	
	;turn off the old proxy settings
	WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Internet Settings" "ProxyEnable" 0
FunctionEnd

Function setNewProxySettings
	;update Internet Explorer's PAC file setting
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Internet Settings" \
										"AutoConfigURL" \
										"file://$APPDATA\Dojo\dot\.offline-pac"
FunctionEnd

Function initUninstaller
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

Function doFinalSanityCheck
	;do a final sanity check to make sure our environment is correctly installed
	;if not, uninstall
FunctionEnd
  
Section "Install"
	SetOutPath "$INSTDIR"
	
	call ensureEnvironment
	call createFileLayout
	call updateConfigFile
	call storeAppMetadata
	call saveOldProxySettings
	call setNewProxySettings
	call initUninstaller
	call doFinalSanityCheck				
SectionEnd

Section "Uninstall"
	Delete "$INSTDIR\config"
	Delete "$INSTDIR\dot.exe"
	Delete "$INSTDIR\proxy.exe"
	Delete "$INSTDIR\Uninstall.exe"
	
	Delete "$APPDATA\Dojo\dot\.offline-pac"

	RMDir /r "$PROGRAMFILES\Dojo\dot"
	RMDir "$PROGRAMFILES\Dojo"
	
	;restore previous proxy settings
	ReadRegDWORD $1 HKCU "Software\Dojo\dot" "OriginalProxyEnable"
	WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Internet Settings" "ProxyEnable" $1
	ReadRegStr $1 HKCU "Software\Dojo\dot" "OriginalAutoConfigURL"
	;was there even an old PAC setting?
	${if} $1 != ""
		WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Internet Settings" "AutoConfigURL" $1
	${else}
		DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Internet Settings" \
										"AutoConfigURL"
	${endif}

	;clean up our final registry keys
	DeleteRegKey HKCU "Software\Dojo\dot"
	DeleteRegKey /ifempty HKCU "Software\Dojo"
	DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\dot"
SectionEnd