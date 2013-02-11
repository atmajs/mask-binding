/**
 * visible handler. Used to bind rectly to display:X/none
 *
 * attr =
 *    check - expression to evaluate
 *    bind - listen for a property change
*/

mask.registerHandler(':visible', Class({
	Extends: mask.ValueUtils.out,
	refresh: function(model, container) {
		container.style.display = this.isCondition(this.attr.check, model) ? '' : 'none';
	},
	render: function(model, container, cntx) {
		this.refresh(model, container);

		if (this.attr.bind) {
			addObjectObserver(model, this.attr.bind, this.refresh.bind(this, model, container));
		}
		if (this.nodes) {
			mask.render(this.nodes, model, container, cntx);
		}
	}
}));
