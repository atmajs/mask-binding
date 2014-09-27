
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
	return $(mask.render.apply(null, arguments));
}