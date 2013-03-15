
/**
 *	Mask Custom Attribute
 *	Bind Closest Controllers Handler Function to dom event(s)
 */

mask.registerAttrHandler('x-signal', function(node, model, value, element, cntx){

	var arr = value.split(';');
	for(var i = 0, x, length = arr.length; i < length; i++){
		x = arr[i];
		var event = x.substring(0, x.indexOf(':')),
			handler = x.substring(x.indexOf(':') + 1).trim(),
			Handler = getHandler(cntx, handler);

		if (Handler){
			addEventListener(element, event, Handler);
		}

		// if DEBUG
		!Handler && console.warn('No slot found for signal', handler);
		// endif
	}

});


function getHandler(controller, name){
	if (controller == null) {
		return null;
	}

	if (controller.slots != null && typeof controller.slots[name] !== 'undefined'){
		var slot = controller.slots[name];
		if (typeof slot === 'string'){
			slot = controller[slot];
		}

		// if DEBUG
		typeof slot !== 'function' && console.error('Controller defines slot, but that is not a function', controller, name);
		// endif

		return slot.bind(controller);
	}

	return getHandler(controller.parent, name);
}
