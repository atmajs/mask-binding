var attr_log = (function() {

	return function attr_log(self, model, cntx) {

		function log(value) {
			console.log('Logger > Key: %s, Value: %s', expr, value);
		}

		var expr = self.attr['log'],
			binder = expression_createBinder(expr, model, cntx, self, log),
			value = expression_eval(expr, model, cntx, self);

		expression_bind(expr, model, cntx, self, binder);


		compo_attachDisposer(self, function(){
			expression_unbind(expr, model, self, binder);
		});

		log(value);
	};

}());
