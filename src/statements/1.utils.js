var _getNodes,
	_renderPlaceholder,
	_compo_initAndBind,
	els_toggleVisibility
	;

(function(){
	_getNodes = function(name, node, model, ctx, controller){
		return custom_Statements[name].getNodes(node, model, ctx, controller);
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