var dom_removeElement,
	dom_removeAll,
	dom_insertAfter,
	dom_insertBefore;
(function(){

	dom_removeElement = function(node) {
		var parent = node.parentNode;
		if (parent == null)
			return node;

		return parent.removeChild(node);
	};
	dom_removeAll = function(array) {
		if (array == null) 
			return;
		
		var imax = array.length,
			i = -1;
		while ( ++i < imax ) {
			dom_removeElement(array[i]);
		}
	};
	dom_insertAfter = function(element, anchor) {
		return anchor.parentNode.insertBefore(element, anchor.nextSibling);
	};
	dom_insertBefore = function(element, anchor) {
		return anchor.parentNode.insertBefore(element, anchor);
	};
}());
