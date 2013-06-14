var Expression = mask.Utils.Expression,
	expression_eval_origin = Expression.eval,
	expression_eval = function(expr, model, cntx, controller){
		var value = expression_eval_origin(expr, model, cntx, controller);

		return value == null ? '' : value;
	},
	expression_parse = Expression.parse,
	expression_varRefs = Expression.varRefs;


function expression_bind(expr, model, cntx, controller, callback) {
	var ast = expression_parse(expr),
		vars = expression_varRefs(ast),
		obj, ref;

	if (vars == null) {
		return;
	}

	if (typeof vars === 'string') {
		
		if (obj_isDefined(model, vars)) {
			obj = model;
		}
		
		if (obj == null && obj_isDefined(controller, vars)) {
			obj = controller;
		}
		
		if (obj == null) {
			obj = model;
		}
		
		obj_addObserver(obj, vars, callback);
		return;
	}

	var isArray = vars.length != null && typeof vars.splice === 'function',
		imax = isArray === true ? vars.length : 1,
		i = 0,
		x;
	
	for (; i < imax; i++) {
		x = isArray ? vars[i] : vars;
		if (x == null) {
			continue;
		}
		
		
		if (typeof x === 'object') {
			
			obj = expression_eval_origin(x.accessor, model, cntx, controller);
			
			if (obj == null || typeof obj !== 'object') {
				console.error('Binding failed to an object over accessor', x);
				continue;
			}
			
			x = x.ref;
		} else if (obj_isDefined(model, x)) {
			
			obj = model;
		} else if (obj_isDefined(controller, x)) {
			
			obj = controller;
		} else {
			
			obj = model;
		}
		
		obj_addObserver(obj, x, callback);
	}

	return;
}

function expression_unbind(expr, model, callback) {
	var ast = expression_parse(expr),
		vars = expression_varRefs(ast),
		x, ref;

	if (vars == null) {
		return;
	}


	if (typeof vars === 'string') {
		obj_removeObserver(model, vars, callback);
		return;
	}

	for (var i = 0, length = vars.length; i < length; i++) {
		obj_removeObserver(model, vars[i], callback);
	}
}

/**
 * expression_bind only fires callback, if some of refs were changed,
 * but doesnt supply new expression value
 **/
function expression_createBinder(expr, model, cntx, controller, callback) {
	var lockes = 0;
	return function binder() {
		if (lockes++ > 10) {
			console.warn('Concurent binder detected', expr);
			return;
		}
		callback(expression_eval(expr, model, cntx, controller));
		lockes--;
	};
}
