(function(){
	
	var $Switch = custom_Statements['switch'],
		attr_SWITCH = 'switch-index'
		;
	
	var _nodes,
		_index;
	
	mask.registerHandler('+switch', {
		
		$meta: {
			serializeNodes: true
		},

		serializeNodes: function(current){
			return mask.stringify(current);
		},
		
		render: function(model, ctx, container, ctr, children){
			
			var value = expression_eval(this.expression, model, ctx, ctr);
			
			
			resolveNodes(value, this.nodes, model, ctx, ctr);
			
			if (_nodes == null) 
				return null;
			
			this.attr[attr_SWITCH] = _index;
			
			return _renderElements(_nodes, model, ctx, container, ctr, children);
		},
		
		renderEnd: function(els, model, ctx, container, ctr){
			
			var compo = new SwitchStatement(),
				index = this.attr[attr_SWITCH];
			
			_renderPlaceholder(compo, container);
			
			initialize(compo, this, index, els, model, ctx, container, ctr);
			
			return compo;
		}
		
	});
	
	
	function SwitchStatement() {}
	
	SwitchStatement.prototype = {
		compoName: '+switch',
		ctx: null,
		model: null,
		controller: null,
		
		index: null,
		nodes: null,
		Switch: null,
		binder: null,
		
		
		refresh: function(value) {
			
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
			
			resolveNodes(value, compo.nodes, model, ctx, ctr);
			
			if (_index === currentIndex) 
				return;
			
			if (currentIndex != null) 
				els_toggle(switch_[currentIndex], false);
			
			if (_index == null) {
				compo.index = null;
				return;
			}
			
			this.index = _index;
			
			var elements = switch_[_index];
			if (elements != null) {
				els_toggle(elements, true);
				return;
			}
			
			var frag = mask.render(_nodes, model, ctx, null, ctr);
			var els = frag.nodeType === Node.DOCUMENT_FRAGMENT_NODE
				? _Array_slice.call(frag.childNodes)
				: frag
				;
			
			
			dom_insertBefore(frag, compo.placeholder);
			
			switch_[_index] = els;
			
		},
		dispose: function(){
			expression_unbind(
				this.expr,
				this.model,
				this.controller,
				this.binder
			);
		
			this.controller = null;
			this.model = null;
			this.ctx = null;
			
			var switch_ = this.Switch,
				key,
				els, i, imax
				;
			
			for(key in switch_) {
				els = switch_[key];
				
				if (els == null)
					continue;
				
				imax = els.length;
				i = -1;
				while ( ++i < imax ){
					if (els[i].parentNode != null) 
						els[i].parentNode.removeChild(els[i]);
				}
			}
		}
	};
	
	function resolveNodes(val, nodes, model, ctx, ctr) {
		
		_nodes = $Switch.getNodes(val, nodes, model, ctx, ctr);
		_index = null;
		
		if (_nodes == null) 
			debugger;
		
		if (_nodes == null) 
			return;
		
		var imax = nodes.length,
			i = -1;
		while( ++i < imax ){
			if (nodes[i].nodes === _nodes) 
				break;
		}
			
		_index = i === imax ? null : i;
	}
	
	function initialize(compo, node, index, elements, model, ctx, container, ctr) {
		
		compo.ctx = ctx;
		compo.expr = node.expression;
		compo.model = model;
		compo.controller = ctr;
		compo.index = index;
		compo.nodes = node.nodes;
		
		compo.refresh = fn_proxy(compo.refresh, compo);
		compo.binder = expression_createBinder(
			compo.expr,
			model,
			ctx,
			ctr,
			compo.refresh
		);
		
		
		compo.Switch = new Array(node.nodes.length);
		
		if (index != null) 
			compo.Switch[index] = elements;
		
		expression_bind(node.expression, model, ctx, ctr, compo.binder);
	}

	
}());