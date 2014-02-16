(function(mask) {

	function Sys() {
		this.attr = {
			'debugger': null,
			'use': null,
			'log': null,
			'if': null,
			'each': null,
			'visible': null
		};
	}


	mask.registerHandler('%%', Sys);

	// import sys.plus.js
	
	// import attr.use.js
	// import attr.log.js
	// import attr.if.js
	// import attr.if.else.js
	// import attr.each.js
	// import attr.visible.js




	Sys.prototype = {
		constructor: Sys,
		elements: null,
		renderStart: function(model, cntx, container) {
			var attr = this.attr;

			if (attr['debugger'] != null) {
				debugger;
				return;
			}

			if (attr['use'] != null) {
				attr_use(this, model, cntx, container);
				return;
			}

			if (attr['log'] != null) {
				attr_log(this, model, cntx, container);
				return;
			}

			this.model = model;

			if (attr['if'] != null) {
				attr_if(this, model, cntx, container);
				return;
			}

			if (attr['else'] != null) {
				attr_else(this, model, cntx, container);
				return;
			}

			// foreach is deprecated
			if (attr['each'] != null || attr['foreach'] != null) {
				attr_each(this, model, cntx, container);
			}
		},
		render: null,
		renderEnd: function(elements) {
			this.elements = elements;


			if (this.attr['visible'] != null) {
				attr_visible(this, this.model, this.cntx);
			}
		}
	};

}(mask));
