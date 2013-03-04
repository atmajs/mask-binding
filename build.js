/**
 *	IncludeJSBuild
 *
 *	``` $ includejs build.js ```
 **/

var sources = [
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
	];


var builds = {
	'mask.binding': ['src/intro.js.txt'].concat(sources).concat('src/outro.js.txt'),
	'mask.binding.embeded': ['src/plugin.intro.js.txt'].concat(sources).concat('src/plugin.outro.js.txt'),
};


var config = [{
	action: 'settings',
	io: {
		extensions: {
			js: ['condcomments:read']
		}
	}
}];

for(var build in builds){
	config.push({
		action: 'concat',
		files: builds[build],
		dist: 'lib/' + build + '.js'
	})
}




config.push({
	action: 'jshint',
	files: ['lib/mask.binding.js'],
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
				"mask": false,
				"$": false,
				"Mask": false
			}
		}
});


config.push({
	action: 'uglify',
	files: 'lib/mask.binding.js'
});

config.push({
	action: 'copy',
	files: {
		'lib/mask.binding.embeded.js': '../mask/src/handlers/mask.binding.js'
	}
})

global.config = config;
