var obj_isDefined;
(function(){
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