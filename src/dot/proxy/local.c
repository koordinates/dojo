/*
Copyright (c) 2003-2006 by Juliusz Chroboczek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

#include "polipo.h"

int disableLocalInterface = 0;
int disableConfiguration = 0;
int disableIndexing = 1;
int disableServersList = 1;
int disableOfflineSupport = 1;

AtomPtr atomInitForbidden;
AtomPtr atomReopenLog;
AtomPtr atomDiscardObjects;
AtomPtr atomWriteoutObjects;
AtomPtr atomFreeChunkArenas;
AtomPtr atomSQL;

void
preinitLocal()
{
    atomInitForbidden = internAtom("init-forbidden");
    atomReopenLog = internAtom("reopen-log");
    atomDiscardObjects = internAtom("discard-objects");
    atomWriteoutObjects = internAtom("writeout-objects");
    atomFreeChunkArenas = internAtom("free-chunk-arenas");
    atomSQL = internAtom("sql");

    /* These should not be settable for obvious reasons */
    CONFIG_VARIABLE(disableLocalInterface, CONFIG_BOOLEAN,
                    "Disable the local configuration pages.");
    CONFIG_VARIABLE(disableConfiguration, CONFIG_BOOLEAN,
                    "Disable reconfiguring Polipo at runtime.");
    CONFIG_VARIABLE(disableIndexing, CONFIG_BOOLEAN,
                    "Disable indexing of the local cache.");
    CONFIG_VARIABLE(disableServersList, CONFIG_BOOLEAN,
                    "Disable the list of known servers.");
    CONFIG_VARIABLE(disableOfflineSupport, CONFIG_BOOLEAN,
                    "Disable support for offline web applications.");
}

static void fillSpecialObject(ObjectPtr, void (*)(FILE*, char*), void*);

int 
httpLocalRequest(ObjectPtr object, int method, int from, int to,
                 HTTPRequestPtr requestor, void *closure)
{
    if(object->requestor == NULL)
        object->requestor = requestor;

    if(urlIsSpecial(object->key, object->key_size))
        return httpSpecialRequest(object, method, from, to, 
                                  requestor, closure);

    if(method >= METHOD_POST) {
        httpClientError(requestor, 405, internAtom("Method not allowed"));
        requestor->connection->flags &= ~CONN_READER;
        return 1;
    }

    /* objectFillFromDisk already did the real work but we have to
       make sure we don't get into an infinite loop. */
    if(object->flags & OBJECT_INITIAL) {
        abortObject(object, 404, internAtom("Not found"));
    }
    object->age = current_time.tv_sec;
    object->date = current_time.tv_sec;

    object->flags &= ~OBJECT_VALIDATING;
    notifyObject(object);
    return 1;
}

void
alternatingHttpStyle(FILE *out, char *id)
{
    fprintf(out,
            "<style type=\"text/css\">\n"
            "#%s tbody tr.even td { background-color: #eee; }\n"
            "#%s tbody tr.odd  td { background-color: #fff; }\n"
            "</style>\n", id, id);
}

static void
printConfig(FILE *out, char *dummy)
{
    fprintf(out,
            "<!DOCTYPE HTML PUBLIC "
            "\"-//W3C//DTD HTML 4.01 Transitional//EN\" "
            "\"http://www.w3.org/TR/html4/loose.dtd\">\n"
            "<html><head>\n"
            "<title>Polipo configuration</title>\n"
            "</head><body>\n"
            "<h1>Polipo configuration</h1>\n");
    printConfigVariables(out, 1);
    fprintf(out, "<p><a href=\"/polipo/\">back</a></p>");
    fprintf(out, "</body></html>\n");
}

static int
matchUrl(char *base, ObjectPtr object)
{
    int n = strlen(base);
    if(object->key_size < n)
        return 0;
    if(memcmp(base, object->key, n) != 0)
        return 0;
    return (object->key_size == n) || (((char*)object->key)[n] == '?');
}

#ifndef NO_OFFLINE_SUPPORT

