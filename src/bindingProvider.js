var BindingProvider = (function() {

	mask.registerBinding = function(type, binding) {
		Providers[type] = binding;
	};

	mask.BindingProvider = BindingProvider;

	var Providers = {};


	function BindingProvider(model, element, controller, bindingType) {

		if (bindingType == null) {
			bindingType = controller.compoName === ':bind' ? 'single' : 'dual';
		}

		var attr = controller.attr;

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
					var type = element.getAttribute('type');
					if ('checkbox' === type) {
						this.property = 'element.checked';
						break;
					}
					this.property = 'element.value';
					break;
				case 'TEXTAREA':
					this.property = 'element.value';
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

		if (attr['x-signal']) {
			var signals = attr['x-signal'].split(';'),
				type, signal;

			for (var i = 0, x, length = signals.length; i < length; i++) {
				x = signals[i].split(':');
				switch (x.length) {
				case 1:
					this.signal_domChanged = x[0];
					break;
				case 2:
					type = x[0].trim();
					signal = x[1].trim();
					if ('dom' === type) {
						this.signal_domChanged = signal;
					}
					if ('object' === type) {
						this.signal_domChanged = signal;
					}
					break;
				}
			}
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
		} else {
			this.expression = this.value;
		}

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


		return apply_bind(provider);
	};


	BindingProvider.prototype = {
		constructor: BindingProvider,
		dispose: function() {
			expression_unbind(this.expression, this.model, this.binder);
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

			this.locked = false;
		},
		domChanged: function() {

			if (this.locked === true) {
				console.warn('Concurance change detected', this);
				return;
			}
			this.locked = true;

			var x = this.domWay.get(this),
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
			}

			this.locked = false;
		},
		objectWay: {
			get: function(provider, expression) {
				return expression_eval(expression, provider.model, provider.cntx, provider);
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
						console.error('Mask.bindings: Getter should be a function', provider.getter, provider);
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



	function apply_bind(provider) {

		var expr = provider.expression,
			model = provider.model,
			onObjChanged = provider.objectChanged = provider.objectChanged.bind(provider);

		provider.binder = expression_createBinder(expr, model, provider.cntx, provider.node, onObjChanged);

		expression_bind(expr, model, provider.cntx, provider.node, provider.binder);

		if (provider.bindingType === 'dual') {
			var element = provider.element,
				eventType = provider.node.attr.changeEvent || 'change',
				onDomChange = provider.domChanged.bind(provider);

			dom_addEventListener(element, eventType, onDomChange);
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
