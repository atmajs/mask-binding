var DomObjectTransport;
(function(){
	
	var objectWay = {
		get: function(provider, expression) {
			var getter = provider.objGetter;
			if (getter == null) {
				return expression_eval(
					expression
					, provider.model
					, provider.ctx
					, provider.ctr
				);
			}
			
			var obj = getAccessorObject_(provider, getter);
			if (obj == null) 
				return null;
			
			return obj[getter](expression, provider.model, provider.ctr.parent);
		},
		set: function(obj, property, value, provider) {
			var setter = provider.objSetter;
			if (setter == null) {
				obj_setProperty(obj, property, value);
				return;
			}
			var ctx = getAccessorObject_(provider, setter);
			if (ctx == null) 
				return;
			
			ctx[setter](
				property
				, value
				, provider.model
				, provider.ctr.parent
			);
		}
	};
	var domWay  = {
		get: function(provider) {
			var getter = provider.domGetter;
			if (getter == null) {
				return obj_getProperty(provider, provider.property);
			}
			var ctr = provider.ctr.parent;
			if (isValidFn_(ctr, getter, 'Getter') === false) {
				return null;
			}
			return ctr[getter](provider.element);
		},
		set: function(provider, value) {
			var setter = provider.domSetter;
			if (setter == null) {
				obj_setProperty(provider, provider.property, value);
				return;
			}
			var ctr = provider.ctr.parent;
			if (isValidFn_(ctr, setter, 'Setter') === false) {
				return;
			}
			ctr[setter](value, provider.element);
		}
	};
	var DateTimeDelegate = {
		domSet: function(format){
			return function(prov, val){
				var date = date_ensure(val);
				prov.element.value = date == null ? '' : format(date);
			}
		},
		objSet: function(extend){
			return function(obj, prop, val){
				
				var date = date_ensure(val);
				if (date == null) 
					return;
				
				var target = date_ensure(obj_getProperty(obj, prop));
				if (target == null) {
					obj_setProperty(obj, prop, date);
					return;
				}
				extend(target, date);
			}
		}
	};
	
	DomObjectTransport = {
		// generic
		objectWay: objectWay,
		domWay: domWay,
		
		SELECT: {
			get: function(provider) {
				var el = provider.element,
					i = el.selectedIndex;
				if (i === -1) 
					return '';
				
				var opt = el.options[i],
					val = opt.getAttribute('value');
				return val == null
					? opt.getAttribute('name') /* obsolete */
					: val
					;
			},
			set: function(provider, val) {
				var el = provider.element,
					options = el.options,
					imax = options.length,
					opt, x, i;
				for(i = 0; i < imax; i++){
					opt = options[i];
					x = opt.getAttribute('value');
					if (x == null) 
						x = opt.getAttribute('name');
					
					/* jshint eqeqeq: false */
					if (x == val) {
						/* jshint eqeqeq: true */
						el.selectedIndex = i;
						return;
					}
				}
				log_warn('Value is not an option', val);
			}
		},
		DATE: {
			domWay: {
				get: domWay.get,
				set: function(prov, val){
					var date = date_ensure(val);
					prov.element.value = date == null ? '' : formatDate(date);
				}
			},
			objectWay: {
				get: objectWay.get,
				set: DateTimeDelegate.objSet(function(a, b){
					a.setFullYear(b.getFullYear());
					a.setMonth(b.getMonth());
					a.setDate(b.getDate());
				})
			}
		},
		TIME: {
			domWay: {
				get: domWay.get,
				set: DateTimeDelegate.domSet(formatTime)
			},
			objectWay: {
				get: objectWay.get,
				set: DateTimeDelegate.objSet(function(a, b){
					a.setHours(b.getHours())
					a.setMinutes(b.getMinutes());
					a.setSeconds(b.getSeconds());
				})
			}
		}
		
	};
	
	function isValidFn_(obj, prop, name) {
		if (obj== null || typeof obj[prop] !== 'function') {
			log_error('BindingProvider. Controllers accessor.', name, 'should be a function. Property:', prop);
			return false;
		}
		return true;
	}
	function getAccessorObject_(provider, accessor) {
		var ctr = provider.ctr.parent;
		if (ctr[accessor] != null) 
			return ctr;
		var model = provider.model;
		if (model[accessor] != null) 
			return model;
		
		log_error('BindingProvider. Accessor `', accessor, '`should be a function');
		return null;
	}
	function formatDate(date) {
		var YYYY = date.getFullYear(),
			MM = date.getMonth() + 1,
			DD = date.getDate();
		return YYYY
			+ '-'
			+ (MM < 10 ? '0' : '')
			+ (MM)
			+ '-'
			+ (DD < 10 ? '0' : '')
			+ (DD)
			;
	}
	function formatTime(date) {
		var H = date.getHours(),
			M = date.getMinutes();
		return H
			+ ':'
			+ (M < 10 ? '0' : '')
			+ (M)
			;
	}
}());
