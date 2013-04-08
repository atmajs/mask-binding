var attr_log = (function() {

	return function attr_log(self, model, cntx) {

		function log(value) {
			console.log('Logger > Key: %s, Value: %s', expr, value);
		}

		var expr = self.attr['log'],
			value = expression_bind(expr, model, cntx, self, log);



		log(value);

		self = null;
		model = null;
		cntx = null;
	};

}());
