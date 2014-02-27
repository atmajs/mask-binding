
var obj_getProperty,
	obj_setProperty,
	obj_addObserver,
	obj_hasObserver,
	obj_removeObserver,
	obj_lockObservers,
	obj_unlockObservers,
	obj_extend,
	obj_isDefined
	;

(function(){

	obj_getProperty = function(obj, property) {
		var chain = property.split('.'),
			imax = chain.length,
			i = -1;
		while ( ++i < imax ) {
			if (obj == null) 
				return null;
			
			obj = obj[chain[i]];
		}
		return obj;
	};
	
	
	obj_setProperty = function(obj, property, value) {
		var chain = property.split('.'),
			imax = chain.length - 1,
			i = -1,
			key;
		while ( ++i < imax ) {
			key = chain[i];
			if (obj[key] == null) 
				obj[key] = {};
			
			obj = obj[key];
		}
		obj[chain[i]] = value;
	};

	obj_addObserver = function(obj, property, callback) {
		
		// closest observer
		var parts = property.split('.'),
			imax  = parts.length,
			i = -1,
			x = obj;
		while ( ++i < imax ) {
			x = x[parts[i]];
			
			if (x == null) 
				break;
			
			if (x.__observers != null) {
				
				var prop = parts.slice(i + 1).join('.');
				
				if (x.__observers[prop]) {
					
					listener_push(x, prop, callback);
					
					var listeners = listener_push(obj, property, callback);
					if (listeners.length === 1) {
						var arr = parts.splice(0, i);
						if (arr.length !== 0) 
							obj_attachProxy(obj, property, listeners, arr, true);
					}
					
					
					return;
				}
			}
		}
		
		var listeners = listener_push(obj, property, callback);
		
		if (listeners.length === 1) 
			obj_attachProxy(obj, property, listeners, parts, true);
		
		
		var val = obj_getProperty(obj, property);
		if (arr_isArray(val)) 
			arr_addObserver(val, callback);
		
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
			
			if (x.__observers != null) {
				if (obj_hasObserver(x, parts.slice(i).join('.'), callback))
					return true;
				
				break;
			}
		}
		
		var obs = obj.__observers;
		if (obs == null || obs[property] == null) 
			return false;
		
		return arr_indexOf(obs[property], callback) !== -1;
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
			
			if (x.__observers != null) {
				obj_removeObserver(x, parts.slice(i).join('.'), callback);
				break;
			}
		}
		
		
		var obs = obj.__observers;
		if (obs == null || obs[property] == null) 
			return;
		
	
		var currentValue = obj_getProperty(obj, property);
		if (arguments.length === 2) {
			// <callback> not provided -> remove all observers	
			obs[property].length = 0;
			return;
		}
	
		arr_remove(obs[property], callback);
	
		if (arr_isArray(currentValue)) 
			arr_removeObserver(currentValue, callback);
	};
	
	
	obj_lockObservers = function(obj) {
		if (arr_isArray(obj)) {
			arr_lockObservers(obj);
			return;
		}
	
		var obs = obj.__observers;
		if (obs != null) 
			obs.__dirties = {};
	};
	
	obj_unlockObservers = function(obj) {
		if (arr_isArray(obj)) {
			arr_unlockObservers(obj);
			return;
		}
	
		var obs = obj.__observers,
			dirties = obs == null
				? null
				: obs.__dirties
				;
		if (dirties != null) {
			for (var prop in dirties) {
				var callbacks = obj.__observers[prop],
					value = obj_getProperty(obj, prop);
	
				if (callbacks != null) {
					for(var i = 0, imax = callbacks.length; i < imax; i++){
						callbacks[i](value);
					}
				}
			}
			obs.__dirties = null;
		}
	};
	
	
	obj_extend = function(obj, source) {
		if (source == null) 
			return obj;
		
		if (obj == null) 
			obj = {};
		
		for (var key in source) {
			obj[key] = source[key];
		}
		return obj;
	};
	
	
	obj_isDefined = function(obj, path) {
		if (obj == null) 
			return false;
		
		var parts = path.split('.'),
			imax = parts.length,
			i = -1;
		
		while ( ++i < imax ) {
			
			if ((obj = obj[parts[i]]) == null) 
				return false;
		}
		
		return true;
	};

	
	//Resolve object, or if property do not exists - create
	function obj_ensure(obj, chain) {
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
	};
	
	
	function obj_attachProxy(obj, property, listeners, chain) {
		var length = chain.length,
			parent = length > 1
				? obj_ensure(obj, chain)
				: obj,
			key = chain[length - 1],
			currentValue = parent[key];
			
		if (length > 1) {
			obj_defineCrumbs(obj, chain);
		}
			
		if (key === 'length' && arr_isArray(parent)) {
			// we cannot redefine array properties like 'length'
			arr_addObserver(parent, function(array, method, args, result){
				var imax = listeners.length,
					i = -1
					;
				while ( ++i < imax ) {
					listeners[i](array, method, args, result);
				}
			});
			return currentValue;
		}
		
		Object.defineProperty(parent, key, {
			get: function() {
				return currentValue;
			},
			set: function(x) {
				var i = 0,
					imax = listeners.length;
				
				if (x === currentValue) 
					return;
				
				currentValue = x;
	
				if (arr_isArray(x)) {
					for (i = 0; i< imax; i++) {
						arr_addObserver(x, listeners[i]);
					}
				}
	
				if (listeners.__dirties != null) {
					listeners.__dirties[property] = 1;
					return;
				}
	
				for (i = 0; i < imax; i++) {
					listeners[i](x);
				}
			},
			configurable: true
		});
	
		
		return currentValue;
	}
	
	function obj_defineCrumbs(obj, chain) {
		var rebinder = obj_crumbRebindDelegate(obj),
			path = '',
			key;
			
		for (var i = 0, imax = chain.length - 1; i < imax; i++) {
			key = chain[i];
			path += key + '.';
			
			obj_defineCrumb(path, obj, key, rebinder);
			
			obj = obj[key];
		}
	}
	
	function obj_defineCrumb(path, obj, key, rebinder) {
			
		var value = obj[key],
			old;
		
		Object.defineProperty(obj, key, {
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
			configurable: true
		});
	}
	
	function obj_crumbRebindDelegate(obj) {
		return function(path, oldValue){
			
			var observers = obj.__observers;
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
	function listener_push(obj, property, callback) {
		if (obj.__observers == null) {
			Object.defineProperty(obj, '__observers', {
				value: {
					__dirty: null
				},
				enumerable: false
			});
		}
		var obs = obj.__observers;
		if (obs[property] != null) {
			
			if (arr_indexOf(obs[property], callback) === -1) 
				obs[property].push(callback);
		}
		else{
			obs[property] = [callback];
		}
		
		return obs[property];
	}
	
}());





