var $ = window.jQuery || window.Zepto || window.$;

if ($ == null){
	console.warn('Without jQuery/Zepto etc. binder is limited (mouse dom event bindings)');
}
