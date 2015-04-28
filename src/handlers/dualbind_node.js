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

function DualbindHandler() {}

__registerHandler(':dualbind', DualbindHandler);
__registerHandler( 'dualbind', DualbindHandler);



DualbindHandler.prototype = {
	constructor: DualbindHandler,
	
	renderStart: function(model, ctx, container) {
		this.provider = BindingProvider.create(model, container, this);
		this.provider.objectChanged();
	},
	dispose: function(){
		var provider = this.provider,
			dispose = provider && provider.dispose;
		if (typeof dispose === 'function') {
			dispose.call(provider);
		}
	},
	
	handlers: {
		attr: {
			'x-signal' : function(){}
		}
	}
};
