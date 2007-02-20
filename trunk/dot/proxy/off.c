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
		do_log(L_INFO, "Unable to open Polipo offline file list");
	}
}

void preinitOffline(void){
	CONFIG_VARIABLE_SETTABLE(offlineFile, CONFIG_ATOM, atomSetterOffline,
                             "File specifying the path to our offline file list");
}

void initOffline(void){
	/* get the correct filename to our offline file list */
	initOfflineFileName();
	
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
	FILE *file_ptr;
	struct offline_list_entry *entry_ptr;
	char message[1024];
	
	/* make sure we have an actual file name */
	assert(offlineFile != NULL);
	
	/* see if we have permission to access our offline file */
	if(access(offlineFile->string, W_OK) < 0){
		sprintf(message, "We don't have permission to write out the offline list: %s\n", 
				offlineFile->string);
		do_log(L_ERROR, message);
		return 0;
    }

	/* open the file */
	file_ptr = fopen(offlineFile->string, "w");
	if(file_ptr == NULL){
		sprintf(message, "Unable to open offline list file, errno: %d", errno);
		do_log(L_ERROR, message);
		return 0;
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
	
	return 1;
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
		
		/* instantiate an entry for this host */
		new_entry_ptr = (struct offline_list_entry *)
						malloc(sizeof(struct offline_list_entry));
		new_entry_ptr->host_ptr = (char *)malloc((unsigned) (strlen(line) + 1));
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

#endif /* else for NO_OFFLINE_SUPPORT */