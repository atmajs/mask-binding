	
module.exports = {
	suites: {
		
		dom: {
			exec: 'dom',
			env: [
				".import/mask.js",
				".import/mask.bootstrap.js",
				"lib/binding.js",
				"test/dom/utils.js"
			],
			tests: [
				"test/dom/**.test"
			]
		},
		node: {
			exec: 'node',
			env: [
				"lib/binding.node.js",
			],
			tests: [
				"test/**node.test"
			]
		}
	}
};