int 
getHost(AtomPtr url, char **host_results){
	int cut_start = -1, cut_end = -1, cut_length;
	int index;
	char *cut_ptr;
	char *host_ptr;
	
	/* get the host name */
	/* find where the host name begins */
	for(index = 0; index < strlen(url->string); index++){
       if(url->string[index] == '/'
          && (index + 1) < strlen(url->string)
          && url->string[index + 1] == '/'){
	      index = index + 2;
          break;
       }
	}
	
	if(index == strlen(url->string)){
       /* nothing left to process */
       return -1;	
    }

    /* find the end cut for where the host name is */
    cut_start = index;
    while(index < strlen(url->string)){
       if(url->string[index] == '/' 
            || url->string[index] == '?'
            || url->string[index] == ':'
            || (index + 1) == strlen(url->string)){
          cut_end = index - 1;	
          break;
       }
       index++;
    }

    if(cut_end == -1){
      return -1;
    }

    /*  
        +1 for index arrays starting at 0,
        another +1 for end of string null character
    */
    cut_length = (cut_end - cut_start) + 2;
    host_ptr = (char *)malloc((unsigned) cut_length);
    if(host_ptr == NULL)
        return -1;
    cut_ptr = host_ptr;
    for(index = cut_start; index <= cut_end 
                             && index < strlen(url->string); index++){
	  *cut_ptr = url->string[index];
	  cut_ptr++;
    }
    *cut_ptr = '\0';

    if(strlen(host_ptr) == 0){
      return -1;
    }

    *host_results = host_ptr;
    
    return 1;
}

void
handleOfflineAPI(ObjectPtr object, HTTPRequestPtr requestor)
{
	AtomPtr referer;
	char *host_ptr = NULL;
	int safe_scheme = 0;
	int status;
    do_log(L_INFO, "handleOfflineAPI, key=");
    do_log_n(L_INFO, object->key, object->key_size);
    do_log(L_INFO, "\n");
	if(requestor->referer == NULL 
          || requestor->referer->string == NULL
          || strlen(requestor->referer->string) == 0) {
       goto fail;
	}
	
	referer = requestor->referer;
	
	/* make sure we have a scheme we know how to work with */
	if(strlen(referer->string) >= 4 
       && lwrcmp(referer->string, "http", 4) == 0) {
      safe_scheme = 1; 
    }
	if(safe_scheme == 0){
		goto fail;
	}
	
	/* get the host inside of the referer header */
	status = getHost(referer, &host_ptr);
	if(status == -1){
		goto fail;
	}
	
	do_log(L_INFO, "host=%s\n", host_ptr);
	
	/* 
       get the type of API request desired:
	   addOfflineHost, removeOfflineHost, isHostAvailableOffline,
	   isRunning, getVersion, goOnline, goOffline
    */
	if(matchUrl("/polipo/offline?addOfflineHost", object)){
      status = addOfflineHost(host_ptr);
      objectPrintf(object, 0,
                 "%s('addOfflineHost', %s);",
                 OFF_JAVASCRIPT_CALLBACK,
                 (status == 1) ? "true" : "false");
      object->length = object->size;
    }else if(matchUrl("/polipo/offline?removeOfflineHost", object)){
      status = removeOfflineHost(host_ptr);
      objectPrintf(object, 0,
                 "%s('removeOfflineHost', %s);",
                 OFF_JAVASCRIPT_CALLBACK,
                 (status == 1) ? "true" : "false");
      object->length = object->size;	
    }else if(matchUrl("/polipo/offline?isHostAvailableOffline", object)){
      status = isHostAvailableOffline(host_ptr);
      objectPrintf(object, 0,
                 "%s('isHostAvailableOffline', %s);",
                 OFF_JAVASCRIPT_CALLBACK,
                 (status == 1) ? "true" : "false");
      object->length = object->size;	
    }else if(matchUrl("/polipo/offline?isRunning", object)){
      objectPrintf(object, 0,
                 "%s('isRunning', true);",
                 OFF_JAVASCRIPT_CALLBACK);
      object->length = object->size;	
    }else if(matchUrl("/polipo/offline?getVersion", object)){
      objectPrintf(object, 0,
                 "%s('getVersion', '%s');",
                 OFF_JAVASCRIPT_CALLBACK,
                 OFF_OFFLINE_VERSION);
      object->length = object->size;
    }else if(matchUrl("/polipo/offline?goOnline", object)){
	  goOnline();
      objectPrintf(object, 0,
                 "%s('goOnline', null);",
                 OFF_JAVASCRIPT_CALLBACK);
      object->length = object->size;
    }else if(matchUrl("/polipo/offline?goOffline", object)){
	  goOffline();
      objectPrintf(object, 0,
                 "%s('goOffline', null);",
                 OFF_JAVASCRIPT_CALLBACK);
      object->length = object->size;
    }else{
      goto fail;
    }

    /* make sure the browser doesn't cache our JavaScript response */
    object->cache_control = CACHE_NO;

    if(host_ptr){
      free(host_ptr);	
    }

    return;

    fail:
       objectPrintf(object, 0,
                  "%s('UnknownMethod', null);",
                  OFF_JAVASCRIPT_CALLBACK);
       object->length = object->size;

       if(host_ptr){
         free(host_ptr);	
       }
}

