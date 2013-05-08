/**
 * visible handler. Used to bind directly to display:X/none
 *
 * attr =
 *    check - expression to evaluate
 *    bind - listen for a property change
 */

function VisibleHandler() {}

mask.registerHandler(':visible', VisibleHandler);


VisibleHandler.prototype = {
	constructor: VisibleHandler,

	refresh: function(model, container) {
		container.style.display = expression_eval(this.attr.check, model) ? '' : 'none';
	},
	renderStart: function(model, cntx, container) {
		this.refresh(model, container);

		if (this.attr.bind) {
			obj_addObserver(model, this.attr.bind, this.refresh.bind(this, model, container));
		}
	}
};
