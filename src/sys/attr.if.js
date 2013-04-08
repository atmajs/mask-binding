var attr_if = (function() {

	var IfProto = {
		refresh: function(value) {

			if (this.elements == null && !value) {
				// was not render and still falsy
				return;
			}

			if (this.elements == null) {
				// was not render - do it

				mask //
				.render(this.template, this.model, this.cntx, null, this) //
				.insertBefore(this.placeholder);

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
			
		}
	};

	return function(self, model, cntx, container) {

		var expr = self.attr['if'];

		self.placeholder = document.createComment('');
		self.template = self.nodes;

		self.state = !! expression_bind(expr, model, cntx, self, IfProto.refresh.bind(self));

		if (!self.state) {
			self.nodes = null;
		}

		container.appendChild(self.placeholder);
	};

}());