#endif

#ifndef NO_DISK_CACHE

static void
recursiveIndexDiskObjects(FILE *out, char *root)
{
    indexDiskObjects(out, root, 1);
}

static void
plainIndexDiskObjects(FILE *out, char *root)
{
    indexDiskObjects(out, root, 0);
}
#endif

static void
serversList(FILE *out, char *dummy)
{
    listServers(out);
}
    
int 
httpSpecialRequest(ObjectPtr object, int method, int from, int to,
                   HTTPRequestPtr requestor, void *closure)
{
    char buffer[1024];
    int hlen = 0;
    
    if(method >= METHOD_POST) {
        return httpSpecialSideRequest(object, method, from, to,
                                      requestor, closure);
    }

    if(!(object->flags & OBJECT_INITIAL)) {
        privatiseObject(object, 0);
        supersedeObject(object);
        object->flags &= ~(OBJECT_VALIDATING | OBJECT_INPROGRESS);
        notifyObject(object);
        return 1;
    }

    object->date = current_time.tv_sec;
    object->age = current_time.tv_sec;
    object->headers = internAtomN(buffer, hlen);
    object->code = 200;
    object->message = internAtom("Okay");
    object->flags &= ~OBJECT_INITIAL;
    object->flags |= OBJECT_DYNAMIC;
    
    do_log(L_INFO, "httpSpecialRequest, url=");
    do_log_n(L_INFO, object->key, object->key_size);
    do_log(L_INFO, "\n");

	if(disableOfflineSupport == 0 && matchUrl("/polipo/offline", object)) {
		hlen = snnprintf(buffer, 0, 1024,
                     "\r\nServer: polipo"
                     "\r\nContent-Type: text/javascript");
    } else if(isPACCheck(object) == 1) {
		hlen = snnprintf(buffer, 0, 1024,
                     "\r\nServer: polipo"
                     "\r\nContent-Type: text/plain");
	}else{
        hlen = snnprintf(buffer, 0, 1024,
                     "\r\nServer: polipo"
                     "\r\nContent-Type: text/html");
    }

    if(disableOfflineSupport == 1 
        && object->key_size == 8 
        && memcmp(object->key, "/polipo/", 8) == 0) {
        objectPrintf(object, 0,
                     "<!DOCTYPE HTML PUBLIC "
                     "\"-//W3C//DTD HTML 4.01 Transitional//EN\" "
                     "\"http://www.w3.org/TR/html4/loose.dtd\">\n"
                     "<html><head>\n"
                     "<title>Polipo</title>\n"
                     "</head><body>\n"
                     "<h1>Polipo</h1>\n"
                     "<p><a href=\"status?\">Status report</a>.</p>\n"
                     "<p><a href=\"config?\">Current configuration</a>.</p>\n"
                     "<p><a href=\"servers?\">Known servers</a>.</p>\n"
#ifndef NO_DISK_CACHE
                     "<p><a href=\"index?\">Disk cache index</a>.</p>\n"
#endif
                     "</body></html>\n");
        object->length = object->size;
#ifndef NO_OFFLINE_SUPPORT
    } else if(disableOfflineSupport == 0 && 
            matchUrl("/polipo/offline", object)) {
        handleOfflineAPI(object, requestor);
    } else if(isPACCheck(object) == 1) {
        do_log(L_INFO, "pac_check.txt was requested\n");
        objectPrintf(object, 0, 
                    "the web application is inside the PAC file");
        object->length = object->size;        
#endif
    } else if(disableOfflineSupport == 1 && matchUrl("/polipo/status", object)) {
        objectPrintf(object, 0,
                     "<!DOCTYPE HTML PUBLIC "
                     "\"-//W3C//DTD HTML 4.01 Transitional//EN\" "
                     "\"http://www.w3.org/TR/html4/loose.dtd\">\n"
                     "<html><head>\n"
                     "<title>Polipo status report</title>\n"
                     "</head><body>\n"
                     "<h1>Polipo proxy on %s:%d: status report</h1>\n"
                     "<p>The %s proxy on %s:%d is %s.</p>\n"
                     "<p>There are %d public and %d private objects "
                     "currently in memory using %d KB in %d chunks "
                     "(%d KB allocated).</p>\n"
                     "<p>There are %d atoms.</p>"
                     "<p><form method=POST action=\"/polipo/status?\">"
                     "<input type=submit name=\"init-forbidden\" "
                     "value=\"Read forbidden file\"></form>\n"
                     "<form method=POST action=\"/polipo/status?\">"
                     "<input type=submit name=\"writeout-objects\" "
                     "value=\"Write out in-memory cache\"></form>\n"
                     "<form method=POST action=\"/polipo/status?\">"
                     "<input type=submit name=\"discard-objects\" "
                     "value=\"Discard in-memory cache\"></form>\n"
                     "<form method=POST action=\"/polipo/status?\">"
                     "<input type=submit name=\"reopen-log\" "
                     "value=\"Reopen log file\"></form>\n"
                     "<form method=POST action=\"/polipo/status?\">"
                     "<input type=submit name=\"free-chunk-arenas\" "
                     "value=\"Free chunk arenas\"></form></p>\n"
                     "<p><a href=\"/polipo/\">back</a></p>"
                     "</body></html>\n",
                     proxyName->string, proxyPort,
                     cacheIsShared ? "shared" : "private",
                     proxyName->string, proxyPort,
                     proxyOffline ? "off line" :
                     (relaxTransparency ? 
                      "on line (transparency relaxed)" :
                      "on line"),
                     publicObjectCount, privateObjectCount,
                     used_chunks * CHUNK_SIZE / 1024, used_chunks,
                     totalChunkArenaSize() / 1024,
                     used_atoms);
        object->expires = current_time.tv_sec;
        object->length = object->size;
    } else if(disableOfflineSupport == 1 && matchUrl("/polipo/config", object)) {
        fillSpecialObject(object, printConfig, NULL);
        object->expires = current_time.tv_sec + 5;
#ifndef NO_DISK_CACHE
    } else if(disableOfflineSupport == 1 && matchUrl("/polipo/index", object)) {
        int len;
        char *root;
        if(disableIndexing) {
            abortObject(object, 403, internAtom("Action not allowed"));
            notifyObject(object);
            return 1;
        }
        len = MAX(0, object->key_size - 14);
        root = strdup_n((char*)object->key + 14, len);
        if(root == NULL) {
            abortObject(object, 503, internAtom("Couldn't allocate root"));
            notifyObject(object);
            return 1;
        }
        writeoutObjects(1);
        fillSpecialObject(object, plainIndexDiskObjects, root);
        free(root);
        object->expires = current_time.tv_sec + 5;
    } else if(disableOfflineSupport == 1 && matchUrl("/polipo/recursive-index", object)) {
        int len;
        char *root;
        if(disableIndexing) {
            abortObject(object, 403, internAtom("Action not allowed"));
            notifyObject(object);
            return 1;
        }
        len = MAX(0, object->key_size - 24);
        root = strdup_n((char*)object->key + 24, len);
        if(root == NULL) {
            abortObject(object, 503, internAtom("Couldn't allocate root"));
            notifyObject(object);
            return 1;
        }
        writeoutObjects(1);
        fillSpecialObject(object, recursiveIndexDiskObjects, root);
        free(root);
        object->expires = current_time.tv_sec + 20;
#endif
    } else if(disableOfflineSupport == 1 && matchUrl("/polipo/servers", object)) {
        if(disableServersList) {
            abortObject(object, 403, internAtom("Action not allowed"));
            notifyObject(object);
            return 1;
        }
        fillSpecialObject(object, serversList, NULL);
        object->expires = current_time.tv_sec + 2;
    } else {
        abortObject(object, 404, internAtom("Not found"));
    }

    object->flags &= ~OBJECT_VALIDATING;
    notifyObject(object);
    return 1;
}

