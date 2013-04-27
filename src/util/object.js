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

function obj_addObserver(obj, property, callback) {
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
		if (value instanceof Array) {
			arr_addObserver(value, callback);
		}

		return;
	}

	var callbacks = observers[property] = [callback],
		chain = property.split('.'),
		length = chain.length,
		parent = length > 1 ? obj_ensure(obj, chain) : obj,
		key = chain[length - 1],
		currentValue = parent[key];

	if (parent instanceof Array) {
		// we cannot redefine array properties like 'length'
		arr_addObserver(parent, callback);
		return;
	}


	Object.defineProperty(parent, key, {
		get: function() {
			return currentValue;
		},
		set: function(x) {
			if (x === currentValue) {
				return;
			}
			currentValue = x;

			if (x instanceof Array) {
				arr_addObserver(x, callback);
			}

			if (observers.__dirties != null) {
				observers.__dirties[property] = 1;
				return;
			}

			for (var i = 0, length = callbacks.length; i < length; i++) {
				callbacks[i](x);
			}
		}
	});

	if (currentValue instanceof Array) {
		arr_addObserver(currentValue, callback);
	}
}


function obj_lockObservers(obj) {
	if (obj instanceof Array) {
		arr_lockObservers(obj);
		return;
	}

	var obs = obj.__observers;
	if (obs != null) {
		obs.__dirties = {};
	}
}

function obj_unlockObservers(obj) {
	if (obj instanceof Array) {
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

	if (obj.__observers == null || obj.__observers[property] == null) {
		return;
	}

	var currentValue = obj_getProperty(obj, property);
	if (arguments.length === 2) {
		obj_setProperty(obj, property, currentValue);
		delete obj.__observers[property];
		return;
	}

	arr_remove(obj.__observers[property], callback);

	if (currentValue instanceof Array) {
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
