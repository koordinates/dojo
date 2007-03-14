#ifndef __off_h
#ifndef NO_OFFLINE_SUPPORT /* Compiles out offline support */

/**
	This file contains the implementation for offline
	access for web applications. 
	
	Author: Brad Neuberg, bkn3@columbia.edu
*/

/*
    The JavaScript callback function name that will receive
    the results of a call to the offline API. Two arguments
    will be given: the API function that was called, such as
    "isRunning", and the results of this call, which is call
    dependent. If an unknown method was called then the
    method name is "UnknownMethod".

    Example:

      window.offlineCacheCallback("isRunning", true);
*/
#define OFF_JAVASCRIPT_CALLBACK "window.offlineCacheCallback"

/*
    The version of our offline system. This is not the same as
    our Polipo version, since the offline architecture could
    potentially include other components such as SQLite.
*/
#define OFF_OFFLINE_VERSION "0.01"


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
	0 otherwise.
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
	goOnline() or goOffline() have been
	called.
*/
int isOnline(void);

#endif /* NO_OFFLINE_SUPPORT */
#endif /* __off_h */