int 
httpSpecialSideRequest(ObjectPtr object, int method, int from, int to,
                       HTTPRequestPtr requestor, void *closure)
{
    HTTPConnectionPtr client = requestor->connection;
    
    assert(client->request == requestor);

    if(method != METHOD_POST) {
        httpClientError(requestor, 405, internAtom("Method not allowed"));
        requestor->connection->flags &= ~CONN_READER;
        return 1;
    }

    return httpSpecialDoSide(requestor);
}

int
httpSpecialDoSide(HTTPRequestPtr requestor)
{
    HTTPConnectionPtr client = requestor->connection;
    
    if(client->reqlen - client->reqbegin >= client->bodylen) {
        AtomPtr data;
        data = internAtomN(client->reqbuf + client->reqbegin,
                           client->reqlen - client->reqbegin);
        client->reqbegin = 0;
        client->reqlen = 0;
        if(data == NULL) {
            do_log(L_ERROR, "Couldn't allocate data.\n");
            httpClientError(requestor, 500,
                            internAtom("Couldn't allocate data"));
            return 1;
        }
        httpSpecialDoSideFinish(data, requestor);
        return 1;
    }

    if(client->reqlen - client->reqbegin >= CHUNK_SIZE) {
        httpClientError(requestor, 500, internAtom("POST too large"));
        return 1;
    }

    if(client->reqbegin > 0 && client->reqlen > client->reqbegin) {
        memmove(client->reqbuf, client->reqbuf + client->reqbegin,
                client->reqlen - client->reqbegin);
    }
    client->reqlen -= client->reqbegin;
    client->reqbegin = 0;

    do_stream(IO_READ | IO_NOTNOW, client->fd,
              client->reqlen, client->reqbuf, CHUNK_SIZE,
              httpSpecialClientSideHandler, client);
    return 1;
}

