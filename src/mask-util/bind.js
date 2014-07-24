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

	function refresherDelegate_NODE(element){
		return function(value) {
			element.textContent = value;
		};
	}
	function refresherDelegate_ATTR(element, attrName, currentValue) {
		return function(value){
			var currentAttr = element.getAttribute(attrName),
				attr = attr_strReplace(currentAttr, currentValue, value);

			element.setAttribute(attrName, attr);
			currentValue = value;
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
					console.warn('Unsupported elements property type', attrName);
					return;
			}
		};
	}
	
	function create_refresher(type, expr, element, currentValue, attrName) {
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
					return refresherDelegate_PROP(element, attrName, currentValue);
			}
			return refresherDelegate_ATTR(element, attrName, currentValue);
		}
		throw Error('Unexpected binder type: ' + type);
	}


	function bind (current, expr, model, ctx, element, controller, attrName, type){
		var	refresher =  create_refresher(type, expr, element, current, attrName),
			binder = expression_createBinder(expr, model, ctx, controller, refresher);
	
		expression_bind(expr, model, ctx, controller, binder);
	
	
		compo_attachDisposer(controller, function(){
			expression_unbind(expr, model, controller, binder);
		});
	}

	__mask_registerUtil('bind', {
		mode: 'partial',
		current: null,
		element: null,
		nodeRenderStart: function(expr, model, ctx, element, controller){
			
			var current = expression_eval(expr, model, ctx, controller);
			
			// though we apply value's to `this` context, but it is only for immediat use
			// in .node() function, as `this` context is a static object that share all bind
			// utils
			this.element = document.createTextNode(current);
			
			return (this.current = current);
		},
		node: function(expr, model, ctx, element, controller){
			bind(
				this.current,
				expr,
				model,
				ctx,
				this.element,
				controller,
				null,
				'node');
			
			return this.element;
		},
		
		attrRenderStart: function(expr, model, ctx, element, controller){
			return (this.current = expression_eval(expr, model, ctx, controller));
		},
		attr: function(expr, model, ctx, element, controller, attrName){
			bind(
				this.current,
				expr,
				model,
				ctx,
				element,
				controller,
				attrName,
				'attr');
			
			return this.current;
		}
	});

}());
