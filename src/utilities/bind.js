/**
 *	Mask Custom Utility - for use in textContent and attribute values
 */
(function(){

	function attr_strReplace(attrValue, currentValue, newValue) {
		if (!attrValue)
			return newValue;

		if (currentValue == null || currentValue === '')
			return attrValue + ' ' + newValue;

		return attrValue.replace(currentValue, newValue);
	}

	function refresherDelegate_NODE(el){
		return function(value) {
			el.textContent = value;
		};
	}
	function refresherDelegate_ATTR(el, attrName, currentValue) {
		var current_ = currentValue;
		return function(value){
			var currentAttr = el.getAttribute(attrName),
				attr = attr_strReplace(currentAttr, current_, value);

			if (attr == null || attr === '') {
				el.removeAttribute(attrName);
			} else {
				el.setAttribute(attrName, attr);
			}
			current_ = value;
		};
	}
	function refresherDelegate_ATTR_COMPO(ctr, attrName, currentValue) {
		var current_ = currentValue;
		return function(val){
			if (current_ === val) {
				return;
			}
			current_ = val;
			var fn = ctr.setAttribute;
			if (is_Function(fn)) {
				fn.call(ctr, attrName, val);
				return;
			}
			ctr.attr[attrName] = val;
		};
	}
	function refresherDelegate_PROP(element, attrName, currentValue) {
		return function(value){
			switch(typeof element[attrName]) {
				case 'boolean':
					currentValue = element[attrName] = !!value;
					return;
				case 'number':
					currentValue = element[attrName] = Number(value);
					return;
				case 'string':
					currentValue = element[attrName] = attr_strReplace(element[attrName], currentValue, value);
					return;
				default:
					log_warn('Unsupported elements property type', attrName);
					return;
			}
		};
	}

	function create_refresher(type, expr, element, currentValue, attrName, ctr) {
		if ('node' === type) {
			return refresherDelegate_NODE(element);
		}
		if ('attr' === type) {
			switch(attrName) {
				case 'value':
				case 'disabled':
				case 'checked':
				case 'selected':
				case 'selectedIndex':
					if (attrName in element) {
						return refresherDelegate_PROP(element, attrName, currentValue);
					}
			}
			return refresherDelegate_ATTR(element, attrName, currentValue);
		}
		if ('compo-attr' === type) {
			return refresherDelegate_ATTR_COMPO(ctr, attrName, currentValue)
		}
		throw Error('Unexpected binder type: ' + type);
	}


	function bind (current, expr, model, ctx, element, ctr, attrName, type){
		var	refresher =  create_refresher(type, expr, element, current, attrName, ctr),
			binder = expression_createBinder(expr, model, ctx, ctr, refresher);

		expression_bind(expr, model, ctx, ctr, binder);

		compo_attachDisposer(ctr, function(){
			expression_unbind(expr, model, ctr, binder);
		});
	}

	__registerUtil('bind', {
		mode: 'partial',
		current: null,
		element: null,
		nodeRenderStart: function(expr, model, ctx, el, ctr, type, node){

			var current = expression_eval(expr, model, ctx, ctr, node);

			// though we apply value's to `this` context, but it is only for immediat use
			// in .node() function, as `this` context is a static object that share all bind
			// utils
			this.element = document.createTextNode(current);

			return (this.current = current);
		},
		node: function(expr, model, ctx, container, ctr){
			var el = this.element,
				val = this.current;
			bind(
				val
				, expr
				, model
				, ctx
				, el
				, ctr
				, null
				, 'node'
			);
			this.element = null;
			this.current = null;
			return el;
		},

		attrRenderStart: function(expr, model, ctx, el, ctr, type, node){
			return (this.current = expression_eval(expr, model, ctx, ctr, node));
		},
		attr: function(expr, model, ctx, element, controller, attrName, type){
			bind(
				this.current,
				expr,
				model,
				ctx,
				element,
				controller,
				attrName,
				type);

			return this.current;
		}
	});

}());
