var domLib = global.jQuery || global.Zepto || global.$,
	__Compo = typeof Compo !== 'undefined' ? Compo : (mask.Compo || global.Compo),
    __dom_addEventListener = __Compo.addEventListener,
    __mask_registerHandler = mask.registerHandler,
    __mask_registerAttrHandler = mask.registerAttrHandler,
    __mask_registerUtil = mask.registerUtil,
    
	__array_slice = Array.prototype.slice;
	