int
httpSpecialClientSideHandler(int status,
                             FdEventHandlerPtr event,
                             StreamRequestPtr srequest)
{
    HTTPConnectionPtr connection = srequest->data;
    HTTPRequestPtr request = connection->request;
    int push;

    if((request->object->flags & OBJECT_ABORTED) || 
       !(request->object->flags & OBJECT_INPROGRESS)) {
        httpClientDiscardBody(connection);
        httpClientError(request, 503, internAtom("Post aborted"));
        return 1;
    }
        
    if(status < 0) {
        do_log_error(L_ERROR, -status, "Reading from client\n");
        if(status == -EDOGRACEFUL)
            httpClientFinish(connection, 1);
        else
            httpClientFinish(connection, 2);
        return 1;
    }

    push = MIN(srequest->offset - connection->reqlen,
               connection->bodylen - connection->reqoffset);
    if(push > 0) {
        connection->reqlen += push;
        httpSpecialDoSide(request);
    }

    do_log(L_ERROR, "Incomplete client request.\n");
    connection->flags &= ~CONN_READER;
    httpClientRawError(connection, 502,
                       internAtom("Incomplete client request"), 1);
    return 1;
}

int
httpSpecialDoSideFinish(AtomPtr data, HTTPRequestPtr requestor)
{
    ObjectPtr object = requestor->object;
     
    if(isExecSQL(object)) {
        int status;
        
        status = httpSpecialExecSQL(object, data, requestor);
        if(status == 1) {
            goto out;
        }
    } else if(disableOfflineSupport == 1 && matchUrl("/polipo/config", object)) {
        AtomListPtr list = NULL;
        int i, rc;

        if(disableConfiguration) {
            abortObject(object, 403, internAtom("Action not allowed"));
            goto out;
        }

        list = urlDecode(data->string, data->length);
        if(list == NULL) {
            abortObject(object, 400,
                        internAtom("Couldn't parse variable to set"));
            goto out;
        }
        for(i = 0; i < list->length; i++) {
            rc = parseConfigLine(list->list[i]->string, NULL, 0, 1);
            if(rc < 0) {
                abortObject(object, 400,
                            rc == -1 ?
                            internAtom("Couldn't parse variable to set") :
                            internAtom("Variable is not settable"));
                destroyAtomList(list);
                goto out;
            }
        }
        destroyAtomList(list);
        object->date = current_time.tv_sec;
        object->age = current_time.tv_sec;
        object->headers = internAtom("\r\nLocation: /polipo/config?");
        object->code = 303;
        object->message = internAtom("Done");
        object->flags &= ~OBJECT_INITIAL;
        object->length = 0;
    } else if(disableOfflineSupport == 1 && matchUrl("/polipo/status", object)) {
        AtomListPtr list = NULL;
        int i;

        if(disableConfiguration) {
            abortObject(object, 403, internAtom("Action not allowed"));
            goto out;
        }

        list = urlDecode(data->string, data->length);
        if(list == NULL) {
            abortObject(object, 400,
                        internAtom("Couldn't parse action"));
            goto out;
        }
        for(i = 0; i < list->length; i++) {
            char *equals = 
                memchr(list->list[i]->string, '=', list->list[i]->length);
            AtomPtr name = 
                equals ? 
                internAtomN(list->list[i]->string, 
                            equals - list->list[i]->string) :
                retainAtom(list->list[i]);
            if(name == atomInitForbidden)
                initForbidden();
            else if(name == atomReopenLog)
                reopenLog();
            else if(name == atomDiscardObjects)
                discardObjects(1, 0);
            else if(name == atomWriteoutObjects)
                writeoutObjects(1);
            else if(name == atomFreeChunkArenas)
                free_chunk_arenas();
            else {
                abortObject(object, 400, internAtomF("Unknown action %s",
                                                     name->string));
                releaseAtom(name);
                destroyAtomList(list);
                goto out;
            }
            releaseAtom(name);
        }
        destroyAtomList(list);
        object->date = current_time.tv_sec;
        object->age = current_time.tv_sec;
        object->headers = internAtom("\r\nLocation: /polipo/status?");
        object->code = 303;
        object->message = internAtom("Done");
        object->flags &= ~OBJECT_INITIAL;
        object->length = 0;
    } else {
        abortObject(object, 405, internAtom("Method not allowed"));
    }

 out:
    releaseAtom(data);
    notifyObject(object);
    requestor->connection->flags &= ~CONN_READER;
    return 1;
}

