var resume = include.pause();
var cache = include.getResources();
cache.js = {};
cache.load = {};
include
	.instance()
	.js(
		'/.import/mask.node.js::Mask'
	)
	.done(function(resp){
		global.mask = resp.Mask;
		
		include
			.instance()
			.js('/lib/binding.node.js::Binding')
			.done(function(){
				resume();
			});
	})