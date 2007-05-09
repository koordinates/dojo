#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <assert.h>

#include "polipo.h"

/** Our strategy for dealing with the network falling out from under
    us is as follows:

    We start assuming the network exists (i.e. proxyOffline = no). If
    at any time we get a network error, we automatically move offline
    and retry the request again, causing the data to be retrieved from our
    offline cache if available. We therefore call goOffline(), which sets
    proxyOffline = yes, causing Polipo to therefore start using the local
    data cache. See client.c:httpClientReplayNeeded and
    client.c:httpClientReplay for the appropriate code where this occurs.
    We place calls to httpClientReplayNeeded before most httpServerAbort
    calls in server.c to attempt a replay if necessary instead of
    aborting the request and sending an error message to the client.

    We depend on the offline JavaScript layer to determine when our particular
    web application has lost the network -- if so, we then call our local
    goOffline() API on the local proxy. The web app also periodically checks
    to see if the web application has reappeared on the network -- if so, we
    call goOnline() on the local proxy. This happens through the JavaScript layer.
    Doing this through the JavaScript layer simplifies our code and allows us to 
    avoid having custom sockets being opened on a listener thread at the C level,
    which would be checking to see if each web app is available, which would get
    complicated.

    FIXME: If we have multiple offline-enabled web apps running at once, how
    will one of them pushing us offline affect the others?
*/

#ifdef NO_OFFLINE_SUPPORT /* compile out offline support */

void preinitOffline(){
    return;
}

void initOffline(){
    return;
}

#else

/* 1 if we are online, 0 if we are offline. */
int online_flag = 1;

AtomPtr offlineFile = NULL;
AtomPtr offlinePACFile = NULL;

static int atomSetterOffline(ConfigVariablePtr var, 
                                void *value){
    return configAtomSetter(var, value);
}

static void initOfflineFileName(void){
    if(offlineFile){
        offlineFile = expandTilde(offlineFile);
    }

    if(offlineFile == NULL){
        offlineFile = expandTilde(internAtom("~/.polipo-offline"));
    }

    if(offlineFile == NULL){
        if(access("/etc/polipo/offline", F_OK) >= 0){
            offlineFile = internAtom("/etc/polipo/offline");
        }
    }

    if(offlineFile == NULL){
        do_log(L_INFO, "Unable to open Polipo offline file list\n");
    }
}

static void initOfflinePACFileName(void){
    if(offlinePACFile){
        offlinePACFile = expandTilde(offlinePACFile);
    }

    if(offlinePACFile == NULL){
        offlinePACFile = expandTilde(internAtom("~/.polipo-offline-pac"));
    }

    if(offlinePACFile == NULL){
        if(access("/etc/polipo/offline-pac", F_OK) >= 0){
            offlinePACFile = internAtom("/etc/polipo/offline-pac");
        }
    }

    if(offlinePACFile == NULL){
        do_log(L_INFO, "Unable to open generated Polipo "
                       "offline Proxy AutoConfig (PAC) file\n");
    }
}

void preinitOffline(void){
    CONFIG_VARIABLE_SETTABLE(offlineFile, CONFIG_ATOM, atomSetterOffline,
                             "File specifying the path to our offline file list");
    CONFIG_VARIABLE_SETTABLE(offlinePACFile, CONFIG_ATOM, atomSetterOffline,
                             "File specifying the path to our generated PAC file");
}

void initOffline(void){
    /* get the correct filename to our offline file list and PAC file */
    initOfflineFileName();
    initOfflinePACFileName();
    
    /* load our list of offline enabled hosts */
    if(offlineFile != NULL){
        loadOfflineList();
    }
    
    /* Under some conditions, such as if someone has upgraded
        Polipo, removing the default PAC file but leaving the
        offline-list present, we must regenerate the PAC file
        to ensure it is up to date. Simply do this on
        startup each time, in case someone has hand edited
        the offline list as well. */
    generatePACFile();
}