int
httpSpecialExecSQL(ObjectPtr object, AtomPtr data, HTTPRequestPtr requestor) {
    AtomListPtr list = NULL;
    int i;
    AtomPtr referer;
    char *refererHostPtr = NULL;
    char *urlHostPtr = NULL;
    int status = 0;
    
    if(requestor->referer == NULL 
          || requestor->referer->string == NULL
          || strlen(requestor->referer->string) == 0) {
        abortObject(object, 400, internAtom("No referer given"));
        return 1;
	}

    referer = requestor->referer;
    
    /* get the host inside of the referer header */
    status = getHost(referer, &refererHostPtr);
	if(status == -1) {
	    abortObject(object, 400, internAtom("No referer given"));
        return 1;
	}
	
	/* get the host given in this URL */
	status = getHost(referer, &urlHostPtr);
	if(status == -1) {
	    abortObject(object, 400, internAtom("No URL given"));
        return 1;
	}
	
	/* make sure they match */
	if(strcmp(urlHostPtr, refererHostPtr) != 0) {
	    abortObject(object, 400, internAtom("Referer different than host inside URL"));
        return 1;
	}

    list = urlDecode(data->string, data->length);
    if(list == NULL) {
        abortObject(object, 400,
                    internAtom("Couldn't parse action"));
        return 1;
    }
    
    for(i = 0; i < list->length; i++) {
        char *equals = 
            memchr(list->list[i]->string, '=', list->list[i]->length);
        AtomPtr name = 
            equals ? 
            internAtomN(list->list[i]->string, 
                        equals - list->list[i]->string) :
            retainAtom(list->list[i]);
        if(name == atomSQL) {
            char *sql = (char *)malloc(list->list[i]->length + 1);
            char *changeme = NULL;
            char *origPtr = sql;
            
            memcpy(sql, list->list[i]->string, list->list[i]->length);
            sql[list->list[i]->length] = '\0';
            
            changeme = sql;
            
            /* strip off the 'sql=' part of the URL encoded value */
            if (strlen(sql) < 4) {
                abortObject(object, 400, internAtomF("Invalid form data: %s",
                                                    sql));
                free(sql);
                releaseAtom(name);
                destroyAtomList(list);
                return 1;
            }
            sql = sql + 4;
            
            /* convert URL encoded spaces from pluses to actual spaces */
            while(changeme != NULL) {
                changeme = strchr(changeme, '+');
                if(changeme != NULL && strlen(changeme) > 0 && changeme[0] == '+') {
                    changeme[0] = ' ';
                }
            }
            do_log(L_INFO, "sql=%s\n", sql);
            /* execute the SQL and return it's results JSON encoded */
            status = execSQL(refererHostPtr, sql, object);
            free(origPtr);
            break;
        }
        else {
            abortObject(object, 400, internAtomF("Unknown action %s",
                                                 name->string));
            releaseAtom(name);
            destroyAtomList(list);
            return 1;
        }
        releaseAtom(name);
    }
    
    destroyAtomList(list);
    return status;
}

