#!/usr/bin/perl -w

=head1 NAME

=head1 DESCRIPTION

Start with all top-level references, and references from function bodies, of code in starter file.


=head1 TODO

Get Rhino to issue original file line numbers.
Also maybe get Rhino to mangle/change names, or do other transforms (such as conditional "in").

Track alias definitions (in 'assign' case, lhs inherits all the methods available from rhs).
Things like "a = b.c.d;".

Also track creation of global instances, things like "var foo = new SomeFunc();".

Track calls to prototype functions from within subprototype method bodies (based on 
remembering the set of the subprototype's prototype object).

Do something about passing in named function references (no parens). Though
win somewhat with "justname" look up on the other side.

Exclude pattern matches within quoted strings and regexp literals.

Scope locally bound functions with "OuterFunction.inner."

Allow anchor refs to come from an html page.

Support -D of expressions known to be false or true, to exclude references in:

    if (FALSEEXPR) {...} 
    if (!FALSEEXPR) {} else {...}
    if (TRUEEXPR) {} else {...}

Provide warnings on:

   calls to eval 
   computed apply and computed call
   js file names
   unknown method on builtin object
   redefinition of builtin object method

Track definitions of global data variables, and references to them.

   # global data
   ^var $NAMERE = 
   # member data
   ^\ *this.$NAMERE = 
   # local data
   ^\ *var $NAMERE = 
   

=cut

# including 'this'
my @KEYWORDS = qw(break else new var case finally return void catch for switch while continue function with this default if throw delete in try do instanceof typeof);
my %KEYWORDS = map {$_=>1} @KEYWORDS;
my @BUILTIN_OBJECTS = qw(Number String Boolean Date RegExp Array Math Object Error Function arguments);
my %BUILTIN_OBJECTS = map {$_=>1} @BUILTIN_OBJECTS;
my @BUILTIN_FUNCTIONS = (qw(eval parseInt parseFloat isNan isFinite decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape),
			 qw(ScriptEngineMajorVersion ScriptEngineMinorVersion));
my %BUILTIN_FUNCTIONS = map {$_=>1} @BUILTIN_FUNCTIONS;
my @BUILTIN_METHODS = (qw(charAt indexOf length substring lastIndexOf replace split),
		       qw(test match exec),
		       qw(push pop join split));
my %BUILTIN_METHODS = map {$_=>1} @BUILTIN_METHODS;
my $INDENT = 4;

my $GLOBALNAME = 'GLOBAL '; # used as the equivalent of function name for top-level statements in some file
my $NAMERE = '([\w_]+)';
my $QUALRE = '([\w_\.]+)';



my $DEFS_BY_QUAL = {};
my $DEFS_BY_UNQUAL = {};
my $DEFS_BY_FNAME = {};

use Data::Dumper;

my $DEBUG = 0;
my $WARN_FUNCTION_MATCHES = 0;
my $SHOW_USEDBY = 1;

sub debug {
    print STDERR 'DEBUG: ', @_, "\n" if $DEBUG;
}

sub debughack {
    print STDERR "DEBUGHACK: ";
    parse_warn (@_);
}

my $CURRENT_FNAME = '';

sub parse_warn {
    my ($mess, @rest) = @_;
    my $line = $_;
    my $lineno = $.;
    my $fname = $CURRENT_FNAME;
    print STDERR "PARSE WARNING: At line $fname\:$lineno : '$line'\n        $mess", @rest, "\n";
}

sub process_warn {
    print STDERR "WARNING: ", @_, "\n";
}

# used for 'ctormeth' definition, "this.foobar = function ...". 
# need to figure out what "this" is
sub qualify_def_this {
    my ($name, $parentdef) = @_;
    my $pname = $parentdef->{qualname};
    my $pdeftype = $parentdef->{deftype};
    if ($pdeftype eq 'globalfunc') {
	debug("qualifying name '$name' with parent '$pname' of type '$pdeftype'");
	$name = "$pname\.constructor\.$name";
    }
    else {
	parse_warn("member function definition of $name at with parent '$pname' of type '$pdeftype'");
    }
    return $name;
}

# used when a reference string for a function call starts with 'this.'
# we try to determine what "this" means based on deftype we are in :
#   'ctormeth'   - in a "this.foobar = function" (itself inside a global function)
#   'protometh'  - in a "FooBar.prototype.methname = function"
#   'instmeth'  -  in a "whatever.methname = function"
#   'globalfunc' - inside body of global function (constructor)
sub qualify_ref_this {
    my ($refname, $def) = @_;

    # we this could have been from the body of a constructor, or from the body of another method.
    my ($restname) = ($refname =~ m/^this\.(.*)/);
    my $deftype = $def->{deftype};

    my $refqual = undef;
    my $is_funny = 0;

    if ($deftype eq 'ctormeth' || $deftype eq 'protometh' || $deftype eq 'instmeth') {
	($refqual) = ($def->{qualname} =~ m/(.*)\./);
    }
    elsif ($deftype eq 'globalfunc') {
	$refqual = $def->{qualname};
    }
    else {
	$is_funny = 1;
	parse_warn("reference $refname in a definition of type $deftype");
    }

    if ($refqual) {
	debug("qualifying reference '$refname' in a '$deftype' definition as '$refqual' + '.' + '$restname'");
	$refname = "$refqual\.$restname";
    }
    elsif (!$is_funny) {
	parse_warn("could not get definition qualifier out of definition: ", Dumper($def));
    }
    return $refname;
}

sub add_def {
    my ($qualname, $actualname, $deftype, $fname, $lineno, $level, $parentdef, $protoname, $aliasto) = @_;
    die "add_def: wrong number args: @_" unless scalar(@_) == 9;

    my $is_global = ($qualname =~ m/^$GLOBALNAME/);

    # parse out params, unless type 'assign'
    my $params = {};
    if (!$is_global && $deftype ne 'assign') {
	my ($funcname, $paramstr) =  m/function ([\w_]*)\((.*)\)/ ;
	if (defined($paramstr)) { 
	    # debughack("funcname=$funcname, paramstr=$paramstr in '$_'") if m/for_each/;
	    # $paramstr ||= '';
	    # if (!defined($paramstr)) { parse_warn("did not match function params, 1='$1'"); $paramstr = ''}
	    my @parms = split(/, ?/, $paramstr);
	    $params = {map {$_ => 1} @parms};
	    # debughack("got params '$paramstr', ", Dumper($params)) if m/for_each/;
	}
	else {
	    parse_warn("no function params to parse in: ", $_); 
	}
    }
    
    my $parentqual = $parentdef->{qualname};
    my $justname = undef;
    if (!$is_global) {
	($justname) = ($qualname =~ m/$NAMERE$/);
	parse_warn("no match to m/$NAMERE\$/ in '$qualname'") unless $justname;
    }
    my $def = {
	qualname => $qualname,
	actualname => $actualname,
	justname => $justname,
	deftype => $deftype,
	filename => $fname,
	startline => $lineno,
	params => $params,
	level => $level,
	parentqual => $parentqual,
	protoname => $protoname,
	aliasto => $aliasto,
	refs => {},      # all references found in body of this definition. hash from $qualname to [$reftype, $lineno]
        undefs => [],    # list of keys from refs which are not defined.
	usedby => [],    # array of other $def's which point to this one.
    };
    my $existing = $DEFS_BY_QUAL->{$qualname};
    my $do_replace = 1;
    if ($existing) {
	# don't warn if either of type 'assign' (and same file?)
	if ( # $existing->{filename} eq $def->{filename} &&
	    ($existing->{deftype} eq 'assign' || $def->{deftype} eq 'assign')) {
	    $do_replace = 0 if $def->{deftype} eq 'assign'; # don't replace a non-assign with an assign
	}
	else {
	    parse_warn("duplicate definition of $qualname: ", Dumper($existing), Dumper($def));
	}
    }
    $DEFS_BY_QUAL->{$qualname} = $def;

    # debughack("storing def on '$qualname' with justname=$justname") if $qualname eq 'bu_encodeURIComponent';

    if ($justname) {
	my $a = $DEFS_BY_UNQUAL->{$justname};
	$DEFS_BY_UNQUAL->{$justname} = $a ? [@$a, $def] : [$def];
    }
    my $filedefs = $DEFS_BY_FNAME->{$fname};
    push(@$filedefs, $def);
    debug("starting function definition of '", def_name($def), "' with type '$deftype' at $fname:$lineno, level $level");
    return $def;
}

sub def_name {
    my ($def) = @_;
    my $q = $def->{qualname};
    # return $def->{protoname} . ".prototype.$q" if $def->{protoname};
    return $q;
}

# note that this function definition is referring to qualified symbol $refname
sub add_ref {
    my ($def, $refname, $reftype, $fname, $lineno) = @_;
    my ($startname) = ($refname =~ m/^(\w+)/);

    my $qualname = $refname;
    # my $actualname = $refname;
    if ($startname eq 'this') {
	if ($refname eq 'this') {debug("skipping 'this' as function"); return;}
	$qualname = qualify_ref_this($refname, $def);
    }
    elsif ($KEYWORDS{$startname}) {
	# debug("skipping keyword '$refname' at $fname:$lineno"); 
	return;
    }
    elsif ($BUILTIN_OBJECTS{$startname}) {
	# debug("skipping builtin object reference '$refname' at $fname:$lineno"); 
	return;
    }
    elsif ($BUILTIN_FUNCTIONS{$startname}) {
	# debug("skipping builtin function reference '$refname' at $fname:$lineno"); 
	return;
    }
    debug("adding reference '$refname' (qualname='$qualname') of type '$reftype' from ", def_name($def), " at $fname:$lineno : ", $_);
    $def->{refs}->{$qualname} = [$reftype, $.];
}

sub parse_file {
    my ($f, $fname) = @_;

    $CURRENT_FNAME = $fname;
    $DEFS_BY_FNAME->{$fname} = [];

    # the function def we are currently inside of, or the top-level script
    my $currentdef = add_def($GLOBALNAME . $fname, '', 'global', $fname, 0, 0, undef, undef, undef);
    my $nested = [$currentdef];          # stack of functions being defined. 
    while(<$f>) {
	chop;
	# debug("parsing $fname:$. : '$_'");
	# determine indent level. 
	m/^( *)/;
	my $level = length($1)/$INDENT;
	my $is_global = ($level == 0);
	# maybe done definining function
	my $lastlevel = $currentdef->{level};
	my $numnested = scalar(@$nested);
	if ($level <= $lastlevel && ($lastlevel > 0 || $numnested > 1)) {
	    $currentdef->{lastline} = $.;
	    debug("finishing definition of ", def_name($currentdef), " at line: '", $_, "'");
	    pop(@$nested);
	    $currentdef = $nested->[$numnested - 2];
	    die "no nested function definition to pop at: $_" unless $currentdef;
	}

	my $qualname = undef; # full qualified
	my $actualname = undef; # what actually was found in the file
	my $deftype = undef;
	my $protoname = undef;
	my $aliasto = undef;

	if (m/^ *function $NAMERE/ || m/^ *var $NAMERE = function/ ) {
	    $deftype = ($is_global ? 'globalfunc' : 'localfunc');
	    $qualname = $actualname = $1;
	}
	elsif (m/^ *this\.$NAMERE = function/) {
	    $deftype = 'ctormeth';
	    $actualname = "this.$1";
	    $qualname = qualify_def_this($1, $currentdef);
	}
	# TODO: Foo.prototype.meth = aliasfunc
	# TODO: var Foo = {methname : function ...
	elsif (m/^ *$QUALRE\.prototype\.$NAMERE = function/) {
	    $deftype = 'protometh';
	    $protoname = $1;
	    $actualname = $qualname = "$1\.prototype\.$2";
	}
	elsif (m/^ *$QUALRE\.$NAMERE = function/) {
	    $actualname = $qualname = "$1\.$2";
	    $deftype = 'instmeth';
	}

	# starting a function definition - register and continue loop
	if ($deftype) {
	    my $parentdef = $currentdef;
	    $currentdef = add_def($qualname, $actualname, $deftype, $fname, $., $level, $parentdef, $protoname, $aliasto); 
	    push(@$nested, $currentdef);
	    next;
	}

	# deal with assignment, which could be definition and reference. could also be an alias.
	if (!$deftype && (m/^ *$QUALRE = / || m/^ *var $NAMERE = /)) {
	    $deftype = 'assign';
	    $actualname = $qualname = $1;
	    # we don't push a function defining context
	    add_def($qualname, $actualname, $deftype, $fname, $., $level, $currentdef, $protoname, $aliasto);
	    # debughack("adding assignment for qualname='$qualname'") if $qualname eq 'bu_encodeURIComponent';
	}
	else {
	    # debughack("did not match assignment") if (m/bu_encodeURIComponent/);
	}

	# not starting a function definition
	if (m/function/) {
	    # matches we expect: 
	    #    closures in function calls: foobar(17, function(a, b) {
            #    returning a closure:        return function (o) {  
            #    closure on rhs, in level:   foobar = function (s) {
	    #    matches in string:          foobar("what is this function"); 
            #    matches in regexp:          var m = s.match(/function /);
            #    partial matches:            var s = foobar.functionName(f);
	    parse_warn("ignoring function defintion starting here") if $WARN_FUNCTION_MATCHES;
	}

	# scan for function references, using possibly qualified names
	my @ctorcalls = m/new $QUALRE/g;
	for my $csym (@ctorcalls) {
	    add_ref($currentdef, $csym, 'construct', $fname, $.);
	}
	my @funcalls = m/$QUALRE\(/g;
	# exclude calls to methods of literal regexps such as /foo/i.exec();
	# TODO detect other things besides \w and / prior to .
	@funcalls = grep {! m/apply$/ && ! m/call$/ && !m,^\.,} @funcalls;
	for my $fsym (@funcalls) {
	    add_ref($currentdef, $fsym, 'call', $fname, $.);
	}
	my @applycalls = m/$QUALRE\.apply/;
	my @callcalls = m/$QUALRE\.call/;
	my @dyncalls = (@applycalls, @callcalls);
	for my $dynsym (@dyncalls) {
	    add_ref($currentdef, $dynsym, 'dynamic', $fname, $.);
	}	
	
    }
}

sub main {
    my @filenames = @ARGV;

    # collect definitions and references
    for my $fname (@filenames) {
	my $cmd = "java -classpath /Users/mda/Desktop/rhino1_5R4_1/js.jar:. JsLinker " . $fname . " |";
	open(PRETTY, $cmd) || die "can't open $cmd: $!";
	parse_file(PRETTY, $fname);
	close(PRETTY);
    }

    # collect anchor file(s) and/or defs
    my $anchorfile = $filenames[0];
    my $start_defs = $DEFS_BY_FNAME->{$anchorfile} || die "no definitions for $anchorfile";

    # perform transitive closure determining what other functions are required
    my $all_defs = [];
    my $new_defs = $start_defs;
    my $loopcount = 1;

    # loop as long we we added new definitions in the last pass.
    # we start with the "anchor" definitions.
    while (scalar(@$new_defs) > 0) {
	debug("starting loop $loopcount with ", scalar(@$new_defs), " definitions");
	my $current_defs = $new_defs;
	$new_defs = [];

	# loop over all (new definitions), looking at what they refer to, and pulling those in if not already 
	for my $fromdef (@$current_defs) {
	    my $refs = $fromdef->{refs};

	    # loop over all refs from this definition
	    for my $refname (keys %$refs) {
		my ($justname) = ($refname =~ m/$NAMERE$/);
		my ($firstname) = ($refname =~ m/^$NAMERE/);
		my $reftype = $refs->{$refname};

		# look up definition object by full name
		my $todef = $DEFS_BY_QUAL->{$refname};
		my $usedby;

		# not found, try to find less strict match.
		# if find multiple, warn.
		# if still find none, collect in an 'undefined' collection.
		if (!$todef) {
		    # if a builtin method, ignore
		    if ($BUILTIN_METHODS{$justname}) {
			debug("ignoring reference to builtin method in $refname");
		    }
		    else {
			my $is_local = $fromdef->{params}->{$firstname} ? 1 : 0 ;
			# debughack("is_local=$is_local, firstname=$firstname, fromdef=", def_name($fromdef), ", params=", Dumper($fromdef->{params})) if ($refname eq 'unary_func') ;
			my $unqual_defs = $DEFS_BY_UNQUAL->{$justname};
			my $mess = "reference '$refname' in " . def_name($fromdef) . " in file " . $fromdef->{filename};
			# attempt to find matches to just the unqualified last part of the name
			if ($unqual_defs) {
			    my $num_unqual = scalar(@$unqual_defs);
			    if ($num_unqual > 1) {
				process_warn("no fully qualified matches, found $num_unqual matches to '$justname', " . $mess);
			    }
			    else {
				debug("found 1 match to justname='$justname', " . $mess);
			    }
			    $todef = $unqual_defs->[0];
			}
			# no matches to unqualified name either, collect it.
			else {
			    my $undefs = $fromdef->{undefs};
			    push(@$undefs, $refname);
			}
		    }
		}

		# update the definition with the references from here. 
		# add it to $new_defs if it hasn't already been processed.
		if ($todef) {
		    $usedby = $todef->{usedby};
		    push(@$usedby, $fromdef);
		    push(@$new_defs, $todef) unless $todef->{used};
		}
	    } # loop for refs

	    # mark this definition as having been processed
	    $fromdef->{used} = $loopcount;
	} # for $new_defs
	$loopcount++;
	push(@$all_defs, @$current_defs);
    }
    
    # overall summary
    print "In $loopcount loops need ", scalar(@$all_defs), " definitions including anchor file\n";

    my $INDENTSTR = '   ';

    # list what files are not used at all, and what functions in files are not used
    for my $fname (@filenames) {
	my $fdefs = $DEFS_BY_FNAME->{$fname};

	# filename summary
	my $ndefs = scalar(@$fdefs);
	my @used = grep {$_->{used}} @$fdefs;
	my $nused = scalar(@used);
	my $nunused = $ndefs - $nused;
	print "$fname : $nused used, $nunused unused\n";

	for my $def (@$fdefs) {
	    next if $def->{deftype} eq 'assign';

	    my $usedby;
	    my $nused = 0;
	    if ($def->{used}) {
		$usedby = $def->{usedby};
		$nused = scalar(@$usedby);
	    }

	    # per definition summary
	    print sprintf("%s%-10s %3d %s\n", $INDENTSTR, $def->{deftype}, $nused, def_name($def));

	    # indented list of undefined references from within this function
	    my $undefs = $def->{undefs};
	    if (scalar(@$undefs) > 0) {
		print $INDENTSTR, $INDENTSTR, 'CONTAINS UNDEFINED REFERENCES:',"\n";
		for my $refsym (@$undefs) {
		    my $refinfo = $def->{refs}->{$refsym};
		    my ($reftype, $reflineno) = @$refinfo;
		    print $INDENTSTR, $INDENTSTR, $refsym, ' at ', $fname, ':', $reflineno, "\n";
		}
	    }

	    # if desired, list usedby for this definition
	    if ($SHOW_USEDBY && $nused > 0) {
		print $INDENTSTR, $INDENTSTR, 'USED BY:', "\n";
		for my $usedef (@$usedby) {
		    print $INDENTSTR, $INDENTSTR, def_name($usedef), ' at ', $usedef->{filename}, ':', $usedef->{startline}, "\n";
		}
	    }
	}
    }
}

main();
