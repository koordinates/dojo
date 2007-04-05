#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef __MINGW32_VERSION
#define MINGW
#endif

/* A simple restarter that keeps restarting the proxy
   if it fails. 
   
   @author Brad Neuberg, bkn3@columbia.edu
*/
int main(int argc, char **argv)
{
    int len;
    int results;
    char *path;
    char systemStr[5000];
   
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
     
#ifdef MINGW
    strcpy(systemStr, "cd \"");
    strcat(systemStr, path);
    strcat(systemStr, "\" & ");
    strcat(systemStr, "proxy.exe -c ");
    strcat(systemStr, "config");
#else
    strcpy(systemStr, "cd ");
    strcat(systemStr, path);
    strcat(systemStr, "; ");
    strcat(systemStr, "./proxy -c ");
    strcat(systemStr, "config");
#endif
   
    printf("Systemstr: %s\n", systemStr);
    
    /** see if we have a command processor */
    if(system(NULL) == 0){
        printf("No command process available\n");
        return(1);
    }
    
    while(1){
        results = system(systemStr);
        printf("---Restarting local proxy...; results=%d\n", results);
    }
    
    printf("---Unable to continue executing local proxy\n");
    return(1);
}