int
isPACCheck(ObjectPtr object)
{
    char *testUrl;
    
    if(disableOfflineSupport == 1)
        return 0;
        
    /* object->key doesn't use a null terminator, which
       strstr requires; copy it over and add a null
       terminator. */
    testUrl = (char *)malloc((unsigned)(object->key_size + 1)); 
    memcpy(testUrl, object->key, object->key_size);
    testUrl[object->key_size] = '\0';
    
    if(strstr(testUrl, "pac_check.txt") != NULL) {
        free(testUrl);
        return 1;
    } else {
        free(testUrl);
        return 0;
    }
}

int
isExecSQL(ObjectPtr object)
{
    char *testUrl;
    
    if(disableOfflineSupport == 1)
        return 0;
        
    /* object->key doesn't use a null terminator, which
       strstr requires; copy it over and add a null
       terminator. */
    testUrl = (char *)malloc((unsigned)(object->key_size + 1)); 
    memcpy(testUrl, object->key, object->key_size);
    testUrl[object->key_size] = '\0';
    if(strstr(testUrl, "/__polipo/__offline?execSQL") != NULL) {
        free(testUrl);
        return 1;
    } else {
        free(testUrl);
        return 0;
    }
}

#ifdef HAVE_FORK
static void
fillSpecialObject(ObjectPtr object, void (*fn)(FILE*, char*), void* closure)
{
    int rc;
    int filedes[2];
    pid_t pid;
    sigset_t ss, old_mask;

    if(object->flags & OBJECT_INPROGRESS)
        return;

    rc = pipe(filedes);
    if(rc < 0) {
        do_log_error(L_ERROR, errno, "Couldn't create pipe\n");
        abortObject(object, 503,
                    internAtomError(errno, "Couldn't create pipe"));
        return;
    }

    fflush(stdout);
    fflush(stderr);
    fflush(logF);

    /* Block signals that we handle specially until the child can
       disable the handlers. */
    interestingSignals(&ss);
    /* I'm a little confused.  POSIX doesn't allow EINTR here, but I
       think that both Linux and SVR4 do. */
    do {
        rc = sigprocmask(SIG_BLOCK, &ss, &old_mask);
    } while (rc < 0 && errno == EINTR);
    if(rc < 0) {
        do_log_error(L_ERROR, errno, "Sigprocmask failed\n");
        abortObject(object, 503, internAtomError(errno, "Sigprocmask failed"));
        close(filedes[0]);
        close(filedes[1]);
        return;
    }
    
    pid = fork();
    if(pid < 0) {
        do_log_error(L_ERROR, errno, "Couldn't fork\n");
        abortObject(object, 503, internAtomError(errno, "Couldn't fork"));
        close(filedes[0]);
        close(filedes[1]);
        do {
            rc = sigprocmask(SIG_SETMASK, &old_mask, NULL);
        } while (rc < 0 && errno == EINTR);
        if(rc < 0) {
            do_log_error(L_ERROR, errno, "Couldn't restore signal mask\n");
            polipoExit();
        }
        return;
    }

    if(pid > 0) {
        SpecialRequestPtr request;
        close(filedes[1]);
        do {
            rc = sigprocmask(SIG_SETMASK, &old_mask, NULL);
        } while (rc < 0 && errno == EINTR);
        if(rc < 0) {
            do_log_error(L_ERROR, errno, "Couldn't restore signal mask\n");
            polipoExit();
            return;
        }

        request = malloc(sizeof(SpecialRequestRec));
        if(request == NULL) {
            kill(pid, SIGTERM);
            close(filedes[0]);
            abortObject(object, 503,
                        internAtom("Couldn't allocate request\n"));
            notifyObject(object);
            /* specialRequestHandler will take care of the rest. */
        } else {
            request->buf = get_chunk();
            if(request->buf == NULL) {
                kill(pid, SIGTERM);
                close(filedes[0]);
                free(request);
                abortObject(object, 503,
                            internAtom("Couldn't allocate request\n"));
                notifyObject(object);
            }
        }
        object->flags |= OBJECT_INPROGRESS;
        retainObject(object);
        request->object = object;
        request->fd = filedes[0];
        request->pid = pid;
        request->offset = 0;
        /* Under any sensible scheduler, the child will run before the
           parent.  So no need for IO_NOTNOW. */
        do_stream(IO_READ, filedes[0], 0, request->buf, CHUNK_SIZE,
                  specialRequestHandler, request);
    } else {
        /* child */
        close(filedes[0]);
        uninitEvents();
        do {
            rc = sigprocmask(SIG_SETMASK, &old_mask, NULL);
        } while (rc < 0 && errno == EINTR);
        if(rc < 0)
            exit(1);

        if(filedes[1] != 1)
            dup2(filedes[1], 1);

        (*fn)(stdout, closure);
        exit(0);
    }
}

