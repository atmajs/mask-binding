var $ = window.jQuery || window.Zepto || window.$,

	__array_slice = Array.prototype.slice;

if ($ == null){
	console.warn('Without jQuery/Zepto etc. binder is limited (mouse dom event bindings)');
}
