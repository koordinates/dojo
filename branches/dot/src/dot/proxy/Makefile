PREFIX = /usr/local
BINDIR = $(PREFIX)/bin
MANDIR = $(PREFIX)/man
INFODIR = $(PREFIX)/info
LOCAL_ROOT = /usr/share/polipo/www
DISK_CACHE_ROOT = /var/cache/polipo

# To compile with Unix CC:

# CDEBUGFLAGS=-O

# To compile with GCC:

CC = gcc
# CDEBUGFLAGS = -Os -g -Wall -std=gnu99
CDEBUGFLAGS = -Os -Wall $(DEBUGFLAG)
# CDEBUGFLAGS = -Os -Wall
# CDEBUGFLAGS = -g -Wall

# To compile on a pure POSIX system:

# CC = c89
# CC = c99
# CDEBUGFLAGS=-O

# To compile with icc 7, you need -restrict.  (Their bug.)

# CC=icc
# CDEBUGFLAGS = -O -restrict

# On System V (Solaris, HP/UX) you need the following:

# PLATFORM_DEFINES = -DSVR4

# On Solaris, you need the following:

# LDLIBS = -lsocket -lnsl -lresolv

# On mingw, you need

# EXE=.exe
# LDLIBS = -lwsock32

# Hides a console window popping up on Windows -- needed
# if you want to start the restarter on system startup
# without a window appearing (mingw option).
# HIDECONSOLE = -mwindows

FILE_DEFINES = -DLOCAL_ROOT=\"$(LOCAL_ROOT)/\" \
               -DDISK_CACHE_ROOT=\"$(DISK_CACHE_ROOT)/\"

# You may optionally also add any of the following to DEFINES:
#
#  -DNO_DISK_CACHE to compile out the on-disk cache and local web server;
#  -DNO_IPv6 to avoid using the RFC 3493 API and stick to stock
#      Berkeley sockets;
#  -DHAVE_IPv6 to force the use of the RFC 3493 API on systems other
#      than GNU/Linux and BSD (let me know if it works);
#  -DNO_FANCY_RESOLVER to compile out the asynchronous name resolution
#      code;
#  -DNO_STANDARD_RESOLVER to compile out the code that falls back to
#      gethostbyname/getaddrinfo when DNS requests fail;
#  -DNO_TUNNEL to compile out the code that handles CONNECT requests;
#  -DNO_SOCKS to compile out the SOCKS gateway code.
#  -DNO_FORBIDDEN to compile out the all of the forbidden URL code
#  -DNO_REDIRECTOR to compile out the Squid-style redirector code
#  -DNO_OFFLINE_SUPPORT to compile out the offline web application support

DEFINES = $(FILE_DEFINES) $(PLATFORM_DEFINES)

CFLAGS = $(MD5INCLUDES) $(CDEBUGFLAGS) $(DEFINES) $(EXTRA_DEFINES)

SRCS = util.c event.c io.c chunk.c atom.c object.c log.c diskcache.c main.c \
       config.c local.c http.c client.c server.c auth.c tunnel.c \
       http_parse.c parse_time.c dns.c forbidden.c \
       md5import.c md5.c ftsimport.c fts_compat.c socks.c mingw.c \
       off.c 
#database.c

OBJS = util.o event.o io.o chunk.o atom.o object.o log.o diskcache.o main.o \
       config.o local.o http.o client.o server.o auth.o tunnel.o \
       http_parse.o parse_time.o dns.o forbidden.o \
       md5import.o ftsimport.o socks.o mingw.o off.o 
#\
#database.o

SQLITE_PATH = ../sqlite

