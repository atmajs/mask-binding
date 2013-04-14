
function dom_removeElement(node) {
	return node.parentNode.removeChild(node);
}

function dom_removeAll(array) {
	if (array == null) {
		return;
	}
	for(var i = 0, length = array.length; i < length; i++){
		dom_removeElement(array[i]);
	}
}

function dom_insertAfter(element, anchor) {
	return anchor.parentNode.insertBefore(element, anchor.nextSibling);
}

function dom_insertBefore(element, anchor) {
	return anchor.parentNode.insertBefore(element, anchor);
}



function dom_addEventListener(element, event, listener) {

	////if (typeof $ === 'function'){
	////	$(element).on(event, listener);
	////	return;
	////}

	if (element.addEventListener != null) {
		element.addEventListener(event, listener, false);
		return;
	}
	if (element.attachEvent) {
		element.attachEvent("on" + event, listener);
	}
}
