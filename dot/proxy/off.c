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
	
	addOfflineHost("bradneuberg.name2");
	addOfflineHost("3bad");
	addOfflineHost("bad_bad");
	addOfflineHost("good.com");
	fflush(stdout);
	saveOfflineList();
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
		character MUST be A-Z or a-z.
	*/
	
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
		if(c >= 48 && c <= 57 && index != 0){
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

int addOfflineHost(char host[]){
	struct offline_list_entry *entry_ptr;
	struct offline_list_entry *new_entry_ptr;
	
	if(isValidHost(host) == 0){ /* invalid host */
		do_log(L_FORBIDDEN, 
				"off.c:addOflineHost: Illegal host name\n");
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
		do_log(L_ERROR, "No memory");
		return 0;
	}
	new_entry_ptr->host_ptr = (char *)malloc((unsigned) (strlen(host) + 1));
	if(new_entry_ptr->host_ptr == NULL){
		do_log(L_ERROR, "No memory");
		return 0;
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
	
	return 1; /* success */
}

int removeOfflineHost(char host[]){
	return 0;
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
	if(access(offlineFile->string, W_OK) < 0){
		sprintf(message, "We don't have permission to write out the offline list: %s\n", 
				offlineFile->string);
		do_log(L_ERROR, message);
		return 0; /* failure */
    }

	/* open the file */
	file_ptr = fopen(offlineFile->string, "w");
	if(file_ptr == NULL){
		sprintf(message, "Unable to open offline list file, errno: %d", errno);
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
		sprintf(message, "Unable to open offline list file, errno: %d", errno);
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
			do_log(L_ERROR, "No memory");
			return 0; /* failure */
		}
		new_entry_ptr->host_ptr = (char *)malloc((unsigned) (strlen(line) + 1));
		if(new_entry_ptr->host_ptr == NULL){
			do_log(L_ERROR, "No memory");
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
	online_flag = 1;
}

void goOffline(void){
	online_flag = 0;
}

int isOnline(void){
	return online_flag;
}

#endif /* else for NO_OFFLINE_SUPPORT */