int
specialRequestHandler(int status, 
                      FdEventHandlerPtr event, StreamRequestPtr srequest)
{
    SpecialRequestPtr request = srequest->data;
    int rc;
    int killed = 0;

    if(status < 0) {
        kill(request->pid, SIGTERM);
        killed = 1;
        request->object->flags &= ~OBJECT_INPROGRESS;
        abortObject(request->object, 502,
                    internAtomError(-status, "Couldn't read from client"));
        goto done;
    }

    if(srequest->offset > 0) {
        rc = objectAddData(request->object, request->buf, 
                           request->offset, srequest->offset);
        if(rc < 0) {
            kill(request->pid, SIGTERM);
            killed = 1;
            request->object->flags &= ~OBJECT_INPROGRESS;
            abortObject(request->object, 503,
                        internAtom("Couldn't add data to connection"));
            goto done;
        }
        request->offset += srequest->offset;
    }
    if(status) {
        request->object->flags &= ~OBJECT_INPROGRESS;
        request->object->length = request->object->size;
        goto done;
    }

    /* If we're the only person interested in this object, let's abort
       it now. */
    if(request->object->refcount <= 1) {
        kill(request->pid, SIGTERM);
        killed = 1;
        request->object->flags &= ~OBJECT_INPROGRESS;
        abortObject(request->object, 500, internAtom("Aborted"));
        goto done;
    }
    notifyObject(request->object);
    do_stream(IO_READ | IO_NOTNOW, request->fd, 0, request->buf, CHUNK_SIZE,
              specialRequestHandler, request);
    return 1;

 done:
    close(request->fd);
    dispose_chunk(request->buf);
    releaseNotifyObject(request->object);
    /* That's a blocking wait.  It shouldn't block for long, as we've
       either already killed the child, or else we got EOF from it. */
    do {
        rc = waitpid(request->pid, &status, 0);
    } while(rc < 0 && errno == EINTR);
    if(rc < 0) {
        do_log(L_ERROR, "Wait for %d: %d\n", (int)request->pid, errno);
    } else {
        int normal = 
            (WIFEXITED(status) && WEXITSTATUS(status) == 0) ||
            (killed && WIFSIGNALED(status) && WTERMSIG(status) == SIGTERM);
        char *reason =
            WIFEXITED(status) ? "with status" : 
            WIFSIGNALED(status) ? "on signal" :
            "with unknown status";
        int value =
            WIFEXITED(status) ? WEXITSTATUS(status) :
            WIFSIGNALED(status) ? WTERMSIG(status) :
            status;
        do_log(normal ? D_CHILD : L_ERROR, 
               "Child %d exited %s %d.\n",
               (int)request->pid, reason, value);
    }
    free(request);
    return 1;
}
#else
static void
fillSpecialObject(ObjectPtr object, void (*fn)(FILE*, char*), void* closure)
{
    FILE *tmp = NULL;
    char *buf = NULL;
    int rc, len, offset;

    if(object->flags & OBJECT_INPROGRESS)
        return;

    buf = get_chunk();
    if(buf == NULL) {
        abortObject(object, 503, internAtom("Couldn't allocate chunk"));
        goto done;
    }

    tmp = tmpfile();
    if(tmp == NULL) {
        abortObject(object, 503, internAtom(pstrerror(errno)));
        goto done;
    }

    (*fn)(tmp, closure);
    fflush(tmp);

    rewind(tmp);
    offset = 0;
    while(1) {
        len = fread(buf, 1, CHUNK_SIZE, tmp);
        if(len <= 0 && ferror(tmp)) {
            abortObject(object, 503, internAtom(pstrerror(errno)));
            goto done;
        }
        if(len <= 0)
            break;

        rc = objectAddData(object, buf, offset, len);
        if(rc < 0) {
            abortObject(object, 503, internAtom("Couldn't add data to object"));
            goto done;
        }

        offset += len;
    }

    object->length = offset;

 done:
    if(buf)
        dispose_chunk(buf);
    if(tmp)
        fclose(tmp);
    notifyObject(object);
}
#endif
