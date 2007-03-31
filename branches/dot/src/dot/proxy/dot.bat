@echo off
rem
rem Just keep looping over and over -- this is our
rem poor man's restarter, since we don't want to be
rem a Windows Service since that has some inappropriate
rem attributes, such as running out of the context of
rem a user account and running even when a user has
rem logged out. If DOT crashes for some reason
rem it will simply start up again quickly
rem through this infinite loop
rem
:loop
dot.exe -c config
echo Restarting dot...
goto loop