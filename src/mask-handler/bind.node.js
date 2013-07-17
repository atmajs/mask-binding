
(function() {

	function Bind() {}

	mask.registerHandler(':bind', Bind);

	Bind.prototype = {
		constructor: Bind,
		renderStart: function(model, cntx, container){
			
			this.provider = BindingProvider.create(model, container, this, 'single');
			this.provider.objectChanged();
		}
	};


}());