var arr_isArray,
	arr_remove,
	arr_each,
	arr_indexOf;
(function(){
	
	arr_isArray = function(x) {
		return x != null
			&& typeof x === 'object'
			&& typeof x.length === 'number'
			&& typeof x.splice === 'function';
	};
	arr_remove = function(array /*, .. */ ) {
		if (array == null) 
			return false;
		
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
	};
	arr_each = function(array, fn) {
		for (var i = 0, length = array.length; i < length; i++) {
			fn(array[i]);
		}
	};
	arr_indexOf = function(arr, x){
		return arr.indexOf(x);
	};
}());
