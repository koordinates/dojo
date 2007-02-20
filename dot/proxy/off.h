#ifndef __off_h
#ifndef NO_OFFLINE_SUPPORT /* Compiles out offline support */

/**
	This file contains the implementation for offline
	access for web applications. 
	
	Author: Brad Neuberg, bkn3@columbia.edu
*/

/* 
	The special host name that web applications use
	to interact with the offline infrastructure itself.
*/
#define OFF_BOOTSTRAP_HOST "offline.web.app"


/** 
	We save our list of offline-enabled web apps
	in a link list, with each list link entry being
	the string host name with a pointer to the next
	entry.
*/

struct offline_list_entry{
	char *host_ptr;
	struct offline_list_entry *next_ptr;
} *offline_list_ptr;

void preinitOffline(void);

/**
	Initializes the offline web app support.
*/
void initOffline(void);

/** 
	Makes the given host offline-enabled.
	
	Returns 1 if the host was added successfully,
	0 otherwise.
*/
int addOfflineHost(char host[]);

/** 
	Removes the given host from being offline-enabled.

	Returns 1 if the host was remove successfully,
	0 otherwise. If this host was never part of the offline
	list, 1 is returned.
*/
int removeOfflineHost(char host[]);

/**
	Returns 1 if the given host is offline-enabled, 0 otherwise.
*/
int isHostAvailableOffline(char host[]);

/** Saves our list of offline-enabled sites. */
int saveOfflineList(void);

/** Loads our list of offline-enabled sites. */
int loadOfflineList(void);

/**
	Sets our the path + filename to our list of offline-enabled web sites, 
	such as "/Users/foobar/.polipo/offline_list.txt".
*/
void setOfflineFileName(char *name_ptr);

/* 
	Goes online; note that this just sets a flag
 	whether we are online or not -- it does not
	attempt to see if we actually have a network
	available.
*/
void goOnline(void);

/* Goes offline */
void goOffline(void);

/* 
	Returns 1 if we are in online mode, 0 otherwise.
	Note that this doesn't attempt to see if we are
	really on the network, it just sees if our
	off_go_online() or off_go_offline() have been
	called.
*/
int isOnline(void);

#endif /* NO_OFFLINE_SUPPORT */
#endif /* __off_h */