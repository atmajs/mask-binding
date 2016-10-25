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
		if (obj == null) {
			log_error('Not possible to add the observer for "' + property + '" as current model is undefined.');
			return;
		}
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
				if (obj_hasObserver(x, parts.slice(i + 1).join('.'), callback))
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
		if (obj == null) {
			log_error('Not possible to remove the observer for "' + property + '" as current model is undefined.');
			return;
		}
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
				obj_removeObserver(x, parts.slice(i + 1).join('.'), callback);
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
				__mutators: null,
				__rebinders: null
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
		prop_DIRTY = '__dirty',
		prop_REBINDERS = '__rebinders';

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
				var oldVal = currentVal;

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

				obj_sub_notifyListeners(obj, property, oldVal)
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
		var cbs = obj[prop_OBS] && obj[prop_OBS][key];
		if (cbs != null) {
			return;
		}

		var value = obj[key],
			old;

		var obs = obj[prop_OBS],
			hash = obj[prop_REBINDERS];
		if (hash == null)
			hash = obj[prop_REBINDERS] = {};

		var arr = hash[key];
		if (arr == null)
			arr = hash[key] = [];

		arr.push([path, rebinder]);

		defineProp_(obj, key, {
			get: function() {
				return value;
			},
			set: function(x) {
				if (x === value)
					return;

				old = value;
				value = x;

				var i = -1, imax = arr.length;
				while(++i < imax) {
					var tuple = arr[i],
						path_ = tuple[0],
						fn_ = tuple[1];
					fn_(path_, old);	
				}
				
			},
			configurable: true,
			enumerable : true
		});
	}
	function obj_sub_notifyListeners(obj, path, oldVal) {
		var obs = obj[prop_OBS];
		if (obs == null)
			return;
		for(var prop in obs) {
			if (prop.indexOf(path + '.') !== 0)
				continue;

			var cbs = obs[prop].slice(0),
				imax = cbs.length,
				i = 0, oldProp, cb;
			if (imax === 0)
				continue;

			var val = obj_getProperty(obj, prop);
			for (i = 0; i < imax; i++) {
				cb = cbs[i];
				obj_removeObserver(obj, prop, cb);

				if (oldVal != null && typeof oldVal === 'object') {
					oldProp = prop.substring(path.length + 1);
					obj_removeObserver(oldVal, oldProp, cb);
				}
			}
			for (i = 0; i < imax; i++){
				cbs[i](val);
			}
			for (i = 0; i < imax; i++){
				obj_addObserver(obj, prop, cbs[i]);
			}
		}
	}

	function obj_crumbRebindDelegate(obj) {
		return function(path, oldValue){
			obj_crumbRebind(obj, path, oldValue);
		};
	}
	function obj_crumbRebind(obj, path, oldValue) {
		var obs = obj[prop_OBS];
		if (obs == null)
			return;

		for (var prop in obs) {
			if (prop.indexOf(path) !== 0)
				continue;

			var cbs = obs[prop].slice(0),
				imax = cbs.length,
				i = 0;

			if (imax === 0)
				continue;

			var val = obj_getProperty(obj, prop),
				oldProp = prop.substring(path.length),
				oldVal = obj_getProperty(oldValue, oldProp);

			for (i = 0; i < imax; i++) {
				var cb = cbs[i];
				obj_removeObserver(obj, prop, cb);

				if (oldValue != null && typeof oldValue === 'object') {
					obj_removeObserver(oldValue, oldProp, cb);
				}
			}
			if (oldVal !== val) {
				for (i = 0; i < imax; i++){
					cbs[i](val);
				}
			}


			for (i = 0; i < imax; i++){
				obj_addObserver(obj, prop, cbs[i]);
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