!include LogicLib.nsh
!include "MUI.nsh"

!define VERSION "0.0.1"

Name "Dojo Offline Toolkit"
OutFile "Install.exe"

InstallDir "$PROGRAMFILES\Dojo\dot"

;get installation folder from registry if available
InstallDirRegKey HKCU "Software\Dojo\dot" ""

;no pages -- just install or uninstall seamlessly 
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"
  
Section "Install"
	SetOutPath "$INSTDIR"

	File "dot.exe"
	File "config"

	;store installation folder
	WriteRegStr HKCU "Software\Dojo\dot" "" $INSTDIR
	
	;update Internet Explorer's PAC file setting
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Internet Settings" \
										"AutoConfigURL" \
										"file://C:\hello-world22"
  
	;create uninstaller
	WriteUninstaller "$INSTDIR\Uninstall.exe"
	
	;add our uninstaller to the Add/Remove Programs dialog
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\dot" \
                 "DisplayName" "Dojo Offline Toolkit"
	WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\dot" \
                 "UninstallString" "$INSTDIR\Uninstall.exe"
SectionEnd

Section "Uninstall"
	Delete "$INSTDIR\config"
	Delete "$INSTDIR\dot.exe"
	Delete "$INSTDIR\Uninstall.exe"

	RMDir "$PROGRAMFILES\Dojo\dot"
	RMDir "$PROGRAMFILES\Dojo"

	DeleteRegKey /ifempty HKCU "Software\Dojo\dot"
	DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\dot"
SectionEnd