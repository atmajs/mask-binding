__registerAttr('xx-visible', function(node, attrValue, model, ctx, el, ctr) {

	var binder = expression_createBinder(attrValue, model, ctx, ctr, function(value){
		el.style.display = value ? '' : 'none';
	});

	expression_bind(attrValue, model, ctx, ctr, binder);

	compo_attachDisposer(ctr, function(){
		expression_unbind(attrValue, model, ctr, binder);
	});

	if (!expression_eval(attrValue, model, ctx, ctr, node)) {
		el.style.display = 'none';
	}
});