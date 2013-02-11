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
mask.registerHandler(':dualbind', DualbindHandler);


function DualbindHandler() {}

DualbindHandler.prototype.render = function(model, container, cntx) {
	if (this.nodes) {
		mask.render(this.nodes, model, container, cntx);
	}

	if (cntx.components) {
		for (var i = 0, x, length = cntx.components.length; i < length; i++) {
			x = cntx.components[i];

			if (x.compoName == ':validate') {
				(this.validations || (this.validations = [])).push(x);
			}
		}

	}
	new BindingProvider(model, container, this);
};
