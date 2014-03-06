
function $has(selector, state) {
	$dom
		[ state ? 'has_' : 'hasNot_' ](selector);
}

function $visible(selector, state){
	$dom
		.find(selector)
		[state ? 'notEq_' : 'eq_' ]('css', 'display', 'none');
}

function $render(){
	var x = mask.render.apply(null, arguments);
	if (x && x.nodeType === Node.DOCUMENT_FRAGMENT_NODE) 
		x = x.childNodes;
	
	return $(x);
}