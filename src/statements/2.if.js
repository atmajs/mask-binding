(function(){

	__registerHandler('+if', {
		placeholder: null,
		meta: {
			serializeNodes: true
		},
		render: function(model, ctx, container, ctr, children){

			var node = this,
				nodes = _getNodes('if', node, model, ctx, ctr),
				index = 0;

			var next = node;
			while(true){

				if (next.nodes === nodes)
					break;

				index++;
				next = node.nextSibling;

				if (next == null || next.tagName !== 'else') {
					index = null;
					break;
				}
			}

			this.attr['switch-index'] = index;

			return _renderElements(nodes, model, ctx, container, ctr, children);
		},

		renderEnd: function(els, model, ctx, container, ctr){

			var compo = new IFStatement(),
				index = this.attr['switch-index'];

			_renderPlaceholder(this, compo, container);

			return initialize(
				compo
				, this
				, index
				, els
				, model
				, ctx
				, container
				, ctr
			);
		},

		serializeNodes: function(current){

			var nodes = [ current ];
			while (true) {
				current = current.nextSibling;
				if (current == null || current.tagName !== 'else')
					break;

				nodes.push(current);
			}

			return mask.stringify(nodes);
		}

	});


	function IFStatement() {}

	IFStatement.prototype = {
		compoName: '+if',
		ctx : null,
		model : null,
		controller : null,

		index : null,
		Switch : null,
		binder : null,

		refresh: function() {
			var compo = this,
				switch_ = compo.Switch,

				imax = switch_.length,
				i = -1,
				expr,
				item, index = 0;

			var currentIndex = compo.index,
				model = compo.model,
				ctx = compo.ctx,
				ctr = compo.controller
				;

			while ( ++i < imax ){
				expr = switch_[i].node.expression;
				if (expr == null)
					break;

				if (expression_eval(expr, model, ctx, ctr))
					break;
			}

			if (currentIndex === i)
				return;

			if (currentIndex != null)
				els_toggleVisibility(switch_[currentIndex].elements, false);

			if (i === imax) {
				compo.index = null;
				return;
			}

			this.index = i;

			var current = switch_[i];
			if (current.elements != null) {
				els_toggleVisibility(current.elements, true);
				return;
			}

			var frag = mask.render(current.node.nodes, model, ctx, null, ctr);
			var els = frag.nodeType === Node.DOCUMENT_FRAGMENT_NODE
				? _Array_slice.call(frag.childNodes)
				: frag
				;


			dom_insertBefore(frag, compo.placeholder);

			current.elements = els;

		},
		dispose: function(){
			var switch_ = this.Switch,
				imax = switch_.length,
				i = -1,

				x, expr;

			while( ++i < imax ){
				x = switch_[i];
				expr = x.node.expression;

				if (expr) {
					expression_unbind(
						expr,
						this.model,
						this.controller,
						this.binder
					);
				}

				x.node = null;
				x.elements = null;
			}

			this.controller = null;
			this.model = null;
			this.ctx = null;
		}
	};

	function initialize(compo, node, index, elements, model, ctx, container, ctr) {

		compo.model = model;
		compo.ctx = ctx;
		compo.controller = ctr;
		compo.refresh = fn_proxy(compo.refresh, compo);
		compo.binder = expression_createListener(compo.refresh);
		compo.index = index;
		compo.Switch = [{
			node: node,
			elements: null
		}];

		expression_bind(node.expression, model, ctx, ctr, compo.binder);

		while (true) {
			node = node.nextSibling;
			if (node == null || node.tagName !== 'else')
				break;

			compo.Switch.push({
				node: node,
				elements: null
			});

			if (node.expression)
				expression_bind(node.expression, model, ctx, ctr, compo.binder);
		}
		if (index != null) {
			compo.Switch[index].elements = elements;
		}
		return compo;
	}


}());