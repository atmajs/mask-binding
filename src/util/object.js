/**
 *	Resolve object, of if property do not exists - create
 */
function obj_ensure(obj, chain) {
	for (var i = 0, length = chain.length - 1; i < length; i++) {
		var key = chain.shift();

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
			value: {},
			enumerable: false
		});
	}

	if (obj.__observers[property]) {
		obj.__observers[property].push(callback);

		var value = obj_getProperty(obj, property);
		if (value instanceof Array) {
			arr_addObserver(value, callback);
		}

		return;
	}

	var observers = obj.__observers[property] = [callback],
		chain = property.split('.'),
		parent = chain.length > 1 ? obj_ensure(obj, chain) : obj,
		key = chain[0],
		currentValue = parent[key];



	Object.defineProperty(parent, key, {
		get: function() {
			return currentValue;
		},
		set: function(x) {
			currentValue = x;

			for (var i = 0, length = observers.length; i < length; i++) {
				observers[i](x);
			}

			if (currentValue instanceof Array) {
				arr_addObserver(currentValue, callback);
			}
		}
	});

	if (currentValue instanceof Array) {
		arr_addObserver(currentValue, callback);
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
		arr_remove(currentValue.__observers, callback);
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
