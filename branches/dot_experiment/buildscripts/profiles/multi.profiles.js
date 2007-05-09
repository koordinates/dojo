var profiles = {
	one: {
		dependencies : [
			'dojo.event.*'
		]
	},
	two : {
		profileDeps : ['one'],
		dependencies : [
			'dojo.widget.Button'
		]
	}
}
