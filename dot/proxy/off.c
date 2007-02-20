#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <assert.h>

#include "polipo.h"

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

static int atomSetterOffline(ConfigVariablePtr var, 
								void *value){
    initOffline();
    return configAtomSetter(var, value);
}

void preinitOffline(void){
	CONFIG_VARIABLE_SETTABLE(offlineFile, CONFIG_ATOM, atomSetterOffline,
                             "File specifying the path to our offline file list");
}

void initOffline(void){
	/* get the correct filename to our offline file list */
	if(offlineFile){
        offlineFile = expandTilde(offlineFile);
	}

    if(offlineFile == NULL){
        offlineFile = expandTilde(internAtom("~/.polipo-offline"));
		printf("offlineFile: %s\n", offlineFile->string);
    }

    if(offlineFile == NULL){
        if(access("/etc/polipo/offline", F_OK) >= 0){
            offlineFile = internAtom("/etc/polipo/offline");
		}
    }

	if(offlineFile == NULL){
		do_log(L_INFO, "Unable to open Polipo offline file list");
	}
	
	/* load our list of offline enabled hosts */
	if(offlineFile != NULL){
		loadOfflineList();
	}
}

int isValidHost(char host[]){
	return 0;
}

int addOfflineHost(char host[]){
	return 0;
}

int removeOfflineHost(char host[]){
	return 0;
}

int isHostAvailableOffline(char host[]){
	return 0;
}

int saveOfflineList(void){
	return 0;
}

int loadOfflineList(void){
	FILE *file_ptr;
	char line[1024];
	char *line_ptr;
	char host[1024];
	char message[1024];
	
	assert(offlineFile != NULL);
	
	/* see if we even have an offline file yet */
	if(access(offlineFile->string, F_OK) < 0){
		/* no saved list yet */
		sprintf(message, "Offline list file does not exist: %s\n", 
				offlineFile->string);
		do_log(L_INFO, message);
		return 1;
	}
	
	/* see if we have permission to access our offline file */
	if(access(offlineFile->string, R_OK) < 0){
		sprintf(message, "We don't have permission to read the offline list: %s\n", 
				offlineFile->string);
		do_log(L_ERROR, message);
		return 0;
    }

	/* try to open the file */
	file_ptr = fopen(offlineFile->string, "r");
	if(file_ptr == NULL){
		sprintf(message, "Unable to open offline list file, errno: %d", errno);
		do_log(L_ERROR, message);
		return 0;
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
		
		/* get our host name */
		strcpy(host, line);
		
		printf("Host: %s\n", host);
		fflush(stdout);
	}
	
	fclose(file_ptr);
	
	return 1;
}

void setOfflineFileName(char *name_ptr){
	offlineFile = internAtom(name_ptr);
}

void goOnline(void){
	online_flag = 1;
}

void goOffline(void){
	online_flag = 0;
}

int isOnline(void){
	return online_flag;
}

#ifdef HIDE_ME
int main(){
	char full_path[256] = "~/.polipo-cache/offline_list.txt";
	char *name_ptr;
	int load_status;
	
	name_ptr = (char *)malloc((unsigned) strlen(full_path) + 1);
	if(name_ptr == NULL){
		fprintf(stderr, "Unable to create memory");
		exit(8);
	}
	strcpy(name_ptr, full_path);
	
	off_set_file_name(name_ptr);
	load_status = off_load();
	
	return(0);
}
#endif

#endif /* else for NO_OFFLINE_SUPPORT */