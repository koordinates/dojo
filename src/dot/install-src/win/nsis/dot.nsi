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

Function handleInternetExplorer
	;preserve three possible previous proxy settings:
	; * "Autodetect proxy settings" - used for the network-based PAC file installation
	; * A previous PAC file setting
	; * Directly using a proxy
	
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

	;update Internet Explorer's PAC file setting
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Internet Settings" \
										"AutoConfigURL" \
										"file://$APPDATA\Dojo\dot\.offline-pac"
FunctionEnd

Function removeTrailingNewlines
	Var /GLOBAL inputLength
	Var /GLOBAL startCut
	Var /GLOBAL inputString
	Var /GLOBAL fragment

	Pop $inputString
	
	StrLen $inputLength $inputString
	${if} $inputLength >= 2
		IntOp $startCut $inputLength - 2
		StrCpy $fragment $inputString 2 $startCut
		${if} $fragment == "$\r$\n"
			StrCpy $inputString $inputString $startCut
		${endif}
	${endif}
	
	Push $inputString
FunctionEnd

Function handleFirefox
	Var /GLOBAL searchHandle
	Var /GLOBAL foundDirectory
	Var /GLOBAL allProfileNames
	
	StrCpy $allProfileNames ""
	
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
FunctionEnd

Function handleFirefoxProfile
	;for each profile, get the prefs.js file, read out the old network settings,
	;persist this in a registry key as a sub-value under the name of this
	;profile (such as w2hwmkob.default), then update the prefs.js file with our
	;new values by adding them to the bottom. When Firefox restarts it will
	;simply over-write the old settings and use the new ones we added
	;at the bottom, since lower settings get precedence since prefs.js is
	;just JavaScript. On Uninstallation we will restore these values
	;using the registry settings.
	
	Var /GLOBAL profilePath
	Var /GLOBAL profileName
	Var /GLOBAL pacPref
	Var /GLOBAL proxyTypePref
	Var /GLOBAL prefsFile
	Var /GLOBAL currentLine
	Var /GLOBAL lineStart
	Var /GLOBAL lineLen
	
	Pop $profileName
	
	StrCpy $pacPref 'user_pref("network.proxy.autoconfig_url", null);'
	StrCpy $proxyTypePref 'user_pref("network.proxy.type", 0);'	
	
	StrCpy $profilePath "$APPDATA\Mozilla\Firefox\Profiles\$profileName"
	
	;keep reading pref lines in until we find
	;the ones we want
	ClearErrors
	FileOpen $prefsFile "$profilePath\prefs.js" a
	loop:
		IfErrors done
		FileRead $prefsFile $currentLine
		
		;is this the autoconfig_url pref setting?
		StrLen $lineLen 'user_pref("network.proxy.autoconfig_url",'
		StrCpy $lineStart $currentLine $lineLen
		${if} $lineStart == 'user_pref("network.proxy.autoconfig_url",'
			StrCpy $pacPref $currentLine
			Push $pacPref
			Call removeTrailingNewlines
			Pop $pacPref
		${endif}
		
		;is this the proxy type setting?
		StrLen $lineLen 'user_pref("network.proxy.type",'
		StrCpy $lineStart $currentLine $lineLen
		${if} $lineStart == 'user_pref("network.proxy.type",'
			StrCpy $proxyTypePref $currentLine
			Push $proxyTypePref
			Call removeTrailingNewlines
			Pop $proxyTypePref
		${endif}
		
		Goto loop 
	done:
		;write out our new proxy settings at the end of the proxy file
		FileSeek $prefsFile 0 END
		FileWrite $prefsFile '$\r$\n'
		FileWrite $prefsFile 'user_pref("network.proxy.type", 2);$\r$\n'
		FileWrite $prefsFile 'user_pref("network.proxy.autoconfig_url", "file://$APPDATA\Dojo\dot\.offline-pac");$\r$\n'
		
		;persist our old proxy settings in the registry
		WriteRegStr HKCU "Software\Dojo\dot\mozilla_profiles\$profileName" "pacPref" $pacPref
		WriteRegStr HKCU "Software\Dojo\dot\mozilla_profiles\$profileName" "proxyTypePref" $proxyTypePref
		
		FileClose $prefsFile
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

Function startOnStartup
	;have our local proxy start up on system startup
	WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "DojoOffline" '"$INSTDIR\dot.exe" "$INSTDIR\"'
FunctionEnd

Function doFinalSanityCheck
	;do a final sanity check to make sure our environment is correctly installed
	;if not, uninstall
FunctionEnd

Function un.RestoreIEProxySettings
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

Function un.RestoreFirefoxProxySettings
	DetailPrint "RestoreFirefoxProxySettings"
	Var /GLOBAL allProfiles
	Var /GLOBAL currentProfile
	Var /GLOBAL pFile

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
		
		;open the pref.js file for this profile
		ClearErrors
		FileOpen $pFile "$APPDATA\Mozilla\Firefox\Profiles\$currentProfile\prefs.js" a
		IfErrors done
			
		;append our original values -- if there were none, then
		;the default set the pref to null, which will clear
		;it out when Firefox reads it, giving a correct value
		;of having no proxy settings and directly connecting
		;to the Internet
		FileSeek $pFile 0 END
		FileWrite $pFile '$\r$\n'
		FileWrite $pFile '$R2$\r$\n'
		FileWrite $pFile '$R3$\r$\n'
		
		done:
			FileClose $pFile
		
			IntOp $R1 $R1 + 1
	${loop}
FunctionEnd

