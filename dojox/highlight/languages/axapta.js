dojo.provide("dojox.highlight.languages.axapta"); 

dojo.require("dojox.highlight._base");

//
// Axapta definition (c) Dmitri Roudakov <dmitri@roudakov.ru>
// Released BSD, contributed under CLA to the Dojo Foundation
//

(function(){
	var dh = dojox.highlight, dhc = dh.constants;
	dh.languages.axapta = {
		// summary: axapta highlight definitions
		defaultMode: {
			lexems: [dhc.UNDERSCORE_IDENT_RE],
			contains: ['comment', 'string', 'class', 'number', 'preprocessor'],
			keywords: {
				'false': 1, 'int': 1, 'abstract': 1, 'private': 1, 'char': 1,
				'interface': 1, 'boolean': 1, 'static': 1, 'null': 1, 'if': 1,
				'for': 1, 'true': 1, 'while': 1, 'long': 1, 'throw': 1,  
				'finally': 1, 'protected': 1, 'extends': 1, 'final': 1,
				'implements': 1, 'return': 1, 'void': 1, 'enum': 1, 'else': 1,
				'break': 1, 'new': 1, 'catch': 1, 'byte': 1, 'super': 1, 
				'class': 1, 'case': 1, 'short': 1, 'default': 1, 'double': 1,
				'public': 1, 'try': 1, 'this': 1, 'switch': 1, 'continue': 1,
				'reverse':1, 'firstfast':1,'firstonly':1,'forupdate':1,'nofetch':1,
				'sum':1, 'avg':1, 'minof':1, 'maxof':1, 'count':1, 'order':1,
				'group':1, 'by':1, 'asc':1, 'desc':1, 'index':1, 'hint':1,
				'like':1, 'dispaly':1, 'edit':1, 'client':1, 'server':1,
				'ttsbegin':1, 'ttscommit':1, 'str':1, 'real':1, 'date':1,
				'container':1, 'anytype':1, 'common':1, 'div':1,'mod':1
			}
		},
		modes: [
			{
				className: 'class',
				lexems: [dhc.UNDERSCORE_IDENT_RE],
				begin: '(class |interface )', end: '{',
				illegal: ':',
				keywords: {'class': 1, 'interface': 1},
				contains: ['inheritance', 'title']
			},
			{
				className: 'inheritance',
				begin: '(implements|extends)', end: '^',
				lexems: [dhc.IDENT_RE],
				keywords: {'extends': 1, 'implements': 1},
				relevance: 10
			},
			{
				className: 'title',
				begin: dhc.UNDERSCORE_IDENT_RE, end: '^'
			},
			{
				className: 'params',
				begin: '\\(', end: '\\)',
				contains: ['string', 'annotation']
			},
			dhc.C_NUMBER_MODE,
			dhc.APOS_STRING_MODE,
			dhc.QUOTE_STRING_MODE,
			dhc.BACKSLASH_ESCAPE,
			dhc.C_LINE_COMMENT_MODE,
			dhc.C_BLOCK_COMMENT_MODE,
			{
				className: 'preprocessor',
				begin: '#', end: '$'
			}
		]
	};//axapta
})();
