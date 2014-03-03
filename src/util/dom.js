
function dom_removeElement(node) {
	return node.parentNode.removeChild(node);
}

function dom_removeAll(array) {
	if (array == null) 
		return;
	
	var imax = array.length,
		i = -1;
	while ( ++i < imax ) {
		dom_removeElement(array[i]);
	}
}

function dom_insertAfter(element, anchor) {
	return anchor.parentNode.insertBefore(element, anchor.nextSibling);
}

function dom_insertBefore(element, anchor) {
	return anchor.parentNode.insertBefore(element, anchor);
}