int isValidHost(char host[]){
    int index;
    char c;
    int valid;
    
    if(host == NULL || strlen(host) == 0){
        return 0; /* invalid */
    }
    
    /** 
        Whitelist allowed host characters according to RFC 1034.
        What is allowed: A-Z a-z 0-9 dash space dot. The first
        character MUST be A-Z or a-z according to RFC 1034, but
        we allow numbers because the host could be an IP address.
    */
    
    if(strncmp("127.0.0.1", host, 9) == 0){
        return 0; /* invalid */
    }
    
    for(index = 0; index < strlen(host); index++){
        c = host[index];
        valid = 0;
        
        /* A-Z */
        if(c >= 65 && c <= 90){
            valid = 1;
        }
        
        /* a-z */
        if(c >= 97 && c <= 122){
            valid = 1;
        }
        
        /* 0-9 */
        if(c >= 48 && c <= 57){
            valid = 1;
        }
        
        /* dash, period, or space */
        if((c == 45 || c == 46 || c == 32) && index != 0){
            valid = 1;
        }
        
        if(valid == 0){
            /* failed the whitelist! */
            return 0; /* invalid */
        }
    }
        
    return 1; /* success */
}

/**
     Generates and saves a Proxy AutoConfig (PAC) file 
     from our list of offline-enabled hosts. Returns 1
     if successful, 0 if not.
*/
int generatePACFile(){
    FILE *out_file;
    struct offline_list_entry *entry_ptr;
    int first = 1;
    
    assert(offlinePACFile != NULL);
    assert(offlinePACFile->string != NULL);
    
    /* open the file we will write the PAC contents to */
    out_file = fopen(offlinePACFile->string, "w");
    if(out_file == NULL){
        do_log(L_ERROR, "Unable to open PAC file: %s\n", 
               offlinePACFile->string);
        return 0; /* failed */
    }
    
    fprintf(out_file, "function FindProxyForURL(url, host){\n");
    
    /** Provide a way to 'bust' the proxy's cache and really 
        test the outer network. This is with the magic
        query variable 'proxybust'. */
    fprintf(out_file, "   if(/proxybust/.test(url)){\n"
                      "      return \"DIRECT\";\n"
                      "   }\n\n");
    
    if(offline_list_ptr != NULL){ /* do we even have any sites? */
        fprintf(out_file, "   if("); /* beginning of list of sites */
    
        /* go through each site and write it out */
        entry_ptr = offline_list_ptr;
        while(entry_ptr != NULL){
           if(isValidHost(entry_ptr->host_ptr) == 1){ /* be extra careful */
              if(first == 0){
                 fprintf(out_file, "\t\t|| ");  
              }else{
                 first = 0;
              }
        
              fprintf(out_file, "shExpMatch(url, \"http://%s*\")\n", 
                      entry_ptr->host_ptr);  
           }
        
           entry_ptr = entry_ptr->next_ptr;
        }
    
        fprintf(out_file, "\t\t){\n"); /* end of list of sites */
    
        /* FIXME: Don't hard code the proxy port here */
        fprintf(out_file, "      return \"PROXY 127.0.0.1:8123; DIRECT\";\n"
                          "   }else{\n"
                          "      return \"DIRECT\";\n"
                          "   }\n"
                          "}\n");
    }else{
        fprintf(out_file, "   return \"DIRECT\";\n"
                          "}\n");
    }

    fclose(out_file);

    return 1;   
}

