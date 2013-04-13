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
		vars = expression_varRefs(ast);

	if (vars == null) {
		return;
	}


	if (typeof vars === 'string') {
		obj_addObserver(model, vars, callback);
		return;
	}


	for (var i = 0, x, length = vars.length; i < length; i++) {
		x = vars[i];
		obj_addObserver(model, x, callback);
	}

	return;
}

function expression_unbind(expr, model, callback) {
	var ast = expression_parse(expr),
		vars = expression_varRefs(ast);

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
