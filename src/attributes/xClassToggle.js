/**
 *	Toggle Class Name
 *
 *	button x-toggle='click: selected'
 */

__registerAttr('x-class-toggle', 'client', function(node, attrValue, model, ctx, element, controller){
    
    
    var event = attrValue.substring(0, attrValue.indexOf(':')),
        $class = attrValue.substring(event.length + 1).trim();
    
	
    __dom_addEventListener(element, event, function(){
         domLib(element).toggleClass($class);
    });
});