int addOfflineHost(char host[]){
    struct offline_list_entry *entry_ptr;
    struct offline_list_entry *new_entry_ptr;
    int status;
    
    if(isValidHost(host) == 0){ /* invalid host */
        do_log(L_FORBIDDEN, 
                "off.c:addOfflineHost: Illegal host name\n");
        return 0; /* failed */
    }
    
    if(isHostAvailableOffline(host) == 1){
        /* already registered to be available offline */
        return 1; /* success */
    }
    
    /* instantiate an entry for this host */
    new_entry_ptr = (struct offline_list_entry *)
                    malloc(sizeof(struct offline_list_entry));
    if(new_entry_ptr == NULL){
        do_log(L_ERROR, "No memory\n");
        return 0; /* failed */
    }
    new_entry_ptr->host_ptr = (char *)malloc((unsigned) (strlen(host) + 1));
    if(new_entry_ptr->host_ptr == NULL){
        do_log(L_ERROR, "No memory\n");
        return 0; /* failed */
    }
    memcpy(new_entry_ptr->host_ptr, host, strlen(host) + 1);
    new_entry_ptr->next_ptr = NULL;
    
    /* add it in the right place */
    if(offline_list_ptr == NULL){
        offline_list_ptr = new_entry_ptr;
    }else{
        /* shuffle along the list until we get to the end */
        entry_ptr = offline_list_ptr;
        while(entry_ptr->next_ptr != NULL){
            entry_ptr = entry_ptr->next_ptr;
        }
        entry_ptr->next_ptr = new_entry_ptr;
    }
    
    /* try to save the offline list */
    status = saveOfflineList();
    
    /* try to generate and save a new Proxy AutoConfig (PAC) file */
    status = generatePACFile();
    
    return status;
}

int removeOfflineHost(char host[]){
    struct offline_list_entry *entry_ptr, *prev_ptr,
                                *found_ptr;
    int successful = 0;
                                
    found_ptr = NULL;
    prev_ptr = NULL;
    entry_ptr = NULL;
    
    if(isValidHost(host) == 0){ /* invalid host */
        do_log(L_FORBIDDEN, 
                "off.c:removeOfflineHost: Illegal host name\n");
        return 0; /* failed */
    }
    
    if(isHostAvailableOffline(host) == 0){
        /* host was never available offline */
        return 0; /* failed */
    }
    
    /* locate this entry */
    entry_ptr = offline_list_ptr;
    while(entry_ptr != NULL){
        if(strcmp(entry_ptr->host_ptr, host) == 0){
            break;
        }
        
        prev_ptr = entry_ptr;
        entry_ptr = entry_ptr->next_ptr;
    }
    
    if(entry_ptr == NULL){
        return 0; /* failed */
    }
    
    found_ptr = entry_ptr;
    
    /* was our found entry at the beginning? */
    if(prev_ptr == NULL){
        offline_list_ptr = found_ptr->next_ptr;
        free(found_ptr);
        successful = 1;
    }
    
    /* was our found entry at the end? */
    if(found_ptr->next_ptr == NULL){
        prev_ptr->next_ptr = NULL;
        free(found_ptr);
        successful = 1;
    }
    
    /* was our found entry in the middle? */
    if(prev_ptr != NULL && found_ptr->next_ptr != NULL){
        prev_ptr->next_ptr = found_ptr->next_ptr;
        free(found_ptr);
        successful = 1;
    }
    
    if(successful == 0){
        return 0; /* failed */
    }else{
        /* try to save the offline list */      
        successful = saveOfflineList();

        /* try to generate and save a new Proxy AutoConfig (PAC) file */
        successful = generatePACFile();
        
        return successful;
    }
}

int isHostAvailableOffline(char host[]){
    struct offline_list_entry *entry_ptr;
    
    if(isValidHost(host) == 0){ /* invalid host */
        do_log(L_FORBIDDEN, 
                "off.c:isHostAvailableOffline: Illegal host name\n");
        return 0; /* failed */
    }
    
    entry_ptr = offline_list_ptr;
    while(entry_ptr != NULL){
        if(strcmp(entry_ptr->host_ptr, host) == 0){
            return 1; /* the host is available offline */
        }
        
        entry_ptr = entry_ptr->next_ptr;
    }
    
    /* host not available offlne */
    return 0;
}

