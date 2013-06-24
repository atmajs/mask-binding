
/**
 *	Mask Custom Utility - for use in textContent and attribute values
 */

(function(){
	
	function attr_strReplace(attrValue, currentValue, newValue) {
		if (!attrValue) {
			return newValue;
		}
		
		if (!currentValue) {
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


	mask.registerUtility('bind', function(expr, model, cntx, element, controller, attrName, type){

		var current = expression_eval(expr, model, cntx, controller);

		if ('node' === type) {
			element = document.createTextNode(current);
		}

		var refresher =  create_refresher(type, expr, element, current, attrName),
			binder = expression_createBinder(expr, model, cntx, controller, refresher);

		expression_bind(expr, model, cntx, controller, binder);


		compo_attachDisposer(controller, function(){
			expression_unbind(expr, model, binder);
		});

		return type === 'node' ? element : current;
	});


}());
