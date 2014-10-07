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
		var mask = resp.Mask.mask;
		Object.extend(global.mask.getHandler(), mask.getHandler());
		Object.extend(global.mask, mask);
		
		include
			.instance()
			.js('/lib/binding.node.js::Binding')
			.done(function(){
				resume();
			});
	})