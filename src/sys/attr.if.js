var attr_if = (function() {

	var IfProto = {
		refresh: function(value) {

			if (this.elements == null && !value) {
				// was not render and still falsy
				return;
			}

			if (this.elements == null) {
				// was not render - do it

				dom_insertBefore( //
				compo_render(this, this.template, this.model, this.cntx), this.placeholder);

				this.$ = $(this.elements);
			} else {

				if (this.$ == null) {
					this.$ = $(this.elements);
				}
				this.$[value ? 'show' : 'hide']();
			}

			if (this.onchange) {
				this.onchange(value);
			}

		},
		dispose: function(){
			expression_unbind(this.expr, this.model, this.binder);
			this.onchange = null;
			this.elements = null;
		}
	};


	function bind(fn, compo) {
		return function(){
			return fn.apply(compo, arguments);
		}
	}

	return function(self, model, cntx, container) {

		var expr = self.attr['if'];


		obj_extend(self, {
			expr: expr,
			template: self.nodes,
			placeholder: document.createComment(''),
			binder: expression_createBinder(expr, model, cntx, self, bind(IfProto.refresh, self)),

			state: !! expression_eval(expr, model, cntx, self)
		});

		if (!self.state) {
			self.nodes = null;
		}

		expression_bind(expr, model, cntx, self, self.binder);

		container.appendChild(self.placeholder);
	};

}());
