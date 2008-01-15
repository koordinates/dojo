dojo.provide("dojox.highlight.languages.ruby");

dojo.require("dojox.highlight._base");

//
// Ruby definition (c) Anton Kovalyov <anton@kovalyov.net>
// Released BSD, contributed under CLA to the Dojo Foundation
//
(function(){
	var dh = dojox.highlight, dhc = dh.constants;
	dh.languages.ruby = {
		// summary: Ruby highlight definitions
		defaultMode: {
			lexems: [dhc.UNDERSCORE_IDENT_RE],
			contains: ['comment', 'string', 'class', 'function', 'symbol', 'instancevar'],
			keywords: {
				'and': 1, 'false': 1, 'then': 1, 'defined': 1, 'module': 1, 
				'in': 1, 'return': 1, 'redo': 1, 'if': 1, 'BEGIN': 1, 'retry': 1,
				'end': 1, 'for': 1, 'true': 1, 'self': 1, 'when': 1, 'next': 1,
				'until': 1, 'do': 1, 'begin': 1, 'unless': 1, 'END': 1, 
				'rescue': 1, 'nil': 1, 'else': 1, 'break': 1, 'undef': 1, 'not': 1,
				'super': 1, 'class': 1, 'case': 1, 'require': 1, 'yield': 1,
				'alias': 1, 'while': 1, 'ensure': 1, 'elsif': 1, 'or': 1, 'def': 1
			}
		},
		modes: [
			dhc.HASH_COMMENT_MODE,
			{
				className: 'comment',
				begin: '^\\=begin', end: '^\\=end',
				relevance: 10
			},
			{
				className: 'string',
				begin: '\'', end: '(^|[^\\\\])\'',
				contains: ['subst'],
				relevance: 0
			},
			{
				className: 'string',
				begin: '"', end: '(^|[^\\\\])"',
				contains: ['subst'],
				relevance: 0
			},
			{
				className: 'subst',
				begin: '#\\{', end: '\}',
				contains: ['string', 'symbol', 'instancevar'],
				relevance: 10
			},
			{
				className: 'function',
				lexems: [dhc.IDENT_RE],
				begin: '\\bdef ', end: '$',
				illegal: '[{\\:]',
				keywords: {'def': 1},
				contains: ['title', 'comment'],
				relevance: 10
			},    
			{ 
				className: 'class',
				lexems: [dhc.IDENT_RE],
				begin: '\\bclass ', end: '$',
				illegal: '[{\\:]',
				contains: ['title', 'inheritance', 'comment'],      
				keywords: {'class': 1}
			},
			{
				className: 'title',
				begin: 'self.' + dhc.IDENT_RE, end: '^'
			},
			{
				className: 'title',
				begin: dhc.IDENT_RE, end: '^'
			},
			{
				className: 'inheritance',
				begin: '<\\s*', end: '^',
				contains: ['parent']
			},
			{
				className: 'parent',
				begin: '(' + dhc.IDENT_RE + '::)?' + dhc.IDENT_RE, end: '^'
			},
			{
				className: 'symbol',
				begin: ':' + dhc.UNDERSCORE_IDENT_RE, end: '^'
			},
			{
				className: 'instancevar',
				begin: '\\@' + dhc.UNDERSCORE_IDENT_RE, end: '^'
			}
		]
	};
})();
