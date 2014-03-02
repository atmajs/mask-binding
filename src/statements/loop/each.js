(function(){
	
	var Each = custom_Statements['each'];
		
	
	mask.registerHandler('+each', {
		
		render: function(model, ctx, container, controller, childs){
			
			var node = this;
			
			var array = expression_eval(node.expression, model, ctx, controller);
			if (array == null) 
				return;
			
			arr_createRefs(array);
			
			Each.build(
				node.nodes,
				array,
				ctx,
				container,
				node,
				childs
			);
		},
		
		renderEnd: function(els, model, ctx, container, controller){
			
			var compo = new EachStatement(this, this.attr);
			
			compo.placeholder = document.createComment('');
			container.appendChild(compo.placeholder);
			
			
			
			_compo_initAndBind(compo, this, model, ctx, container, controller);
			
			return compo;
		}
		
	});
	
	
	function EachStatement(node, attr) {
		this.expr = node.expression;
		this.nodes = node.nodes;
		
		if (node.components == null) 
			node.components = [];
		
		this.node = node;
		this.components = node.components;
	}
	
	EachStatement.prototype = {
		compoName: '+each',
		refresh: LoopStatementProto.refresh,
		dispose: LoopStatementProto.dispose,
		
		_getModel: function(compo) {
			return compo.model;
		},
		
		_build: function(node, model, ctx, component) {
			var fragment = document.createDocumentFragment();
			
			Each.build(node.nodes, model, ctx, fragment, component);
			
			return fragment;
		}
	};
	
}());