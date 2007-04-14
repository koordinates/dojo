;This file includes a number of standard functions
;that are distributed on the NSIS portal for free use
;by developers. These standard functions and samples
;are distributed under the same license as NSIS, which
;is the zlib/png license. The zlib/png license is just
;the BSD license under a different name.
;Each code snippet is clearly marked with the Wiki
;page location on the NSIS portal where it was taken
;from.

;StrTok wiki page in NSIS docs here: http://nsis.sourceforge.net/StrTok

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

;ReplaceLineStr wiki page in NSIS docs here: 
;http://nsis.sourceforge.net/Replace_line_that_starts_with_specified_string

!define ReplaceLineStr "!insertmacro ReplaceLineStr"
!define Un_ReplaceLineStr "!insertmacro Un_ReplaceLineStr"
 
!macro ReplaceLineStr ModifyFile BeginWith ReplaceLineWith
  Push ${ModifyFile}
  Push ${BeginWith}
  Push ${ReplaceLineWith}
  Call ReplaceLineStr
!macroend

!macro Un_ReplaceLineStr ModifyFile BeginWith ReplaceLineWith
  Push ${ModifyFile}
  Push ${BeginWith}
  Push ${ReplaceLineWith}
  Call un.ReplaceLineStr
!macroend

!macro ReplaceLineStrFunctionBody
	 Exch $R0 ; string to replace that whole line with
	 Exch
	 Exch $R1 ; string that line should start with
	 Exch
	 Exch 2
	 Exch $R2 ; file
	 Push $R3 ; file handle
	 Push $R4 ; temp file
	 Push $R5 ; temp file handle
	 Push $R6 ; global
	 Push $R7 ; input string length
	 Push $R8 ; line string length
	 Push $R9 ; global
 
	  StrLen $R7 $R1
 
	  GetTempFileName $R4
 
	  FileOpen $R5 $R4 w
	  FileOpen $R3 $R2 r
 
	  ReadLoop:
	  ClearErrors
	   FileRead $R3 $R6
	    IfErrors Done
 
	   StrLen $R8 $R6
	   StrCpy $R9 $R6 $R7 -$R8
	   StrCmp $R9 $R1 0 +3
 
	    FileWrite $R5 "$R0$\r$\n"
	    Goto ReadLoop
 
	    FileWrite $R5 $R6
	    Goto ReadLoop
 
	  Done:
 
	  FileClose $R3
	  FileClose $R5
 
	  SetDetailsPrint none
	   Delete $R2
	   Rename $R4 $R2
	  SetDetailsPrint both
 
	 Pop $R9
	 Pop $R8
	 Pop $R7
	 Pop $R6
	 Pop $R5
	 Pop $R4
	 Pop $R3
	 Pop $R2
	 Pop $R1
	 Pop $R0
	;end ReplaceLineStrFunctionBody
!macroend

Function ReplaceLineStr
!insertmacro ReplaceLineStrFunctionBody
FunctionEnd

Function un.ReplaceLineStr
!insertmacro ReplaceLineStrFunctionBody
FunctionEnd

;end of definition for ReplaceLineStr

;The following functions were custom written
;as part of the Dojo Offline installer
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