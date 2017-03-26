var obj_callFn;
(function () {
	obj_callFn = function (obj, path, args) {
		var end = path.lastIndexOf('.');
		if (end === -1) {
			return call(obj, path, args);
		}
		var host = obj,
			i = -1, start;
		while (host !== null) {
			start = i;
			i = path.indexOf('.', i);
			if (i === end)
				break;

			var key = path.substring(start + 1, i);
			host = host[key];
		}
		return call(host, path.substring(end + 1), args);
	};
	function call(obj, key, args) {
		var fn = null;
		if (obj != null)
			fn = obj[key];

		if (typeof fn !== 'function') {
			console.error('Not a function', key);
			return null;
		}
		return fn.apply(obj, args);
	}
}());