/**
 *	Atma.Toolkit Configuration
 *
 *	``` $ atma ```
 **/


module.exports = {
	'settings': {
		io: {
			extensions: {
				js: ['condcomments:read', 'importer:read']
			}
		}
	},
	'import': {
		files: 'builds/**',
		output: 'lib/'
	},
	'jshint': {
		files: ['lib/binding.js'],
		jshint: JSHint()
	},
	'uglify': {
		files: 'lib/binding.js'
	},

	'import.libs': {
		action: 'copy',
		files: {
			'../mask/lib/mask.js': '.import/mask.js',
			'../mask-node/lib/mask.node.js': '.import/mask.node.js',
			'../mask-node/lib/mask.bootstrap.js': '.import/mask.bootstrap.js',
			'../utils/lib/utils.embed.js': '.import/utils.embed.js',
		}
	},

	'watch': {
		files: 'src/**',
		config: '#[import]'
	},

	'defaults': ['import', 'jshint', 'uglify', 'export.embed']
};



function JSHint() {
	
	var options = {
			"bitwise": false,
			"camelcase": false,
			"curly": false,
			"eqeqeq": true,
			"es3": false,
			"forin": false,
			"freeze": false,
			"immed": true,
			"indent": 2,
			"latedef": "nofunc",
			"newcap": false,
			"noarg": true,
			"noempty": true,
			"nonbsp": true,
			"nonew": false,
			"plusplus": false,
			"quotmark": false,
			"undef": true,
			"unused": false,
			"strict": false,
			"trailing": false,
			"maxparams": false,
			"maxdepth": false,
			"maxstatements": false,
			"maxcomplexity": false,
			"maxlen": false,
			"asi": true,
			"boss": true,
			"debug": true,
			"eqnull": true,
			"esnext": true,
			"evil": true,
			"expr": true,
			"funcscope": false,
			"gcl": false,
			"globalstrict": true,
			"iterator": false,
			"lastsemic": true,
			"laxbreak": true,
			"laxcomma": true,
			"loopfunc": false,
			"maxerr": false,
			"moz": false,
			"multistr": true,
			"notypeof": false,
			"proto": true,
			"scripturl": false,
			"smarttabs": true,
			"shadow": true,
			"sub": true,
			"supernew": true,
			"validthis": true,
			"noyield": false,
			"browser": true,
			"couch": false,
			"devel": false,
			"dojo": false,
			"jquery": true,
			"mootools": false,
			"node": true,
			"nonstandard": false,
			"phantom": false,
			"prototypejs": false,
			"rhino": false,
			"worker": false,
			"wsh": false,
			"yui": false,
			"nomen": false,
			"onevar": false,
			"passfail": false,
			"white": false,
			"predef":
			[
				/* utils */
				"is_Object",
				"is_rawObject",
				"is_String",
				"is_Function",
				"is_Array",
				"fn_doNothing",
				"fn_proxy",
				"fn_apply",
				"obj_create",
				"obj_extend",
				
				"_Array_slice",
				"_Array_splice",
				"_Array_indexOf",
				
				"arr_each",
				"arr_remove",
				"arr_indexOf",
				"arr_contains",
				"obj_setProperty",
				"obj_getProperty",
				
				
				"Compo",
				"log_error",
				"log_warn",
				"arr_pushMany",
				"global",
				"define",
				"atma",
				"io",
				"net",
				"mask",
				"include",
				"ruta",
				"ruqq",
				"Class",
				"logger",
				"app",
				"UTest",
				"assert",
				"eq_",
				"notEq_",
				"deepEq_",
				"notDeepEq_",
				"has_",
				"hasNot_"
			]
		}
	return {
		options: options,
		globals: options.predef
	};
}

