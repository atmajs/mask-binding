/**
 *  Mask Custom Tag Handler
 *	attr =
 *		attr: {String} - attribute name to bind
 *		prop: {Stirng} - property name to bind
 *		- : {default} - innerHTML
 */



(function() {

	function Bind() {}

	__registerHandler(':bind', Bind);
	__registerHandler( 'bind', Bind);

	Bind.prototype = {
		constructor: Bind,
		renderEnd: function(els, model, cntx, container){
			
			this.provider = BindingProvider.create(model, container, this, 'single');
			
			BindingProvider.bind(this.provider);
		},
		dispose: function(){
			if (this.provider && typeof this.provider.dispose === 'function') {
				this.provider.dispose();
			}
		}
	};


}());
