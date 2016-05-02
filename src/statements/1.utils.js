var _getNodes,
	_renderElements,
	_renderPlaceholder,
	_compo_initAndBind,
	_compo_disposeChildren,

	els_toggleVisibility

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

	_compo_disposeChildren = function(compo) {
		var els = compo.elements;
		if (els != null) {
			dom_removeAll(els);
			compo.elements = null;
		}

		var compos = compo.components;
		if (compos != null) {
			var imax = compos.length, i = -1;
			while (++i < imax){
				Compo.dispose(compos[i]);
			}
			compos.length = 0;
		}
	};

	(function(){
		els_toggleVisibility = function(mix, state){
			if (mix == null)
				return;
			if (is_Array(mix)) {
				_arr(mix, state);
				return;
			}
			_single(mix, state);
		};
		function _single(el, state) {
			el.style.display = state ? '' : 'none';
		}
		function _arr(els, state) {
			var imax = els.length, i = -1;
			while (++i < imax) _single(els[i], state);
		}
	}());
}());