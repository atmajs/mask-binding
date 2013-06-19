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

mask.registerHandler(':dualbind', DualbindHandler);



DualbindHandler.prototype = {
	constructor: DualbindHandler,
	renderEnd: function(elements, model, cntx, container) {
		if (this.components) {
			for (var i = 0, x, length = this.components.length; i < length; i++) {
				x = this.components[i];

				if (x.compoName === ':validate') {
					(this.validations || (this.validations = [])).push(x);
				}
			}
		}

		this.provider = BindingProvider.create(model, container, this);
		
		if (typeof model.Validate === 'object') {
			
			var validator = model.Validate[this.provider.value];
			if (typeof validator === 'function') {
			
				validator = mask
					.getHandler(':validate')
					.createCustom(container, validator);
				
			
				(this.validations || (this.validations = []))
					.push(validator);
				
			}
		}
	},
	dispose: function(){
		if (this.provider && typeof this.provider.dispose === 'function') {
			this.provider.dispose();
		}
	}
};
