var obj_getProperty,
	obj_setProperty,
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
}());