/**
 *  Mask Custom Tag Handler
 *	attr =
 *		attr: {String} - attribute name to bind
 *		prop: {Stirng} - property name to bind
 *		- : {default} - innerHTML
 */



(function() {

	function Bind() {}

	mask.registerHandler(':bind', Bind);

	Bind.prototype = {
		constructor: Bind,
		renderStart: function(model, cntx, container) {

			this.provider = BindingProvider.create(model, container, this, 'single');

		},
		dispose: function(){
			if (this.provider && typeof this.provider.dispose === 'function') {
				this.provider.dispose();
			}
		}
	};


}());
