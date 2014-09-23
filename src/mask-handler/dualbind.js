/**
 *	Mask Custom Handler
 *
 *	2 Way Data Model binding
 *
 *
 *	attr =
 *		value: {string} - property path in object
 *		?property : {default} 'element.value' - value to get/set from/to HTMLElement
 *		?changeEvent: {default} 'change' - listen to this event for HTMLELement changes
 *
 *		?setter: {string} - setter function of a parent controller
 *		?getter: {string} - getter function of a parent controller
 *
 *
 */

function DualbindHandler() {}

__mask_registerHandler(':dualbind', DualbindHandler);



DualbindHandler.prototype = {
	constructor: DualbindHandler,

	renderEnd: function(elements, model, cntx, container) {
		this.provider = BindingProvider.create(model, container, this);

		if (this.components) {
			for (var i = 0, x, length = this.components.length; i < length; i++) {
				x = this.components[i];

				if (x.compoName === ':validate') {
					(this.validations || (this.validations = []))
						.push(x);
				}
			}
		}

		if (!this.attr['no-validation'] && !this.validations) {
			var Validate = model.Validate,
				prop = this.provider.value;

			if (Validate == null && prop.indexOf('.') !== -1) {
				var parts = prop.split('.'),
					i = 0,
					imax = parts.length,
					obj = model[parts[0]];
				while (Validate == null && ++i < imax && obj) {
					Validate = obj.Validate;
					obj = obj[parts[i]]
				}
				prop = parts.slice(i).join('.');
			}

			var validator = Validate && Validate[prop];
			if (typeof validator === 'function') {

				validator = mask
					.getHandler(':validate')
					.createCustom(container, validator);

				(this.validations || (this.validations = []))
					.push(validator);

			}
		}


		BindingProvider.bind(this.provider);
	},
	dispose: function() {
		if (this.provider && typeof this.provider.dispose === 'function') {
			this.provider.dispose();
		}
	},

	handlers: {
		attr: {
			'x-signal': function() {}
		}
	}
};