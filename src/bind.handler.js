/**
 *  Mask Custom Tag Handler
 *	attr =
 *		attr: {String} - attribute name to bind
 *		prop: {Stirng} - property name to bind
 *		- : {default} - innerHTML
 */


function Bind() {}

mask.registerHandler(':bind', Bind);



Bind.prototype.renderStart = function(model, cntx, container) {

	new BindingProvider(model, container, this, 'single');

};
