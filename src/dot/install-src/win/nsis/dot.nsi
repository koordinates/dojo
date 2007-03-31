!include LogicLib.nsh
!include "MUI.nsh"

!define VERSION "0.0.1"

Name "Dojo Offline Toolkit"
OutFile "${INSTALL_FILENAME}"

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

	;Store installation folder
	WriteRegStr HKCU "Software\Dojo\dot" "" $INSTDIR
  
	;Create uninstaller
	WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd

Section "Uninstall"
	File "dot.exe"
	File "config"

	Delete "$INSTDIR\Uninstall.exe"

	RMDir "$INSTDIR"

	DeleteRegKey /ifempty HKCU "Software\Dojo\dot"
SectionEnd