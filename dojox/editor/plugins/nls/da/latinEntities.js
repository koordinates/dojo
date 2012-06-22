define(
({
	/* These are already handled in the default RTE
		amp:"ampersand",lt:"less-than sign",
		gt:"greater-than sign",
		nbsp:"no-break space\nnon-breaking space",
		quot:"quote",
	*/
	iexcl:"omvendt udråbstegn",
	cent:"cent-tegn",
	pound:"pund-tegn",
	curren:"valutategn",
	yen:"yen-tegn\nyuan-tegn",
	brvbar:"pipe-tegn\npipe-tegn",
	sect:"afsnitstegn",
	uml:"Trema\nafstandstrema",
	copy:"copyright-tegn",
	ordf:"ordinalindikator for femininum",
	laquo:"dobbelt vinkelanførselstegn pegende mod venstre\nvenstre fransk anførselstegn",
	not:"ikke-tegn",
	shy:"blød bindestreg\ndiskret bindestreg",
	reg:"registreret-tegn\ntegn for registreret varemærke",
	macr:"makron\nafstandsmakron\nstreg over\nAPL-overstreg",
	deg:"gradtegn",
	plusmn:"plus-minus-tegn\nplus-eller-minus-tegn",
	sup2:"hævet total\ntallet to hævet\nkvadrat",
	sup3:"hævet tretal\ntallet tre hævet\nkubik",
	acute:"accent aigu\nafstands-aigu",
	micro:"mikro-tegn",
	para:"afsnitstegn\nafsnitstegn",
	middot:"mellemprik\ngeorgisk komma\ngræsk mellemprik",
	cedil:"cedille\nafstands-cedille",
	sup1:"hævet ettal\ntallet et hævet",
	ordm:"ordinalindikator for maskulinum",
	raquo:"dobbelt vinkelanførselstegn pegende mod højre\nhøjre fransk anførselstegn",
	frac14:"forskudt brøk en kvart\nbrøk en kvart",
	frac12:"forskudt brøk en halv\nbrøk en halv",
	frac34:"forskudt børk en tre kvart\nbrøk tre kvart",
	iquest:"omvendt spørgsmålstegn\ndrejet spørgsmålstegn",
	Agrave:"stort latinsk A med accent grave\nstort latinsk A med accent grave",
	Aacute:"stort latinsk A med accent aigu",
	Acirc:"stort latinsk A med cirkumfleks",
	Atilde:"stort latinsk A med tilde",
	Auml:"stort latinsk A med trema",
	Aring:"stort latinsk A med bolle over\nstort latinsk A med bolle",
	AElig:"stort latinsk AE\nstort latinsk AE",
	Ccedil:"stort latinsk C med cedille",
	Egrave:"stort latinsk E med accent grave",
	Eacute:"stort latinsk E med accent aigu",
	Ecirc:"stort latinsk E med cirkumfleks",
	Euml:"stort latinsk E med trema",
	Igrave:"stort latinsk I med accent grave",
	Iacute:"stort latinsk I med accent aigu",
	Icirc:"stort latinsk I med cirkumfleks",
	Iuml:"stort latinsk I med trema",
	ETH:"stort latinsk ETH",
	Ntilde:"stort latinsk N med tilde",
	Ograve:"stort latinsk O med accent grave",
	Oacute:"stort latinsk O med accent aigu",
	Ocirc:"stort latinsk O med cirkumfleks",
	Otilde:"stort latinsk O med tilde",
	Ouml:"stort latinsk O med trema",
	times:"multiplikationstegn",
	Oslash:"stort latinsk O med streg\nstort latinsk O med skråstreg",
	Ugrave:"stort latinsk U med accent grave",
	Uacute:"stort latinsk U med accent aigu",
	Ucirc:"stort latinsk U med cirkumfleks",
	Uuml:"stort latinsk U med trema",
	Yacute:"stort latinsk Y med accent aigu",
	THORN:"stort latinsk THORN",
	szlig:"lille latinsk skarpt s\ndobbelt-S",
	agrave:"lille latinsk a med accent grave\nlille latinsk a med accent grave",
	aacute:"lille latinsk a med accent aigu",
	acirc:"lille latinsk a med cirkumfleks",
	atilde:"lille latinsk a med tilde",
	auml:"lille latinsk a med trema",
	aring:"lille latinsk a med bolle over\nlille latinsk a med bolle",
	aelig:"lille latinsk ae\nlille latinsk ae",
	ccedil:"lille latinsk c med cedille",
	egrave:"lille latinsk e med accent grave",
	eacute:"lille latinsk e med accent aigu",
	ecirc:"lille latinsk e med cirkumfleks",
	euml:"lille latinsk e med trema",
	igrave:"lille latinsk i med accent grave",
	iacute:"lille latinsk i med accent aigu",
	icirc:"lille latinsk i med cirkumfleks",
	iuml:"lille latinsk i med trema",
	eth:"lille latinsk eth",
	ntilde:"lille latinsk n med tilde",
	ograve:"lille latinsk o med accent grave",
	oacute:"lille latinsk o med accent aigu",
	ocirc:"lille latinsk o med cirkumfleks",
	otilde:"lille latinsk o med tilde",
	ouml:"lille latinsk o med trema",
	divide:"divisionstegn",
	oslash:"lille latinsk o med streg\nlille latinsk o med skråstreg",
	ugrave:"lille latinsk u med accent grave",
	uacute:"lille latinsk u med accent aigu",
	ucirc:"lille latinsk u med cirkumfleks",
	uuml:"lille latinsk u med trema",
	yacute:"lille latinsk y med accent aigu",
	thorn:"lille latinsk thorn",
	yuml:"lille latinsk y med trema",
// Greek Characters and Symbols
	fnof:"lille latinsk f med krumning\nfunktion\nflorin",
	Alpha:"stort græsk alfa",
	Beta:"stort græsk beta",
	Gamma:"stort græsk gamma",
	Delta:"stort græsk delta",
	Epsilon:"stort græsk epsilon",
	Zeta:"stort græsk zeta",
	Eta:"stort græsk eta",
	Theta:"stort græsk theta",
	Iota:"stort græsk iota",
	Kappa:"stort græsk kappa",
	Lambda:"stort græsk lambda",
	Mu:"stort græsk my",
	Nu:"stort græsk ny",
	Xi:"stort græsk ksi",
	Omicron:"stort græsk omikron",
	Pi:"stort græsk pi",
	Rho:"stort græsk rho",
	Sigma:"stort græsk sigma",
	Tau:"stort græsk tau",
	Upsilon:"stort græsk ypsilon",
	Phi:"stort græsk phi",
	Chi:"stort græsk chi",
	Psi:"stort græsk psi",
	Omega:"stort græsk omega",
	alpha:"lille græsk alfa",
	beta:"lille græsk beta",
	gamma:"lille græsk gamma",
	delta:"lille græsk delta",
	epsilon:"lille græsk epsilon",
	zeta:"lille græsk zeta",
	eta:"lille græsk eta",
	theta:"lille græsk theta",
	iota:"lille græsk iota",
	kappa:"lille græsk kappa",
	lambda:"lille græsk lambda",
	mu:"lille græsk my",
	nu:"lille græsk ny",
	xi:"lille græsk ksi",
	omicron:"lille græsk omikron",
	pi:"lille græsk pi",
	rho:"lille græsk rho",
	sigmaf:"lille græsk sigma (slut)",
	sigma:"lille græsk sigma",
	tau:"lille græsk tau",
	upsilon:"lille græsk ypsilon",
	phi:"lille græsk phi",
	chi:"lille græsk chi",
	psi:"lille græsk psi",
	omega:"lille græsk omega",
	thetasym:"lille græsk theta-symbol",
	upsih:"græsk ypsilon med krumning",
	piv:"græsk pi-symbol",
	bull:"punkt\nsort lille cirkel",
	hellip:"vandret ellipse\ntre prikker",
	prime:"citationstegn\nminutter\nfod",
	Prime:"dobbelt citationstegn\nsekunder\ntommer",
	oline:"streg over\nafstandsoverstregning",
	frasl:"brøkskråstreg",
	weierp:"håndskrevet stort P\npowerset\nWeierstrass-p",
	image:"stort blackletter-I\nimaginær del",
	real:"stort blackletter-R\nreel del-symbol",
	trade:"varemærketegn",
	alefsym:"alef-symbol\nførste transfinitte kardinaltal",
	larr:"pil mod venstre",
	uarr:"pil opad",
	rarr:"pil mod højre",
	darr:"pil nedad",
	harr:"pil højre-venstre",
	crarr:"pil nedad med hjørne venstre\nlinjeskift",
	lArr:"dobbeltpil mod venstre",
	uArr:"dobbeltpil opad",
	rArr:"dobbeltpil mod højre",
	dArr:"dobbeltpil nedad",
	hArr:"dobbeltpil højre-venstre",
	forall:"for alle",
	part:"partielt afledet",
	exist:"findes",
	empty:"tomt sæt\nNULL-sæt\ndiameter",
	nabla:"nabla\nbaglæns difference",
	isin:"element af",
	notin:"ikke et element af",
	ni:"indeholder som medlem",
	prod:"n-ær-produkt\nprodukttegn",
	sum:"n-ær-summering",
	minus:"minustegn",
	lowast:"stjerneoperator",
	radic:"kvadratrod\nrodtegn",
	prop:"proportional med",
	infin:"uendelig",
	ang:"vinkel",
	and:"logisk og\nkile",
	or:"logisk eller\nvee",
	cap:"fællesmængde\nhat",
	cup:"foreningsmængde\nkop","int":"integral",
	there4:"derfor",
	sim:"tilde-operator\nvarierer med\nligner",
	cong:"tilnærmet lig med",
	asymp:"næsten lig med\nasymptotisk med",
	ne:"ikke lig med",
	equiv:"identisk med",
	le:"mindre end eller lig med",
	ge:"større end eller lig med",
	sub:"delmængde af",
	sup:"supersæt af",
	nsub:"ikke en delmængde af",
	sube:"delmængde af eller lig med",
	supe:"supersæt af eller lig med",
	oplus:"cirkel med plus\ndirekte sum",
	otimes:"cirkel med gangetegn\nvektorprodukt",
	perp:"vinkelret op\nortogonal på\nretvinklet",
	sdot:"prik-operator",
	lceil:"venstre loft\nAPL upstile",
	rceil:"højre loft",
	lfloor:"venstre gulv\nAPL downstile",
	rfloor:"højre gulv",
	lang:"venstre vinkelparentes",
	rang:"højre vinkelparentes",
	loz:"rombe",
	spades:"sort spar",
	clubs:"sort klør\ntrekløver",
	hearts:"sort hjerter\nvalentin",
	diams:"sort ruder",
	OElig:"stort latinsk OE",
	oelig:"lille latinsk oe",
	Scaron:"stort latinsk S med hacek",
	scaron:"lille latinsk s med hacek",
	Yuml:"stort latinsk Y med trema",
	circ:"accent cirkumfleks",
	tilde:"lille tilde",
	ensp:"kort mellemrum",
	emsp:"langt mellemrum",
	thinsp:"lille mellemrum",
	zwnj:"valgfrit mellemrum uden bredde",
	zwj:"hårdt mellemrum uden bredde",
	lrm:"venstre mod højre-mærke",
	rlm:"højre mod venstre-mærke",
	ndash:"kort tankestreg",
	mdash:"lang tankestreg",
	lsquo:"venstre enkelt anførselstegn",
	rsquo:"højre enkelt anførselstegn",
	sbquo:"enkelt nedre anførselstegn",
	ldquo:"venstre dobbelt anførselstegn",
	rdquo:"højre dobbelt anførselstegn",
	bdquo:"dobbelt nedre anførselstegn",
	dagger:"kors",
	Dagger:"dobbelt kors",
	permil:"promilletegn",
	lsaquo:"enkelt venstre vinkelanførselstegn",
	rsaquo:"enkelt højre vinkelanførselstegn",
	euro:"eurotegn"
})
);
