var BindingProvider = (function() {
	var Providers = {};
	
	mask.registerBinding = function(type, binding) {
		Providers[type] = binding;
	};

	mask.BindingProvider = BindingProvider;
	
	function BindingProvider(model, element, controller, bindingType) {

		if (bindingType == null) {
			bindingType = controller.compoName === ':bind' ? 'single' : 'dual';
		}

		var attr = controller.attr,
			type;

		this.node = controller; // backwards compat.
		this.controller = controller;

		this.model = model;
		this.element = element;
		this.value = attr.value;
		this.property = attr.property;
		this.setter = controller.attr.setter;
		this.getter = controller.attr.getter;
		this.dismiss = 0;
		this.bindingType = bindingType;
		this.log = false;
		this.signal_domChanged = null;
		this.signal_objectChanged = null;
		this.locked = false;

		if (this.property == null) {

			switch (element.tagName) {
				case 'INPUT':
					type = element.getAttribute('type');
					if ('checkbox' === type) {
						this.property = 'element.checked';
						break;
					}
					this.property = 'element.value';
					break;
				case 'TEXTAREA':
					this.property = 'element.value';
					break;
				case 'SELECT':
					this.domWay = DomWaysProto.SELECT;
					break;
				default:
					this.property = 'element.innerHTML';
					break;
			}
		}

		if (attr['log']) {
			this.log = true;
			if (attr.log !== 'log') {
				this.logExpression = attr.log;
			}
		}

		/**
		 *	Send signal on OBJECT or DOM change
		 */
		if (attr['x-signal']) {
			var signal = signal_parse(attr['x-signal'], null, 'dom')[0];
			
			if (signal) {
					
				if (signal.type === 'dom') {
					this.signal_domChanged = signal.signal;
				}
				
				else if (signal.type === 'object') {
					this.signal_objectChanged = signal.signal;
				}
				
				else {
					console.error('Type is not supported', signal);
				}
			}
			
		}
		
		if (attr['x-pipe-signal']) {
			var signal = signal_parse(attr['x-pipe-signal'], true, 'dom')[0];
			if (signal) {
				if (signal.type === 'dom') {
					this.pipe_domChanged = signal;
				}
				
				else if (signal.type === 'object') {
					this.pipe_objectChanged = signal;
				}
				
				else {
					console.error('Type is not supported', signal)
				}
			}
		}
		
		
		if (attr['dom-slot']) {
			this.slots = {};
			// @hack - place dualb. provider on the way of a signal
			// 
			var parent = controller.parent,
				newparent = parent.parent;
				
			parent.parent = this;
			this.parent = newparent;
			
			this.slots[attr['dom-slot']] = function(sender, value){
				this.domChanged(sender, value);
			}
		}
		
		/*
		 *  @obsolete: attr name : 'x-pipe-slot'
		 */
		var pipeSlot = attr['object-pipe-slot'] || attr['x-pipe-slot'];
		if (pipeSlot) {
			var str = pipeSlot,
				index = str.indexOf('.'),
				pipeName = str.substring(0, index),
				signal = str.substring(index + 1);
			
			this.pipes = {};
			this.pipes[pipeName] = {};
			this.pipes[pipeName][signal] = function(){
				this.objectChanged();
			};
			
			__Compo.pipe.addController(this);
		}


		if (attr.expression) {
			this.expression = attr.expression;
			if (this.value == null && bindingType !== 'single') {
				var refs = expression_varRefs(this.expression);
				if (typeof refs === 'string') {
					this.value = refs;
				} else {
					console.warn('Please set value attribute in DualBind Control.');
				}
			}
			return;
		}
		
		this.expression = this.value;
	}
	
	BindingProvider.create = function(model, element, controller, bindingType) {

		/* Initialize custom provider */
		var type = controller.attr.bindingProvider,
			CustomProvider = type == null ? null : Providers[type],
			provider;

		if (typeof CustomProvider === 'function') {
			return new CustomProvider(model, element, controller, bindingType);
		}

		provider = new BindingProvider(model, element, controller, bindingType);

		if (CustomProvider != null) {
			obj_extend(provider, CustomProvider);
		}


		return provider;
	};
	
	BindingProvider.bind = function(provider){
		return apply_bind(provider);
	}


	BindingProvider.prototype = {
		constructor: BindingProvider,
		
		//////handlers: {
		//////	attr: {
		//////		'x-signal': function(provider, value){
		//////			var signal = signal_parse(value, null, 'dom')[0];
		//////	
		//////			if (signal) {
		//////					
		//////				if (signal.type === 'dom') {
		//////					provider.signal_domChanged = signal.signal;
		//////				}
		//////				
		//////				else if (signal.type === 'object') {
		//////					provider.signal_objectChanged = signal.signal;
		//////				}
		//////				
		//////				else {
		//////					console.error('Type is not supported', signal);
		//////				}
		//////			}
		//////		}
		//////	}
		//////},
		
		dispose: function() {
			expression_unbind(this.expression, this.model, this.controller, this.binder);
		},
		objectChanged: function(x) {
			if (this.dismiss-- > 0) {
				return;
			}
			if (this.locked === true) {
				console.warn('Concurance change detected', this);
				return;
			}
			this.locked = true;

			if (x == null) {
				x = this.objectWay.get(this, this.expression);
			}

			this.domWay.set(this, x);

			if (this.log) {
				console.log('[BindingProvider] objectChanged -', x);
			}
			if (this.signal_objectChanged) {
				signal_emitOut(this.node, this.signal_objectChanged, [x]);
			}
			
			if (this.pipe_objectChanged) {
				var pipe = this.pipe_objectChanged;
				__Compo.pipe(pipe.pipe).emit(pipe.signal);
			}

			this.locked = false;
		},
		domChanged: function(event, value) {

			if (this.locked === true) {
				console.warn('Concurance change detected', this);
				return;
			}
			this.locked = true;

			var x = value || this.domWay.get(this),
				valid = true;

			if (this.node.validations) {

				for (var i = 0, validation, length = this.node.validations.length; i < length; i++) {
					validation = this.node.validations[i];
					if (validation.validate(x, this.element, this.objectChanged.bind(this)) === false) {
						valid = false;
						break;
					}
				}
			}

			if (valid) {
				this.dismiss = 1;
				this.objectWay.set(this.model, this.value, x);
				this.dismiss = 0;

				if (this.log) {
					console.log('[BindingProvider] domChanged -', x);
				}

				if (this.signal_domChanged) {
					signal_emitOut(this.node, this.signal_domChanged, [x]);
				}
				
				if (this.pipe_domChanged) {
					var pipe = this.pipe_domChanged;
					__Compo.pipe(pipe.pipe).emit(pipe.signal);
				}	
			}

			this.locked = false;
		},
		objectWay: {
			get: function(provider, expression) {
				return expression_eval(expression, provider.model, provider.cntx, provider.controller);
			},
			set: function(obj, property, value) {
				obj_setProperty(obj, property, value);
			}
		},
		/**
		 * usually you have to override this object, while getting/setting to element,
		 * can be very element(widget)-specific thing
		 *
		 * Note: The Functions are static
		 */
		domWay: {
			get: function(provider) {
				if (provider.getter) {
					var controller = provider.node.parent;

					// if DEBUG
					if (controller == null || typeof controller[provider.getter] !== 'function') {
						console.error('Mask.bindings: Getter should be a function', provider.getter, provider);
						return null;
					}
					// endif

					return controller[provider.getter]();
				}
				return obj_getProperty(provider, provider.property);
			},
			set: function(provider, value) {
				if (provider.setter) {
					var controller = provider.node.parent;

					// if DEBUG
					if (controller == null || typeof controller[provider.setter] !== 'function') {
						console.error('Mask.bindings: Setter should be a function', provider.setter, provider);
						return;
					}
					// endif

					controller[provider.setter](value);
				} else {
					obj_setProperty(provider, provider.property, value);
				}

			}
		}
	};
	
	var DomWaysProto = {
		SELECT: {
			get: function(provider) {
				var element = provider.element;
				
				if (element.selectedIndex === -1) {
					return '';
				}
				
				return element.options[element.selectedIndex].getAttribute('name');
			},
			set: function(provider, value) {
				var element = provider.element;
				
				for (var i = 0, x, imax = element.options.length; i < imax; i++){
					x = element.options[i];
					
					if (x.getAttribute('name') === value) {
						element.selectedIndex = i;
						return;
					}
				}

			}
		}
	};



	function apply_bind(provider) {

		var expr = provider.expression,
			model = provider.model,
			onObjChanged = provider.objectChanged = provider.objectChanged.bind(provider);

		provider.binder = expression_createBinder(expr, model, provider.cntx, provider.node, onObjChanged);

		expression_bind(expr, model, provider.cntx, provider.node, provider.binder);

		if (provider.bindingType === 'dual') {
			var attr = provider.node.attr;
			
			if (!attr['change-slot'] && !attr['change-pipe-event']) {
				var element = provider.element,
					/*
					 * @obsolete: attr name : 'changeEvent'
					 */
					eventType = attr['change-event'] || attr.changeEvent || 'change',
					onDomChange = provider.domChanged.bind(provider);
	
				dom_addEventListener(element, eventType, onDomChange);
			}
		}

		// trigger update
		provider.objectChanged();
		return provider;
	}

	function signal_emitOut(controller, signal, args) {
		var slots = controller.slots;
		if (slots != null && typeof slots[signal] === 'function') {
			if (slots[signal].apply(controller, args) === false) {
				return;
			}
		}

		if (controller.parent != null) {
			signal_emitOut(controller.parent, signal, args);
		}
	}


	obj_extend(BindingProvider, {
		addObserver: obj_addObserver,
		removeObserver: obj_removeObserver
	});

	return BindingProvider;

}());
