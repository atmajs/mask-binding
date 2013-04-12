var BindingProvider = (function() {

	mask.registerBinding = function(type, binding) {
		Providers[type] = binding;
	};

	mask.BindingProvider = BindingProvider;

	var Providers = {};


	function BindingProvider(model, element, node, bindingType) {

		if (bindingType == null) {
			bindingType = node.compoName === ':bind' ? 'single' : 'dual';
		}

		this.node = node;
		this.model = model;
		this.element = element;
		this.value = node.attr.value;
		this.property = node.attr.property || (bindingType === 'single' ? 'element.innerHTML' : 'element.value');
		this.setter = node.attr.setter;
		this.getter = node.attr.getter;
		this.dismiss = 0;
		this.bindingType = bindingType;

		if (node.attr.expression) {
			this.expression = node.attr.expression;
			if (this.value == null && bindingType !== 'single') {
				var refs = expression_varRefs(this.expression);
				if (typeof refs === 'string') {
					this.value = refs;
				}else{
					console.warn('Please set value attribute in DualBind Control.');
				}
			}
		}else {
			this.expression = this.value;
		}

	}

	BindingProvider.create = function(model, element, node, bindingType) {

		/** Initialize custom provider.
		 * That could be defined by customName or by tagName
		 */
		var type = node.attr.bindingProvider || element.tagName.toLowerCase(),
			CustomProvider = Providers[type],
			provider;

		if (CustomProvider instanceof Function) {
			return new CustomProvider(model, element, node, bindingType);
		}

		provider = new BindingProvider(model, element, node, bindingType);

		if (CustomProvider != null) {
			obj_extend(provider, CustomProvider);
		}


		return apply_bind(provider);
	};


	BindingProvider.prototype = {
		constructor: BindingProvider,
		dispose: function(){
			expression_unbind(this.expression, this.model, this.binder);
		},
		objectChanged: function(x) {
			if (this.dismiss-- > 0) {
				return;
			}

			if (x == null) {
				x = this.objectWay.get(this, this.expression);
			}

			this.domWay.set(this, x);
		},
		domChanged: function() {
			var x = this.domWay.get(this);

			if (this.node.validations) {

				for (var i = 0, validation, length = this.node.validations.length; i < length; i++) {
					validation = this.node.validations[i];
					if (validation.validate(x, this.element, this.objectChanged.bind(this)) === false) {
						return;
					}
				}
			}

			this.dismiss = 1;
			this.objectWay.set(this.model, this.value, x);
			this.dismiss = 0;
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


	obj_extend(BindingProvider, {
		addObserver: obj_addObserver,
		removeObserver: obj_removeObserver
	});

	return BindingProvider;

}());
