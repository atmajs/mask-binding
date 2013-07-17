	
module.exports = {
	suites: {
		
		dom: {
			exec: 'dom',
			env: [
				".import/mask.js",
				"lib/binding.js"
			],
			tests: [
				"test/**.dom.test"
			]
		},
		node: {
			exec: 'node',
			env: [
				".import/mask.node.js::mask"
			],
			tests: [
				"test/**.node.test"
			]
		}
	}
};
