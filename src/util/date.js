var date_ensure;
(function(){
	date_ensure = function(val){
		if (val == null || val === '') 
			return null;
		if (typeof val === 'string') 
			val = new Date(val);
			
		return isNaN(val) === false && typeof val.getFullYear === 'function'
			? val
			: null
			;
	};
}());