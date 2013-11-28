
/**
 *	Mask Custom Utility - for use in textContent and attribute values
 */

(function(){
	
	function attr_strReplace(attrValue, currentValue, newValue) {
		if (!attrValue) {
			return newValue;
		}
		
		if (currentValue == null || currentValue === '') {
			return attrValue + ' ' + newValue;
		}
		
		return attrValue.replace(currentValue, newValue);
	}

	function create_refresher(type, expr, element, currentValue, attrName) {

		return function(value){
			switch (type) {
				case 'node':
					element.textContent = value;
					break;
				case 'attr':
					var _typeof = typeof element[attrName],
						currentAttr, attr;


					// handle properties first
					if ('boolean' === _typeof) {
						currentValue = element[attrName] = !!value;
						return;
					}

					if ('string' === _typeof) {
						currentValue = element[attrName] = attr_strReplace(element[attrName], currentValue, value);
						return;
					}

					currentAttr = element.getAttribute(attrName);
					attr = attr_strReplace(currentAttr, currentValue, value);


					element.setAttribute(attrName, attr);
					currentValue = value;
					break;
			}
		};

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
