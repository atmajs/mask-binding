(function(){
	
	var $With = custom_Statements['with'];
		
	mask.registerHandler('+with', {
		$meta: {
			serializeNodes: true
		},
		
		render: function(model, ctx, container, ctr, childs){
			
			var val = expression_eval(this.expression, model, ctx, ctr);
			
			return build(this.nodes, val, ctx, container, ctr);
		},
		
		renderEnd: function(els, model, ctx, container, ctr){
			
			var compo = new WithStatement(this);
		
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
			
			expression_bind(compo.expr, model, ctx, ctr, compo.binder);
			
			_renderPlaceholder(compo, container);
			
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
		refresh: function(val){
			dom_removeAll(this.elements);
			
			if (this.components) {
				var imax = this.components.length,
					i = -1;
				while ( ++i < imax ){
					Compo.dispose(this.components[i]);
				}
				this.components.length = 0;
			}
			
			
			var fragment = document.createDocumentFragment();
			this.elements = build(this.nodes, val, null, fragment, this);
			
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
	
	
	function build(nodes, model, ctx, container, controller){
		
		var els = [];
		builder_build(nodes, model, ctx, container, controller, els);
		
		return els;
	}

}());