var attr_use = (function() {

	var UseProto = {
		refresh: function(value) {

			this.model = value;

			if (this.elements) {
				dom_removeAll(this.elements);

				this.elements = [];
			}

			if (__Compo != null) {
				__Compo.dispose(this);
			}

			dom_insertBefore( //
			compo_render(this, this.nodes, this.model, this.cntx), this.placeholder);

		},
		dispose: function(){
			expression_unbind(this.expr, this.originalModel, this.binder);
		}
	};

	return function attr_use(self, model, cntx, container) {

		var expr = self.attr['use'];

		obj_extend(self, {
			expr: expr,
			placeholder: document.createComment(''),
			binder: expression_createBinder(expr, model, cntx, self, UseProto.refresh.bind(self)),
			
			originalModel: model,
			model: expression_eval(expr, model, cntx, self),

			dispose: UseProto.dispose
		});


		expression_bind(expr, model, cntx, self, self.binder);

		container.appendChild(self.placeholder);
	};

}());
