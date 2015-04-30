/**
 *	Toggle Class Name
 *
 *	button x-toggle='click: selected'
 */

__registerAttr('x-class-toggle', 'client', function(node, attrVal, model, ctx, element){
    
    var event = attrVal.substring(0, attrVal.indexOf(':')),
        klass = attrVal.substring(event.length + 1).trim();
    
	
    __dom_addEventListener(element, event, function(){
         domLib(element).toggleClass(klass);
    });
});
