function arr_remove(array /*, .. */){
	if (array == null) {
		return false;
	}

	var i = 0,
		length = array.length,
		x,
		j = 1,
		jmax = arguments.length,
		removed = 0;

	for(; i < length; i++){
		x = array[i];

		for (j = 1; j<jmax; j++) {
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


function arr_toArray(args) {
	return Array.prototype.slice.call(args);
}



function arr_addObserver(arr, callback) {

	if (arr.__observers == null) {
		Object.defineProperty(arr, '__observers', {
			value: [],
			enumerable: false
		});
	}

	function wrap(method) {
		arr[method] = function() {
			var callbacks = this.__observers,
				args = arr_toArray(arguments),
				result = Array.prototype[method].apply(this, args);


			if (callbacks == null || callbacks.length === 0) {
				return result;
			}


			for(var i = 0, x, length = callbacks.length; i < length; i++){
				x = callbacks[i];
				if (typeof x === 'function') {

					x(this, method, args);
				}
			}

			return result;
		};
	}

	var i = 0,
		fns = ['push', 'unshift', 'splice', 'pop', 'shift', 'reverse', 'sort'],
		length = fns.length;
	for (; i < length; i++) {
		wrap(fns[i]);
	}

	arr.__observers.push(callback);

	arr = null;
}


function arr_each(array, fn) {
	for(var i = 0, length = array.length; i < length; i++){
		fn(array[i]);
	}
}
