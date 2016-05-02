(function(){
	__registerHandler('+with', {
		meta: {
			serializeNodes: true
		},
		rootModel: null,
		render: function(model, ctx, container, ctr){
			var expr = this.expression,
				nodes = this.nodes,
				val = expression_eval_strict(
					expr, model, ctx, ctr
				)
				;
			this.rootModel = model;
			return _renderElements(nodes, val, ctx, container, ctr);
		},
		onRenderStartClient: function(model, ctx){
			this.rootModel = model;
			this.model = expression_eval_strict(
				this.expression, model, ctx, this
			);
		},
		renderEnd: function(els, model_, ctx, container, ctr){
			var model = this.rootModel || model_,
				compo = new WithStatement(this);

			compo.elements = els;
			compo.model = model;
			compo.parent = ctr;
			compo.refresh = fn_proxy(compo.refresh, compo);
			compo.binder = expression_createBinder(
				compo.expr,
				model,
				ctx,
				ctr,
				compo.refresh
			);
			expression_bind(
				compo.expr,
				model,
				ctx,
				ctr,
				compo.binder
			);
			_renderPlaceholder(this, compo, container);
			return compo;
		}
	});

	function WithStatement(node){
		this.expr = node.expression;
		this.nodes = node.nodes;
	}
	WithStatement.prototype = {
		compoName: '+with',
		elements: null,
		binder: null,
		model: null,
		parent: null,
		refresh: function(model){
			_compo_disposeChildren(this);

			var fragment = document.createDocumentFragment();
			this.elements = _renderElements(this.nodes, model, null, fragment, this);

			dom_insertBefore(fragment, this.placeholder);
			compo_inserted(this);
		},
		dispose: function(){
			expression_unbind(
				this.expr,
				this.model,
				this.parent,
				this.binder
			);
			this.parent = null;
			this.model = null;
			this.ctx = null;
		}
	};
}());