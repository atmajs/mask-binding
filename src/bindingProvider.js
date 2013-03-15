
var Providers = {};

mask.registerBinding = function(type, binding) {
	Providers[type] = binding;
};

mask.BindingProvider = BindingProvider;

function BindingProvider(model, element, node, bindingType){
	if (this.constructor === BindingProvider) {

		/** Initialize custom provider.
		 * That could be defined by customName or by tagName
		 */

		var type = node.attr.bindingProvider || element.tagName.toLowerCase();

		if (Providers[type] instanceof Function) {
			return new Providers[type](model, element, node);
		} else {
			extendObject(this, Providers[type]);
		}
	}

	if (bindingType == null){
		bindingType = node.compoName === ':bind' ? 'single' : 'dual';
	}


	this.node = node;
	this.model = model;
	this.element = element;
	this.property = node.attr.property || (bindingType === 'single' ? 'element.innerHTML' : 'element.value');
	this.setter = node.attr.setter;
	this.getter = node.attr.getter;
	this.dismiss = 0;


	addObjectObserver(model, node.attr.value, this.objectChanged.bind(this));


	if (bindingType !== 'single'){
		addEventListener(element, node.attr.changeEvent || 'change', this.domChanged.bind(this));
	}

	this.objectChanged();
	return this;

}


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

		if (x instanceof Array && x.hasObserver !== true) {
			observeArray(x, this.objectChanged.bind(this));
		}
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

			if (property[0] === ':'){
				return mask.Utils.ConditionUtil.condition(property.substring(1));
			}

			return getProperty(obj, property);
		},
		set: function(obj, property, value) {
			setProperty(obj, property, value);
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
				return provider.node.parent[provider.getter]();
			}
			return getProperty(provider, provider.property);
		},
		set: function(provider, value) {
			if (provider.setter) {
				provider.node.parent[provider.setter](value);
			} else {
				setProperty(provider, provider.property, value);
			}

		}
	}
};
