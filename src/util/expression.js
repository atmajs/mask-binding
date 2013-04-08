var Expression = mask.Utils.Expression;

function expression_bind(expr, model, cntx, controller, callback) {
	var ast = Expression.parse(expr),
		vars = Expression.varRefs(ast),
		current = Expression.eval(ast, model);

	if (vars == null) {
		return current;
	}


	if (typeof vars === 'string') {
		obj_addObserver(model, vars, callback);
		return current;
	}


	for (var i = 0, x, length = vars.length; i < length; i++) {
		x = vars[i];
		obj_addObserver(model, x, callback);
	}

	return current;
}

function expression_unbind(expr, model, callback) {
	var ast = Expression.parse(expr),
		vars = Expression.varRefs(ast);

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
	return function binder() {
		callback(Expression.eval(expr, model, cntx, controller));
	};
}
