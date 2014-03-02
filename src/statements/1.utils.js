var _getNodes,
	_renderElements,
	
	_compo_initAndBind,
	
	els_toggle
	
	;
	
(function(){
	
	_getNodes = function(name, node, model, ctx, controller){
		return custom_Statements[name].getNodes(node, model, ctx, controller);
	};
	
	_renderElements = function(nodes, model, ctx, container, controller, childs){
		
		var elements = [];
		builder_build(nodes, model, ctx, container, controller, elements);
		
		if (childs == null) 
			return elements;
		
		var il = childs.length,
			jl = elements.length;

		var i = -1;
		while (++i < jl) {
			childs[il + i] = elements[i];
		}
	
		return elements;
	};
	
	_compo_initAndBind = function(compo, node, model, ctx, container, controller) {
		
		compo.parent = controller;
		compo.model = model;
		
		compo.refresh = fn_proxy(compo.refresh, compo);
		compo.binder = expression_createBinder(
			compo.expr,
			model,
			ctx,
			controller,
			compo.refresh
		);
		
		
		expression_bind(compo.expr, model, ctx, controller, compo.binder);
	};
	
	
	els_toggle = function(els, state){
		if (els == null) 
			return;
		
		var isArray = typeof els.splice === 'function',
			imax = isArray ? els.length : 1,
			i = -1,
			x;
		while ( ++i < imax ){
			x = isArray ? els[i] : els;
			x.style.display = state ? '' : 'none';
		}
	}
	
}());