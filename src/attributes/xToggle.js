/**
 *	Toggle value with ternary operator on an event.
 *
 *	button x-toggle='click: foo === "bar" ? "zet" : "bar" > 'Toggle'
 */
__registerAttr('x-toggle', 'client', function(node, attrValue, model, ctx, el, ctr){
    var event = attrValue.substring(0, attrValue.indexOf(':')),
        expression = attrValue.substring(event.length + 1),
        ref = expression_varRefs(expression);
    
	if (typeof ref !== 'string') {
		// assume is an array
		ref = ref[0];
	}
	
    __dom_addEventListener(el, event, function(){
        var val = expression_eval(expression, model, ctx, ctr, node);
        obj_setProperty(model, ref, val);
    });
});
