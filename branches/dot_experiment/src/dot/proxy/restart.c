#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef __MINGW32_VERSION
#define MINGW
#endif

#ifdef MINGW
#include <windows.h>
#include <shellapi.h>
#endif

void addTrailingSlash(char *path){
    int len;
    
    /* Add a trailing slash */
    len = strlen(path);
#ifdef MINGW
    if(path[len - 1] != '\\'){
        path[len - 1] = '\\';
        path[len] = '\0';
    }
#else
    if(path[len - 1] != '/'){
        path[len - 1] = '/';
        path[len] = '\0';
    }
#endif
}

void getSystemString(char *systemStr, char *path){
#ifndef MINGW
    /* we only need the system string to execute
        this process on non-Windows systems */
    strcpy(systemStr, "cd ");
    strcat(systemStr, path);
    strcat(systemStr, "; ");
    strcat(systemStr, "./proxy -c ");
    strcat(systemStr, "config");
#endif
}

void executeProxy(char *systemStr, char *path){
#ifdef MINGW
    /* can't use system() on Windows - opens
        a DOS window */
    while(1){
        /* execute the command */
        BOOL result;
        SHELLEXECUTEINFO sei = { sizeof(sei) };
        sei.fMask = SEE_MASK_FLAG_DDEWAIT | SEE_MASK_NOCLOSEPROCESS;
        sei.nShow = SW_HIDE;
        sei.lpVerb = "open";
        sei.lpFile = "proxy.exe";
        sei.lpParameters = " -c config";
        sei.lpDirectory = (LPCTSTR)path;
        result = ShellExecuteEx(&sei);
        
        /* TODO: Get printf's to write into Polipo's log file. */
        
        /* make sure there wasn't an error */
        if(result == FALSE){
            printf("Unable to execute local proxy: %d\n", (int)GetLastError());
            return;
        }
        
        /* wait until application has terminated */
        WaitForSingleObject(sei.hProcess, INFINITE);

        /* close process handle */
        if(sei.hProcess != NULL){
            CloseHandle(sei.hProcess);
        }  
        
        printf("---Restarting local proxy...\n");
    }
#else    
    /** see if we have a command processor */
    if(system(NULL) == 0){
        printf("No command process available\n");
        return;
    }
    
    while(1){
        system(systemStr);
        printf("---Restarting local proxy...\n");
    }
    
#endif
}

/* A simple restarter that keeps restarting the proxy
   if it fails. 
   
   @author Brad Neuberg, bkn3@columbia.edu
*/
int main(int argc, char **argv)
{
    char *path;
    char systemStr[5000];
    
#ifdef MINGW
    /* On Windows, we get an annoying Dr. Watson
        dialog that appears if this sub-process
        crashes -- tell Windows not to do this.
        Technique from 
        http://blogs.msdn.com/oldnewthing/archive/2004/07/27/198410.aspx
    */
    DWORD dwMode = SetErrorMode(SEM_NOGPFAULTERRORBOX);
    SetErrorMode(dwMode | SEM_NOGPFAULTERRORBOX);
#endif
   
    /* The absolute path directory of where the proxy executable
        is located is passed in as the first argument,
        with a trailing slash. If on Windows this must have
        quotes around it. Example:
        "C:\Program Files\Dojo\dot\" */
    if(argc < 2){
        printf("You must pass the full absolute path of the proxy location as the first argument\n");
        return(1);
    }else{
        path = argv[1];
    }

    addTrailingSlash(path);
    getSystemString(systemStr, path);
    executeProxy(systemStr, path);
    
    printf("---Unable to continue executing local proxy\n");
    return(1);
}