SQLITE_OBJS = \
	$(SQLITE_PATH)/build/.libs/alter.o $(SQLITE_PATH)/build/.libs/analyze.o \
	$(SQLITE_PATH)/build/.libs/attach.o $(SQLITE_PATH)/build/.libs/auth.o \
	$(SQLITE_PATH)/build/.libs/btree.o $(SQLITE_PATH)/build/.libs/build.o \
	$(SQLITE_PATH)/build/.libs/callback.o $(SQLITE_PATH)/build/.libs/complete.o \
	$(SQLITE_PATH)/build/.libs/date.o $(SQLITE_PATH)/build/.libs/delete.o \
	$(SQLITE_PATH)/build/.libs/expr.o $(SQLITE_PATH)/build/.libs/func.o \
	$(SQLITE_PATH)/build/.libs/hash.o $(SQLITE_PATH)/build/.libs/insert.o \
	$(SQLITE_PATH)/build/.libs/loadext.o $(SQLITE_PATH)/build/.libs/main.o \
	$(SQLITE_PATH)/build/.libs/opcodes.o $(SQLITE_PATH)/build/.libs/os.o \
	$(SQLITE_PATH)/build/.libs/os_unix.o $(SQLITE_PATH)/build/.libs/os_win.o \
	$(SQLITE_PATH)/build/.libs/os_os2.o $(SQLITE_PATH)/build/.libs/pager.o \
	$(SQLITE_PATH)/build/.libs/parse.o $(SQLITE_PATH)/build/.libs/pragma.o \
	$(SQLITE_PATH)/build/.libs/prepare.o $(SQLITE_PATH)/build/.libs/printf.o \
	$(SQLITE_PATH)/build/.libs/random.o $(SQLITE_PATH)/build/.libs/select.o \
	$(SQLITE_PATH)/build/.libs/table.o $(SQLITE_PATH)/build/.libs/tokenize.o \
	$(SQLITE_PATH)/build/.libs/trigger.o $(SQLITE_PATH)/build/.libs/update.o \
	$(SQLITE_PATH)/build/.libs/util.o $(SQLITE_PATH)/build/.libs/vacuum.o \
	$(SQLITE_PATH)/build/.libs/vdbe.o $(SQLITE_PATH)/build/.libs/vdbeapi.o \
	$(SQLITE_PATH)/build/.libs/vdbeaux.o $(SQLITE_PATH)/build/.libs/vdbefifo.o \
	$(SQLITE_PATH)/build/.libs/vdbemem.o $(SQLITE_PATH)/build/.libs/where.o \
	$(SQLITE_PATH)/build/.libs/utf.o $(SQLITE_PATH)/build/.libs/legacy.o \
	$(SQLITE_PATH)/build/.libs/vtab.o

#polipo$(EXE): $(OBJS)
#	$(CC) $(CFLAGS) $(LDFLAGS) -o polipo$(EXE) $(OBJS) $(SQLITE_OBJS) $(MD5LIBS) $(LDLIBS) \
#			-I. -I$(SQLITE_PATH)/src -I$(SQLITE_PATH) -I$(SQLITE_PATH)/build

polipo$(EXE): $(OBJS)
	$(CC) $(CFLAGS) $(LDFLAGS) -o polipo$(EXE) $(OBJS) $(MD5LIBS) $(LDLIBS)

restart$(EXE): $(OBJS)
	$(CC) $(CFLAGS) $(LDFLAGS) $(HIDECONSOLE) -o restarter$(EXE) restart.c $(MD5LIBS) $(LDLIBS)

ftsimport.o: ftsimport.c fts_compat.c

md5import.o: md5import.c md5.c

database.o: database.c

database.c:
	$(CC) $(CFLAGS) $(LDFLAGS) -I. -I$(SQLITE_PATH)/src -I$(SQLITE_PATH) -I$(SQLITE_PATH)/build

.PHONY: all install install.binary install.man

all: polipo$(EXE) restart$(EXE) polipo.info html/index.html localindex.html

install: install.binary install.man

install.binary: all
	mkdir -p $(TARGET)$(BINDIR)
	mkdir -p $(TARGET)$(LOCAL_ROOT)
	mkdir -p $(TARGET)$(LOCAL_ROOT)/doc
	rm -f $(TARGET)$(BINDIR)/polipo
	cp -f polipo $(TARGET)$(BINDIR)/
	cp -f html/* $(TARGET)$(LOCAL_ROOT)/doc
	cp -f localindex.html $(TARGET)$(LOCAL_ROOT)/index.html

install.man: all
	mkdir -p $(TARGET)$(MANDIR)/man1
	mkdir -p $(TARGET)$(INFODIR)
	cp -f polipo.man $(TARGET)$(MANDIR)/man1/polipo.1
	cp polipo.info $(TARGET)$(INFODIR)/
	install-info --info-dir=$(INFODIR) polipo.info


polipo.info: polipo.texi
	makeinfo polipo.texi

html/index.html: polipo.texi
	mkdir -p html
	makeinfo --html -o html polipo.texi

polipo.html: polipo.texi
	makeinfo --html --no-split --no-headers -o polipo.html polipo.texi

polipo.pdf: polipo.texi
	texi2pdf polipo.texi

polipo.ps.gz: polipo.ps
	gzip -c polipo.ps > polipo.ps.gz

polipo.ps: polipo.dvi
	dvips -Pwww -o polipo.ps polipo.dvi

polipo.dvi: polipo.texi
	texi2dvi polipo.texi

polipo.man.html: polipo.man
	groff -man -Thtml polipo.man > polipo.man.html

TAGS: $(SRCS)
	etags $(SRCS)

.PHONY: clean

clean:
	-rm -f polipo polipo.exe *.o *~ core TAGS gmon.out
	-rm -f polipo.cp polipo.fn polipo.log polipo.vr
	-rm -f polipo.cps polipo.info* polipo.pg polipo.toc polipo.vrs
	-rm -f polipo.aux polipo.dvi polipo.ky polipo.ps polipo.tp
	-rm -f polipo.dvi polipo.ps polipo.ps.gz polipo.pdf polipo.html
	-rm -rf ./html/
	-rm -f polipo.man.html
