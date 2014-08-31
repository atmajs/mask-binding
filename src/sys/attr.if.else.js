var attr_else = (function() {

	var ElseProto = {
		refresh: function(value) {
			if (this.elements == null && value) {
				// was not render and still truthy
				return;
			}

			if (this.elements == null) {
				// was not render - do it

				dom_insertBefore(compo_render(this, this.template, this.model, this.cntx));
				this.$ = domLib(this.elements);

				return;
			}

			if (this.$ == null) {
				this.$ = domLib(this.elements);
			}

			this.$[value ? 'hide' : 'show']();
		}
	};

	return function(self, model, cntx, container) {


		var compos = self.parent.components,
			prev = compos && compos[compos.length - 1];

		self.template = self.nodes;
		self.placeholder = document.createComment('');

		// if DEBUG
		if (prev == null || prev.compoName !== '%%' || prev.attr['if'] == null) {
			log_error('Mask.Binding: Binded ELSE should be after binded IF - %% if="expression" { ...');
			return;
		}
		// endif


		// stick to previous IF controller
		prev.onchange = ElseProto.refresh.bind(self);

		if (prev.state) {
			self.nodes = null;
		}



		container.appendChild(self.placeholder);
	};

}());
