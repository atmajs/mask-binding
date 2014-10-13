(function(mask, Compo){
	var IS_BROWSER = true,
		IS_NODE = false;
		
	// source ../src/vars.js
	var __Compo = typeof Compo !== 'undefined' ? Compo : (mask.Compo || global.Compo),
	    __dom_addEventListener = __Compo.Dom.addEventListener,
	    __mask_registerHandler = mask.registerHandler,
	    __mask_registerAttrHandler = mask.registerAttrHandler,
	    __mask_registerUtil = mask.registerUtil,
	    
		domLib = __Compo.config.getDOMLibrary();
		
	
	// end:source ../src/vars.js

	// source ../src/util/object.js
	
	// end:source ../src/util/object.js
	// source ../src/util/object.observe.js
	var obj_addObserver,
		obj_hasObserver,
		obj_removeObserver,
		obj_lockObservers,
		obj_unlockObservers,
		obj_ensureObserversProperty,
		obj_addMutatorObserver,
		obj_removeMutatorObserver
		;
	
	(function(){
		obj_addObserver = function(obj, property, cb) {
			// closest observer
			var parts = property.split('.'),
				imax  = parts.length,
				i = -1,
				x = obj;
			while ( ++i < imax ) {
				x = x[parts[i]];
				
				if (x == null) 
					break;
				
				if (x[prop_OBS] != null) {
					
					var prop = parts.slice(i + 1).join('.');
					if (x[prop_OBS][prop] != null) {
						
						pushListener_(x, prop, cb);
						
						var cbs = pushListener_(obj, property, cb);
						if (cbs.length === 1) {
							var arr = parts.splice(0, i);
							if (arr.length !== 0) 
								attachProxy_(obj, property, cbs, arr, true);
						}
						return;
					}
				}
			}
			
			var cbs = pushListener_(obj, property, cb);
			if (cbs.length === 1) 
				attachProxy_(obj, property, cbs, parts, true);
			
			var val = obj_getProperty(obj, property),
				mutators = getSelfMutators(val);
			if (mutators != null) {
				objMutator_addObserver(
					val, mutators, cb
				);
			}
		};
		
		obj_hasObserver = function(obj, property, callback){
			// nested observer
			var parts = property.split('.'),
				imax  = parts.length,
				i = -1,
				x = obj;
			while ( ++i < imax ) {
				x = x[parts[i]];
				if (x == null) 
					break;
				
				if (x[prop_OBS] != null) {
					if (obj_hasObserver(x, parts.slice(i).join('.'), callback))
						return true;
					
					break;
				}
			}
			
			var obs = obj[prop_OBS];
			if (obs == null || obs[property] == null) 
				return false;
			
			return arr_contains(obs[property], callback);
		};
		
		obj_removeObserver = function(obj, property, callback) {
			// nested observer
			var parts = property.split('.'),
				imax  = parts.length,
				i = -1,
				x = obj;
			while ( ++i < imax ) {
				x = x[parts[i]];
				if (x == null) 
					break;
				
				if (x[prop_OBS] != null) {
					obj_removeObserver(x, parts.slice(i).join('.'), callback);
					break;
				}
			}
			
			
			var obs = obj_ensureObserversProperty(obj, property),
				val = obj_getProperty(obj, property);
			if (callback === void 0) {
				// callback not provided -> remove all observers	
				obs.length = 0;
			} else {
				arr_remove(obs, callback);
			}
		
			var mutators = getSelfMutators(val);
			if (mutators != null) 
				objMutator_removeObserver(val, mutators, callback)
			
		};
		obj_lockObservers = function(obj) {
			var obs = obj[prop_OBS];
			if (obs != null) 
				obs[prop_DIRTY] = {};
		};	
		obj_unlockObservers = function(obj) {
			var obs = obj[prop_OBS],
				dirties = obs == null ? null : obs[prop_DIRTY];
			if (dirties == null)
				return;
			
			obs[prop_DIRTY] = null;
			
			var prop, cbs, val, imax, i;
			for(prop in dirties) {
				cbs = obj[prop_OBS][prop];
				imax = cbs == null ? 0 : cbs.length;
				if (imax === 0) 
					continue;
				
				i = -1;
				val = prop === prop_MUTATORS
						? obj
						: obj_getProperty(obj, prop)
						;
				while ( ++i < imax ) {
					cbs[i](val);
				}
			}
		};
	
		obj_ensureObserversProperty = function(obj, type){
			var obs = obj[prop_OBS];
			if (obs == null) {
				obs = {
					__dirty: null,
					__dfrTimeout: null,
					__mutators: null
				};
				defineProp_(obj, '__observers', {
					value: obs,
					enumerable: false
				});
			}
			if (type == null) 
				return obs;
			
			var arr = obs[type];
			return arr == null
				? (obs[type] = [])
				: arr
				;
		};
		
		obj_addMutatorObserver = function(obj, cb){
			var mutators = getSelfMutators(obj);
			if (mutators != null) 
				objMutator_addObserver(obj,  mutators, cb);
		};
		obj_removeMutatorObserver = function(obj, cb){
			objMutator_removeObserver(obj, null, cb);
		};
		
		// PRIVATE
		var prop_OBS = '__observers',
			prop_MUTATORS = '__mutators',
			prop_TIMEOUT = '__dfrTimeout',
			prop_DIRTY = '__dirty';
			
		var defineProp_ = Object.defineProperty;
			
		
		//Resolve object, or if property do not exists - create
		function ensureProperty_(obj, chain) {
			var i = -1,
				imax = chain.length - 1,
				key
				;
			while ( ++i < imax ) {
				key = chain[i];
		
				if (obj[key] == null) 
					obj[key] = {};
				
				obj = obj[key];
			}
			return obj;
		}
		function getSelfMutators(obj) {
			if (obj == null || typeof obj !== 'object') 
				return null;
			
			if (typeof obj.length === 'number' && typeof obj.slice === 'function') 
				return MUTATORS_.Array;
			if (typeof obj.toUTCString === 'function') 
				return MUTATORS_.Date;
			
			return null;
		}
		var MUTATORS_ = {
			Array: {
				throttle: false,
				methods: [
					// native mutators
					'push',
					'unshift',
					'splice',
					'pop',
					'shift',
					'reverse',
					'sort',
					// collection mutators
					'remove'
				]
			},
			Date: {
				throttle: true,
				methods: [
					'setDate',
					'setFullYear',
					'setHours',
					'setMilliseconds',
					'setMinutes',
					'setMonth',
					'setSeconds',
					'setTime',
					'setUTCDate',
					'setUTCFullYear',
					'setUTCHours',
					'setUTCMilliseconds',
					'setUTCMinutes',
					'setUTCMonth',
					'setUTCSeconds',
				]
			}
		};
		function attachProxy_(obj, property, cbs, chain) {
			var length = chain.length,
				parent = length > 1
					? ensureProperty_(obj, chain)
					: obj,
				key = chain[length - 1],
				currentVal = parent[key];
				
			if (length > 1) {
				obj_defineCrumbs(obj, chain);
			}
			
			
			if ('length' === key) {
				var mutators = getSelfMutators(parent);
				if (mutators != null) {
					objMutator_addObserver(
						parent, mutators, function(){
							var imax = cbs.length,
								i = -1
								;
							while ( ++i < imax ) {
								cbs[i].apply(null, arguments);
							}
						});
					return currentVal;
				}
				
			}
			
			defineProp_(parent, key, {
				get: function() {
					return currentVal;
				},
				set: function(x) {
					if (x === currentVal) 
						return;
					currentVal = x;
					var i = 0,
						imax = cbs.length,
						mutators = getSelfMutators(x);
					if (mutators != null) {
						for(; i < imax; i++) {
							objMutator_addObserver(
								x, mutators, cbs[i]
							);
						}
					}
					
					if (obj[prop_OBS][prop_DIRTY] != null) {
						obj[prop_OBS][prop_DIRTY][property] = 1;
						return;
					}
		
					for (i = 0; i < imax; i++) {
						cbs[i](x);
					}
				},
				configurable: true,
				enumerable : true
			});
			
			return currentVal;
		}
		
		function obj_defineCrumbs(obj, chain) {
			var rebinder = obj_crumbRebindDelegate(obj),
				path = '',
				key;
			
			var imax = chain.length - 1,
				i = 0;
			for(; i < imax; i++) {
				key = chain[i];
				path += key + '.';
				
				obj_defineCrumb(path, obj, key, rebinder);
				obj = obj[key];
			}
		}
		
		function obj_defineCrumb(path, obj, key, rebinder) {
				
			var value = obj[key],
				old;
			
			defineProp_(obj, key, {
				get: function() {
					return value;
				},
				set: function(x) {
					if (x === value) 
						return;
					
					old = value;
					value = x;
					rebinder(path, old);
				},
				configurable: true,
				enumerable : true
			});
		}
		
		function obj_crumbRebindDelegate(obj) {
			return function(path, oldValue){
				
				var observers = obj[prop_OBS];
				if (observers == null) 
					return;
				
				for (var property in observers) {
					
					if (property.indexOf(path) !== 0) 
						continue;
					
					var listeners = observers[property].slice(0),
						imax = listeners.length,
						i = 0;
					
					if (imax === 0) 
						continue;
					
					var val = obj_getProperty(obj, property),
						cb, oldProp;
					
					for (i = 0; i < imax; i++) {
						cb = listeners[i];
						obj_removeObserver(obj, property, cb);
						
						oldProp = property.substring(path.length);
						obj_removeObserver(oldValue, oldProp, cb);
					}
					for (i = 0; i < imax; i++){
						listeners[i](val);
					}
					
					for (i = 0; i < imax; i++){
						obj_addObserver(obj, property, listeners[i]);
					}
					
				}
			}
		}
		
		// Create Collection - Check If Exists - Add Listener
		function pushListener_(obj, property, cb) {
			var obs = obj_ensureObserversProperty(obj, property);
			if (arr_contains(obs, cb) === false) 
				obs.push(cb);
			return obs;
		}
		
		var objMutator_addObserver,
			objMutator_removeObserver;
		(function(){
			objMutator_addObserver = function(obj, mutators, cb){
				var methods = mutators.methods,
					throttle = mutators.throttle,
					obs = obj_ensureObserversProperty(obj, prop_MUTATORS);
				if (obs.length === 0) {
					var imax = methods.length,
						i = -1,
						method, fn;
					while( ++i < imax ){
						method = methods[i];
						fn = obj[method];
						if (fn == null) 
							continue;
						
						obj[method] = objMutator_createWrapper_(
							obj
							, fn
							, method
							, throttle
						);
					}
				}
				obs[obs.length++] = cb;
			};
			objMutator_removeObserver = function(obj, mutators, cb){
				var obs = obj_ensureObserversProperty(obj, prop_MUTATORS);
				if (cb === void 0) {
					obs.length = 0;
					return;
				}
				arr_remove(obs, cb);
			};
			
			function objMutator_createWrapper_(obj, originalFn, method, throttle) {
				var fn = throttle === true ? callDelayed : call;
				return function() {
					return fn(
						obj,
						originalFn,
						method,
						_Array_slice.call(arguments)
					);
				};
			}
			function call(obj, original, method, args) {
				var cbs = obj_ensureObserversProperty(obj, prop_MUTATORS),
					result = original.apply(obj, args);
				
				tryNotify(obj, cbs, method, args, result);
				return result;
			}
			function callDelayed(obj, original, method, args) {
				var cbs = obj_ensureObserversProperty(obj, prop_MUTATORS),
					result = original.apply(obj, args);
				
				var obs = obj[prop_OBS];
				if (obs[prop_TIMEOUT] != null) 
					return result;
				
				obs[prop_TIMEOUT] = setTimeout(function(){
					obs[prop_TIMEOUT] = null;
					tryNotify(obj, cbs, method, args, result);
				});
				return result;
			}
			
			function tryNotify(obj, cbs, method, args, result){
				if (cbs.length === 0) 
					return;
				
				var obs = obj[prop_OBS];
				if (obs[prop_DIRTY] != null) {
					obs[prop_DIRTY][prop_MUTATORS] = 1;
					return;
				}
				var imax = cbs.length,
					i = -1,
					x;
				while ( ++i < imax ){
					x = cbs[i];
					if (typeof x === 'function') {
						x(obj, method, args, result);
					}
				}
			}
		}());
		
	}());
	// end:source ../src/util/object.observe.js
	// source ../src/util/date.js
	var date_ensure;
	(function(){
		date_ensure = function(val){
			if (val == null || val === '') 
				return null;
			if (typeof val === 'string') 
				val = new Date(val);
				
			return isNaN(val) === false && typeof val.getFullYear === 'function'
				? val
				: null
				;
		};
	}());
	// end:source ../src/util/date.js
	// source ../src/util/dom.js
	
	function dom_removeElement(node) {
		return node.parentNode.removeChild(node);
	}
	
	function dom_removeAll(array) {
		if (array == null) 
			return;
		
		var imax = array.length,
			i = -1;
		while ( ++i < imax ) {
			dom_removeElement(array[i]);
		}
	}
	
	function dom_insertAfter(element, anchor) {
		return anchor.parentNode.insertBefore(element, anchor.nextSibling);
	}
	
	function dom_insertBefore(element, anchor) {
		return anchor.parentNode.insertBefore(element, anchor);
	}
	
	
	
	
	// end:source ../src/util/dom.js
	// source ../src/util/compo.js
	var compo_fragmentInsert,
		compo_render,
		compo_dispose,
		compo_inserted,
		compo_attachDisposer
		;
	(function(){
		
		compo_fragmentInsert = function(compo, index, fragment, placeholder) {
			if (compo.components == null) 
				return dom_insertAfter(fragment, placeholder || compo.placeholder);
			
			var compos = compo.components,
				anchor = null,
				insertBefore = true,
				imax = compos.length,
				i = index - 1,
				elements;
			
			if (anchor == null) {
				while (++i < imax) {
					elements = compos[i].elements;
			
					if (elements && elements.length) {
						anchor = elements[0];
						break;
					}
				}
			}
			if (anchor == null) {
				insertBefore = false;
				i = index < imax
					? index
					: imax
					;
				while (--i > -1) {
					elements = compos[i].elements;
					if (elements && elements.length) {
						anchor = elements[elements.length - 1];
						break;
					}
				}
			}
			if (anchor == null) 
				anchor = placeholder || compo.placeholder;
			
			if (insertBefore) 
				return dom_insertBefore(fragment, anchor);
			
			return dom_insertAfter(fragment, anchor);
		};
		
		compo_render = function(parentCtr, template, model, ctx, container) {
			return mask.render(template, model, ctx, container, parentCtr);
		};
		
		compo_dispose = function(compo, parent) {
			if (compo == null) 
				return false;
			
			if (compo.elements != null) {
				dom_removeAll(compo.elements);
				compo.elements = null;
			}
			__Compo.dispose(compo);
			
			var compos = (parent && parent.components) || (compo.parent && compo.parent.components);
			if (compos == null) {
				log_error('Parent Components Collection is undefined');
				return false;
			}
			return arr_remove(compos, compo);
		};
		
		compo_inserted = function(compo) {
			__Compo.signal.emitIn(compo, 'domInsert');
		};
		
		compo_attachDisposer = function(ctr, disposer) {
			if (typeof ctr.dispose === 'function') {
				var previous = ctr.dispose;
				ctr.dispose = function(){
					disposer.call(this);
					previous.call(this);
				};
		
				return;
			}
			ctr.dispose = disposer;
		};
	
	}());
	// end:source ../src/util/compo.js
	// source ../src/util/expression.js
	var expression_eval,
		expression_eval_strict,
		expression_bind,
		expression_unbind,
		expression_createBinder,
		expression_createListener,
		
		expression_parse,
		expression_varRefs
		;
		
	(function(){
		var Expression = mask.Utils.Expression;
	
		expression_eval_strict = Expression.eval;
		expression_parse = Expression.parse;
		expression_varRefs = Expression.varRefs;
		
		expression_eval = function(expr, model, ctx, ctr){
			if (expr === '.') 
				return model;
			
			var x = expression_eval_strict(expr, model, ctx, ctr);
			return x == null ? '' : x;
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
					log_warn('<listener:expression> concurent binder');
					return;
				}
				
				callback();
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
				if (first === '$c') {
					// Controller Observer
					ctr = _getObservable_Controller(ctr, parts.slice(1), imax - 1);
					mutatorFn(ctr, property.substring(3), callback);
					return;
				}
				if ('$a' === first || '$ctx' === first) 
					return;
			}
			
			var obj = null;
			if (_isDefined(model, parts, imax)) {
				obj = model;
			}
			if (obj == null) {
				obj = _getObservable_Scope(ctr, parts, imax);
			}
			if (obj == null) {
				obj = model;
			}
			
			mutatorFn(obj, property, callback);
		}
		
		function _getObservable_Scope(ctr, parts, imax){
			var scope;
			while(ctr != null){
				scope = ctr.scope;
				if (scope != null && _isDefined(scope, parts, imax)) 
					return scope;
				
				ctr = ctr.parent;
			}
			return null;
		}
		function _getObservable_Controller(ctr, parts, imax) {
			while(ctr != null){
				if (_isDefined(ctr, parts, imax)) 
					return ctr;
				ctr = ctr.parent;
			}
			return ctr;
		}
		function _isDefined(obj, parts, imax){
			if (obj == null) 
				return false;
				
			var i = 0, val;
			for(; i < imax; i++) {
				obj = obj[parts[i]];
				if (obj === void 0) 
					return false;
			}
			return true;
		}
		
		
	}());
	
	
	
	// end:source ../src/util/expression.js
	// source ../src/util/signal.js
	var signal_parse,
		signal_create
		;
	
	(function(){
		
		
		signal_parse = function(str, isPiped, defaultType) {
			var signals = str.split(';'),
				set = [],
				i = 0,
				imax = signals.length,
				x,
				signalName, type,
				signal;
				
		
			for (; i < imax; i++) {
				x = signals[i].split(':');
				
				if (x.length !== 1 && x.length !== 2) {
					log_error('Too much ":" in a signal def.', signals[i]);
					continue;
				}
				
				
				type = x.length === 2 ? x[0] : defaultType;
				signalName = x[x.length === 2 ? 1 : 0];
				
				signal = signal_create(signalName.trim(), type, isPiped);
				
				if (signal != null) {
					set.push(signal);
				}
			}
			
			return set;
		};
		
		
		signal_create = function(signal, type, isPiped) {
			if (isPiped !== true) {
				return {
					signal: signal,
					type: type
				};
			}
			
			var index = signal.indexOf('.');
			if (index === -1) {
				log_error('No pipe name in a signal', signal);
				return null;
			}
			
			return {
				signal: signal.substring(index + 1),
				pipe: signal.substring(0, index),
				type: type
			};
		};
	}());
	
	// end:source ../src/util/signal.js

	// source ../src/bindingProvider.js
	// source ./DomObjectTransport.js
	var DomObjectTransport;
	(function(){
		
		var objectWay = {
			get: function(provider, expression) {
				var getter = provider.objGetter;
				if (getter == null) {
					return expression_eval(
						expression
						, provider.model
						, provider.ctx
						, provider.ctr
					);
				}
				
				var obj = getAccessorObject_(provider, getter);
				if (obj == null) 
					return null;
				
				return obj[getter](expression, provider.model, provider.ctr.parent);
			},
			set: function(obj, property, value, provider) {
				var setter = provider.objSetter;
				if (setter == null) {
					obj_setProperty(obj, property, value);
					return;
				}
				var ctx = getAccessorObject_(provider, setter);
				if (ctx == null) 
					return;
				
				ctx[setter](
					property
					, value
					, provider.model
					, provider.ctr.parent
				);
			}
		};
		var domWay  = {
			get: function(provider) {
				var getter = provider.domGetter;
				if (getter == null) {
					return obj_getProperty(provider, provider.property);
				}
				var ctr = provider.ctr.parent;
				if (isValidFn_(ctr, getter, 'Getter') === false) {
					return null;
				}
				return ctr[getter](provider.element);
			},
			set: function(provider, value) {
				var setter = provider.domSetter;
				if (setter == null) {
					obj_setProperty(provider, provider.property, value);
					return;
				}
				var ctr = provider.ctr.parent;
				if (isValidFn_(ctr, setter, 'Setter') === false) {
					return;
				}
				ctr[setter](value, provider.element);
			}
		};
		var DateTimeDelegate = {
			domSet: function(format){
				return function(prov, val){
					var date = date_ensure(val);
					prov.element.value = date == null ? '' : format(date);
				}
			},
			objSet: function(extend){
				return function(obj, prop, val){
					
					var date = date_ensure(val);
					if (date == null) 
						return;
					
					var target = date_ensure(obj_getProperty(obj, prop));
					if (target == null) {
						obj_setProperty(obj, prop, date);
						return;
					}
					extend(target, date);
				}
			}
		};
		
		DomObjectTransport = {
			// generic
			objectWay: objectWay,
			domWay: domWay,
			
			SELECT: {
				get: function(provider) {
					var el = provider.element,
						i = el.selectedIndex;
					if (i === -1) 
						return '';
					
					var opt = el.options[i],
						val = opt.getAttribute('value');
					return val == null
						? opt.getAttribute('name') /* obsolete */
						: val
						;
				},
				set: function(provider, val) {
					var el = provider.element,
						options = el.options,
						imax = options.length,
						opt, x, i;
					for(i = 0; i < imax; i++){
						opt = options[i];
						x = opt.getAttribute('value');
						if (x == null) 
							x = opt.getAttribute('name');
						
						/* jshint eqeqeq: false */
						if (x == val) {
							/* jshint eqeqeq: true */
							el.selectedIndex = i;
							return;
						}
					}
					log_warn('Value is not an option', val);
				}
			},
			DATE: {
				domWay: {
					get: domWay.get,
					set: function(prov, val){
						var date = date_ensure(val);
						prov.element.value = date == null ? '' : formatDate(date);
					}
				},
				objectWay: {
					get: objectWay.get,
					set: DateTimeDelegate.objSet(function(a, b){
						a.setFullYear(b.getFullYear());
						a.setMonth(b.getMonth());
						a.setDate(b.getDate());
					})
				}
			},
			TIME: {
				domWay: {
					get: domWay.get,
					set: DateTimeDelegate.domSet(formatTime)
				},
				objectWay: {
					get: objectWay.get,
					set: DateTimeDelegate.objSet(function(a, b){
						a.setHours(b.getHours())
						a.setMinutes(b.getMinutes());
						a.setSeconds(b.getSeconds());
					})
				}
			}
			
		};
		
		function isValidFn_(obj, prop, name) {
			if (obj== null || typeof obj[prop] !== 'function') {
				log_error('BindingProvider.', name, 'should be a function. Property:', prop);
				return false;
			}
			return true;
		}
		function getAccessorObject_(provider, accessor) {
			var ctr = provider.ctr.parent;
			if (ctr[accessor] != null) 
				return ctr;
			var model = provider.model;
			if (model[accessor] != null) 
				return model;
			
			log_error('BindingProvider. Accessor `', accessor, '`should be a function');
			return null;
		}
		function formatDate(date) {
			var YYYY = date.getFullYear(),
				MM = date.getMonth() + 1,
				DD = date.getDate();
			return YYYY
				+ '-'
				+ (MM < 10 ? '0' : '')
				+ (MM)
				+ '-'
				+ (DD < 10 ? '0' : '')
				+ (DD)
				;
		}
		function formatTime(date) {
			var H = date.getHours(),
				M = date.getMinutes();
			return H
				+ ':'
				+ (M < 10 ? '0' : '')
				+ (M)
				;
		}
	}());
	
	// end:source ./DomObjectTransport.js
	// source ./CustomProviders.js
	var CustomProviders = {};
	
	mask.registerBinding = function(name, Prov) {
		CustomProviders[name] = Prov;
	};
	// end:source ./CustomProviders.js
	
	var BindingProvider;
	(function() {
		
		mask.BindingProvider =
		BindingProvider =
		function BindingProvider(model, element, ctr, bindingType) {
			if (bindingType == null) 
				bindingType = ctr.compoName === ':bind' ? 'single' : 'dual';
			
			var attr = ctr.attr,
				type;
	
			this.node = ctr; // backwards compat.
			this.ctr = ctr;
			this.ctx = null;
	
			this.model = model;
			this.element = element;
			this.value = attr.value;
			this.property = attr.property;
			this.domSetter = attr.setter || attr['dom-setter'];
			this.domGetter = attr.getter || attr['dom-getter'];
			this.objSetter = attr['obj-setter'];
			this.objGetter = attr['obj-getter'];
			
			/* Convert to an instance, e.g. Number, on domchange event */
			this['typeof'] = attr['typeof'] || null;
			
			this.dismiss = 0;
			this.bindingType = bindingType;
			this.log = false;
			this.signal_domChanged = null;
			this.signal_objectChanged = null;
			this.locked = false;
			
			
			if (this.property == null && this.domGetter == null) {
	
				switch (element.tagName) {
					case 'INPUT':
						type = element.getAttribute('type');
						if ('checkbox' === type) {
							this.property = 'element.checked';
							break;
						}
						if ('date' === type) {
							var x = DomObjectTransport.DATE;
							this.domWay = x.domWay;
							this.objectWay = x.objectWay;
						}
						if ('number' === type) 
							this['typeof'] = 'Number';
						
						this.property = 'element.value';
						break;
					case 'TEXTAREA':
						this.property = 'element.value';
						break;
					case 'SELECT':
						this.domWay = DomObjectTransport.SELECT;
						break;
					default:
						this.property = 'element.innerHTML';
						break;
				}
			}
	
			if (attr['log']) {
				this.log = true;
				if (attr.log !== 'log') {
					this.logExpression = attr.log;
				}
			}
	
			/**
			 *	Send signal on OBJECT or DOM change
			 */
			if (attr['x-signal']) {
				var signal = signal_parse(attr['x-signal'], null, 'dom')[0],
					signalType = signal && signal.type;
				
				switch(signalType){
					case 'dom':
					case 'object':
						this['signal_' + signalType + 'Changed'] = signal.signal;
						break;
					default:
						log_error('Signal typs is not supported', signal);
						break;
				}
				
				
			}
			
			if (attr['x-pipe-signal']) {
				var signal = signal_parse(attr['x-pipe-signal'], true, 'dom')[0],
					signalType = signal && signal.type;
					
				switch(signalType){
					case 'dom':
					case 'object':
						this['pipe_' + signalType + 'Changed'] = signal;
						break;
					default:
						log_error('Pipe type is not supported');
						break;
				}
			}
			
			
			if (attr['dom-slot']) {
				this.slots = {};
				// @hack - place dualb. provider on the way of a signal
				// 
				var parent = ctr.parent,
					newparent = parent.parent;
					
				parent.parent = this;
				this.parent = newparent;
				
				this.slots[attr['dom-slot']] = function(sender, value){
					this.domChanged(sender, value);
				}
			}
			
			/*
			 *  @obsolete: attr name : 'x-pipe-slot'
			 */
			var pipeSlot = attr['object-pipe-slot'] || attr['x-pipe-slot'];
			if (pipeSlot) {
				var str = pipeSlot,
					index = str.indexOf('.'),
					pipeName = str.substring(0, index),
					signal = str.substring(index + 1);
				
				this.pipes = {};
				this.pipes[pipeName] = {};
				this.pipes[pipeName][signal] = function(){
					this.objectChanged();
				};
				
				__Compo.pipe.addController(this);
			}
	
	
			if (attr.expression) {
				this.expression = attr.expression;
				if (this.value == null && bindingType !== 'single') {
					var refs = expression_varRefs(this.expression);
					if (typeof refs === 'string') {
						this.value = refs;
					} else {
						log_warn('Please set value attribute in DualBind Control.');
					}
				}
				return;
			}
			
			this.expression = this.value;
		};
		
		BindingProvider.create = function(model, el, ctr, bindingType) {
	
			/* Initialize custom provider */
			var type = ctr.attr.bindingProvider,
				CustomProvider = type == null ? null : CustomProviders[type],
				provider;
	
			if (typeof CustomProvider === 'function') {
				return new CustomProvider(model, el, ctr, bindingType);
			}
	
			provider = new BindingProvider(model, el, ctr, bindingType);
	
			if (CustomProvider != null) {
				obj_extend(provider, CustomProvider);
			}
			return provider;
		};
		
		BindingProvider.bind = function(provider){
			return apply_bind(provider);
		};
	
		BindingProvider.prototype = {
			constructor: BindingProvider,
			
			dispose: function() {
				expression_unbind(this.expression, this.model, this.ctr, this.binder);
			},
			objectChanged: function(x) {
				if (this.dismiss-- > 0) {
					return;
				}
				if (this.locked === true) {
					log_warn('Concurance change detected', this);
					return;
				}
				this.locked = true;
	
				if (x == null) {
					x = this.objectWay.get(this, this.expression);
				}
	
				this.domWay.set(this, x);
	
				if (this.log) {
					console.log('[BindingProvider] objectChanged -', x);
				}
				if (this.signal_objectChanged) {
					signal_emitOut(this.ctr, this.signal_objectChanged, [x]);
				}
				
				if (this.pipe_objectChanged) {
					var pipe = this.pipe_objectChanged;
					__Compo.pipe(pipe.pipe).emit(pipe.signal);
				}
	
				this.locked = false;
			},
			domChanged: function(event, value) {
				if (this.locked === true) {
					log_warn('Concurance change detected', this);
					return;
				}
				this.locked = true;
	
				if (value == null) 
					value = this.domWay.get(this);
				
				var typeof_ = this['typeof'];
				if (typeof_ != null) {
					var Converter = window[typeof_];
					value = Converter(value);
				}
				
				var isValid = true,
					validations = this.ctr.validations;
				if (validations) {
					var imax = validations.length,
						i = -1, x;
					while( ++i < imax ) {
						x = validations[i];
						if (x.validate(value, this.element, this.objectChanged.bind(this)) === false) {
							isValid = false;
							break;
						}
					}
				}
				if (isValid) {
					this.dismiss = 1;
					this.objectWay.set(this.model, this.value, value, this);
					this.dismiss = 0;
	
					if (this.log) {
						console.log('[BindingProvider] domChanged -', value);
					}
					if (this.signal_domChanged) {
						signal_emitOut(this.ctr, this.signal_domChanged, [value]);
					}
					if (this.pipe_domChanged) {
						var pipe = this.pipe_domChanged;
						__Compo.pipe(pipe.pipe).emit(pipe.signal);
					}	
				}
				this.locked = false;
			},
			
			objectWay: DomObjectTransport.objectWay,
			domWay: DomObjectTransport.domWay
		};
		
		function apply_bind(provider) {
	
			var expr = provider.expression,
				model = provider.model,
				onObjChanged = provider.objectChanged = provider.objectChanged.bind(provider);
	
			provider.binder = expression_createBinder(expr, model, provider.ctx, provider.ctr, onObjChanged);
	
			expression_bind(expr, model, provider.ctx, provider.ctr, provider.binder);
	
			if (provider.bindingType === 'dual') {
				var attr = provider.ctr.attr;
				
				if (!attr['change-slot'] && !attr['change-pipe-event']) {
					var element = provider.element,
						/*
						 * @obsolete: attr name : 'changeEvent'
						 */
						eventType = attr['change-event'] || attr.changeEvent || 'change',
						onDomChange = provider.domChanged.bind(provider);
		
					__dom_addEventListener(element, eventType, onDomChange);
				}
				
					
				if (!provider.objectWay.get(provider, provider.expression)) {
					// object has no value, so check the dom
					setTimeout(function(){
						if (provider.domWay.get(provider))
							// and apply when exists
							provider.domChanged();	
					});
					return provider;
				}
			}
	
			// trigger update
			provider.objectChanged();
			return provider;
		}
	
		function signal_emitOut(ctr, signal, args) {
			if (ctr == null) 
				return;
			
			var slots = ctr.slots;
			if (slots != null && typeof slots[signal] === 'function') {
				if (slots[signal].apply(ctr, args) === false) 
					return;
			}
			
			signal_emitOut(ctr.parent, signal, args);
		}
	
		obj_extend(BindingProvider, {
			addObserver: obj_addObserver,
			removeObserver: obj_removeObserver
		});
	}());
	
	// end:source ../src/bindingProvider.js

	// source ../src/mask-handler/visible.js
	/**
	 * visible handler. Used to bind directly to display:X/none
	 *
	 * attr =
	 *    check - expression to evaluate
	 *    bind - listen for a property change
	 */
	
	function VisibleHandler() {}
	
	__mask_registerHandler(':visible', VisibleHandler);
	
	
	VisibleHandler.prototype = {
		constructor: VisibleHandler,
	
		refresh: function(model, container) {
			container.style.display = expression_eval(this.attr.check, model) ? '' : 'none';
		},
		renderStart: function(model, cntx, container) {
			this.refresh(model, container);
	
			if (this.attr.bind) {
				obj_addObserver(model, this.attr.bind, this.refresh.bind(this, model, container));
			}
		}
	};
	
	// end:source ../src/mask-handler/visible.js
	// source ../src/mask-handler/bind.js
	/**
	 *  Mask Custom Tag Handler
	 *	attr =
	 *		attr: {String} - attribute name to bind
	 *		prop: {Stirng} - property name to bind
	 *		- : {default} - innerHTML
	 */
	
	
	
	(function() {
	
		function Bind() {}
	
		__mask_registerHandler(':bind', Bind);
	
		Bind.prototype = {
			constructor: Bind,
			renderEnd: function(els, model, cntx, container){
				
				this.provider = BindingProvider.create(model, container, this, 'single');
				
				BindingProvider.bind(this.provider);
			},
			dispose: function(){
				if (this.provider && typeof this.provider.dispose === 'function') {
					this.provider.dispose();
				}
			}
		};
	
	
	}());
	
	// end:source ../src/mask-handler/bind.js
	// source ../src/mask-handler/dualbind.js
	/**
	 *	Mask Custom Handler
	 *
	 *	2 Way Data Model binding
	 *
	 *
	 *	attr =
	 *		value: {string} - property path in object
	 *		?property : {default} 'element.value' - value to get/set from/to HTMLElement
	 *		?changeEvent: {default} 'change' - listen to this event for HTMLELement changes
	 *
	 *		?setter: {string} - setter function of a parent controller
	 *		?getter: {string} - getter function of a parent controller
	 *
	 *
	 */
	
	function DualbindHandler() {}
	
	__mask_registerHandler(':dualbind', DualbindHandler);
	
	
	
	DualbindHandler.prototype = {
		constructor: DualbindHandler,
	
		renderEnd: function(elements, model, cntx, container) {
			this.provider = BindingProvider.create(model, container, this);
	
			if (this.components) {
				for (var i = 0, x, length = this.components.length; i < length; i++) {
					x = this.components[i];
	
					if (x.compoName === ':validate') {
						(this.validations || (this.validations = []))
							.push(x);
					}
				}
			}
	
			if (!this.attr['no-validation'] && !this.validations) {
				var Validate = model.Validate,
					prop = this.provider.value;
	
				if (Validate == null && prop.indexOf('.') !== -1) {
					var parts = prop.split('.'),
						i = 0,
						imax = parts.length,
						obj = model[parts[0]];
					while (Validate == null && ++i < imax && obj) {
						Validate = obj.Validate;
						obj = obj[parts[i]]
					}
					prop = parts.slice(i).join('.');
				}
	
				var validator = Validate && Validate[prop];
				if (typeof validator === 'function') {
	
					validator = mask
						.getHandler(':validate')
						.createCustom(container, validator);
	
					(this.validations || (this.validations = []))
						.push(validator);
	
				}
			}
	
	
			BindingProvider.bind(this.provider);
		},
		dispose: function() {
			if (this.provider && typeof this.provider.dispose === 'function') {
				this.provider.dispose();
			}
		},
	
		handlers: {
			attr: {
				'x-signal': function() {}
			}
		}
	};
	// end:source ../src/mask-handler/dualbind.js
	// source ../src/mask-handler/validate.js
	(function() {
		
		var class_INVALID = '-validate-invalid';
	
		mask.registerValidator = function(type, validator) {
			Validators[type] = validator;
		};
	
		function Validate() {}
	
		__mask_registerHandler(':validate', Validate);
	
	
	
	
		Validate.prototype = {
			constructor: Validate,
	        attr: {},
			renderStart: function(model, cntx, container) {
				this.element = container;
				
				if (this.attr.value) {
					var validatorFn = Validate.resolveFromModel(model, this.attr.value);
						
					if (validatorFn) {
						this.validators = [new Validator(validatorFn)];
					}
				}
			},
			/**
			 * @param input - {control specific} - value to validate
			 * @param element - {HTMLElement} - (optional, @default this.element) -
			 *				Invalid message is schown(inserted into DOM) after this element
			 * @param oncancel - {Function} - Callback function for canceling
			 *				invalid notification
			 */
			validate: function(input, element, oncancel) {
				if (element == null){
					element = this.element;
				}
	
				if (this.attr) {
					
					if (input == null && this.attr.getter) {
						input = obj_getProperty({
							node: this,
							element: element
						}, this.attr.getter);
					}
					
					if (input == null && this.attr.value) {
						input = obj_getProperty(this.model, this.attr.value);
					}
				}
				
				
	
				if (this.validators == null) {
					this.initValidators();
				}
	
				for (var i = 0, x, imax = this.validators.length; i < imax; i++) {
					x = this.validators[i].validate(input)
					
					if (x && !this.attr.silent) {
						this.notifyInvalid(element, x, oncancel);
						return false;
					}
				}
	
				this.makeValid(element);
				return true;
			},
			notifyInvalid: function(element, message, oncancel){
				return notifyInvalid(element, message, oncancel);
			},
			makeValid: function(element){
				return makeValid(element);
			},
			initValidators: function() {
				this.validators = [];
				
				for (var key in this.attr) {
					
					
					switch (key) {
						case 'message':
						case 'value':
						case 'getter':
							continue;
					}
					
					if (key in Validators === false) {
						log_error('Unknown Validator:', key, this);
						continue;
					}
					
					var x = Validators[key];
					
					this.validators.push(new Validator(x(this.attr[key], this), this.attr.message));
				}
			}
		};
	
		
		Validate.resolveFromModel = function(model, property){
			return obj_getProperty(model.Validate, property);
		};
		
		Validate.createCustom = function(element, validator){
			var validate = new Validate();
			
			validate.element = element;
			validate.validators = [new Validator(validator)];
			
			return validate;
		};
		
		
		function Validator(fn, defaultMessage) {
			this.fn = fn;
			this.message = defaultMessage;
		}
		Validator.prototype.validate = function(value){
			var result = this.fn(value);
			
			if (result === false) {
				return this.message || ('Invalid - ' + value);
			}
			return result;
		};
		
	
		function notifyInvalid(element, message, oncancel) {
			log_warn('Validate Notification:', element, message);
	
			var next = domLib(element).next('.' + class_INVALID);
			if (next.length === 0) {
				next = domLib('<div>')
					.addClass(class_INVALID)
					.html('<span></span><button>cancel</button>')
					.insertAfter(element);
			}
	
			return next
				.children('button')
				.off()
				.on('click', function() {
					next.hide();
					oncancel && oncancel();
		
				})
				.end()
				.children('span').text(message)
				.end()
				.show();
		}
	
		function makeValid(element) {
			return domLib(element).next('.' + class_INVALID).hide();
		}
	
		__mask_registerHandler(':validate:message', Compo({
			template: 'div.' + class_INVALID + ' { span > "~[bind:message]" button > "~[cancel]" }',
			
			onRenderStart: function(model){
				if (typeof model === 'string') {
					model = {
						message: model
					};
				}
				
				if (!model.cancel) {
					model.cancel = 'cancel';
				}
				
				this.model = model;
			},
			compos: {
				button: '$: button',
			},
			show: function(message, oncancel){
				var that = this;
				
				this.model.message = message;
				this.compos.button.off().on(function(){
					that.hide();
					oncancel && oncancel();
					
				});
				
				this.$.show();
			},
			hide: function(){
				this.$.hide();
			}
		}));
		
		
		var Validators = {
			match: function(match) {
				
				return function(str){
					return new RegExp(match).test(str);
				};
			},
			unmatch:function(unmatch) {
				
				return function(str){
					return !(new RegExp(unmatch).test(str));
				};
			},
			minLength: function(min) {
				
				return function(str){
					return str.length >= parseInt(min, 10);
				};
			},
			maxLength: function(max) {
				
				return function(str){
					return str.length <= parseInt(max, 10);
				};
			},
			check: function(condition, node){
				
				return function(str){
					return expression_eval('x' + condition, node.model, {x: str}, node);
				};
			}
			
	
		};
	
	
	
	}());
	
	// end:source ../src/mask-handler/validate.js
	// source ../src/mask-handler/validate.group.js
	function ValidateGroup() {}
	
	__mask_registerHandler(':validate:group', ValidateGroup);
	
	
	ValidateGroup.prototype = {
		constructor: ValidateGroup,
		validate: function() {
			var validations = getValidations(this);
	
	
			for (var i = 0, x, length = validations.length; i < length; i++) {
				x = validations[i];
				if (!x.validate()) {
					return false;
				}
			}
			return true;
		}
	};
	
	function getValidations(component, out){
		if (out == null){
			out = [];
		}
	
		if (component.components == null){
			return out;
		}
		var compos = component.components;
		for(var i = 0, x, length = compos.length; i < length; i++){
			x = compos[i];
	
			if (x.compoName === 'validate'){
				out.push(x);
				continue;
			}
	
			getValidations(x);
		}
		return out;
	}
	
	// end:source ../src/mask-handler/validate.group.js

	// source ../src/mask-util/bind.js
	/**
	 *	Mask Custom Utility - for use in textContent and attribute values
	 */
	(function(){
		
		function attr_strReplace(attrValue, currentValue, newValue) {
			if (!attrValue) 
				return newValue;
			
			if (currentValue == null || currentValue === '') 
				return attrValue + ' ' + newValue;
			
			return attrValue.replace(currentValue, newValue);
		}
	
		function refresherDelegate_NODE(element){
			return function(value) {
				element.textContent = value;
			};
		}
		function refresherDelegate_ATTR(element, attrName, currentValue) {
			return function(value){
				var currentAttr = element.getAttribute(attrName),
					attr = attr_strReplace(currentAttr, currentValue, value);
	
				element.setAttribute(attrName, attr);
				currentValue = value;
			};
		}
		function refresherDelegate_PROP(element, attrName, currentValue) {
			return function(value){
				switch(typeof element[attrName]) {
					case 'boolean':
						currentValue = element[attrName] = !!value;
						return;
					case 'number':
						currentValue = element[attrName] = Number(value);
						return;
					case 'string':
						currentValue = element[attrName] = attr_strReplace(element[attrName], currentValue, value);
						return;
					default:
						log_warn('Unsupported elements property type', attrName);
						return;
				}
			};
		}
		
		function create_refresher(type, expr, element, currentValue, attrName) {
			if ('node' === type) {
				return refresherDelegate_NODE(element);
			}
			if ('attr' === type) {
				switch(attrName) {
					case 'value':
					case 'disabled':
					case 'checked':
					case 'selected':
					case 'selectedIndex':
						return refresherDelegate_PROP(element, attrName, currentValue);
				}
				return refresherDelegate_ATTR(element, attrName, currentValue);
			}
			throw Error('Unexpected binder type: ' + type);
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
	
	// end:source ../src/mask-util/bind.js
	
	// source ../src/mask-attr/xxVisible.js
	
	
	__mask_registerAttrHandler('xx-visible', function(node, attrValue, model, cntx, element, controller) {
		
		var binder = expression_createBinder(attrValue, model, cntx, controller, function(value){
			element.style.display = value ? '' : 'none';
		});
		
		expression_bind(attrValue, model, cntx, controller, binder);
		
		compo_attachDisposer(controller, function(){
			expression_unbind(attrValue, model,  controller, binder);
		});
		
		
		
		if (!expression_eval(attrValue, model, cntx, controller)) {
			
			element.style.display = 'none';
		}
	});
	// end:source ../src/mask-attr/xxVisible.js
	// source ../src/mask-attr/xToggle.js
	/**
	 *	Toggle value with ternary operator on an event.
	 *
	 *	button x-toggle='click: foo === "bar" ? "zet" : "bar" > 'Toggle'
	 */
	
	__mask_registerAttrHandler('x-toggle', 'client', function(node, attrValue, model, ctx, element, controller){
	    
	    
	    var event = attrValue.substring(0, attrValue.indexOf(':')),
	        expression = attrValue.substring(event.length + 1),
	        ref = expression_varRefs(expression);
	    
		if (typeof ref !== 'string') {
			// assume is an array
			ref = ref[0];
		}
		
	    __dom_addEventListener(element, event, function(){
	        var value = expression_eval(expression, model, ctx, controller);
	        
	        obj_setProperty(model, ref, value);
	    });
	});
	
	// end:source ../src/mask-attr/xToggle.js
	// source ../src/mask-attr/xClassToggle.js
	/**
	 *	Toggle Class Name
	 *
	 *	button x-toggle='click: selected'
	 */
	
	__mask_registerAttrHandler('x-class-toggle', 'client', function(node, attrValue, model, ctx, element, controller){
	    
	    
	    var event = attrValue.substring(0, attrValue.indexOf(':')),
	        $class = attrValue.substring(event.length + 1).trim();
	    
		
	    __dom_addEventListener(element, event, function(){
	         domLib(element).toggleClass($class);
	    });
	});
	
	// end:source ../src/mask-attr/xClassToggle.js

	//--import ../src/sys/sys.js
	// source ../src/statements/exports.js
	(function(){
		var custom_Statements = mask.getStatement();
		
		// source 1.utils.js
		var _getNodes,
			_renderElements,
			_renderPlaceholder,
			_compo_initAndBind,
			
			els_toggle
			
			;
			
		(function(){
			
			_getNodes = function(name, node, model, ctx, controller){
				return custom_Statements[name].getNodes(node, model, ctx, controller);
			};
			
			_renderElements = function(nodes, model, ctx, container, ctr){
				if (nodes == null) 
					return null;
				
				var elements = [];
				builder_build(nodes, model, ctx, container, ctr, elements);
				return elements;
			};
			
			_renderPlaceholder = function(compo, container){
				compo.placeholder = document.createComment('');
				container.appendChild(compo.placeholder);
			};
			
			_compo_initAndBind = function(compo, node, model, ctx, container, controller) {
				
				compo.parent = controller;
				compo.model = model;
				
				compo.refresh = fn_proxy(compo.refresh, compo);
				compo.binder = expression_createBinder(
					compo.expr || compo.expression,
					model,
					ctx,
					controller,
					compo.refresh
				);
				
				
				expression_bind(compo.expr || compo.expression, model, ctx, controller, compo.binder);
			};
			
			
			els_toggle = function(els, state){
				if (els == null) 
					return;
				
				var isArray = typeof els.splice === 'function',
					imax = isArray ? els.length : 1,
					i = -1,
					x;
				while ( ++i < imax ){
					x = isArray ? els[i] : els;
					x.style.display = state ? '' : 'none';
				}
			}
			
		}());
		// end:source 1.utils.js
		// source 2.if.js
		(function(){
			
			mask.registerHandler('+if', {
				meta: {
					serializeNodes: true
				},
				render: function(model, ctx, container, ctr, children){
					
					var node = this,
						nodes = _getNodes('if', node, model, ctx, ctr),
						index = 0;
					
					var next = node;
					while(true){
						
						if (next.nodes === nodes) 
							break;
						
						index++;
						next = node.nextSibling;
						
						if (next == null || next.tagName !== 'else') {
							index = null;
							break;
						}
					}
					
					this.attr['switch-index'] = index;
					
					return _renderElements(nodes, model, ctx, container, ctr, children);
				},
				
				renderEnd: function(els, model, ctx, container, ctr){
					
					var compo = new IFStatement(),
						index = this.attr['switch-index'];
					
					compo.placeholder = document.createComment('');
					container.appendChild(compo.placeholder);
					
					initialize(compo, this, index, els, model, ctx, container, ctr);
					
					
					return compo;
				},
				
				serializeNodes: function(current){
					
					var nodes = [ current ];
					while (true) {
						current = current.nextSibling;
						if (current == null || current.tagName !== 'else') 
							break;
						
						nodes.push(current);
					}
					
					return mask.stringify(nodes);
				}
				
			});
			
			
			function IFStatement() {}
			
			IFStatement.prototype = {
				compoName: '+if',
				ctx : null,
				model : null,
				controller : null,
				
				index : null,
				Switch : null,
				binder : null,
				
				refresh: function() {
					var compo = this,
						switch_ = compo.Switch,
						
						imax = switch_.length,
						i = -1,
						expr,
						item, index = 0;
						
					var currentIndex = compo.index,
						model = compo.model,
						ctx = compo.ctx,
						ctr = compo.controller
						;
					
					while ( ++i < imax ){
						expr = switch_[i].node.expression;
						if (expr == null) 
							break;
						
						if (expression_eval(expr, model, ctx, ctr)) 
							break;
					}
					
					if (currentIndex === i) 
						return;
					
					if (currentIndex != null) 
						els_toggle(switch_[currentIndex].elements, false);
					
					if (i === imax) {
						compo.index = null;
						return;
					}
					
					this.index = i;
					
					var current = switch_[i];
					if (current.elements != null) {
						els_toggle(current.elements, true);
						return;
					}
					
					var frag = mask.render(current.node.nodes, model, ctx, null, ctr);
					var els = frag.nodeType === Node.DOCUMENT_FRAGMENT_NODE
						? _Array_slice.call(frag.childNodes)
						: frag
						;
					
					
					dom_insertBefore(frag, compo.placeholder);
					
					current.elements = els;
					
				},
				dispose: function(){
					var switch_ = this.Switch,
						imax = switch_.length,
						i = -1,
						
						x, expr;
						
					while( ++i < imax ){
						x = switch_[i];
						expr = x.node.expression;
						
						if (expr) {
							expression_unbind(
								expr,
								this.model,
								this.controller,
								this.binder
							);
						}
						
						x.node = null;
						x.elements = null;
					}
					
					this.controller = null;
					this.model = null;
					this.ctx = null;
				}
			};
			
			function initialize(compo, node, index, elements, model, ctx, container, ctr) {
				
				compo.model = model;
				compo.ctx = ctx;
				compo.controller = ctr;
				
				compo.refresh = fn_proxy(compo.refresh, compo);
				compo.binder = expression_createListener(compo.refresh);
				compo.index = index;
				compo.Switch = [{
					node: node,
					elements: null
				}];
				
				expression_bind(node.expression, model, ctx, ctr, compo.binder);
				
				while (true) {
					node = node.nextSibling;
					if (node == null || node.tagName !== 'else') 
						break;
					
					compo.Switch.push({
						node: node,
						elements: null
					});
					
					if (node.expression) 
						expression_bind(node.expression, model, ctx, ctr, compo.binder);
				}
				
				if (index != null) 
					compo.Switch[index].elements = elements;
				
			}
		
			
		}());
		// end:source 2.if.js
		// source 3.switch.js
		(function(){
			
			var $Switch = custom_Statements['switch'],
				attr_SWITCH = 'switch-index'
				;
			
			var _nodes,
				_index;
			
			mask.registerHandler('+switch', {
				meta: {
					serializeNodes: true
				},
				serializeNodes: function(current){
					return mask.stringify(current);
				},
				render: function(model, ctx, container, ctr, children){
					
					var value = expression_eval(this.expression, model, ctx, ctr);
					
					
					resolveNodes(value, this.nodes, model, ctx, ctr);
					
					if (_nodes == null) 
						return null;
					
					this.attr[attr_SWITCH] = _index;
					
					return _renderElements(_nodes, model, ctx, container, ctr, children);
				},
				
				renderEnd: function(els, model, ctx, container, ctr){
					
					var compo = new SwitchStatement(),
						index = this.attr[attr_SWITCH];
					
					_renderPlaceholder(compo, container);
					
					initialize(compo, this, index, els, model, ctx, container, ctr);
					
					return compo;
				}
				
			});
			
			
			function SwitchStatement() {}
			
			SwitchStatement.prototype = {
				compoName: '+switch',
				ctx: null,
				model: null,
				controller: null,
				
				index: null,
				nodes: null,
				Switch: null,
				binder: null,
				
				
				refresh: function(value) {
					
					var compo = this,
						switch_ = compo.Switch,
						
						imax = switch_.length,
						i = -1,
						expr,
						item, index = 0;
						
					var currentIndex = compo.index,
						model = compo.model,
						ctx = compo.ctx,
						ctr = compo.controller
						;
					
					resolveNodes(value, compo.nodes, model, ctx, ctr);
					
					if (_index === currentIndex) 
						return;
					
					if (currentIndex != null) 
						els_toggle(switch_[currentIndex], false);
					
					if (_index == null) {
						compo.index = null;
						return;
					}
					
					this.index = _index;
					
					var elements = switch_[_index];
					if (elements != null) {
						els_toggle(elements, true);
						return;
					}
					
					var frag = mask.render(_nodes, model, ctx, null, ctr);
					var els = frag.nodeType === Node.DOCUMENT_FRAGMENT_NODE
						? _Array_slice.call(frag.childNodes)
						: frag
						;
					
					
					dom_insertBefore(frag, compo.placeholder);
					
					switch_[_index] = els;
					
				},
				dispose: function(){
					expression_unbind(
						this.expr,
						this.model,
						this.controller,
						this.binder
					);
				
					this.controller = null;
					this.model = null;
					this.ctx = null;
					
					var switch_ = this.Switch,
						key,
						els, i, imax
						;
					
					for(key in switch_) {
						els = switch_[key];
						
						if (els == null)
							continue;
						
						imax = els.length;
						i = -1;
						while ( ++i < imax ){
							if (els[i].parentNode != null) 
								els[i].parentNode.removeChild(els[i]);
						}
					}
				}
			};
			
			function resolveNodes(val, nodes, model, ctx, ctr) {
				
				_nodes = $Switch.getNodes(val, nodes, model, ctx, ctr);
				_index = null;
				
				if (_nodes == null) 
					return;
				
				var imax = nodes.length,
					i = -1;
				while( ++i < imax ){
					if (nodes[i].nodes === _nodes) 
						break;
				}
					
				_index = i === imax ? null : i;
			}
			
			function initialize(compo, node, index, elements, model, ctx, container, ctr) {
				
				compo.ctx = ctx;
				compo.expr = node.expression;
				compo.model = model;
				compo.controller = ctr;
				compo.index = index;
				compo.nodes = node.nodes;
				
				compo.refresh = fn_proxy(compo.refresh, compo);
				compo.binder = expression_createBinder(
					compo.expr,
					model,
					ctx,
					ctr,
					compo.refresh
				);
				
				
				compo.Switch = new Array(node.nodes.length);
				
				if (index != null) 
					compo.Switch[index] = elements;
				
				expression_bind(node.expression, model, ctx, ctr, compo.binder);
			}
		
			
		}());
		// end:source 3.switch.js
		// source 4.with.js
		(function(){
			
			var $With = custom_Statements['with'];
				
			mask.registerHandler('+with', {
				meta: {
					serializeNodes: true
				},
				rootModel: null,
				render: function(model, ctx, container, ctr){
					var expr = this.expression,
						nodes = this.nodes,
						val = expression_eval_strict(
							expr, model, ctx, ctr
						)
						;
					this.rootModel = model;
					return build(nodes, val, ctx, container, ctr);
				},
				
				onRenderStartClient: function(model, ctx){
					this.rootModel = model;
					this.model = expression_eval_strict(
						this.expression, model, ctx, this
					);
				},
				
				renderEnd: function(els, model, ctx, container, ctr){
					model = this.rootModel || model;
					
					var compo = new WithStatement(this);
				
					compo.elements = els;
					compo.model = model;
					compo.parent = ctr;
					compo.refresh = fn_proxy(compo.refresh, compo);
					compo.binder = expression_createBinder(
						compo.expr,
						model,
						ctx,
						ctr,
						compo.refresh
					);
					
					expression_bind(compo.expr, model, ctx, ctr, compo.binder);
					
					_renderPlaceholder(compo, container);
					
					return compo;
				}
			});
			
			
			function WithStatement(node){
				this.expr = node.expression;
				this.nodes = node.nodes;
			}
			
			WithStatement.prototype = {
				compoName: '+with',
				elements: null,
				binder: null,
				model: null,
				parent: null,
				refresh: function(val){
					dom_removeAll(this.elements);
					
					if (this.components) {
						var imax = this.components.length,
							i = -1;
						while ( ++i < imax ){
							Compo.dispose(this.components[i]);
						}
						this.components.length = 0;
					}
					
					
					var fragment = document.createDocumentFragment();
					this.elements = build(this.nodes, val, null, fragment, this);
					
					dom_insertBefore(fragment, this.placeholder);
					compo_inserted(this);
				},
				
				
				dispose: function(){
					expression_unbind(
						this.expr,
						this.model,
						this.parent,
						this.binder
					);
				
					this.parent = null;
					this.model = null;
					this.ctx = null;
				}
				
			};
			
			function build(nodes, model, ctx, container, controller){
				var els = [];
				builder_build(nodes, model, ctx, container, controller, els);
				return els;
			}
		}());
		// end:source 4.with.js
		// source 5.visible.js
		(function(){
			var $Visible = custom_Statements['visible'];
				
			mask.registerHandler('+visible', {
				meta: {
					serializeNodes: true
				},
				render: function(model, ctx, container, ctr, childs){
					return build(this.nodes, model, ctx, container, ctr);
				},
				renderEnd: function(els, model, ctx, container, ctr){
					
					var compo = new VisibleStatement(this);
					compo.elements = els;
					compo.model = model;
					compo.parent = ctr;
					compo.refresh = fn_proxy(compo.refresh, compo);
					compo.binder = expression_createBinder(
						compo.expr,
						model,
						ctx,
						ctr,
						compo.refresh
					);
					
					expression_bind(compo.expr, model, ctx, ctr, compo.binder);
					compo.refresh();
					return compo;
				}
			});
			
			
			function VisibleStatement(node){
				this.expr = node.expression;
				this.nodes = node.nodes;
			}
			
			VisibleStatement.prototype = {
				compoName: '+visible',
				elements: null,
				binder: null,
				model: null,
				parent: null,
				refresh: function(){
					var isVisible = expression_eval(
						this.expr, this.model, this.ctx, this
					);
					$Visible.toggle(this.elements, isVisible);
				},
				dispose: function(){
					expression_unbind(
						this.expr,
						this.model,
						this.parent,
						this.binder
					);
				
					this.parent = null;
					this.model = null;
					this.ctx = null;
				}
				
			};
			
			function build(nodes, model, ctx, container, ctr){
				var els = [];
				builder_build(nodes, model, ctx, container, ctr, els);
				return els;
			}
		}());
		// end:source 5.visible.js
		// source loop/exports.js
		(function(){
			
			// source utils.js
			
			
			function arr_createRefs(array){
				var imax = array.length,
					i = -1,
					x;
				while ( ++i < imax ){
					//create references from values to distinguish the models
					x = array[i];
					switch (typeof x) {
					case 'string':
					case 'number':
					case 'boolean':
						array[i] = Object(x);
						break;
					}
				}
			}
			
			
			function list_sort(self, array) {
			
				var compos = self.node.components,
					i = 0,
					imax = compos.length,
					j = 0,
					jmax = null,
					element = null,
					compo = null,
					fragment = document.createDocumentFragment(),
					sorted = [];
			
				for (; i < imax; i++) {
					compo = compos[i];
					if (compo.elements == null || compo.elements.length === 0) 
						continue;
					
					for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
						element = compo.elements[j];
						element.parentNode.removeChild(element);
					}
				}
			
				
				outer: for (j = 0, jmax = array.length; j < jmax; j++) {
			
					for (i = 0; i < imax; i++) {
						if (array[j] === self._getModel(compos[i])) {
							sorted[j] = compos[i];
							continue outer;
						}
					}
				
					console.warn('No Model Found for', array[j]);
				}
			
			
			
				for (i = 0, imax = sorted.length; i < imax; i++) {
					compo = sorted[i];
			
					if (compo.elements == null || compo.elements.length === 0) {
						continue;
					}
			
			
					for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
						element = compo.elements[j];
			
						fragment.appendChild(element);
					}
				}
			
				self.components = self.node.components = sorted;
			
				dom_insertBefore(fragment, self.placeholder);
			
			}
			
			function list_update(self, deleteIndex, deleteCount, insertIndex, rangeModel) {
				
				var node = self.node,
					compos = node.components
					;
				if (compos == null) 
					compos = node.components = []
				
				var prop1 = self.prop1,
					prop2 = self.prop2,
					type = self.type,
					
					ctx = self.ctx,
					ctr = self.node
					;
				
				if (deleteIndex != null && deleteCount != null) {
					var i = deleteIndex,
						length = deleteIndex + deleteCount;
			
					if (length > compos.length) 
						length = compos.length;
					
					for (; i < length; i++) {
						if (compo_dispose(compos[i], node)){
							i--;
							length--;
						}
					}
				}
			
				if (insertIndex != null && rangeModel && rangeModel.length) {
			
					var i = compos.length,
						imax,
						fragment = self._build(node, rangeModel, ctx, ctr),
						new_ = compos.splice(i)
						; 
					compo_fragmentInsert(node, insertIndex, fragment, self.placeholder);
					
					compos.splice.apply(compos, [insertIndex, 0].concat(new_));
					i = 0;
					imax = new_.length;
					for(; i < imax; i++){
						__Compo.signal.emitIn(new_[i], 'domInsert');
					}
				}
			}
			
			function list_remove(self, removed){
				var compos = self.components,
					i = compos.length,
					x;
				while(--i > -1){
					x = compos[i];
					
					if (removed.indexOf(x.model) === -1) 
						continue;
					
					compo_dispose(x, self.node);
				}
			}
			
			
			// end:source utils.js
			// source proto.js
			var LoopStatementProto = {
				model: null,
				parent: null,
				refresh: function(value, method, args, result){
					var i = 0,
						x, imax;
						
					var node = this.node,
						
						model = this.model,
						ctx = this.ctx,
						ctr = this.node
						;
			
					if (method == null) {
						// this was new array/object setter and not an immutable function call
						
						var compos = node.components;
						if (compos != null) {
							var imax = compos.length,
								i = -1;
							while ( ++i < imax ){
								if (compo_dispose(compos[i], node)){
									i--;
									imax--;
								}
							}
							compos.length = 0;
						}
						
						var frag = this._build(node, value, ctx, ctr);
						
						dom_insertBefore(frag, this.placeholder);
						arr_each(node.components, compo_inserted);
						return;
					}
			
					var array = value;
					arr_createRefs(value);
					
			
					switch (method) {
					case 'push':
						list_update(this, null, null, array.length - 1, array.slice(array.length - 1));
						break;
					case 'pop':
						list_update(this, array.length, 1);
						break;
					case 'unshift':
						list_update(this, null, null, 0, array.slice(0, 1));
						break;
					case 'shift':
						list_update(this, 0, 1);
						break;
					case 'splice':
						var sliceStart = args[0],
							sliceRemove = args.length === 1 ? this.components.length : args[1],
							sliceAdded = args.length > 2 ? array.slice(args[0], args.length - 2 + args[0]) : null;
			
						list_update(this, sliceStart, sliceRemove, sliceStart, sliceAdded);
						break;
					case 'sort':
					case 'reverse':
						list_sort(this, array);
						break;
					case 'remove':
						if (result != null && result.length) 
							list_remove(this, result);
						break;
					}
				},
				
				dispose: function(){
					
					expression_unbind(
						this.expr || this.expression, this.model, this.parent, this.binder
					);
				}
			};
			
			// end:source proto.js
			// source for.js
			(function(){
				
				var For = custom_Statements['for'],
				
					attr_PROP_1 = 'for-prop-1',
					attr_PROP_2 = 'for-prop-2',
					attr_TYPE = 'for-type',
					attr_EXPR = 'for-expr'
					;
					
				
				mask.registerHandler('+for', {
					meta: {
						serializeNodes: true
					},
					serializeNodes: function(node){
						return mask.stringify(node);
					},
					render: function(model, ctx, container, ctr, children){
						var directive = For.parseFor(this.expression),
							attr = this.attr;
						
						attr[attr_PROP_1] = directive[0];
						attr[attr_PROP_2] = directive[1];
						attr[attr_TYPE] = directive[2];
						attr[attr_EXPR] = directive[3];
						
						var value = expression_eval_strict(directive[3], model, ctx, ctr);
						if (value == null) 
							return;
						
						if (is_Array(value)) 
							arr_createRefs(value);
						
						For.build(
							value,
							directive,
							this.nodes,
							model,
							ctx,
							container,
							this,
							children
						);
					},
					
					renderEnd: function(els, model, ctx, container, ctr){
						
						var compo = new ForStatement(this, this.attr);
						
						compo.placeholder = document.createComment('');
						container.appendChild(compo.placeholder);
						
						
						
						_compo_initAndBind(compo, this, model, ctx, container, ctr);
						
						return compo;
					},
					
					getHandler: function(name, model){
						
						return For.getHandler(name, model);
					}
					
				});
				
				function initialize(compo, node, els, model, ctx, container, ctr) {
					
					compo.parent = ctr;
					compo.model = model;
					
					compo.refresh = fn_proxy(compo.refresh, compo);
					compo.binder = expression_createBinder(
						compo.expr,
						model,
						ctx,
						ctr,
						compo.refresh
					);
					
					
					expression_bind(compo.expr, model, ctx, ctr, compo.binder);
					
				}
				
				function ForStatement(node, attr) {
					this.prop1 = attr[attr_PROP_1];
					this.prop2 = attr[attr_PROP_2];
					this.type = attr[attr_TYPE];
					this.expr = attr[attr_EXPR];
					
					if (node.components == null) 
						node.components = [];
					
					this.node = node;
					this.components = node.components;
				}
				
				ForStatement.prototype = {
					compoName: '+for',
					model: null,
					parent: null,
					
					refresh: LoopStatementProto.refresh,
					dispose: LoopStatementProto.dispose,
					
					_getModel: function(compo) {
						return compo.scope[this.prop1];
					},
					
					_build: function(node, model, ctx, component) {
						var nodes = For.getNodes(node.nodes, model, this.prop1, this.prop2, this.type);
						
						return builder_build(nodes, this.model, ctx, null, component);
					}
				};
				
			}());
			// end:source for.js
			// source each.js
			(function(){
				
				var Each = custom_Statements['each'];
				
				mask.registerHandler('+each', {
					meta: {
						serializeNodes: true
					},
					serializeNodes: function(node){
						return mask.stringify(node);
					},
					//modelRef: null,
					render: function(model, ctx, container, ctr, children){
						//this.modelRef = this.expression;
						var array = expression_eval(this.expression, model, ctx, ctr);
						if (array == null) 
							return;
						
						arr_createRefs(array);
						
						build(
							this.nodes,
							array,
							ctx,
							container,
							this,
							children
						);
					},
					
					renderEnd: function(els, model, ctx, container, ctr){
						var compo = new EachStatement(this, this.attr);
						
						compo.placeholder = document.createComment('');
						container.appendChild(compo.placeholder);
						
						_compo_initAndBind(compo, this, model, ctx, container, ctr);
						
						return compo;
					}
					
				});
				mask.registerHandler('each::item', EachItem);
				
				function build(nodes, array, ctx, container, ctr, elements) {
					var imax = array.length,
						nodes_ = new Array(imax),
						i = 0, node;
					
					for(; i < imax; i++) {
						node = createEachNode(nodes, i);
						builder_build(node, array[i], ctx, container, ctr, elements);
					}
				}
				
				function createEachNode(nodes, index){
					var item = new EachItem;
					item.scope = { index: index };
					
					return {
						type: Dom.COMPONENT,
						tagName: 'each::item',
						nodes: nodes,
						controller: function() {
							return item;
						}
					};
				}
				
				function EachItem() {}
				EachItem.prototype = {
					compoName: 'each::item',
					scope: null,
					model: null,
					modelRef: null,
					parent: null,
					renderStart: IS_NODE === true
						?  function(){
							var expr = this.parent.expression;
							this.modelRef = ''
								+ (expr === '.' ? '' : ('(' + expr + ')'))
								+ '."'
								+ this.scope.index
								+ '"';
						}
						: null,
					renderEnd: function(els) {
						this.elements = els;
					},
					dispose: function(){
						if (this.elements != null) {
							this.elements.length = 0;
							this.elements = null;
						}
					}
				};
				
				function EachStatement(node, attr) {
					this.expression = node.expression;
					this.nodes = node.nodes;
					
					if (node.components == null) 
						node.components = [];
					
					this.node = node;
					this.components = node.components;
				}
				
				EachStatement.prototype = {
					compoName: '+each',
					refresh: LoopStatementProto.refresh,
					dispose: LoopStatementProto.dispose,
					
					_getModel: function(compo) {
						return compo.model;
					},
					
					_build: function(node, model, ctx, component) {
						var fragment = document.createDocumentFragment();
						
						build(node.nodes, model, ctx, fragment, component);
						
						return fragment;
					}
				};
				
			}());
			// end:source each.js
			
		}());
		
		// end:source loop/exports.js
		
	}());
	// end:source ../src/statements/exports.js

}(Mask, Compo));
