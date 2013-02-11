/**
 *  Mask Custom Tag Handler
 *	attr =
 *		attr: {String} - attribute name to bind
 *		prop: {Stirng} - property name to bind
 *		- : {default} - innerHTML
 */



mask.registerHandler(':bind', Bind);

function Bind() {}

Bind.prototype = {
	refresh: function(model, container, x) {
		if (this.attr.attr != null) {
			container.setAttribute(this.attr.attr, x);
		} else if (this.attr.prop != null) {
			container[this.attr.prop] = x;
		} else {
			container.innerHTML = x;
		}
	},
	render: function(model, container, cntx) {
		this.refresh(model, container, Object.getProperty(model, this.attr.value));
		addObjectObserver(model, this.attr.value, this.refresh.bind(this, model, container));

		if (this.nodes) {
			mask.render(this.nodes, model, container, cntx);
		}
	}
};
