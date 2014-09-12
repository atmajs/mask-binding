var expression_eval,
	expression_bind,
	expression_unbind,
	expression_createBinder,
	expression_createListener,
	
	expression_parse,
	expression_varRefs
	;
	
(function(){
	
	var Expression = mask.Utils.Expression,
		expression_eval_origin = Expression.eval
		;

	expression_parse = Expression.parse;
	
	expression_varRefs = Expression.varRefs;
	
	expression_eval = function(expr, model, cntx, controller){
			
		if (expr === '.') 
			return model;
		
		var value = expression_eval_origin(expr, model, cntx, controller);
		return value == null
			? ''
			: value
			;
	};
		
	expression_bind = function(expr, model, ctx, ctr, callback) {
		
		if (expr === '.') {
			obj_addMutatorObserver(model, callback);
			return;
		}
		
		var ast = expression_parse(expr),
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
			obj_removeMutatorObserver(model, callback);
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
	
	/**
	 * expression_bind only fires callback, if some of refs were changed,
	 * but doesnt supply new expression value
	 **/
	expression_createBinder = function(expr, model, cntx, controller, callback) {
		var locks = 0;
		return function binder() {
			if (++locks > 1) {
				locks = 0;
				log_warn('<mask:bind:expression> Concurent binder detected', expr);
				return;
			}
			
			var value = expression_eval(expr, model, cntx, controller);
			if (arguments.length > 1) {
				var args = _Array_slice.call(arguments);
				
				args[0] = value;
				callback.apply(this, args);
				
			} else {
				
				callback(value);
			}
			
			locks--;
		};
	};
	
	expression_createListener = function(callback){
		var locks = 0;
		return function(){
			if (++locks > 1) {
				locks = 0;
				log_warn('<mask:listener:expression> concurent binder');
				return;
			}
			
			callback();
			locks--;
		}
	};
	
	function _toggleObserver(mutatorFn, model, ctr, accessor, callback) {
		if (accessor == null) 
			return;
		
		var accessorType = typeof accessor,
			obj = _getObservableObject(model, ctr, accessor, accessorType);
		if (obj == null) 
			return;
		
		var property = accessorType === 'object'
			? accessor.ref
			: accessor;
		mutatorFn(obj, property, callback);
	}
	function _getObservableObject(model, ctr, property, type){
		if (type === 'object') {
			var obj = expression_eval_origin(property.accessor, model, null, ctr);
			if (obj == null || typeof obj !== 'object') {
				log_error('Binding failed to an object over accessor', property);
				return null;
			}
			return obj;
		}
		if (property == null || property === '$c') 
			return null;
		
		if (obj_isDefined(model, property)) 
			return model;
		
		if (obj_isDefined(ctr, property)) 
			return ctr;
		
		var x = ctr,
			scope;
		while(x != null){
			scope = x.scope;
			if (scope != null && obj_isDefined(scope, property)) 
				return scope;
			
			x = x.parent;
		}
		return model;
	}
}());


