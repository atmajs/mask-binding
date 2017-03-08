var expression_eval,
	expression_eval_strict,
	expression_evalStatements,
	expression_bind,
	expression_unbind,
	expression_createBinder,
	expression_createListener,
	expression_callFn,

	expression_parse,
	expression_varRefs,
	expression_getObservable
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

	(function () {
		// [ObjectHost, Property]
		var tuple = [null, null];
		expression_getObservable = function (accessor, model, ctr) {
			var result = get(accessor, model, ctr);
			if (result == null) {
				error_withCompo('Observable host is undefined or is not allowed: ' + accessor.toString(), ctr);
			}
			return result;
		};
		function get(accessor, model, ctr) {
			if (accessor == null)
				return;

			if (typeof accessor === 'object') {
				var obj = expression_eval_strict(accessor.accessor, model, null, ctr);
				if (obj == null || typeof obj !== 'object') {
					return null;
				}
				tuple[0] = obj;
				tuple[1] = accessor.ref;
				return tuple;
			}
			var property = accessor,
				parts = property.split('.'),
				imax = parts.length;

			if (imax > 1) {
				var first = parts[0];
				if (first === 'this' || first === '$c' || first === '$') {
					if (parts[1] === 'attr') {
						return null;
					}
					// Controller Observer
					var owner  = _getObservable_Controller(ctr, parts[1]);
					var cutIdx = first.length + 1;
					tuple[0] = owner;
					tuple[1] = property.substring(cutIdx);
					return tuple;
				}
				if (first === '$scope') {
					// Controller Observer
					var scope = _getObservable_Scope(ctr, parts[1]);
					var cutIdx = 6 + 1;
					tuple[0] = scope;
					tuple[1] = property.substring(cutIdx);
					return tuple;
				}
				if ('$a' === first || '$ctx' === first || '_' === first || '$u' === first)
					return null;
			}

			var obj = null;
			if (_isDefined(model, parts[0])) {
				obj = model;
			}
			if (obj == null) {
				obj = _getObservable_Scope(ctr, parts[0]);
			}
			if (obj == null) {
				obj = model;
			}
			tuple[0] = obj;
			tuple[1] = property;
			return tuple;
		}
	}());
	
	function _toggleObserver(mutatorFn, model, ctr, accessor, callback) {
		
		/*
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
			obj = _getObservable_Scope(ctr, parts[0]);
		}
		if (obj == null) {
			obj = model;
		} 
		*/
		var tuple = expression_getObservable(accessor, model, ctr);
		if (tuple == null) return;
		var obj = tuple[0],
			property = tuple[1];

		mutatorFn(obj, property, callback);
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
			if (_isDefined(scope, property)) {
				return scope;
			}
			ctr = ctr.parent;
		}
		return null;
	}
	function _isDefined(obj_, key){
		return obj_ != null && key in obj_;
	}


}());
