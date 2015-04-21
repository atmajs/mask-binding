

__registerAttr('xx-visible', function(node, attrValue, model, cntx, element, controller) {
	
	var binder = expression_createBinder(attrValue, model, cntx, controller, function(value){
		element.style.display = value ? '' : 'none';
	});
	
	expression_bind(attrValue, model, cntx, controller, binder);
	
	compo_attachDisposer(controller, function(){
		expression_unbind(attrValue, model,  controller, binder);
	});
	
	
	
	if (!expression_eval(attrValue, model, cntx, controller)) {
		
		element.style.display = 'none';
	}
});