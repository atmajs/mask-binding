var files =	[
	'src/intro.js.txt',
	'src/vars.js',
	'src/helpers.js',
	'src/visible.handler.js',
	'src/bind.handler.js',
	'src/bind.util.js',
	'src/bindingProvider.js',
	'src/dualbind.handler.js',
	'src/validate.js',
	'src/validate.group.js',
	'src/bind.events.js',
	'src/outro.js.txt'
	];

global.config = [{
	action: 'settings',
	io: {
		extensions: {
			js: ['condcomments:read', 'hint:write', 'uglify:write']
		}
	}
},{
	action: "concat",
	files: files,
	dist: 'lib/mask.binding.js',
	jshint: {
			options: {
				"curly": true,
				"eqeqeq": false,
				"immed": true,
				"latedef": true,
				"newcap": false,
				"noarg": true,
				"sub": true,
				"undef": true,
				"boss": false,
				"eqnull": true,
				"node": true,
				"es5": true,
				"strict": false,
				"smarttabs": true,
				"expr": true,
				"evil": true
			},

			"globals": {
				"window": false,
				"document": false,
				"XMLHttpRequest": false,
				"IncludeRewrites": false,
				"Class": false,
				"Compo": false,
				"CompoUtils": false,
				"mask": false,
				"ruqq": false,
				"include": false,
				"$": false
			},
		}
},{
	action: "concat",
	files: files,
	minify: true,
	dist: 'lib/mask.binding.min.js'
}];
