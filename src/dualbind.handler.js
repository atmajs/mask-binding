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

DualbindHandler.prototype.renderEnd = function(elements, model, cntx, container) {

	if (this.components) {
		for (var i = 0, x, length = this.components.length; i < length; i++) {
			x = this.components[i];

			if (x.compoName == ':validate') {
				(this.validations || (this.validations = [])).push(x);
			}
		}

	}
	new BindingProvider(model, container, this);

};
