var date_addObserver,
	date_removeObserver,
	date_ensure;

(function(){
	date_addObserver = function(date, cb){
		var obs = obj_ensureObserversProperty(date, '__date');
		if (obs.length === 0) {
			// create wrappers for first time
			var i = 0,
				fns = [
					'Date',
					'FullYear',
					'Hours',
					'Milliseconds',
					'Minutes',
					'Month',
					'Seconds',
					'Time',
					'UTCDate',
					'UTCFullYear',
					'UTCHours',
					'UTCMilliseconds',
					'UTCMinutes',
					'UTCMonth',
					'UTCSeconds'
				],
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
		obs[obs.length++] = callback;
	};
	
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