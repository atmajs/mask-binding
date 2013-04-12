
/**
 *	Mask Custom Utility - for use in textContent and attribute values
 */

(function(){

	function create_refresher(type, expr, element, currentValue, attrName) {

		return function(value){
			switch (type) {
				case 'node':
					element.textContent = value;
					break;
				case 'attr':
					var currentAttr = element.getAttribute(attrName),
						attr = currentAttr ? currentAttr.replace(currentValue, value) : value;
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
