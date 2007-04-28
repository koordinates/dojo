#ifndef __database_h

/**
	This file contains our local SQL data
	cache, one for each offline host.
	
	Author: Brad Neuberg, bkn3@columbia.edu
*/

#include "../sqlite/build/sqlite3.h"

int execSQL(const char *host, const char *sql, ObjectPtr object);

void preinitDatabase(void);

/**
	Initializes the offline database support.
*/
void initDatabase(void);


#endif /* __database_h */