int saveOfflineList(void){
    FILE *file_ptr;
    struct offline_list_entry *entry_ptr;
    char message[1024];
    
    /* make sure we have an actual file name */
    assert(offlineFile != NULL);
    
    /* see if we have permission to access our offline file */
    if(access(offlineFile->string, F_OK) > 0
       && access(offlineFile->string, W_OK) < 0){
        sprintf(message, "We don't have permission to write out the offline list: %s\n", 
                offlineFile->string);
        do_log(L_ERROR, message);
        return 0; /* failure */
    }

    /* open the file */
    file_ptr = fopen(offlineFile->string, "w");
    if(file_ptr == NULL){
        sprintf(message, "Unable to open offline list file, errno: %d\n", errno);
        do_log(L_ERROR, message);
        return 0; /* failure */
    }

    /* go through each of our host entries, writing them out to the file */
    entry_ptr = offline_list_ptr;
    while(entry_ptr != NULL){
        /* write out this host name */
        fprintf(file_ptr, "%s\n", entry_ptr->host_ptr);
        
        /* get the next entry */
        entry_ptr = entry_ptr->next_ptr;
    }
    
    fclose(file_ptr);
    
    return 1; /* success */
}

int loadOfflineList(void){
    FILE *file_ptr;
    char line[1024];
    char *line_ptr;
    char message[1024];
    struct offline_list_entry *new_entry_ptr;
    struct offline_list_entry *entry_ptr;
    
    /* make sure we have an actual file name */
    assert(offlineFile != NULL);
    
    /* see if we even have an offline file yet */
    if(access(offlineFile->string, F_OK) < 0){
        /* no saved list yet */
        sprintf(message, "Offline list file does not exist: %s\n", 
                offlineFile->string);
        do_log(L_INFO, message);
        return 1; /* success */
    }
    
    /* see if we have permission to access our offline file */
    if(access(offlineFile->string, R_OK) < 0){
        sprintf(message, "We don't have permission to read the offline list: %s\n", 
                offlineFile->string);
        do_log(L_ERROR, message);
        return 0; /* failure */
    }

    /* try to open the file */
    file_ptr = fopen(offlineFile->string, "r");
    if(file_ptr == NULL){
        sprintf(message, "Unable to open offline list file, errno: %d\n", errno);
        do_log(L_ERROR, message);
        return 0; /* failure */
    }
    
    /* read each entry */
    while(1){
        /* get the line */
        line_ptr = fgets(line, sizeof(line), file_ptr);
        
        if(line_ptr == NULL){
            break;
        }
        
        /* strip off the new line */
        line[strlen(line) - 1] = '\0';
        
        /* do we have anything? */
        if(strlen(line) == 0){
            continue;
        }
        
        /* instantiate an entry for this host */
        new_entry_ptr = (struct offline_list_entry *)
                        malloc(sizeof(struct offline_list_entry));
        if(new_entry_ptr == NULL){
            do_log(L_ERROR, "No memory\n");
            return 0; /* failure */
        }
        new_entry_ptr->host_ptr = (char *)malloc((unsigned) (strlen(line) + 1));
        if(new_entry_ptr->host_ptr == NULL){
            do_log(L_ERROR, "No memory\n");
            return 0; /* failure */
        }
        memcpy(new_entry_ptr->host_ptr, line, strlen(line) + 1);
        new_entry_ptr->next_ptr = NULL;
        
        if(offline_list_ptr == NULL){
            offline_list_ptr = new_entry_ptr;
        }else{
            /* shuffle along the list until we get to the end */
            entry_ptr = offline_list_ptr;
            while(entry_ptr->next_ptr != NULL){
                entry_ptr = entry_ptr->next_ptr;
            }
            entry_ptr->next_ptr = new_entry_ptr;
        }
    }
    
    fclose(file_ptr);
    
    return 1; /* success */
}

void setOfflineFileName(char *name_ptr){
    offlineFile = internAtom(name_ptr);
}

void goOnline(void){
    do_log(L_INFO, "Going online\n");
    online_flag = 1;
    proxyOffline = 0; /* 0 means take proxy online */
}

void goOffline(void){
    do_log(L_INFO, "Going offline\n");
    online_flag = 0;
    proxyOffline = 1; /* 1 means take proxy offline */
}

int isOnline(void){
    return online_flag;
}

#endif /* if/else for NO_OFFLINE_SUPPORT */
