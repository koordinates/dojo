#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#include "../sqlite/build/sqlite3.h"

#include "polipo.h"

sqlite3* db;

int first_row;

void execSQL(const char *sql) {
    sqlite3_stmt *ppStmt;
    const char *errmsg;
    const char *colName;
    const unsigned char *colValue;
    int result, numCols, i;

    do_log(L_INFO, "Executing SQL: %s\n", sql);

    /* execute this SQL statement and step through each of its rows. */
    result = sqlite3_prepare_v2(db, sql, strlen(sql), &ppStmt, NULL);
    
    if(result != SQLITE_OK) {
        errmsg = sqlite3_errmsg(db);
        do_log(L_ERROR, "Error in select statement %s [%s].\n", sql, errmsg);
        return;
    }
    
    do {
        result = sqlite3_step(ppStmt);
        printf("new row\n");
        if (result == SQLITE_ROW) {
            numCols = sqlite3_column_count(ppStmt);
            for(i = 0; i < numCols; i++){
                colName = sqlite3_column_name(ppStmt, i);
                colValue = sqlite3_column_text(ppStmt, i);
                printf("%s: %s\n", colName, colValue);
            }
        }
    } while (result == SQLITE_ROW);
    
    sqlite3_finalize(ppStmt);
}

void preinitDatabase(void){
    /* TODO: Create a config level variable to disable sql database
            support at runtime */
}

void initDatabase(void){
    sqlite3_open("./countries.db", &db);

    if(db == 0) {
        printf("Could not open database.");
        exit(1);
    }

   /* sqlite3_close(db);*/
}
