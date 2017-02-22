var expression_eval,
	expression_eval_strict,
	expression_evalStatements,
	expression_bind,
	expression_unbind,
	expression_createBinder,
	expression_createListener,
	expression_callFn,

	expression_parse,
	expression_varRefs
	;

(function(){
	var Expression = mask.Utils.Expression;

	expression_eval_strict = Expression.eval;
	expression_parse = Expression.parse;
	expression_varRefs = Expression.varRefs;
	expression_evalStatements = Expression.evalStatements;

	expression_eval = function(expr, model, ctx, ctr, node){
		var x = expression_eval_strict(expr, model, ctx, ctr, node);
		return x == null ? '' : x;
	};

	expression_bind = function(expr, model, ctx, ctr, callback) {
		if (expr === '.') {
			if (model != null) {
				obj_addMutatorObserver(model, callback);
			}
			return;
		}

		var ast = expression_parse(expr, false),
			vars = expression_varRefs(ast, model, ctx, ctr),
			obj, ref;

		if (vars == null)
			return;

		if (typeof vars === 'string') {
			_toggleObserver(obj_addObserver, model, ctr, vars, callback);
			return;
		}

		var isArray = vars.length != null && typeof vars.splice === 'function',
			imax = isArray === true ? vars.length : 1,
			i = 0,
			x, prop;

		for (; i < imax; i++) {
			x = isArray === true ? vars[i] : vars;
			_toggleObserver(obj_addObserver, model, ctr, x, callback);
		}
	};

	expression_unbind = function(expr, model, ctr, callback) {

		if (typeof ctr === 'function')
			log_warn('[mask.binding] - expression unbind(expr, model, controller, callback)');

		if (expr === '.') {
			if (model != null) {
				obj_removeMutatorObserver(model, callback);
			}
			return;
		}

		var vars = expression_varRefs(expr, model, null, ctr),
			x, ref;

		if (vars == null)
			return;

		if (typeof vars === 'string') {
			_toggleObserver(obj_removeObserver, model, ctr, vars, callback);
			return;
		}

		var isArray = vars.length != null && typeof vars.splice === 'function',
			imax = isArray === true ? vars.length : 1,
			i = 0,
			x;

		for (; i < imax; i++) {
			x = isArray === true ? vars[i] : vars;
			_toggleObserver(obj_removeObserver, model, ctr, x, callback);
		}

	}

	expression_callFn = function (accessor, model, ctx, ctr, args) {
		var dot = accessor.indexOf('.');
		if (dot === -1) {
			var ctx = model,
				fn = ctx[accessor];
			if (fn != null) {
				return fn_apply(fn, ctx, args);
			}
			ctx = ctr;
			fn = ctx[accessor];
			if (fn != null)
				return fn_apply(fn, ctx, args);

			throw Error(accessor + ' is not a function');
		}
		var path = accessor.substring(0, dot),
			key = accessor.substring(dot + 1);

		var ctx = expression_eval_strict(path, model, ctx, ctr);
		var fn = ctx && ctx[key];
		if (fn != null) {
			return fn_apply(fn, ctx, args);
		}		
		throw Error(accessor + ' is not a function');
	};
	/**
	 * expression_bind only fires callback, if some of refs were changed,
	 * but doesnt supply new expression value
	 **/
	expression_createBinder = function(expr, model, ctx, ctr, fn) {
		return expression_createListener(function(){
			var value = expression_eval(expr, model, ctx, ctr);
			var args =  _Array_slice.call(arguments);
			args[0] = value;

			fn.apply(this, args);
		});
	};

	expression_createListener = function(callback){
		var locks = 0;
		return function(){
			if (++locks > 1) {
				locks = 0;
				log_warn('<listener:expression> concurrent binder');
				return;
			}
			callback.apply(this, _Array_slice.call(arguments));
			locks--;
		}
	};

	function _toggleObserver(mutatorFn, model, ctr, accessor, callback) {
		if (accessor == null)
			return;

		if (typeof accessor === 'object') {
			var obj = expression_eval_strict(accessor.accessor, model, null, ctr);
			if (obj == null || typeof obj !== 'object') {
				console.error('Binding failed to an object over accessor', accessor.ref);
				return;
			}
			mutatorFn(obj, accessor.ref, callback);
			return;
		}

		// string;
		var property = accessor,
			parts = property.split('.'),
			imax = parts.length;

		if (imax > 1) {
			var first = parts[0];
			if (first === 'this' || first === '$c' || first === '$') {
				if (parts[1] === 'attr') {
					return;
				}
				// Controller Observer
				var owner  = _getObservable_Controller(ctr, parts[1]);
				var cutIdx = first.length + 1;
				mutatorFn(owner, property.substring(cutIdx), callback);
				return;
			}
			if (first === '$scope') {
				// Controller Observer
				var scope = _getObservable_Scope(ctr, parts[1]);
				var cutIdx = 6 + 1;
				mutatorFn(scope, property.substring(cutIdx), callback);
				return;
			}
			if ('$a' === first || '$ctx' === first || '_' === first || '$u' === first)
				return;
		}

		var obj = null;
		if (_isDefined(model, parts[0])) {
			obj = model;
		}
		if (obj == null) {
			obj = _getObservable_Scope(ctr, parts[0], imax);
		}
		if (obj == null) {
			obj = model;
		}

		mutatorFn(obj, property, callback);
	}

	function _getObservable_Scope_(ctr, parts, imax){
		var scope;
		while(ctr != null){
			scope = ctr.scope;
			if (scope != null && _isDefined(scope, parts[0]))
				return scope;

			ctr = ctr.parent;
		}
		return null;
	}
	function _getObservable_Controller(ctr_, key) {
		var ctr = ctr_;
		while(ctr != null){
			if (_isDefined(ctr, key))
				return ctr;
			ctr = ctr.parent;
		}
		return ctr;
	}
	function _getObservable_Scope(ctr_, property, imax) {
		var ctr = ctr_, scope;
		while(ctr != null){
			scope = ctr.scope;
			if (scope != null && scope[property] !== void 0) {
				return scope;
			}
			ctr = ctr.parent;
		}
		return null;
	}
	function _isDefined(obj_, key){
		return obj_ != null && obj_[key] !== void 0;
	}


}());
