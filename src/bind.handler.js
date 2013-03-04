/**
 *  Mask Custom Tag Handler
 *	attr =
 *		attr: {String} - attribute name to bind
 *		prop: {Stirng} - property name to bind
 *		- : {default} - innerHTML
 */



mask.registerHandler(':bind', Bind);

function Bind() {}

Bind.prototype.render = function(model, container, cntx) {

	if (this.firstChild != null) {
		/** continue render if binder has nodes */
		mask.render(this.firstChild, model, container, cntx);
	}

	new BindingProvider(model, container, this, 'single');

};
