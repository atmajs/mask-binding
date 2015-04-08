var _getNodes,
	_renderElements,
	_renderPlaceholder,
	_compo_initAndBind,
	
	els_toggle
	
	;
	
(function(){
	
	_getNodes = function(name, node, model, ctx, controller){
		return custom_Statements[name].getNodes(node, model, ctx, controller);
	};
	
	_renderElements = function(nodes, model, ctx, container, ctr){
		if (nodes == null) 
			return null;
		
		var elements = [];
		builder_build(nodes, model, ctx, container, ctr, elements);
		return elements;
	};
	
	_renderPlaceholder = function(staticCompo, compo, container){
		var placeholder = staticCompo.placeholder;
		if (placeholder == null) {
			placeholder = document.createComment('');
			container.appendChild(placeholder);
		}
		compo.placeholder = placeholder;
	};
	
	_compo_initAndBind = function(compo, node, model, ctx, container, controller) {
		
		compo.parent = controller;
		compo.model = model;
		
		compo.refresh = fn_proxy(compo.refresh, compo);
		compo.binder = expression_createBinder(
			compo.expr || compo.expression,
			model,
			ctx,
			controller,
			compo.refresh
		);
		
		
		expression_bind(compo.expr || compo.expression, model, ctx, controller, compo.binder);
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