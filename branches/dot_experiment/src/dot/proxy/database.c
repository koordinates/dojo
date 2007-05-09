#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#include "polipo.h"

int first_row;

char *escapeJSON(const char *escapeMe) {
    /* TODO: Implement -- escape all double quotes, all new lines, and back slashes */
    
    return (char *)escapeMe;
}

int openDb(sqlite3 **db, const char *host) {
    int status;
    
    do_log(L_INFO, "Opening database for host %s\n", host);
    
    status = sqlite3_open("./countries.db", db);

    if(*db == NULL || *db == 0 || status != SQLITE_OK) {
        do_log(L_ERROR, "Could not open database\n");
        return 1;
    }
    
    return 0;
}

int closeDb(sqlite3 *db, const char *host) {
    int status;
    
    do_log(L_INFO, "Closing database for host %s\n", host);
    
    status = sqlite3_close(db);
    
    if(status != SQLITE_OK) {
        do_log(L_ERROR, "Could not close database\n");
        return 1;
    }
    
    return 0;
}

int execSQL(const char *host, const char *sql, ObjectPtr object) {
    char buffer[1024];
    sqlite3* db = NULL;
    sqlite3_stmt *ppStmt;
    const char *errmsg;
    const char *colName;
    const char *colValue;
    int result, numCols, i;
    int firstRow = 1;
    int offset = 0;
    int status;
    
    status = openDb(&db, host);
    if(status == 1) {
        abortObject(object, 500, internAtomF("Unable to open database for host %s\n", host));  
        return 1;
    }

    do_log(L_INFO, "Executing SQL: %s\n", sql);

    /* execute this SQL statement and step through each of its rows. */
    result = sqlite3_prepare_v2(db, sql, strlen(sql), &ppStmt, NULL);
    
    if(result != SQLITE_OK) {
        errmsg = sqlite3_errmsg(db);
        do_log(L_ERROR, "Error in select statement: %s: %s\n", sql, errmsg);
        abortObject(object, 400, 
                    internAtomF("Error in select statement %s: %s\n", sql, errmsg));
        closeDb(db, host);
        return 1;
    }
    
    objectPrintf(object, offset, "[\n");
    offset += strlen("[\n");
    
    do {
        result = sqlite3_step(ppStmt);
        if (result == SQLITE_ROW) {
            /* print a comma from the previous result? */
            if(firstRow != 1) {
                objectPrintf(object, offset, ",\n");
                offset += strlen(",\n");
            }else {
                firstRow = 0;
            }
            
            objectPrintf(object, offset, "\t{\n");
            offset += strlen("\t{\n");
            
            numCols = sqlite3_column_count(ppStmt);
            for(i = 0; i < numCols; i++){
                colName = escapeJSON((const char *)sqlite3_column_name(ppStmt, i));
                colValue = escapeJSON((const char *)sqlite3_column_text(ppStmt, i));
                
                objectPrintf(object, offset, "\t\t\"%s\": \"%s\"", colName, colValue);
                offset += strlen("\t\t\"");
                offset += strlen(colName);
                offset += strlen("\": \"");
                offset += strlen(colValue);
                offset += strlen("\"");
                
                /* Are we the last result for this row? */
                if(i < (numCols - 1)) {
                    objectPrintf(object, offset, ",");
                    offset++;
                }
                objectPrintf(object, offset, "\n");
                offset++;
            }
            objectPrintf(object, offset, "\t}");
            offset += strlen("\t}");
        }
    } while (result == SQLITE_ROW);
    
    sqlite3_finalize(ppStmt);
    
    objectPrintf(object, offset, "\n]\n");
    offset += strlen("\n]\n");        
    
    /* tell the client we are about to give them JSON */
    snnprintf(buffer, 0, 1024,
                     "\r\nServer: polipo"
                     "\r\nContent-Type: text/javascript");
    
    object->length = object->size;
    object->message = internAtom("Okay");
    object->code = 200;
    object->flags &= ~OBJECT_INITIAL;
    
    status = closeDb(db, host);
    if(status == 1) {
        abortObject(object, 500, internAtomF("Unable to close database for host %s\n", host));  
        return 1;
    }
    
    return 0;
}

void preinitDatabase(void){
    /* TODO: Create a config level variable to disable sql database
            support at runtime */
}

void initDatabase(void){
}
