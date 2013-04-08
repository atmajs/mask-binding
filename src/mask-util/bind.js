
/**
 *	Mask Custom Utility - for use in textContent and attribute values
 */

(function(){

	function create_refresher(type, expr, element, currentValue, attrName) {

		return function(value){
			switch (type) {
				case 'node':
					element.textContent = value;
					console.log('Value', value);
					break;
				case 'attr':
					var currentAttr = element.getAttribute(attrName),
						attr = attrValue ? currentAttr.replace(currentValue, value) : value;
					element.setAttribute(attrName, attr);
					currentValue = value;
					break;
			}
		};

	}


	mask.registerUtility('bind', function(expr, model, cntx, element, controller, attrName, type){
		var refresher =  create_refresher(type, expr, element, current, attrName),
			binder = expression_createBinder(expr, model, cntx, controller, refresher),
			current = expression_bind(expr, model, cntx, controller, binder);




		if ('node' === type) {
			element = document.createTextNode(current);
		}

		compo_attachDisposer(controller, function(){
			expression_unbind(expr, model, binder);
		});

		if ('node' === type) {
			return element;
		}

		if ('attr' === type) {
			return current;
		}

		console.error('Unknown binding type', arguments);
		return 'Unknown';
	});


}());
