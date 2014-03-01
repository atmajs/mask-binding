(function(){
	
	var For = custom_Statements['for'],
	
		attr_PROP_1 = 'for-prop-1',
		attr_PROP_2 = 'for-prop-2',
		attr_TYPE = 'for-type',
		attr_EXPR = 'for-expr'
		;
		
	
	mask.registerHandler('+for', {
		
		render: function(model, ctx, container, controller, childs){
			
			var directive = For.parseFor(this.expression),
				attr = this.attr;
			
			attr[attr_PROP_1] = directive[0];
			attr[attr_PROP_2] = directive[1];
			attr[attr_TYPE] = directive[2];
			attr[attr_EXPR] = directive[3];
			
			
			var value = expression_eval(directive[3], model, ctx, controller);
			if (value == null) 
				return;
			
			if (arr_isArray(value)) 
				arr_createRefs(value);
			
			For.build(
				value,
				directive,
				this.nodes,
				model,
				ctx,
				container,
				this,
				childs
			);
		},
		
		renderEnd: function(els, model, ctx, container, controller){
			
			var compo = new ForStatement(this, this.attr);
			
			compo.placeholder = document.createComment('');
			container.appendChild(compo.placeholder);
			
			
			
			initialize(compo, this, els, model, ctx, container, controller);
			
			return compo;
		}
		
	});
	
	function initialize(compo, node, els, model, ctx, container, controller) {
		
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
		
	}
	
	function ForStatement(node, attr) {
		this.prop1 = attr[attr_PROP_1];
		this.prop2 = attr[attr_PROP_2];
		this.type = attr[attr_TYPE];
		this.expr = attr[attr_EXPR];
		
		if (node.components == null) 
			node.components = [];
		
		this.node = node;
		this.components = node.components;
	}
	
	ForStatement.prototype = {
		compoName: '+for',
		model: null,
		parent: null,
		refresh: function(value, method, args, result){
			var i = 0,
				x, imax;
				
			var node = this.node,
				prop1 = this.prop1,
				prop2 = this.prop2,
				type = this.type,
				
				model = this.model,
				ctx = this.ctx,
				ctr = this.node
				;

			if (method == null) {
				// this was new array/object setter and not an immutable function call
				
				var compos = node.components;
				if (compos != null) {
					var imax = compos.length,
						i = -1;
					while ( ++i < imax ){
						if (compo_dispose(compos[i])){
							i--;
							imax--;
						}
					}
					compos.length = 0;
				}
				
				var frag = builder_build(
					For.getNodes(node.nodes, value, prop1, prop2, type),
					model,
					ctx,
					null,
					ctr
				);
				
				dom_insertBefore(frag, this.placeholder);
				arr_each(node.components, compo_inserted);
				return;
			}

			var array = value;
			arr_createRefs(value);
			

			switch (method) {
			case 'push':
				list_update(this, null, null, array.length, array.slice(array.length - 1));
				break;
			case 'pop':
				list_update(this, array.length, 1);
				break;
			case 'unshift':
				list_update(this, null, null, 0, array.slice(0, 1));
				break;
			case 'shift':
				list_update(this, 0, 1);
				break;
			case 'splice':
				var sliceStart = args[0],
					sliceRemove = args.length === 1 ? this.components.length : args[1],
					sliceAdded = args.length > 2 ? array.slice(args[0], args.length - 2 + args[0]) : null;

				list_update(this, sliceStart, sliceRemove, sliceStart, sliceAdded);
				break;
			case 'sort':
			case 'reverse':
				list_sort(this, array);
				break;
			case 'remove':
				if (result != null && result.length) 
					list_remove(this, result);
				break;
			}
		},
		
		dispose: function(){
			
			expression_unbind(
				this.expr, this.model, this.parent, this.binder
			);
		}
	};
	
	
	// = List Utils
		
	
	function arr_createRefs(array){
		var imax = array.length,
			i = -1,
			x;
		while ( ++i < imax ){
			//create references from values to distinguish the models
			x = array[i];
			switch (typeof x) {
			case 'string':
			case 'number':
			case 'boolean':
				array[i] = Object(x);
				break;
			}
		}
	}
	
	function list_sort(self, array) {
	
		var compos = self.node.components,
			i = 0,
			imax = compos.length,
			j = 0,
			jmax = null,
			element = null,
			compo = null,
			fragment = document.createDocumentFragment(),
			sorted = [];
	
		for (; i < imax; i++) {
			compo = compos[i];
			if (compo.elements == null || compo.elements.length === 0) 
				continue;
			
			for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
				element = compo.elements[j];
				element.parentNode.removeChild(element);
			}
		}
	
		
		outer: for (j = 0, jmax = array.length; j < jmax; j++) {
	
			for (i = 0; i < imax; i++) {
				if (array[j] === compos[i].scope[self.prop1]) {
					sorted[j] = compos[i];
					continue outer;
				}
			}
	
			console.warn('No Model Found for', array[j]);
		}
	
	
	
		for (i = 0, imax = sorted.length; i < imax; i++) {
			compo = sorted[i];
	
			if (compo.elements == null || compo.elements.length === 0) {
				continue;
			}
	
	
			for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
				element = compo.elements[j];
	
				fragment.appendChild(element);
			}
		}
	
		self.components = self.node.components = sorted;
	
		dom_insertBefore(fragment, self.placeholder);
	
	}
	
	function list_update(self, deleteIndex, deleteCount, insertIndex, rangeModel) {
		
		var node = self.node,
			compos = node.components
			;
		if (compos == null) 
			compos = node.components = []
		
		var prop1 = self.prop1,
			prop2 = self.prop2,
			type = self.type,
			
			ctx = self.ctx,
			ctr = self.node;
			;
		
		if (deleteIndex != null && deleteCount != null) {
			var i = deleteIndex,
				length = deleteIndex + deleteCount;
	
			if (length > compos.length) 
				length = compos.length;
			
			for (; i < length; i++) {
				if (compo_dispose(compos[i], node)){
					i--;
					length--;
				}
			}
		}
	
		if (insertIndex != null && rangeModel && rangeModel.length) {
	
			var component = new mask.Dom.Component(),
				nodes = For.getNodes(node.nodes, rangeModel, prop1, prop2, type),
				fragment = builder_build(nodes, rangeModel, ctx, null, component);
				
			compo_fragmentInsert(node, insertIndex, fragment, self.placeholder);
			compo_inserted(component);
			
			compos.splice.apply(compos, [insertIndex, 0].concat(component.components));
		}
	}
	
	function list_remove(self, removed){
		var compos = self.components,
			i = compos.length,
			x;
		while(--i > -1){
			x = compos[i];
			
			if (removed.indexOf(x.model) === -1) 
				continue;
			
			compo_dispose(x, self);
		}
	}
	
}());