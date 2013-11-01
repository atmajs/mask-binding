
function arr_isArray(x) {
	return x != null && typeof x === 'object' && x.length != null && typeof x.splice === 'function';
}

function arr_remove(array /*, .. */ ) {
	if (array == null) {
		return false;
	}

	var i = 0,
		length = array.length,
		x, j = 1,
		jmax = arguments.length,
		removed = 0;

	for (; i < length; i++) {
		x = array[i];

		for (j = 1; j < jmax; j++) {
			if (arguments[j] === x) {

				array.splice(i, 1);
				i--;
				length--;
				removed++;
				break;
			}
		}
	}
	return removed + 1 === jmax;
}


function arr_addObserver(arr, callback) {

	if (arr.__observers == null) {
		Object.defineProperty(arr, '__observers', {
			value: {
				__dirty: null
			},
			enumerable: false
		});
	}
	
	var observers = arr.__observers.__array;
	if (observers == null) {
		observers = arr.__observers.__array = [];
	}
	
	if (observers.length === 0) {
		// create wrappers for first time
		var i = 0,
			fns = [
				// native mutators
				'push',
				'unshift',
				'splice',
				'pop',
				'shift',
				'reverse',
				'sort',
				
				// collections mutator
				'remove'],
			length = fns.length,
			fn,
			method;
	
		for (; i < length; i++) {
			method = fns[i];
			fn = arr[method];
			
			if (fn != null) {
				arr[method] = _array_createWrapper(arr, fn, method);
			}

		}
	}

	observers[observers.length++] = callback;
}

function arr_removeObserver(arr, callback) {
	var obs = arr.__observers && arr.__observers.__array;
	if (obs != null) {
		for (var i = 0, imax = obs.length; i < imax; i++) {
			if (obs[i] === callback) {
				obs[i] = null;

				for (var j = i; j < imax; j++) {
					obs[j] = obs[j + 1];
				}
				
				imax--;
				obs.length--;
			}
		}
	}
}

function arr_lockObservers(arr) {
	if (arr.__observers != null) {
		arr.__observers.__dirty = false;
	}
}

function arr_unlockObservers(arr) {
	var list = arr.__observers,
		obs = list && list.__array;
		
	if (obs != null) {
		if (list.__dirty === true) {
			for (var i = 0, x, imax = obs.length; i < imax; i++) {
				x = obs[i];
				if (typeof x === 'function') {
					x(arr);
				}
			}
			list.__dirty = null;
		}
	}
}

function _array_createWrapper(array, originalFn, overridenFn) {
	return function() {
		return _array_methodWrapper(array, originalFn, overridenFn, __array_slice.call(arguments));
	};
}


function _array_methodWrapper(array, original, method, args) {
	var callbacks = array.__observers && array.__observers.__array,
		result = original.apply(array, args);


	if (callbacks == null || callbacks.length === 0) {
		return result;
	}

	if (array.__observers.__dirty != null) {
		array.__observers.__dirty = true;
		return result;
	}

	var i = 0,
		imax = callbacks.length,
		x;
	for (; i < imax; i++) {
		x = callbacks[i];
		if (typeof x === 'function') {
			x(array, method, args, result);
		}
	}

	return result;
}


function arr_each(array, fn) {
	for (var i = 0, length = array.length; i < length; i++) {
		fn(array[i]);
	}
}
//////
//////function arr_invoke(functions) {
//////	for(var i = 0, x, imax = functions.length; i < imax; i++){
//////		x = functions[i];
//////
//////		switch (arguments.length) {
//////			case 1:
//////				x();
//////				break;
//////			case 2:
//////				x(arguments[1]);
//////				break;
//////			case 3:
//////				x(arguments[1], arguments[2]);
//////				break;
//////			case 4:
//////				x(arguments[1], arguments[2], arguments[3]);
//////				break;
//////			case 5:
//////				x(arguments[1], arguments[2], arguments[3], arguments[4]);
//////				break;
//////			default:
//////				x.apply(null, __array_slice.call(arguments, 1));
//////				break;
//////		}
//////	}
//////}