;
;Define the StrTok macro, a publicly available snippet 
;of source code for NSIS available under the same
;license as NSIS, free for developers to use, under
;the zlib/png license which is just the BSD.
;NSIS License here: http://nsis.sourceforge.net/License
;StrTok wiki page in NSIS docs here: http://nsis.sourceforge.net/StrTok 
;

!define StrTok "!insertmacro StrTok"
 
!macro StrTok ResultVar String Separators ResultPart SkipEmptyParts
  Push "${String}"
  Push "${Separators}"
  Push "${ResultPart}"
  Push "${SkipEmptyParts}"
  Call un.StrTok
  Pop "${ResultVar}"
!macroend
 
Function un.StrTok
/*After this point:
  ------------------------------------------
  $0 = SkipEmptyParts (input)
  $1 = ResultPart (input)
  $2 = Separators (input)
  $3 = String (input)
  $4 = SeparatorsLen (temp)
  $5 = StrLen (temp)
  $6 = StartCharPos (temp)
  $7 = TempStr (temp)
  $8 = CurrentLoop
  $9 = CurrentSepChar
  $R0 = CurrentSepCharNum
  */
 
  ;Get input from user
  Exch $0
  Exch
  Exch $1
  Exch
  Exch 2
  Exch $2
  Exch 2
  Exch 3
  Exch $3
  Exch 3
  Push $4
  Push $5
  Push $6
  Push $7
  Push $8
  Push $9
  Push $R0
 
  ;Parameter defaults
  ${IfThen} $2 == `` ${|} StrCpy $2 `|` ${|}
  ${IfThen} $1 == `` ${|} StrCpy $1 `L` ${|}
  ${IfThen} $0 == `` ${|} StrCpy $0 `0` ${|}
 
  ;Get "String" and "Separators" length
  StrLen $4 $2
  StrLen $5 $3
  ;Start "StartCharPos" and "ResultPart" counters
  StrCpy $6 0
  StrCpy $8 -1
 
  ;Loop until "ResultPart" is met, "Separators" is found or
  ;"String" reaches its end
  ResultPartLoop: ;"CurrentLoop" Loop
 
  ;Increase "CurrentLoop" counter
  IntOp $8 $8 + 1
 
  StrSearchLoop:
  ${Do} ;"String" Loop
    ;Remove everything before and after the searched part ("TempStr")
    StrCpy $7 $3 1 $6
 
    ;Verify if it's the "String" end
    ${If} $6 >= $5
      ;If "CurrentLoop" is what the user wants, remove the part
      ;after "TempStr" and itself and get out of here
      ${If} $8 == $1
      ${OrIf} $1 == `L`
        StrCpy $3 $3 $6
      ${Else} ;If not, empty "String" and get out of here
        StrCpy $3 ``
      ${EndIf}
      StrCpy $R0 `End`
      ${ExitDo}
    ${EndIf}
 
    ;Start "CurrentSepCharNum" counter (for "Separators" Loop)
    StrCpy $R0 0
 
    ${Do} ;"Separators" Loop
      ;Use one "Separators" character at a time
      ${If} $R0 <> 0
        StrCpy $9 $2 1 $R0
      ${Else}
        StrCpy $9 $2 1
      ${EndIf}
 
      ;Go to the next "String" char if it's "Separators" end
      ${IfThen} $R0 >= $4 ${|} ${ExitDo} ${|}
 
      ;Or, if "TempStr" equals "CurrentSepChar", then...
      ${If} $7 == $9
        StrCpy $7 $3 $6
 
        ;If "String" is empty because this result part doesn't
        ;contain data, verify if "SkipEmptyParts" is activated,
        ;so we don't return the output to user yet
 
        ${If} $7 == ``
        ${AndIf} $0 = 1 ;${TRUE}
          IntOp $6 $6 + 1
          StrCpy $3 $3 `` $6
          StrCpy $6 0
          Goto StrSearchLoop
        ${ElseIf} $8 == $1
          StrCpy $3 $3 $6
          StrCpy $R0 "End"
          ${ExitDo}
        ${EndIf} ;If not, go to the next result part
        IntOp $6 $6 + 1
        StrCpy $3 $3 `` $6
        StrCpy $6 0
        Goto ResultPartLoop
      ${EndIf}
 
      ;Increase "CurrentSepCharNum" counter
      IntOp $R0 $R0 + 1
    ${Loop}
    ${IfThen} $R0 == "End" ${|} ${ExitDo} ${|}
          
    ;Increase "StartCharPos" counter
    IntOp $6 $6 + 1
  ${Loop}
 
/*After this point:
  ------------------------------------------
  $3 = ResultVar (output)*/
 
  ;Return output to user
 
  Pop $R0
  Pop $9
  Pop $8
  Pop $7
  Pop $6
  Pop $5
  Pop $4
  Pop $0
  Pop $1
  Pop $2
  Exch $3
FunctionEnd
;end definition of StrTok macro
  
Section "Install"
	SetOutPath "$INSTDIR"
	
	call ensureEnvironment
	call createFileLayout
	call updateConfigFile
	call storeAppMetadata
	call handleInternetExplorer
	call handleFirefox
	call startOnStartup
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
	
	;restore previous IE and Firefox proxy settings
	Call un.RestoreIEProxySettings
	Call un.RestoreFirefoxProxySettings

	;clean up our final registry keys
	DeleteRegKey HKCU "Software\Dojo\dot"
	DeleteRegKey /ifempty HKCU "Software\Dojo"
	DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\dot"
	DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "DojoOffline"
SectionEnd