#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#include "../sqlite/build/sqlite3.h"

#include "polipo.h"

sqlite3* db;

int first_row;

char *escapeJSON(const char *escapeMe) {
    /* TODO: Implement -- escape all double quotes, all new lines, and back slashes */
    
    return (char *)escapeMe;
}

void execSQL(const char *sql) {
    sqlite3_stmt *ppStmt;
    const char *errmsg;
    const char *colName;
    const char *colValue;
    int result, numCols, i;
    int firstRow = 1;

    do_log(L_INFO, "Executing SQL: %s\n", sql);

    /* execute this SQL statement and step through each of its rows. */
    result = sqlite3_prepare_v2(db, sql, strlen(sql), &ppStmt, NULL);
    
    if(result != SQLITE_OK) {
        errmsg = sqlite3_errmsg(db);
        do_log(L_ERROR, "Error in select statement %s [%s].\n", sql, errmsg);
        return;
    }
    
    printf("{\n");
    do {
        result = sqlite3_step(ppStmt);
        if (result == SQLITE_ROW) {
            /* print a comma from the previous result? */
            if(firstRow != 1) {
                printf(",\n");
            }else {
                firstRow = 0;
            }
            
            printf("\t[\n");
            numCols = sqlite3_column_count(ppStmt);
            for(i = 0; i < numCols; i++){
                colName = escapeJSON((const char *)sqlite3_column_name(ppStmt, i));
                colValue = escapeJSON((const char *)sqlite3_column_text(ppStmt, i));
                
                printf("\t\t\"%s\": \"%s\"", colName, colValue);
                
                /* Are we the last result for this row? */
                if(i < (numCols - 1)) {
                    printf(",");
                }
                printf("\n");
            }
            printf("\t]");
        }
    } while (result == SQLITE_ROW);
    
    sqlite3_finalize(ppStmt);
    
    printf("\n}\n");
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
