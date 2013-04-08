var BindingProvider = (function() {

	mask.registerBinding = function(type, binding) {
		Providers[type] = binding;
	};

	var Providers = {},
		Expression = mask.Utils.Expression;


	function BindingProvider(model, element, node, bindingType) {

		if (bindingType == null) {
			bindingType = node.compoName === ':bind' ? 'single' : 'dual';
		}

		this.node = node;
		this.model = model;
		this.element = element;
		this.property = node.attr.property || (bindingType === 'single' ? 'element.innerHTML' : 'element.value');
		this.setter = node.attr.setter;
		this.getter = node.attr.getter;
		this.dismiss = 0;
		this.bindingType = bindingType;

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
		objectChanged: function(x) {
			if (this.dismiss-- > 0) {
				return;
			}

			if (x == null) {
				x = this.objectWay.get(this.model, this.node.attr.value);
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
			this.objectWay.set(this.model, this.node.attr.value, x);
			this.dismiss = 0;
		},
		objectWay: {
			get: function(obj, property) {

				if (property[0] === ':') {
					return Expression.eval(property.substring(1), obj);
				}

				return obj_getProperty(obj, property);
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

		var value = provider.node.attr.value,
			model = provider.model,
			onObjChange = provider.objectChanged = provider.objectChanged.bind(provider);

		obj_addObserver(model, value, onObjChange);


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


	return BindingProvider;

}());
