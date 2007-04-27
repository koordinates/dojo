#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#include "../sqlite/build/sqlite3.h"

#include "polipo.h"

sqlite3* db;

int first_row;

int select_callback(void *p_data, int num_fields, char **p_fields, char **p_col_names) {

  int i;
  int *p_rn = (int*)p_data;

  if (first_row) {
    first_row = 0;

    for(i=0; i < num_fields; i++) {
      printf("%20s", p_col_names[i]);
    }
    printf("\n");
    for(i=0; i< num_fields*20; i++) {
      printf("=");
    }
    printf("\n");
  }

  (*p_rn)++;

  for(i=0; i < num_fields; i++) {
    printf("%20s", p_fields[i]);
  }

  printf("\n");
  return 0;
}

void select_stmt(const char* stmt) {
  char *errmsg;
  int   ret;
  int   nrecs = 0;

  first_row = 1;

  ret = sqlite3_exec(db, stmt, select_callback, &nrecs, &errmsg);

  if(ret!=SQLITE_OK) {
    printf("Error in select statement %s [%s].\n", stmt, errmsg);
  }
  else {
    printf("\n   %d records returned.\n", nrecs);
  }
}

void sql_stmt(const char* stmt) {
  char *errmsg;
  int   ret;

  ret = sqlite3_exec(db, stmt, 0, 0, &errmsg);

  if(ret != SQLITE_OK) {
    printf("Error in statement: %s [%s].\n", stmt, errmsg);
  }
}

void execSQL(const char *sql) {
    char *errmsg;
    int   ret;
    int   nrecs = 0;
    
    do_log(L_INFO, "Executing SQL: %s\n", sql);

    first_row = 1;

    ret = sqlite3_exec(db, sql, select_callback, &nrecs, &errmsg);

    if(ret != SQLITE_OK) {
        printf("Error in select statement %s [%s].\n", sql, errmsg);
    }
    else {
        printf("\n   %d records returned.\n", nrecs);
    }
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
