
/**
 *	Mask Custom Attribute
 *	Bind Closest Controllers Handler Function to dom event(s)
 */

mask.registerAttrHandler('x-on', function(node, model, value, element, cntx){

	var arr = value.split(';');
	for(var i = 0, x, length = arr.length; i < length; i++){
		x = arr[i];
		var event = x.substring(0, x.indexOf(':')),
			handler = x.substring(x.indexOf(':') + 1).trim(),
			Handler = getHandler(cntx, handler);
			
		if (Handler){
			addEventListener(element, event, Handler);
		}
	}

});


function getHandler(controller, name){
	if (controller == null) {
		return null;
	}
	if (typeof controller[name] === 'function'){
		return controller[name].bind(controller);
	}
	return getHandler(controller.parent, name);
}
