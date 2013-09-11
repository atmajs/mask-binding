/**
 *	Resolve object, or if property do not exists - create
 */
function obj_ensure(obj, chain) {
	for (var i = 0, length = chain.length - 1; i < length; i++) {
		var key = chain[i];

		if (obj[key] == null) {
			obj[key] = {};
		}

		obj = obj[key];
	}
	return obj;
}


function obj_getProperty(obj, property) {
		var chain = property.split('.'),
		length = chain.length,
		i = 0;
	for (; i < length; i++) {
		if (obj == null) {
			return null;
		}

		obj = obj[chain[i]];
	}
	return obj;
}


function obj_setProperty(obj, property, value) {
	var chain = property.split('.'),
		length = chain.length,
		i = 0,
		key = null;

	for (; i < length - 1; i++) {
		key = chain[i];
		if (obj[key] == null) {
			obj[key] = {};
		}
		obj = obj[key];
	}

	obj[chain[i]] = value;
}

/*
 * @TODO refactor - add observer to direct parent with path tracking
 *
 * "a.b.c.d" (add observer to "c" on "d" property change)
 * track if needed also "b" and "a"
 */ 

function obj_addObserver(obj, property, callback) {
	
	// closest observer
	var parts = property.split('.'),
		imax  = parts.length,
		i = 0, at = 0, x = obj;
	while (imax--) {
		x = x[parts[i++]];
		if (x == null) {
			break;
		}
		if (x.__observers != null) {
			at = i;
			obj = x;
		}
	}
	if (at > 0) {
		property = parts.slice(at).join('.');
	}
	
	
	if (obj.__observers == null) {
		Object.defineProperty(obj, '__observers', {
			value: {
				__dirty: null
			},
			enumerable: false
		});
	}

	var observers = obj.__observers;

	if (observers[property] != null) {
		observers[property].push(callback);

		var value = obj_getProperty(obj, property);
		if (arr_isArray(value)) {
			arr_addObserver(value, callback);
		}

		return;
	}
    
    observers[property] = [callback];
    
    var currentValue = obj_attachProxy(obj, property, true);
    

	if (arr_isArray(currentValue)) {
		arr_addObserver(currentValue, callback);
	}
}

function obj_attachProxy(obj, property, attachCrumbs) {
    var listeners = obj.__observers[property],
		chain = property.split('.'),
		length = chain.length,
		parent = length > 1
            ? obj_ensure(obj, chain)
            : obj,
		key = chain[length - 1],
		currentValue = parent[key];
        
    if (attachCrumbs && length > 1) {
        obj_defineCrumbs(obj, chain);
    }
        
    if (key === 'length' && arr_isArray(parent)) {
		// we cannot redefine array properties like 'length'
		arr_addObserver(parent, callback);
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
        
    var value = obj[key];
    
    Object.defineProperty(obj, key, {
		get: function() {
			return value;
		},
		set: function(x) {
			if (x === value) 
				return;
			
			value = x;
            rebinder(path);
		}
	});
}

function obj_crumbRebindDelegate(obj) {
    return function(path){
        
        var observers = obj.__observers;
        if (observers == null) 
            return;
        for (var property in observers) {
            if (property.indexOf(path) !== 0) 
                continue;
            
            
            obj_attachProxy(obj, property, false);
            
            var listeners = observers[property],
                imax = listeners.length,
                i = 0;
            if (imax === 0) 
                continue;
            
            var val = obj_getProperty(obj, property);
            for (; i < imax; i++){
                listeners[i](val);
            }
        }
    }
}

function obj_lockObservers(obj) {
	if (arr_isArray(obj)) {
		arr_lockObservers(obj);
		return;
	}

	var obs = obj.__observers;
	if (obs != null) {
		obs.__dirties = {};
	}
}

function obj_unlockObservers(obj) {
	if (arr_isArray(obj)) {
		arr_unlockObservers(obj);
		return;
	}

	var obs = obj.__observers,
		dirties = obs == null ? null : obs.__dirties;

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
}


function obj_removeObserver(obj, property, callback) {
	// nested observer
	var parts = property.split('.'),
		imax  = parts.length,
		i = 0, x = obj;
	while (imax--) {
		x = x[parts[i++]];
		if (x == null) {
			break;
		}
		if (x.__observers != null) {
			obj_removeObserver(obj, parts.slice(i).join('.'), callback);
			break;
		}
	}
	
	
	if (obj.__observers == null || obj.__observers[property] == null) {
		return;
	}

	var currentValue = obj_getProperty(obj, property);
	if (arguments.length === 2) {
		
		delete obj.__observers[property];
		return;
	}

	arr_remove(obj.__observers[property], callback);

	if (arr_isArray(currentValue)) {
		arr_removeObserver(currentValue, callback);
	}

}

function obj_extend(obj, source) {
	if (source == null) {
		return obj;
	}
	if (obj == null) {
		obj = {};
	}
	for (var key in source) {
		obj[key] = source[key];
	}
	return obj;
}


function obj_isDefined(obj, path) {
	if (obj == null) {
		return false;
	}
	
	var parts = path.split('.'),
		imax = parts.length,
		i = 0;
	
	while (imax--) {
		
		if ((obj = obj[parts[i++]]) == null) {
			return false;
		}
	}
	
	return true;
}