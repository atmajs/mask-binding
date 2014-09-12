var DomObjectTransport;
(function(){
	
	var objectWay = {
		get: function(provider, expression) {
			return expression_eval(expression, provider.model, provider.cntx, provider.controller);
		},
		set: function(obj, property, value) {
			obj_setProperty(obj, property, value);
		}
	};
	var domWay  = {
		get: function(provider) {
			var getter = provider.getter;
			if (getter == null) {
				return obj_getProperty(provider, provider.property);
			}
			var ctr = provider.node.parent;
			if (isValidFn_(ctr, getter, 'Getter') === false) {
				return null;
			}
			return ctr[getter]();
		},
		set: function(provider, value) {
			var setter = provider.setter;
			if (setter == null) {
				obj_setProperty(provider, provider.property, value);
				return;
			}
			var ctr = provider.node.parent;
			if (isValidFn_(ctr, setter, 'Setter') === false) {
				return;
			}
			ctr[setter](value);
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
				return  i === -1
					? ''
					: el.options[i].getAttribute('name')
					;
			},
			set: function(provider, val) {
				var el = provider.element,
					options = el.options,
					imax = options.length,
					i = -1;
				while( ++i < imax ){
					/* jshint eqeqeq: false */
					if (options[i].getAttribute('name') == val) {
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
			log_error('BindingProvider.', name, 'should be a function. Property:', prop);
			return false;
		}
		return true;
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
