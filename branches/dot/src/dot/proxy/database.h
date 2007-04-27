#ifndef __database_h

/**
	This file contains our local SQL data
	cache, one for each offline host.
	
	Author: Brad Neuberg, bkn3@columbia.edu
*/

void execSQL(const char *sql);

void preinitDatabase(void);

/**
	Initializes the offline database support.
*/
void initDatabase(void);


#endif /* __database_h */
