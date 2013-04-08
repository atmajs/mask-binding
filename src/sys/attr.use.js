var attr_use = (function() {

	var UseProto = {
		refresh: function(value) {

			this.model = value;

			if (this.elements) {
				for (var i = 0, x, length = this.elements.length; i < length; i++) {
					x = this.elements[i];
					x.parentNode.removeChild(x);
				}
			}

			if (typeof Compo !== 'undefined') {
				Compo.dispose(this);
			}

			mask //
			.render(this.nodes, this.model, this.cntx) //
			.insertBefore(this.placeholder);

		}
	};

	return function attr_use(self, model, cntx, container) {

		var expr = self.attr['use'];

		self.placeholder = document.createComment('');
		self.model = expression_bind(expr, model, cntx, self, UseProto.refresh.bind(self));

		container.appendChild(self.placeholder);
	};

}());
