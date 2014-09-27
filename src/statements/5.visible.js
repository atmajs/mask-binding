(function(){
	var $Visible = custom_Statements['visible'];
		
	mask.registerHandler('+visible', {
		meta: {
			serializeNodes: true
		},
		render: function(model, ctx, container, ctr, childs){
			return build(this.nodes, this.model, ctx, container, ctr);
		},
		renderEnd: function(els, model, ctx, container, ctr){
			
			var compo = new VisibleStatement(this);
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
			compo.refresh();
			return compo;
		}
	});
	
	
	function VisibleStatement(node){
		this.expr = node.expression;
		this.nodes = node.nodes;
	}
	
	VisibleStatement.prototype = {
		compoName: '+visible',
		elements: null,
		binder: null,
		model: null,
		parent: null,
		refresh: function(){
			var isVisible = expression_eval(
				this.expr, this.model, this.ctx, this
			);
			$Visible.toggle(this.elements, isVisible);
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
	
	function build(nodes, model, ctx, container, ctr){
		var els = [];
		builder_build(nodes, model, ctx, container, ctr, els);
		return els;
	}
}());