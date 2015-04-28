
(function() {

	function Bind() {}

	__registerHandler(':bind', Bind);
	__registerHandler( 'bind', Bind);

	Bind.prototype = {
		constructor: Bind,
		renderStart: function(model, cntx, container){
			
			this.provider = BindingProvider.create(model, container, this, 'single');
			this.provider.objectChanged();
		}
	};


}());